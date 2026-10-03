import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { systemSettingsMachine } from "./support/systemSettingsMachine.ts";
import { rawRequest } from "./support/rawHttp.ts";
import {
  terminalThemeFile,
  themeChoice,
} from "./support/terminalThemeSettingsPage.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());

test("terminal theme endpoint refuses foreign, malformed and unknown requests without changing the saved theme", async () => {
  const server = await fixture.start("dev");
  const endpoint = `${server.baseURL}/__terminal-theme`;
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
  const file = terminalThemeFile(fixture.home);
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
  expect(server.claudeCalls()).toEqual([]);
  expect(server.ghCalls()).toEqual([]);
});

test("an unreadable or unknown saved terminal theme is a read problem shown in System settings with Retry", async ({
  page,
}) => {
  const file = terminalThemeFile(fixture.home);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, '{"theme":"dracula"}\n');
  const server = await fixture.start("dev");
  const read = await rawRequest({
    url: `${server.baseURL}/__terminal-theme`,
    headers: { Origin: server.origin },
  });
  expect(read.status).toBe(503);
  expect(read.body).toContain("not one this dashboard knows");
  await page.goto(`${server.baseURL}/?view=settings`);
  const alert = page.getByRole("alert");
  await expect(alert).toContainText("not one this dashboard knows");
  await expect(themeChoice(page).locator("option:checked")).toHaveText(
    "Default",
  );
  writeFileSync(file, "{");
  await alert.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(alert).toContainText("could not be read");
  writeFileSync(file, '{"theme":"light"}\n');
  await alert.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(themeChoice(page).locator("option:checked")).toHaveText("Light");
  chmodSync(file, 0o000);
  try {
    await page.reload();
    await expect(page.getByRole("alert")).toContainText(
      "Check its file permissions",
    );
  } finally {
    chmodSync(file, 0o600);
  }
  writeFileSync(file, '{"theme":"dracula"}\n');
  await page.reload();
  await expect(page.getByRole("alert")).toContainText(
    "not one this dashboard knows",
  );
  await themeChoice(page).selectOption({ label: "Solarized Dark" });
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(JSON.parse(readFileSync(file, "utf8"))).toEqual({
    theme: "solarized-dark",
  });
});
