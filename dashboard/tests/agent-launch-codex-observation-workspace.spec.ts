// What a saved Codex session offers when its continuation is unknown or its
// workspace is gone: a predecessor without continuation gains no command, and
// a missing workspace keeps passive final-report access, through reload, with
// the store and the native host untouched. The states themselves on the card
// and sidebar are ./agent-launch-codex-observation.spec.ts.
import path from "node:path";
import { openTakenBacklog } from "./launchStoryCardPage.ts";
import { notRefinedStory } from "./launchJourney.ts";
import { storyCardSessions, parts } from "./dashboardPage.ts";
import { test, expect, stored } from "./support/codexLaunch.ts";
import { passive as passiveReport } from "./support/retainedReport.ts";
import {
  observationRecord as record,
  saveObservations as save,
  observed,
  passive,
} from "./support/codexObservation.ts";
import { reloadUntilRead } from "./pageRequestNotes.ts";
test.use({ projectFolders: ["open-dough"] });

test("predecessor without continuation gains no command; missing workspace preserves passive final-report access", async ({
  page,
  dashboard,
  codexProtocol: protocol,
  launchJourney,
}) => {
  const native = protocol;
  if (native === undefined) throw new Error("Missing native fixture");
  const legacy = record(dashboard, native, "legacy-no-continuation");
  delete legacy.session.continuation;
  const missing = record(dashboard, native, native.threadId);
  if (missing.session.continuation === undefined)
    throw new Error("Missing continuation");
  missing.session.continuation.workspace = path.join(
    dashboard.home,
    "retired-workspace",
  );
  native.cwd = missing.session.continuation.workspace;
  native.history = [
    {
      id: "final-turn",
      status: "completed",
      items: [
        {
          type: "agentMessage",
          phase: "final_answer",
          text: "The saved conversation's final report.",
        },
      ],
    },
  ];
  observed(native, native.threadId, { type: "notLoaded" }, "completed");
  save(dashboard, [legacy, missing]);
  const before = stored(dashboard.home);
  const { card } = await openTakenBacklog(page, launchJourney);
  const entries = () => [storyCardSessions(card(notRefinedStory))];
  const check = async () => {
    await expect(parts(page).recentlyDone.getByRole("article")).toHaveCount(0);
    for (const list of entries()) {
      for (const { session } of [legacy, missing]) {
        const id = session.sessionId;
        const entry = list.filter({
          has: page.locator(`code:text-is("${id}")`),
        });
        await expect(
          entry.locator("p", { hasText: /^Continue in / }),
        ).toHaveCount(0);
        await expect(
          entry.getByRole("button", { name: "Open terminal" }),
        ).toHaveCount(0);
        await expect(
          entry.getByRole("button", { name: "Read final report" }),
        ).toBeVisible();
        await expect(
          entry.locator("p", { hasText: /^Workspace / }),
        ).toHaveCount(id === legacy.session.sessionId ? 0 : 1);
        await expect(entry).toContainText(
          id === legacy.session.sessionId
            ? "saved workspace availability could not be established"
            : "saved workspace is missing",
        );
      }
    }
  };
  await check();
  await reloadUntilRead(page);
  await check();
  expect(stored(dashboard.home)).toEqual(before);
  passive(native.calls);
  for (const list of entries()) {
    await list
      .filter({
        has: page.locator(`code:text-is("${missing.session.sessionId}")`),
      })
      .getByRole("button", { name: "Read final report" })
      .click();
    const panel = page.getByRole("region", { name: "Final report" });
    await expect(panel.locator(".final-report-text")).toHaveText(
      "The saved conversation's final report.",
    );
    await panel.getByRole("button", { name: "Close", exact: true }).click();
  }
  expect(stored(dashboard.home)).toEqual(before);
  passiveReport(native, 0);
});
