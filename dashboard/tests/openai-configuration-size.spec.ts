import { existsSync, readFileSync, statSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { openAISettingsMachine } from "./support/openAISettingsMachine.ts";
import { rawRequest } from "./support/rawHttp.ts";

let fixture: ReturnType<typeof openAISettingsMachine>;
test.beforeEach(() => {
  fixture = openAISettingsMachine();
});
test.afterEach(async () => fixture.close());

for (const mode of ["dev", "preview"] as const) {
  test(`an exactly admitted ASCII or UTF-8 credential remains readable and replaceable (${mode})`, async () => {
    const server = await fixture.start(mode);
    const endpoint = `${server.baseURL}/__openai-configuration`;
    const headers = {
      Origin: server.origin,
      "Content-Type": "application/json",
    };
    const available =
      32 * 1024 - Buffer.byteLength(JSON.stringify({ apiKey: "" }));
    const utf8Key =
      "界".repeat(Math.floor(available / 3)) + "x".repeat(available % 3);
    for (const apiKey of ["x".repeat(available), utf8Key]) {
      const body = JSON.stringify({ apiKey });
      expect(Buffer.byteLength(body)).toBe(32 * 1024);
      const saved = await rawRequest({
        url: `${endpoint}/save`,
        method: "POST",
        headers,
        body,
      });
      expect(saved.status).toBe(200);
      expect(JSON.parse(saved.body)).toEqual({ configured: true });
      expect(statSync(fixture.file).size).toBe(32 * 1024 + 1);
      const status = await rawRequest({ url: endpoint, headers });
      expect(status.status).toBe(200);
      expect(JSON.parse(status.body)).toEqual({ configured: true });
      expect(JSON.parse(readFileSync(fixture.file, "utf8"))).toEqual({
        apiKey,
      });
    }
    const replacement = "sk-synthetic-boundary-replacement-084";
    const replaced = await rawRequest({
      url: `${endpoint}/save`,
      method: "POST",
      headers,
      body: JSON.stringify({ apiKey: replacement }),
    });
    expect(replaced.status).toBe(200);
    expect(JSON.parse(readFileSync(fixture.file, "utf8"))).toEqual({
      apiKey: replacement,
    });
    expect((await rawRequest({ url: endpoint, headers })).status).toBe(200);
    const removed = await rawRequest({
      url: `${endpoint}/remove`,
      method: "POST",
      headers,
      body: "{}",
    });
    expect(removed.status).toBe(200);
    expect(JSON.parse(removed.body)).toEqual({ configured: false });
    expect(existsSync(fixture.file)).toBe(false);
    const empty = await rawRequest({ url: endpoint, headers });
    expect(empty.status).toBe(200);
    expect(JSON.parse(empty.body)).toEqual({ configured: false });
    expect(fixture.egress()).toBe("");
    expect(server.output()).not.toContain(replacement);
  });
}
