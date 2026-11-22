// Story B's queued attention page. The composed completion is already stored,
// its native report is kept, and the workspace path is gone before the story
// columns open. This does not launch, call retained(), run installed closure
// or reporting, or restart the dashboard.

import { rmSync } from "node:fs";
import type { Page } from "@playwright/test";
import type { CompletionReport } from "../../src/completionReport.ts";
import { doneSessionName } from "../../src/doneMark.ts";
import { readFinalReport } from "../finalReportPages.ts";
import { readyStory, type StoryColumnsJourney } from "../launchJourney.ts";
import { openStoryColumnsJourney } from "../storyColumnsPage.ts";
import { stored } from "./codexLaunch.ts";
import { keepComposedAttentionCompletion } from "./composedAttentionRecord.ts";
import type { DashboardServer } from "./dashboardServer.ts";
import type { FakeCodex } from "./fakeCodex.ts";
import { markDoneAnyway } from "./markDone.ts";
import { keepFinalReport } from "./retainedReport.ts";

export const attentionMessage =
  "Publication finished. Reminder: inspect the migration before release.\n<script>must remain text</script>";
export const nativeReport = "The saved conversation's final report.";

// The name Mark as done gives the one stored attention session. The original
// session name stays on the record; this is the renamed name.
export function storedDoneName(dashboard: DashboardServer): string {
  const session = stored(dashboard.home)[0]?.session;
  if (session === undefined) throw new Error("Missing stored session");
  return doneSessionName(session);
}

// The queued card with the saved native report already open. The workspace
// path is gone first, or the card offers Open terminal instead.
export async function openQueuedNativeReport(
  page: Page,
  dashboard: DashboardServer,
  native: FakeCodex | undefined,
  journey: StoryColumnsJourney,
  outcome: CompletionReport["outcome"] = "completed",
) {
  const workspace = keepComposedAttentionCompletion(
    dashboard,
    native,
    attentionMessage,
    outcome,
  );
  if (native === undefined) throw new Error("Missing native fixture");
  keepFinalReport(native, workspace, nativeReport);
  rmSync(workspace, { recursive: true, force: true });
  const opened = await openStoryColumnsJourney(page, journey);
  const card = opened.card(readyStory);
  return { native, card, report: await readFinalReport(card) };
}

// That open report stored unfinished, marked done while its native session
// observes an in-progress turn. Callers assert what the mark did.
export async function markObservedAttentionDone(
  page: Page,
  dashboard: DashboardServer,
  native: FakeCodex | undefined,
  journey: StoryColumnsJourney,
) {
  const opened = await openQueuedNativeReport(
    page,
    dashboard,
    native,
    journey,
    "unfinished",
  );
  opened.native.observations.set(opened.native.threadId, {
    status: { type: "active", activeFlags: [] },
    turns: [{ id: "observed-turn", status: "inProgress" }],
  });
  const before = opened.native.calls.length;
  await markDoneAnyway(opened.report.panel);
  return { ...opened, before };
}
