import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { expect, test } from "@playwright/test";
import { openAISettingsMachine } from "./support/openAISettingsMachine.ts";
import { rawRequest } from "./support/rawHttp.ts";

let fixture: ReturnType<typeof openAISettingsMachine>;
test.beforeEach(() => {
  fixture = openAISettingsMachine();
});
test.afterEach(async () => fixture.close());
const key = "sk-synthetic-private-boundary-084";

for (const mode of ["dev", "preview"] as const) {
  test(`OpenAI configuration refuses foreign/malformed requests without changing private files or contacting a provider (${mode})`, async () => {
    const server = await fixture.start(mode);
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
    const before = readFileSync(fixture.file, "utf8");
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
    expect(readFileSync(fixture.file, "utf8")).toBe(before);
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
    expect(existsSync(fixture.file)).toBe(false);
    expect(fixture.egress()).toBe("");
    expect(server.output()).not.toContain(key);
    expect(server.claudeCalls()).toEqual([]);
    expect(server.ghCalls()).toEqual([]);
  });
}

test("malformed and unreadable saved credentials report configuration problems without reseeding, echoing secrets, or importing an environment key", async ({
  page,
}) => {
  mkdirSync(fixture.directory, { recursive: true, mode: 0o700 });
  const malformed = `{"apiKey":"${key}"`;
  writeFileSync(fixture.file, malformed, { mode: 0o600 });
  const server = await fixture.start("dev");
  const options = {
    url: `${server.baseURL}/__openai-configuration`,
    headers: { Origin: server.origin },
  };
  const response = await rawRequest(options);
  expect(response.status).toBe(503);
  expect(response.body).toContain("could not be read");
  expect(response.body).not.toContain(key);
  expect(readFileSync(fixture.file, "utf8")).toBe(malformed);
  await page.goto(`${server.baseURL}/?view=settings`);
  await expect(page.getByRole("alert")).toContainText(
    "replace it, or remove it",
  );
  await expect(page.getByLabel("API key", { exact: true })).toHaveValue("");
  await page.getByLabel("API key", { exact: true }).fill(key);
  await page.getByRole("button", { name: "Save API key", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "API key:" }),
  ).toHaveText("API key: Configured");
  const before = readFileSync(fixture.file, "utf8");
  chmodSync(fixture.file, 0o000);
  try {
    const unreadable = await rawRequest(options);
    expect(unreadable.status).toBe(503);
    expect(unreadable.body).toContain("file permissions");
    expect(unreadable.body).not.toContain(key);
    await page.reload();
    await expect(page.getByRole("alert")).toContainText("could not be read");
  } finally {
    chmodSync(fixture.file, 0o600);
  }
  expect(readFileSync(fixture.file, "utf8")).toBe(before);
  await page.getByRole("button", { name: "Retry status", exact: true }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "API key:" }),
  ).toHaveText("API key: Configured");
  await page
    .getByRole("button", { name: "Remove API key", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "API key:" }),
  ).toHaveText("API key: Not configured");
  expect(existsSync(fixture.file)).toBe(false);
  expect(fixture.egress()).toBe("");
  expect(server.output()).not.toContain(key);
});
