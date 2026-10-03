import { createServer, type ServerResponse } from "node:http";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export async function voiceProvider() {
  const machine = mkdtempSync(path.join(tmpdir(), "dough-voice-"));
  const calls: Array<{
    authorization: string | undefined;
    model: FormDataEntryValue | null;
    type: string;
    bytes: number;
    filename: string;
  }> = [];
  const held = new Set<ServerResponse>();
  let hold = false;
  let text = "Do not implement yet";
  let reply: { status: number; body: string } | undefined;
  let disconnected = 0;
  const server = createServer((req, res) => {
    void (async () => {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(Buffer.from(chunk as Uint8Array));
      }
      const body = Buffer.concat(chunks);
      const form = await new Request("http://127.0.0.1", {
        method: "POST",
        headers: { "Content-Type": req.headers["content-type"] ?? "" },
        body,
      }).formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        throw new Error("No multipart audio file");
      }
      calls.push({
        authorization: req.headers.authorization,
        model: form.get("model"),
        type: file.type,
        bytes: (await file.arrayBuffer()).byteLength,
        filename: file.name,
      });
      res.on("close", () => {
        if (!res.writableEnded) {
          disconnected += 1;
        }
        held.delete(res);
      });
      if (hold) {
        held.add(res);
      } else {
        res.writeHead(reply?.status ?? 200, {
          "Content-Type": "application/json",
        });
        res.end(reply?.body ?? JSON.stringify({ text }));
      }
    })().catch(() => {
      res.writeHead(500);
      res.end();
    });
  });
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("No fake provider address");
  }
  const preload = path.join(machine, "transcription-provider.cjs");
  const url = `http://127.0.0.1:${address.port}/transcriptions`;
  writeFileSync(
    preload,
    `const original = globalThis.fetch;
globalThis.fetch = (input, options) => {
  const url = String(typeof input === 'string' || input instanceof URL ? input : input.url);
  if (url === 'https://api.openai.com/v1/audio/transcriptions') return original(${JSON.stringify(url)}, options);
  const hostname = new URL(url).hostname;
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(hostname)) throw new Error('Provider egress blocked');
  return original(input, options);
};`,
  );
  return {
    machine,
    calls,
    extraEnv: { NODE_OPTIONS: `--require=${preload}` },
    setText(value: string) {
      text = value;
    },
    reply(status: number, body: string) {
      reply = { status, body };
    },
    hold() {
      hold = true;
    },
    release() {
      hold = false;
      for (const res of held) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ text }));
      }
      held.clear();
    },
    disconnected: () => disconnected,
    async close() {
      server.closeAllConnections();
      await new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
      rmSync(machine, { recursive: true, force: true });
    },
  };
}
