import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { systemSettingsMachine } from "./support/systemSettingsMachine.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { apiKey, save, status } from "./support/openAISettingsPage.ts";
import { back, settings } from "./support/systemSettingsPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());
const original = "sk-synthetic-original-084";
const replacement = "sk-synthetic-replacement-084";

test("empty-project settings saves private general access, shares it across dev/preview/restart, replaces and removes without importing the environment key", async ({
  page,
  context,
}) => {
  const browserEgress: string[] = [];
  context.on("request", (request) => {
    const url = new URL(request.url());
    if (
      ["http:", "https:"].includes(url.protocol) &&
      !["127.0.0.1", "localhost"].includes(url.hostname)
    )
      browserEgress.push(url.host);
  });
  const server = await fixture.start("dev");
  await openUntilRead(page, `${server.baseURL}/?view=settings`);
  await expect(
    page.getByText("No projects configured. Add a project to get started."),
  ).toBeVisible();
  await expect(status(page)).toHaveText("API key: Not configured");
  expect(existsSync(fixture.credentialFile)).toBe(false);
  const projects = path.join(
    fixture.home,
    ".open-dough/dashboard/projects-development.json",
  );
  const before = readFileSync(projects, "utf8");
  await expect(apiKey(page)).toHaveAttribute("type", "password");
  await apiKey(page).fill(original);
  await save(page).click();
  await expect(status(page)).toHaveText("API key: Configured");
  await expect(apiKey(page)).toHaveValue("");
  await expect(apiKey(page)).toBeFocused();
  expect(JSON.parse(readFileSync(fixture.credentialFile, "utf8"))).toEqual({
    apiKey: original,
  });
  expect(statSync(fixture.credentialDirectory).mode & 0o777).toBe(0o700);
  expect(statSync(fixture.credentialFile).mode & 0o777).toBe(0o600);
  expect(readdirSync(fixture.credentialDirectory)).toEqual(["openai.json"]);
  const answer = await rawRequest({
    url: `${server.baseURL}/__openai-configuration`,
    headers: { Origin: server.origin },
  });
  expect(answer.status).toBe(200);
  expect(answer.headers["cache-control"]).toBe("no-store");
  expect(JSON.parse(answer.body)).toEqual({ configured: true });
  await save(page).click();
  await expect(page.getByRole("alert")).toContainText("Enter an API key");
  expect(JSON.parse(readFileSync(fixture.credentialFile, "utf8"))).toEqual({
    apiKey: original,
  });
  await apiKey(page).fill("unsaved-synthetic-draft");
  await back(page).click();
  await settings(page).click();
  await expect(apiKey(page)).toHaveValue("");
  const port = Number(new URL(server.baseURL).port);
  await fixture.stop(server);
  const restarted = await fixture.start("dev", port);
  await page.reload();
  await expect(status(page)).toHaveText("API key: Configured");
  await expect(apiKey(page)).toHaveValue("");
  const preview = await fixture.start("preview");
  const second = await context.newPage();
  await second.goto(`${preview.baseURL}/?view=settings&project=doughnut`);
  await expect(status(second)).toHaveText("API key: Configured");
  await apiKey(second).fill(replacement);
  await save(second).click();
  await expect(apiKey(second)).toHaveValue("");
  expect(JSON.parse(readFileSync(fixture.credentialFile, "utf8"))).toEqual({
    apiKey: replacement,
  });
  await page.reload();
  await expect(status(page)).toHaveText("API key: Configured");
  const productionProjects = readFileSync(
    path.join(fixture.home, ".open-dough/dashboard/projects-production.json"),
    "utf8",
  );
  expect(JSON.parse(productionProjects)).toHaveLength(4);
  await second
    .getByRole("button", { name: "Remove API key", exact: true })
    .click();
  await expect(status(second)).toHaveText("API key: Not configured");
  expect(existsSync(fixture.credentialFile)).toBe(false);
  await page.reload();
  await expect(status(page)).toHaveText("API key: Not configured");
  expect(readFileSync(projects, "utf8")).toBe(before);
  expect(
    readFileSync(
      path.join(fixture.home, ".open-dough/dashboard/projects-production.json"),
      "utf8",
    ),
  ).toBe(productionProjects);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "synthetic",
  );
  expect(page.url()).not.toContain(original);
  expect(await page.locator("body").textContent()).not.toContain(original);
  for (const local of [server, restarted, preview]) {
    expect(local.output()).not.toContain(original);
    expect(local.output()).not.toContain(replacement);
    expect(local.claudeCalls()).toEqual([]);
  }
  expect(fixture.egress()).toBe("");
  expect(browserEgress).toEqual([]);
  expect(fixture.temporaryPermissions()).toEqual([0o600, 0o600]);
});
