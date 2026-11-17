// Which requests the syntax styling boundary (../../server/syntaxStylingBoundary.ts)
// refuses, at the boundary server over raw HTTP: another site or Host, a
// method it does not take, malformed bodies, choices it does not know and the
// wrong content type; none changes the saved styling. Missing file means
// Default.
import { readFileSync } from "node:fs";
import { expect, test } from "../../tests/support/pageTest.ts";
import { systemSettingsMachine } from "../../tests/support/systemSettingsMachine.ts";
import { rawRequest } from "../../tests/support/rawHttp.ts";
import { syntaxStylingFile } from "../../tests/support/syntaxStylingSettingsPage.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

test("syntax styling endpoint refuses foreign, malformed and unknown requests without changing the saved styling", async () => {
  const server = await fixture.start("boundary");
  const endpoint = `${server.baseURL}/__syntax-styling`;
  const headers = { Origin: server.origin, "Content-Type": "application/json" };
  const save = (body: string, extra: Record<string, string> = {}) =>
    rawRequest({
      url: `${endpoint}/save`,
      method: "POST",
      headers: { ...headers, ...extra },
      body,
    });
  const fresh = await rawRequest({ url: endpoint, headers });
  expect(fresh.status).toBe(200);
  expect(JSON.parse(fresh.body)).toEqual({ styling: "default" });
  expect(fresh.headers["cache-control"]).toBe("no-store");
  const saved = await save(JSON.stringify({ styling: "off" }));
  expect(saved.status).toBe(200);
  expect(JSON.parse(saved.body)).toEqual({ styling: "off" });
  const file = syntaxStylingFile(fixture.home);
  const before = readFileSync(file, "utf8");
  expect(JSON.parse(before)).toEqual({ styling: "off" });
  for (const url of [endpoint, `${endpoint}/save`]) {
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
              : { body: JSON.stringify({ styling: "default" }) }),
          })
        ).status,
      ).toBe(403);
    }
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
    '"off"',
    JSON.stringify({ styling: "off", extra: true }),
  ]) {
    const refused = await save(body);
    expect(refused.status).toBe(400);
    expect(JSON.parse(refused.body)).toHaveProperty("error");
  }
  for (const styling of ["monokai", "Off", "", 3, null]) {
    const refused = await save(JSON.stringify({ styling }));
    expect(refused.status).toBe(400);
    expect(refused.body).toContain("Choose Off or Default for syntax styling");
  }
  expect(
    (
      await save(JSON.stringify({ styling: "default" }), {
        "Content-Type": "text/plain",
      })
    ).status,
  ).toBe(415);
  expect(readFileSync(file, "utf8")).toBe(before);
  const kept = await rawRequest({ url: endpoint, headers });
  expect(JSON.parse(kept.body)).toEqual({ styling: "off" });
  const restored = await save(JSON.stringify({ styling: "default" }));
  expect(restored.status).toBe(200);
  expect(JSON.parse(restored.body)).toEqual({ styling: "default" });
  expect(server.claudeCalls()).toEqual([]);
  expect(server.ghCalls()).toEqual([]);
});
