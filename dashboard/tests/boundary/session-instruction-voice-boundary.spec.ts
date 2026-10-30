import { expect, test } from "../support/pageTest.ts";
import path from "node:path";
import { startDashboardServer } from "../support/dashboardServer.ts";
import { voiceProvider } from "../support/voiceProvider.ts";
import { abandonedRequest, rawRequest } from "../support/rawHttp.ts";
import {
  instructionAudioLimitBytes,
  instructionProblems,
  instructionTranscriptionEndpoint,
  instructionTranscriptionFailed,
} from "../../src/instructionTranscription.ts";
import { seedVoiceKey, voiceKey } from "../support/voicePage.ts";

test("the audio boundary refuses foreign origins, method, media, empty and oversized bodies before provider contact", async () => {
  const provider = await voiceProvider();
  const server = await startDashboardServer({
    mode: "boundary",
    machine: provider.machine,
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

test("disconnect and server shutdown abort held upstream work", async () => {
  const provider = await voiceProvider();
  seedVoiceKey(path.join(provider.machine, "home"));
  const server = await startDashboardServer({
    mode: "boundary",
    machine: provider.machine,
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

test("provider text is validated and response bounds and errors never expose provider diagnostics or keys", async () => {
  const provider = await voiceProvider();
  seedVoiceKey(path.join(provider.machine, "home"));
  const server = await startDashboardServer({
    mode: "boundary",
    machine: provider.machine,
    extraEnv: provider.extraEnv,
  });
  const url = new URL(instructionTranscriptionEndpoint, server.baseURL).href;
  const headers = {
    Origin: new URL(server.baseURL).origin,
    "Content-Type": "audio/webm",
  };
  try {
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
    expect(server.output()).not.toContain(voiceKey);
    expect(server.output()).not.toContain("private-provider-diagnostic");
    expect(server.output()).not.toContain("raw-provider-diagnostic");
  } finally {
    await server.close();
    await provider.close();
  }
});
