// Which requests the feedback maintenance boundary
// (../../server/feedbackMaintenanceBoundary.ts) refuses, at the boundary
// server over raw HTTP: another site or Host, a method it does not take,
// malformed bodies, unknown fields, hosts and settings, a removal with a body,
// and the wrong content type; none changes the saved setting or starts a
// session. The page's journey, including a malformed saved file, is
// ../system-settings-feedback-maintenance.spec.ts.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { systemSettingsMachine } from "../support/systemSettingsMachine.ts";
import { rawRequest } from "../support/rawHttp.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

test("feedback maintenance endpoints refuse foreign, malformed and unknown requests without changing the saved setting", async () => {
  const server = await fixture.start("boundary");
  const endpoint = `${server.baseURL}/__feedback-maintenance`;
  const file = path.join(
    fixture.home,
    ".open-dough/dashboard/feedback-maintenance.json",
  );
  const headers = { Origin: server.origin, "Content-Type": "application/json" };
  const post = (
    url: string,
    body: string,
    extra: Record<string, string> = {},
  ) =>
    rawRequest({
      url,
      method: "POST",
      headers: { ...headers, ...extra },
      body,
    });
  const save = (body: string, extra: Record<string, string> = {}) =>
    post(`${endpoint}/save`, body, extra);

  const fresh = await rawRequest({ url: endpoint, headers });
  expect(fresh.status).toBe(200);
  expect(fresh.headers["cache-control"]).toBe("no-store");
  expect(JSON.parse(fresh.body)).toEqual({ enabled: false });
  // A foreign save is refused before anything is written.
  expect(
    (
      await save(JSON.stringify({ host: "claude" }), {
        Origin: "http://other.example",
      })
    ).status,
  ).toBe(403);
  expect(existsSync(file)).toBe(false);

  const saved = await save(
    JSON.stringify({ host: "codex", model: "gpt-5", effort: "high" }),
  );
  expect(saved.status).toBe(200);
  expect(JSON.parse(saved.body)).toEqual({
    enabled: true,
    choice: { host: "codex", model: "gpt-5", effort: "high" },
  });
  const before = readFileSync(file, "utf8");
  expect(before).toBe('{"host":"codex","model":"gpt-5","effort":"high"}\n');

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
              : {
                  body: JSON.stringify(
                    url.endsWith("/save") ? { host: "claude" } : {},
                  ),
                }),
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
  for (const body of ["{", "[]", "null", '"claude"'])
    for (const url of [`${endpoint}/save`, `${endpoint}/remove`]) {
      const refused = await post(url, body);
      expect(refused.status).toBe(400);
      expect(JSON.parse(refused.body)).toHaveProperty("error");
    }
  for (const choice of [
    {},
    { host: "claude", extra: true },
    { host: "elsewhere" },
    { host: "Claude" },
    { host: 3 },
    { host: "claude", model: "" },
    { host: "claude", model: "opus\nsonnet" },
    { host: "claude", effort: "high" },
  ]) {
    const refused = await save(JSON.stringify(choice));
    expect(refused.status).toBe(400);
    expect(refused.body).toContain("Choose a listed host and model");
  }
  const removeWithBody = await post(
    `${endpoint}/remove`,
    JSON.stringify({ enabled: false }),
  );
  expect(removeWithBody.status).toBe(400);
  expect(removeWithBody.body).toContain("The turn-off request is malformed");
  expect(
    (
      await save(JSON.stringify({ host: "claude" }), {
        "Content-Type": "text/plain",
      })
    ).status,
  ).toBe(415);

  expect(readFileSync(file, "utf8")).toBe(before);
  const kept = await rawRequest({ url: endpoint, headers });
  expect(JSON.parse(kept.body)).toEqual({
    enabled: true,
    choice: { host: "codex", model: "gpt-5", effort: "high" },
  });
  const removed = await post(`${endpoint}/remove`, "{}");
  expect(removed.status).toBe(200);
  expect(JSON.parse(removed.body)).toEqual({ enabled: false });
  expect(existsSync(file)).toBe(false);
  expect(server.claudeCalls()).toEqual([]);
  expect(server.ghCalls()).toEqual([]);
});
