// OpenAI settings against controlled settings answers: a status answer the
// page asked for before a successful change cannot overwrite what that change
// answered, and touch editing keeps the password draft through viewport
// changes, a refused save and explicit recovery. Private persistence, no echo
// and no egress are ../../../e2e/configuration/system-settings-openai.spec.ts.
import { expect, test } from "../../test-support/support/frontendApp.ts";
import {
  installFrontendSettingsSubstitutes,
  productionSeedProjects,
} from "../../test-support/support/frontendSettingsSubstitutes.ts";
import {
  apiKey,
  save,
  status,
} from "../../test-support/support/openAISettingsPage.ts";
import {
  openAIConfigurationEndpoint,
  openAIRemoveEndpoint,
  openAISaveEndpoint,
} from "../../src/openAIConfiguration.ts";
import { tapWhereShown } from "../../test-support/pageLayout.ts";
import { phoneLaunchTouchViewport } from "../../test-support/touchLaunchPage.ts";
import { readSetting } from "../../test-support/support/settingsTouchPage.ts";

const key = "sk-synthetic-held-status-084";

for (const operation of ["save", "remove", "save after read error"] as const) {
  test(`a held status response cannot overwrite successful ${operation}`, async ({
    page,
    frontendServices,
  }) => {
    const answers = await installFrontendSettingsSubstitutes(
      page,
      frontendServices,
      { projects: productionSeedProjects },
    );
    if (operation === "remove") {
      await page.goto("/?view=settings");
      await expect(status(page)).toHaveText("API key: Not configured");
      await apiKey(page).fill(key);
      await save(page).click();
      await expect(status(page)).toHaveText("API key: Configured");
      await save(page).click();
      await expect(page.getByRole("alert")).toContainText("Enter an API key");
    }
    if (operation === "save after read error")
      answers.refuseNext(
        openAIConfigurationEndpoint,
        503,
        "The saved OpenAI API key could not be read.",
      );
    // The status read answers what the machine held before the change, and is
    // delivered only after the change answered.
    const heldStatus = answers.holdNext(openAIConfigurationEndpoint);
    if (operation === "remove")
      await page
        .getByRole("button", { name: "Retry status", exact: true })
        .click();
    else await page.goto("/?view=settings");
    await heldStatus.received;
    if (operation === "remove")
      await page
        .getByRole("button", { name: "Remove API key", exact: true })
        .click();
    else {
      await apiKey(page).fill(key);
      await save(page).click();
    }
    const expected =
      operation === "remove"
        ? "API key: Not configured"
        : "API key: Configured";
    await expect(status(page)).toHaveText(expected);
    heldStatus.release();
    await heldStatus.delivered;
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              resolve();
            });
          });
        }),
    );
    await expect(status(page)).toHaveText(expected);
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(apiKey(page)).toHaveValue("");
    expect(await page.locator("body").textContent()).not.toContain(key);
    expect(answers.changes.at(-1)).toEqual(
      operation === "remove"
        ? { endpoint: openAIRemoveEndpoint, body: {} }
        : { endpoint: openAISaveEndpoint, body: { apiKey: key } },
    );
  });
}

const original = "sk-synthetic-original-084";
const replacement = "sk-synthetic-replacement-084";
const { name, portrait, landscape } = phoneLaunchTouchViewport;

test.describe(`${name} OpenAI settings recovery`, () => {
  test.use({ viewport: portrait, hasTouch: true });
  test("touch keeps the password draft and the configured key through reduced height, rotation, a refused save and explicit recovery", async ({
    page,
    frontendServices,
  }) => {
    const answers = await installFrontendSettingsSubstitutes(
      page,
      frontendServices,
      { projects: productionSeedProjects },
    );
    await page.goto("/?view=settings");
    await readSetting(status(page));
    await expect(status(page)).toHaveText("API key: Not configured");
    // Align the field to the scrollport end the way a short phone view can:
    // without scroll-margin on the field, Save sits past the bottom edge.
    await apiKey(page).evaluate((field) => {
      field.scrollIntoView({ block: "end", inline: "nearest" });
    });
    await tapWhereShown(apiKey(page));
    await apiKey(page).pressSequentially(original);
    await tapWhereShown(save(page));
    await expect(status(page)).toHaveText("API key: Configured");
    await expect(apiKey(page)).toHaveValue("");
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
    }
    // Viewport changes alone saved nothing over the predecessor.
    expect(answers.changes).toEqual([
      { endpoint: openAISaveEndpoint, body: { apiKey: original } },
    ]);
    answers.refuseNext(
      openAISaveEndpoint,
      503,
      "The OpenAI API key could not be saved. Check the credential folder permissions and retry; the previous key was kept.",
    );
    await tapWhereShown(save(page));
    await expect(page.getByRole("alert")).toContainText("could not be saved");
    await expect(apiKey(page)).toHaveValue(draft);
    await expect(status(page)).toHaveText("API key: Configured");
    await readSetting(page.getByRole("alert"));
    await tapWhereShown(
      page.getByRole("button", { name: "Retry status", exact: true }),
    );
    await expect(page.getByRole("alert")).toHaveCount(0);
    await expect(apiKey(page)).toHaveValue(draft);
    await apiKey(page).scrollIntoViewIfNeeded();
    await tapWhereShown(save(page));
    await expect(apiKey(page)).toHaveValue("");
    // Remove-failure and clear-on-leave: ../../../e2e/configuration/system-settings-openai.spec.ts
    const remove = page.getByRole("button", {
      name: "Remove API key",
      exact: true,
    });
    await apiKey(page).scrollIntoViewIfNeeded();
    await tapWhereShown(remove);
    await expect(status(page)).toHaveText("API key: Not configured");
    // Only OpenAI changes were posted: no project list or terminal theme change.
    expect(answers.changes).toEqual([
      { endpoint: openAISaveEndpoint, body: { apiKey: original } },
      { endpoint: openAISaveEndpoint, body: { apiKey: draft } },
      { endpoint: openAISaveEndpoint, body: { apiKey: draft } },
      { endpoint: openAIRemoveEndpoint, body: {} },
    ]);
  });
});
