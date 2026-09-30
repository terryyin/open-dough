// Choosing the model in a launch dialog, on the committed origin of
// ./agent-launch-card.spec.ts (./launchJourney.ts): every launch dialog offers
// Model after its instruction field, on Default at each opening, and a chosen
// model reaches the synthetic `claude` (./fixtures/fake-claude) as `--model`.
// The real `claude` is never reached. How the launch boundary takes a model is
// ./agent-launch-model-boundary.spec.ts.

import type { Locator, Page } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { cardSessions } from "./dashboardPage.ts";
import {
  openTakenBacklog,
  startSession,
  startSessionDialog,
} from "./launchCardPage.ts";
import {
  notRefinedStory,
  publishLaunchJourney,
  readyStory,
  type LaunchJourney,
} from "./launchJourney.ts";

let journey: LaunchJourney;
// Publishing runs production backlog commands against a local origin; give
// it its own budget so a busy machine cannot starve it.
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
// A setup that failed leaves nothing to clean up.
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test.use({ projectFolders: ["open-dough"] });

const defaultChoice = "Default (your Claude Code setting)";
const choices = [defaultChoice, "Fable", "Opus", "Sonnet"];

// The three launch actions, each opened from the page and answering its
// dialog.
async function actions(page: Page) {
  const { card, start, refine, dialog, refinementDialog } =
    await openTakenBacklog(page, journey);
  return {
    card,
    execution: {
      open: () => start(readyStory).click(),
      dialog,
    },
    refinement: {
      open: () => refine(notRefinedStory).click(),
      dialog: refinementDialog,
    },
    session: {
      open: () => startSession(page, "Open Dough").click(),
      dialog: startSessionDialog(page, "Open Dough"),
    },
  };
}

const modelOf = (dialog: Locator) =>
  dialog.getByRole("combobox", { name: "Model" });

const modelArgs = (argv: readonly string[]) => {
  const at = argv.indexOf("--model");
  return at === -1 ? [] : argv.slice(at, at + 2);
};

for (const [kind, model, alias, name] of [
  ["refinement", "Opus", "opus", "Refinement"],
  ["execution", "Opus", "opus", "Execution"],
  ["session", "Sonnet", "sonnet", "Ad hoc"],
] as const) {
  test(`the ${kind} dialog offers Model after the instruction on Default, and choosing ${model} starts the session with --model ${alias}`, async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { [kind]: action } = await actions(page);

    await action.open();
    const select = modelOf(action.dialog);
    await expect(select).toBeVisible();
    await expect(select.locator("option")).toHaveText(choices);
    await expect(select).toHaveValue("");
    const [field, choice] = await Promise.all([
      action.dialog.getByRole("textbox").boundingBox(),
      select.boundingBox(),
    ]);
    if (!field || !choice) throw new Error("not laid out");
    expect(choice.y).toBeGreaterThanOrEqual(field.y + field.height);

    await select.selectOption({ label: model });
    await action.dialog.getByRole("button", { name: "Start" }).click();

    await expect(action.dialog).toBeHidden();
    await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
    const [call] = dashboard.claudeLaunchCalls();
    expect(call?.argv[1]).toBe("--name");
    expect(call?.argv[2]).toContain(name);
    expect(modelArgs(call?.argv ?? [])).toEqual(["--model", alias]);
  });
}

for (const kind of ["refinement", "execution", "session"] as const) {
  test(`the ${kind} dialog left on Default starts the session without --model`, async ({
    page,
    dashboard,
  }) => {
    dashboard.claudeScenario("launched");
    const { [kind]: action } = await actions(page);

    await action.open();
    await action.dialog.getByRole("button", { name: "Start" }).click();

    await expect(action.dialog).toBeHidden();
    await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);
    expect(dashboard.claudeLaunchCalls()[0]?.argv).not.toContain("--model");
  });
}

for (const dismiss of ["Cancel", "Escape"] as const) {
  test(`Fable chosen then ${dismiss} starts nothing, and every dialog opens again on Default`, async ({
    page,
    dashboard,
  }) => {
    const { execution, refinement, session } = await actions(page);
    const all = [execution, refinement, session];

    for (const action of all) {
      await action.open();
      await modelOf(action.dialog).selectOption({ label: "Fable" });
      if (dismiss === "Cancel") {
        await action.dialog.getByRole("button", { name: "Cancel" }).click();
      } else {
        await page.keyboard.press("Escape");
      }
      await expect(action.dialog).toBeHidden();
    }
    for (const action of all) {
      await action.open();
      await expect(modelOf(action.dialog)).toHaveValue("");
      await page.keyboard.press("Escape");
      await expect(action.dialog).toBeHidden();
    }

    expect(dashboard.claudeCalls()).toEqual([]);
  });
}

test("Opus launched from a dialog, the same dialog opens again on Default", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("launched");
  const { session } = await actions(page);

  await session.open();
  await modelOf(session.dialog).selectOption({ label: "Opus" });
  await session.dialog.getByRole("button", { name: "Start" }).click();
  await expect(session.dialog).toBeHidden();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(1);

  await session.open();
  await expect(modelOf(session.dialog)).toHaveValue("");
  await session.dialog.getByRole("button", { name: "Start" }).click();
  await expect.poll(() => dashboard.claudeLaunchCalls()).toHaveLength(2);
  const [first, second] = dashboard.claudeLaunchCalls();
  expect(modelArgs(first?.argv ?? [])).toEqual(["--model", "opus"]);
  expect(second?.argv).not.toContain("--model");
});

test("the dialog opens in the instruction field, and Tab reaches Model, Start, then Cancel", async ({
  page,
  dashboard,
}) => {
  const { refinement } = await actions(page);

  await refinement.open();
  const { dialog } = refinement;
  await expect(
    dialog.getByRole("textbox", { name: "Instruction (optional)" }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(modelOf(dialog)).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Start" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  expect(dashboard.claudeCalls()).toEqual([]);
});

test("a refused launch with Opus says Launch failed beside its action, closes the dialog, and lists no session", async ({
  page,
  dashboard,
}) => {
  dashboard.claudeScenario("refused");
  const { card, execution } = await actions(page);

  await execution.open();
  await modelOf(execution.dialog).selectOption({ label: "Opus" });
  await execution.dialog.getByRole("button", { name: "Start" }).click();

  await expect(execution.dialog).toBeHidden();
  await expect(card(readyStory).locator(".launch-problem")).toContainText(
    "Launch failed: Claude Code refused to start a session",
  );
  await expect(card(readyStory).locator(".launch-problem")).toContainText(
    "Opus",
  );
  await expect(cardSessions(card(readyStory))).toHaveCount(0);
  expect(dashboard.claudeCalls()).toHaveLength(1);
});
