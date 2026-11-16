// A session entry says which model was requested: wherever the page lists a
// session -- its story's card, Taken, the Sessions sidebar -- the entry reads
// "Model: <Name> (requested)" for a launch record that asked for a model and
// says nothing for Default, and a reload reads the line again from the
// record. Its Session details name the effort the launch passed, "Effort:
// <level> (requested)", and a record kept without one shows no effort line.
// Synthetic machine answers only; that a launch keeps the model it
// was asked for is ../../backend-tests/launches/agent-launch-model-boundary.spec.ts
// and the dialog sending it is ../../../e2e/launches/agent-launch-model.spec.ts.

import type { Page } from "@playwright/test";
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../../tests/support/frontendApp.ts";
import { frontendStoryLaunch } from "../../tests/support/frontendServiceState.ts";
import {
  parts,
  sessionEntriesIn,
  sessionIdLineOf,
  storyCardSessions,
} from "../../tests/dashboardPage.ts";
import { backlogLaunchers } from "../../tests/launchStoryCardPage.ts";
import { sessionDetails } from "../../tests/support/sessionEntryDisclosure.ts";
import { readyStory } from "../../tests/launchJourney.ts";
import {
  expectTooltipLine,
  openSessionsSidebar,
  sessionsSidebarParts,
  sessionsSidebarSessionEntryTooltipOf,
} from "../../tests/sessionsSidebarPage.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const requested = (name: string) => `Model: ${name} (requested)`;

// The machine answers one working session launched from `record`.
const working = (record: LaunchRecord) =>
  makeMe.aMachineAnswer.observingOpen(record).please();

// Reads the page's entries, then reads them again after a reload.
async function throughReload(page: Page, expectWords: () => Promise<void>) {
  await openFrontendTakenBacklog(page);
  await expectWords();
  await page.reload();
  await expectWords();
}

for (const [model, name, words] of [
  ["opus", "Opus", requested("Opus")],
  [undefined, "Default", undefined],
] as const) {
  test(`a story session launched on ${name} ${
    words === undefined ? "shows no model" : "says so"
  } on its card and in the sidebar, through a reload`, async ({
    page,
    frontendServices,
  }) => {
    const record = frontendStoryLaunch("executing", readyStory);
    frontendServices.answerMachine(
      working(
        (model === undefined ? record : record.requestingModel(model)).please(),
      ),
    );
    const { recentlyDone } = parts(page);
    const { sidebar } = sessionsSidebarParts(page);

    await throughReload(page, async () => {
      const entry = storyCardSessions(backlogLaunchers(page).card(readyStory));
      await expect(recentlyDone.getByRole("article")).toHaveCount(0);
      await openSessionsSidebar(page);
      await expect(entry).toHaveCount(1);
      await expect(entry).toContainText("Execution");
      const row = sidebar.getByRole("listitem");
      await expect(row).toHaveCount(1);
      const tooltip = sessionsSidebarSessionEntryTooltipOf(row);
      await expect(tooltip).toHaveAttribute("title", /Execution/);
      if (words === undefined) {
        await expect(entry).not.toContainText("Model:");
        await expect(tooltip).not.toHaveAttribute("title", /Model:/);
      } else {
        await expect(entry).toContainText(words);
        await expectTooltipLine(row, words);
      }
    });
  });
}

test("an ad hoc session launched on Sonnet says so in Taken and in the sidebar, through a reload", async ({
  page,
  frontendServices,
}) => {
  frontendServices.answerMachine(
    working(
      makeMe.aLaunchRecord
        .adHoc({ title: "8 Jan, 10:00" })
        .requestingModel("sonnet")
        .please(),
    ),
  );
  const { taken, recentlyDone } = parts(page);
  const { sidebar } = sessionsSidebarParts(page);

  await throughReload(page, async () => {
    await openSessionsSidebar(page);
    const entry = sessionEntriesIn(taken);
    await expect(entry).toHaveCount(1);
    await expect(sessionEntriesIn(recentlyDone)).toHaveCount(0);
    await expect(entry).toContainText("Ad hoc");
    await expect(entry).toContainText(requested("Sonnet"));
    const tooltip = sessionsSidebarSessionEntryTooltipOf(
      sidebar.getByRole("listitem"),
    );
    await expect(tooltip).toHaveCount(1);
    await expect(tooltip).toHaveAttribute("title", /Ad hoc/);
    await expectTooltipLine(sidebar.getByRole("listitem"), requested("Sonnet"));
  });
});

for (const [effort, words] of [
  ["max", "Effort: max (requested)"],
  [undefined, undefined],
] as const) {
  test(`a story session ${
    effort === undefined
      ? "recorded without an effort shows no effort line"
      : `started at ${effort} names it`
  } in its Session details, through a reload`, async ({
    page,
    frontendServices,
  }) => {
    const launch = frontendStoryLaunch("executing", readyStory);
    const record = (
      effort === undefined ? launch : launch.requestingEffort(effort)
    ).please();
    frontendServices.answerMachine(working(record));

    await throughReload(page, async () => {
      const entry = storyCardSessions(backlogLaunchers(page).card(readyStory));
      await expect(entry).toHaveCount(1);
      await sessionDetails(entry);
      await expect(
        sessionIdLineOf(entry, record.session.sessionId),
      ).toBeVisible();
      if (words === undefined) {
        await expect(entry).not.toContainText("Effort:");
      } else {
        await expect(entry.getByText(words, { exact: true })).toBeVisible();
      }
    });
  });
}
