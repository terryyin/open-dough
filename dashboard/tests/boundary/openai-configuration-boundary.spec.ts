// Which requests the OpenAI configuration boundary
// (../../server/openAIConfigurationBoundary.ts) refuses, at the boundary
// server over raw HTTP: another site or Host, a method it does not take,
// malformed bodies, the wrong content type and an oversized body; none
// changes the private credential file or contacts a provider. The page's
// recovery from a credential it cannot use is
// ../system-settings-openai-unusable-credential.spec.ts; the size bound in detail is
// ./openai-configuration-size.spec.ts.
import { existsSync, readFileSync } from "node:fs";
import { expect, test } from "../support/pageTest.ts";
import { systemSettingsMachine } from "../support/systemSettingsMachine.ts";
import { rawRequest } from "../support/rawHttp.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());
const key = "sk-synthetic-private-boundary-084";

test("OpenAI configuration refuses foreign/malformed requests without changing private files or contacting a provider", async () => {
  const server = await fixture.start("boundary");
  const endpoint = `${server.baseURL}/__openai-configuration`;
  const headers = {
    Origin: server.origin,
    "Content-Type": "application/json",
  };
  const save = (body: string, extra: Record<string, string> = {}) =>
    rawRequest({
      url: `${endpoint}/save`,
      method: "POST",
      headers: { ...headers, ...extra },
      body,
    });
  const saved = await save(JSON.stringify({ apiKey: key }));
  expect(saved.status).toBe(200);
  expect(JSON.parse(saved.body)).toEqual({ configured: true });
  const before = readFileSync(fixture.credentialFile, "utf8");
  for (const url of [endpoint, `${endpoint}/save`, `${endpoint}/remove`]) {
    for (const refused of [
      { Origin: "http://other.example" },
      { Origin: server.origin, Host: "other.example" },
      { "Sec-Fetch-Site": "cross-site", Origin: "http://other.example" },
    ]) {
      expect(
        (
          await rawRequest({
            url,
            method: url === endpoint ? "GET" : "POST",
            headers: { "Content-Type": "application/json", ...refused },
            ...(url === endpoint
              ? {}
              : { body: JSON.stringify({ apiKey: key }) }),
          })
        ).status,
      ).toBe(403);
    }
    expect((await rawRequest({ url, method: "PUT", headers })).status).toBe(
      405,
    );
    expect(
      (
        await rawRequest({
          url,
          method: url === endpoint ? "POST" : "GET",
          headers,
        })
      ).status,
    ).toBe(405);
  }
  for (const body of [
    "{",
    "[]",
    "null",
    "{}",
    '{"apiKey":12}',
    JSON.stringify({ apiKey: key, endpoint: "https://other.example" }),
    '{"apiKey":""}',
    '{"apiKey":" \\n "}',
    JSON.stringify({ apiKey: "sk-line\nbreak" }),
  ]) {
    const refused = await save(body);
    expect(refused.status).toBe(400);
    expect(refused.body).not.toContain(key);
  }
  expect(
    (
      await save(JSON.stringify({ apiKey: key }), {
        "Content-Type": "text/plain",
      })
    ).status,
  ).toBe(415);
  // Existing bounded JSON mechanics end the socket when its byte limit is exceeded.
  let refusal: number | undefined;
  try {
    refusal = (await save(JSON.stringify({ apiKey: "x".repeat(40_000) })))
      .status;
  } catch (error) {
    expect((error as NodeJS.ErrnoException).code).toBe("ECONNRESET");
  }
  if (refusal !== undefined) expect(refusal).toBe(413);
  expect(
    (
      await rawRequest({
        url: `${endpoint}/remove`,
        method: "POST",
        headers,
        body: JSON.stringify({ apiKey: key }),
      })
    ).status,
  ).toBe(400);
  expect(readFileSync(fixture.credentialFile, "utf8")).toBe(before);
  const status = await rawRequest({ url: endpoint, headers });
  expect(status.status).toBe(200);
  expect(JSON.parse(status.body)).toEqual({ configured: true });
  expect(status.headers["cache-control"]).toBe("no-store");
  const removed = await rawRequest({
    url: `${endpoint}/remove`,
    method: "POST",
    headers,
    body: "{}",
  });
  expect(removed.status).toBe(200);
  expect(JSON.parse(removed.body)).toEqual({ configured: false });
  expect(existsSync(fixture.credentialFile)).toBe(false);
  expect(fixture.egress()).toBe("");
  expect(server.output()).not.toContain(key);
  expect(server.claudeCalls()).toEqual([]);
  expect(server.ghCalls()).toEqual([]);
});
