import { expect, test } from "./support/pageTest.ts";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  builtDashboardDir,
  startDashboardServer,
} from "./support/dashboardServer.ts";
import { voiceProvider } from "./support/voiceProvider.ts";
import { abandonedRequest, rawRequest } from "./support/rawHttp.ts";
import {
  instructionAudioLimitBytes,
  instructionTranscriptionEndpoint,
} from "../src/instructionTranscription.ts";
import { voiceKey } from "./support/voicePage.ts";

for (const mode of ["dev", "preview"] as const) {
  test(`${mode} audio boundary refuses foreign origins, method, media, empty and oversized bodies before provider contact`, async () => {
    const provider = await voiceProvider();
    const server = await startDashboardServer({
      mode,
      machine: provider.machine,
      prebuilt: builtDashboardDir,
      extraEnv: provider.extraEnv,
    });
    const url = new URL(instructionTranscriptionEndpoint, server.baseURL).href;
    const headers = {
      Origin: new URL(server.baseURL).origin,
      "Content-Type": "audio/webm",
    };
    try {
      for (const request of [
        {
          method: "POST",
          headers: { ...headers, Origin: "https://foreign.example" },
          body: "audio",
          status: 403,
        },
        { method: "GET", headers, status: 405 },
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: "{}",
          status: 415,
        },
        { method: "POST", headers, body: "", status: 400 },
        {
          method: "POST",
          headers: {
            ...headers,
            "Content-Length": String(instructionAudioLimitBytes + 1),
          },
          status: 413,
        },
        {
          method: "POST",
          headers: { ...headers, "Transfer-Encoding": "chunked" },
          body: "x".repeat(instructionAudioLimitBytes + 1),
          status: 413,
        },
      ]) {
        const response = await rawRequest({ url, ...request });
        expect(
          response.status,
          JSON.stringify({ headers: request.headers, response: response.body }),
        ).toBe(request.status);
        expect(response.headers["cache-control"]).toBe("no-store");
      }
      expect(provider.calls).toHaveLength(0);
    } finally {
      await server.close();
      await provider.close();
    }
  });

  test(`${mode} disconnect and server shutdown abort held upstream work`, async () => {
    const provider = await voiceProvider();
    const credential = path.join(
      provider.machine,
      "home/.open-dough/dashboard/credentials/openai.json",
    );
    mkdirSync(path.dirname(credential), { recursive: true });
    writeFileSync(credential, JSON.stringify({ apiKey: voiceKey }));
    const server = await startDashboardServer({
      mode,
      machine: provider.machine,
      prebuilt: builtDashboardDir,
      extraEnv: provider.extraEnv,
    });
    const url = new URL(instructionTranscriptionEndpoint, server.baseURL).href;
    const headers = {
      Origin: new URL(server.baseURL).origin,
      "Content-Type": "audio/webm",
    };
    try {
      provider.hold();
      const disconnected = abandonedRequest({
        url,
        method: "POST",
        headers,
        body: "nonempty audio",
      });
      await expect.poll(() => provider.calls.length).toBe(1);
      disconnected.cutAfter(0);
      await expect.poll(provider.disconnected).toBe(1);
      const pending = rawRequest({
        url,
        method: "POST",
        headers,
        body: "nonempty audio",
      }).catch(() => undefined);
      await expect.poll(() => provider.calls.length).toBe(2);
      await server.close();
      await pending;
      await expect.poll(provider.disconnected).toBe(2);
      expect(server.output()).not.toContain(voiceKey);
    } finally {
      await server.close();
      await provider.close();
    }
  });
}

test("provider text is validated and response bounds and errors never expose provider diagnostics or keys", async () => {
  const provider = await voiceProvider();
  const credential = path.join(
    provider.machine,
    "home/.open-dough/dashboard/credentials/openai.json",
  );
  mkdirSync(path.dirname(credential), { recursive: true });
  writeFileSync(credential, JSON.stringify({ apiKey: voiceKey }));
  const server = await startDashboardServer({
    mode: "preview",
    machine: provider.machine,
    prebuilt: builtDashboardDir,
    extraEnv: provider.extraEnv,
  });
  const url = new URL(instructionTranscriptionEndpoint, server.baseURL).href;
  const headers = {
    Origin: new URL(server.baseURL).origin,
    "Content-Type": "audio/webm",
  };
  try {
    for (const reply of [
      { status: 200, body: JSON.stringify({ text: "  " }), expected: 502 },
      { status: 200, body: "malformed-provider-body", expected: 503 },
      {
        status: 200,
        body: JSON.stringify({ text: "x".repeat(256 * 1024) }),
        expected: 503,
      },
      {
        status: 500,
        body: `raw-provider-diagnostic ${voiceKey}`,
        expected: 502,
      },
    ]) {
      provider.reply(reply.status, reply.body);
      const response = await rawRequest({
        url,
        method: "POST",
        headers,
        body: "nonempty audio",
      });
      expect(response.status).toBe(reply.expected);
      expect(response.body).not.toContain(voiceKey);
      expect(response.body).not.toContain("raw-provider-diagnostic");
      expect(response.body).not.toContain("malformed-provider-body");
      expect(JSON.parse(response.body)).toHaveProperty("error");
    }
    expect(provider.calls).toHaveLength(4);
    expect(server.output()).not.toContain(voiceKey);
    expect(server.output()).not.toContain("raw-provider-diagnostic");
  } finally {
    await server.close();
    await provider.close();
  }
});
