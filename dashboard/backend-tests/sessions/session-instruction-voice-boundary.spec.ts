// Real HTTP through the instruction transcription boundary to a loopback provider.
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import path from "node:path";
import { format } from "node:util";
import type { Connect } from "vite";
import { beforeEach, expect, onTestFinished, test, vi } from "vitest";
import { installInstructionTranscriptionMiddleware } from "../../server/instructionTranscriptionBoundary.ts";
import { voiceProvider } from "../../test-support/support/voiceProvider.ts";
import {
  abandonedRequest,
  rawRequest,
} from "../../test-support/support/rawHttp.ts";
import {
  instructionAudioLimitBytes,
  instructionProblems,
  instructionTranscriptionEndpoint,
  instructionTranscriptionFailed,
} from "../../src/instructionTranscription.ts";
import {
  seedVoiceKey,
  voiceKey,
} from "../../test-support/support/voicePage.ts";

let provider: Awaited<ReturnType<typeof voiceProvider>>;
let output: string[];

beforeEach(async () => {
  provider = await voiceProvider();
  onTestFinished(() => provider.close());
  vi.stubEnv("HOME", path.join(provider.machine, "home"));
  const vendorFetch = globalThis.fetch;
  vi.stubGlobal("fetch", (input: string | URL | Request, init?: RequestInit) =>
    vendorFetch(
      (input instanceof Request ? input.url : String(input)) ===
        "https://api.openai.com/v1/audio/transcriptions"
        ? provider.url
        : input,
      init,
    ),
  );
  output = [];
  for (const method of ["log", "info", "warn", "error"] as const)
    vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
      output.push(format(...args));
    });
});

// The production boundary mounted on a plain loopback HTTP server, closed
// the way the Dashboard closes it.
async function startBoundary() {
  let handler: Connect.NextHandleFunction | undefined;
  const cleanup = await installInstructionTranscriptionMiddleware(
    {
      use(next: Connect.NextHandleFunction) {
        handler = next;
      },
    },
    null,
  );
  const server = createServer((req, res) => {
    handler?.(req, res, () => {
      res.writeHead(404).end();
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const close = async () => {
    await (typeof cleanup === "function" ? cleanup() : cleanup.close());
    server.closeAllConnections();
    await new Promise((resolve) => {
      server.close(resolve);
    });
  };
  onTestFinished(close);
  return {
    url: new URL(instructionTranscriptionEndpoint, baseURL).href,
    headers: { Origin: baseURL, "Content-Type": "audio/webm" },
    close,
  };
}

test("the audio boundary refuses foreign origins, method, media, empty and oversized bodies before provider contact", async () => {
  const { url, headers } = await startBoundary();
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
});

test("disconnect and server shutdown abort held upstream work", async () => {
  seedVoiceKey(path.join(provider.machine, "home"));
  const { url, headers, close } = await startBoundary();
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
  await close();
  await pending;
  await expect.poll(provider.disconnected).toBe(2);
  expect(output.join("\n")).not.toContain(voiceKey);
});

test("provider text is validated and response bounds and errors never expose provider diagnostics or keys", async () => {
  seedVoiceKey(path.join(provider.machine, "home"));
  const { url, headers } = await startBoundary();
  for (const reply of [
    {
      status: 401,
      body: "private-provider-diagnostic",
      expected: 502,
      error: instructionProblems.authentication,
    },
    {
      status: 403,
      body: "private-provider-diagnostic",
      expected: 502,
      error: instructionProblems.authentication,
    },
    {
      status: 429,
      body: "private-provider-diagnostic",
      expected: 502,
      error: instructionProblems.rateLimit,
    },
    {
      status: 500,
      body: `raw-provider-diagnostic ${voiceKey}`,
      expected: 502,
      error: instructionTranscriptionFailed,
    },
    {
      status: 200,
      body: JSON.stringify({ text: "  " }),
      expected: 502,
      error: instructionProblems.empty,
    },
    {
      status: 200,
      body: "malformed-provider-body",
      expected: 503,
      error: instructionProblems.empty,
    },
    {
      status: 200,
      body: JSON.stringify({ text: "x".repeat(256 * 1024) }),
      expected: 503,
      error: instructionTranscriptionFailed,
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
    expect(response.body).not.toContain("private-provider-diagnostic");
    expect(response.body).not.toContain("raw-provider-diagnostic");
    expect(response.body).not.toContain("malformed-provider-body");
    expect(JSON.parse(response.body)).toEqual({ error: reply.error });
  }
  provider.failNetwork();
  const networkResponse = await rawRequest({
    url,
    method: "POST",
    headers,
    body: "nonempty audio",
  });
  expect(networkResponse.status).toBe(503);
  expect(JSON.parse(networkResponse.body)).toEqual({
    error: instructionProblems.network,
  });
  expect(provider.calls).toHaveLength(8);
  for (const call of provider.calls) {
    expect(call.bytes).toBeGreaterThan(0);
  }
  expect(output.join("\n")).not.toContain(voiceKey);
  expect(output.join("\n")).not.toContain("private-provider-diagnostic");
  expect(output.join("\n")).not.toContain("raw-provider-diagnostic");
});
