import { chmodSync, existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { systemSettingsMachine } from "./support/systemSettingsMachine.ts";
import { apiKey, save, status } from "./support/openAISettingsPage.ts";
import { back, settings } from "./support/systemSettingsPage.ts";
import { tapWhereShown } from "./pageLayout.ts";
import { phoneLaunchTouchViewport } from "./touchLaunchPage.ts";
import { readSetting } from "./support/settingsTouchPage.ts";

let fixture: ReturnType<typeof systemSettingsMachine>;
test.beforeEach(() => {
  fixture = systemSettingsMachine();
});

const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} OpenAI settings recovery`, () => {
  test.use({ viewport: portrait, hasTouch: true });
  test("touch keeps the password draft and predecessor through reduced height, rotation, failed writes and explicit recovery", async ({
    page,
  }) => {
    const server = await fixture.start("preview");
    await page.goto(`${server.baseURL}/?view=settings`);
    await readSetting(status(page));
    await expect(status(page)).toHaveText("API key: Not configured");
    await apiKey(page).scrollIntoViewIfNeeded();
    await tapWhereShown(apiKey(page));
    await apiKey(page).pressSequentially(original);
    await tapWhereShown(save(page));
    await expect(status(page)).toHaveText("API key: Configured");
    await expect(apiKey(page)).toHaveValue("");
    const predecessor = readFileSync(fixture.credentialFile, "utf8");
    const projects = path.join(
      fixture.home,
      ".open-dough/dashboard/projects-production.json",
    );
    const beforeProjects = readFileSync(projects, "utf8");
    await apiKey(page).scrollIntoViewIfNeeded();
    await tapWhereShown(apiKey(page));
    await apiKey(page).pressSequentially(replacement);
    await page.setViewportSize({ width: portrait.width, height: 320 });
    await apiKey(page).scrollIntoViewIfNeeded();
    await tapWhereShown(apiKey(page));
    const caret = await apiKey(page).evaluate((field: HTMLInputElement) => ({
      start: field.selectionStart ?? 0,
      end: field.selectionEnd ?? 0,
    }));
    await apiKey(page).pressSequentially("-edited");
    const draft = `${replacement.slice(0, caret.start)}-edited${replacement.slice(caret.end)}`;
    await expect(apiKey(page)).toHaveValue(draft);
    await expect(apiKey(page)).toBeFocused();
    for (const view of [
      landscape,
      portrait,
      { width: portrait.width, height: 320 },
    ]) {
      await page.setViewportSize(view);
      await apiKey(page).scrollIntoViewIfNeeded();
      await expect(apiKey(page)).toHaveValue(draft);
      expect(readFileSync(fixture.credentialFile, "utf8")).toBe(predecessor);
    }
    const parent = path.dirname(fixture.credentialDirectory);
    chmodSync(parent, 0o000);
    try {
      await tapWhereShown(save(page));
      await expect(page.getByRole("alert")).toContainText("could not be saved");
      await expect(apiKey(page)).toHaveValue(draft);
      await expect(status(page)).toHaveText("API key: Configured");
    } finally {
      chmodSync(parent, 0o700);
    }
    expect(readFileSync(fixture.credentialFile, "utf8")).toBe(predecessor);
    await readSetting(page.getByRole("alert"));
    await tapWhereShown(
      page.getByRole("button", { name: "Retry status", exact: true }),
    );
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(apiKey(page)).toHaveValue(draft);
    expect(readFileSync(fixture.credentialFile, "utf8")).toBe(predecessor);
    await apiKey(page).scrollIntoViewIfNeeded();
    await tapWhereShown(save(page));
    await expect(apiKey(page)).toHaveValue("");
    const replaced = readFileSync(fixture.credentialFile, "utf8");
    expect(JSON.parse(replaced)).toEqual({ apiKey: draft });
    const remove = page.getByRole("button", {
      name: "Remove API key",
      exact: true,
    });
    chmodSync(fixture.credentialDirectory, 0o500);
    try {
      await tapWhereShown(remove);
      await expect(page.getByRole("alert")).toContainText(
        "could not be removed",
      );
      expect(readFileSync(fixture.credentialFile, "utf8")).toBe(replaced);
      await expect(status(page)).toHaveText("API key: Configured");
    } finally {
      chmodSync(fixture.credentialDirectory, 0o700);
    }
    await readSetting(page.getByRole("alert"));
    await apiKey(page).scrollIntoViewIfNeeded();
    await tapWhereShown(remove);
    await expect(status(page)).toHaveText("API key: Not configured");
    expect(existsSync(fixture.credentialFile)).toBe(false);
    // Leaving settings intentionally clears an unsaved key, as on desktop.
    await readSetting(apiKey(page));
    await tapWhereShown(apiKey(page));
    await apiKey(page).pressSequentially("sk-synthetic-cancelled");
    await tapWhereShown(back(page));
    await tapWhereShown(settings(page));
    await expect(apiKey(page)).toHaveValue("");
    expect(readFileSync(projects, "utf8")).toBe(beforeProjects);
    expect(
      existsSync(
        path.join(fixture.home, ".open-dough/dashboard/terminal-theme.json"),
      ),
    ).toBe(false);
    expect(fixture.egress()).toBe("");
    expect(server.output()).not.toContain(original);
    expect(server.output()).not.toContain(draft);
    expect(server.claudeCalls()).toEqual([]);
  });
});
test.afterEach(async () => fixture.close());
const original = "sk-synthetic-original-084";
const replacement = "sk-synthetic-replacement-084";

test("failed save/removal preserve predecessor bytes and allow explicit retries with the entered draft", async ({
  page,
}) => {
  const server = await fixture.start("preview");
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
