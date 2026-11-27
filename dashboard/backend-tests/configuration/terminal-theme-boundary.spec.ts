// Which requests the terminal theme boundary (../../server/terminalThemeBoundary.ts)
// refuses, at the boundary server over raw HTTP: another site or Host, a
// method it does not take, malformed bodies, themes it does not know and the
// wrong content type; none changes the saved theme. The page's recovery from
// a saved theme it cannot use is ../../../e2e/configuration/system-settings-terminal-theme-recovery.spec.ts.
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, expect, test } from "vitest";
import { installTerminalThemeMiddleware } from "../../server/terminalThemeBoundary.ts";
import { terminalThemeFile } from "../../server/terminalTheme.ts";
import {
  privateSettingsMachine,
  type PrivateSettingsMachine,
} from "../support/privateSettingsMachine.ts";
import {
  startInProcessBoundaryHttp,
  type InProcessBoundaryHttp,
} from "../../test-support/support/inProcessBoundaryHttp.ts";
import { rawRequest } from "../../test-support/support/rawHttp.ts";

let machine: PrivateSettingsMachine;
let server: InProcessBoundaryHttp;
beforeEach(async () => {
  machine = privateSettingsMachine();
  server = await startInProcessBoundaryHttp(
    { name: "dough-terminal-theme", install: installTerminalThemeMiddleware },
    "production",
  );
});
afterEach(async () => {
  try {
    await server.closeBoundary();
    await server.closeHttp();
  } finally {
    machine.close();
  }
});

test("terminal theme endpoint refuses foreign, malformed and unknown requests without changing the saved theme", async () => {
  const endpoint = `${server.origin}/__terminal-theme`;
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
  expect(JSON.parse(fresh.body)).toEqual({ theme: "default" });
  expect(fresh.headers["cache-control"]).toBe("no-store");
  const saved = await save(JSON.stringify({ theme: "solarized-light" }));
  expect(saved.status).toBe(200);
  expect(JSON.parse(saved.body)).toEqual({ theme: "solarized-light" });
  const file = terminalThemeFile();
  const before = readFileSync(file, "utf8");
  expect(JSON.parse(before)).toEqual({ theme: "solarized-light" });
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
              : { body: JSON.stringify({ theme: "light" }) }),
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
    '"light"',
    JSON.stringify({ theme: "light", extra: true }),
  ]) {
    const refused = await save(body);
    expect(refused.status).toBe(400);
    expect(JSON.parse(refused.body)).toHaveProperty("error");
  }
  for (const theme of ["dracula", "Light", "", 3, null]) {
    const refused = await save(JSON.stringify({ theme }));
    expect(refused.status).toBe(400);
    expect(refused.body).toContain("Choose one of the listed terminal themes");
  }
  expect(
    (
      await save(JSON.stringify({ theme: "light" }), {
        "Content-Type": "text/plain",
      })
    ).status,
  ).toBe(415);
  expect(readFileSync(file, "utf8")).toBe(before);
  const kept = await rawRequest({ url: endpoint, headers });
  expect(JSON.parse(kept.body)).toEqual({ theme: "solarized-light" });
  expect(machine.commandCalls()).toBe("");
});
