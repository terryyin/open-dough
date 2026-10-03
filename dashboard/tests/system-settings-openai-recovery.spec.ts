import { chmodSync, existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { systemSettingsMachine } from "./support/systemSettingsMachine.ts";
import { apiKey, save, status } from "./support/openAISettingsPage.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});
test.afterEach(async () => fixture.close());
const original = "sk-synthetic-original-084";
const replacement = "sk-synthetic-replacement-084";

test("failed save/removal preserve predecessor bytes and allow explicit retries with the entered draft", async ({
  page,
}) => {
  const server = await fixture.start("dev");
  await page.goto(`${server.baseURL}/?view=settings`);
  await apiKey(page).fill(original);
  await save(page).click();
  await expect(status(page)).toHaveText("API key: Configured");
  const before = readFileSync(fixture.credentialFile, "utf8");
  const parent = path.dirname(fixture.credentialDirectory);
  await apiKey(page).fill(replacement);
  chmodSync(parent, 0o000);
  try {
    await save(page).click();
    await expect(page.getByRole("alert")).toContainText("could not be saved");
    await expect(apiKey(page)).toHaveValue(replacement);
    await expect(status(page)).toHaveText("API key: Configured");
  } finally {
    chmodSync(parent, 0o700);
  }
  expect(readFileSync(fixture.credentialFile, "utf8")).toBe(before);
  expect(readdirSync(fixture.credentialDirectory)).toEqual(["openai.json"]);
  await save(page).click();
  await expect(apiKey(page)).toHaveValue("");
  const replaced = readFileSync(fixture.credentialFile, "utf8");
  expect(JSON.parse(replaced)).toEqual({ apiKey: replacement });
  chmodSync(fixture.credentialDirectory, 0o500);
  try {
    await page
      .getByRole("button", { name: "Remove API key", exact: true })
      .click();
    await expect(page.getByRole("alert")).toContainText("could not be removed");
    expect(readFileSync(fixture.credentialFile, "utf8")).toBe(replaced);
    await expect(status(page)).toHaveText("API key: Configured");
  } finally {
    chmodSync(fixture.credentialDirectory, 0o700);
  }
  await page
    .getByRole("button", { name: "Remove API key", exact: true })
    .click();
  await expect(status(page)).toHaveText("API key: Not configured");
  expect(existsSync(fixture.credentialFile)).toBe(false);
  expect(fixture.egress()).toBe("");
  expect(server.output()).not.toContain(original);
  expect(server.output()).not.toContain(replacement);
});
