// Frontend fixtures for Recently done sessions review-cue journeys: the
// three-project selection launches plus Open Dough's matching done identity
// (already reviewed) and the extra retained sessions those cues cover.

import type { Locator, Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { MachineAnswerBuilder } from "../../../Distribution/tests/support/machineAnswerTestData.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { recentlyDoneSessionsInitialLimit } from "../../src/agentLaunch.ts";
import { expectProjectChoice } from "../dashboardPage.ts";
import {
  recentlyDoneParts,
  showRecentlyDone,
} from "../recentlyDoneSessionsSidebarPage.ts";
import { expect } from "./frontendApp.ts";
import { installFrontendFinalReport } from "./frontendFinalReportSubstitutes.ts";
import {
  adHoc,
  linked,
  observeFrontendSelectionLaunch,
  report,
  selectionLaunchRecords,
  takenElsewhere,
} from "./frontendRecentlyDoneSelection.ts";
import {
  putFrontendDoneRecords,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import { installFrontendStoryReviewState } from "./frontendStoryReviewState.ts";

export { adHoc, linked, report, takenElsewhere };

export const localTitle = "The same story identity completed in Open Dough";
export const localSessionTitle =
  "Open Dough session of the identical story identity";
export const duplicateTitle = "Another Pygardon session of the finished story";
export const longSessionTitle =
  "A very long completed story session title that must leave Needs review visible at narrow touch width without hiding Select or Open";

export function cueSession(
  title: string,
  index: number,
  source = "pygardon",
): LaunchRecord {
  return makeMe.aLaunchRecord
    .executing({ identity: linked.identity, title, source })
    .inClaudeSession({
      sessionId: `cue-session-${source}-${String(index)}`,
      shortId: `cue-${String(index)}`,
    })
    .onStoryBranch({
      workspace: `/tmp/retired-cue-${String(index)}`,
      branch: "claude/retired-cue",
    })
    .completedWith({ message: `Report for ${title}.` })
    .launchedAt(new Date(Date.now() - (index + 10) * 60_000).toISOString())
    .markedDoneAt(new Date(Date.now() - (index + 1) * 1000).toISOString())
    .please();
}

function observeReviewCue(
  answer: MachineAnswerBuilder,
  record: LaunchRecord,
): MachineAnswerBuilder {
  // Cue-session reports open the final report instead of a terminal.
  if (
    typeof record.completion?.message === "string" &&
    record.completion.message.startsWith("Report for ")
  ) {
    return answer.observing(
      makeMe.anObservedLaunch
        .of(record)
        .withSessionState(makeMe.aSessionState.retained("review").please())
        .withWorkspace("missing")
        .please(),
    );
  }
  return observeFrontendSelectionLaunch(answer, record);
}

// Opens the three-project Frontend page with review-cue sessions and Open
// Dough's matching identity already reviewed locally.
export async function openFrontendReviewCueSessions(
  page: Page,
  services: FrontendServiceState,
  {
    extra = [],
    tap,
  }: {
    readonly extra?: readonly LaunchRecord[];
    readonly tap?: (control: Locator) => Promise<void>;
  } = {},
) {
  const now = Date.now();
  const completedAt = new Date(now - 3_600_000).toISOString();
  services.listThreeProjects();
  putFrontendDoneRecords(services, "pygardon", [
    makeMe.aDoneRecord
      .completed({
        identity: linked.identity,
        title: linked.title,
        completedAt,
      })
      .please(),
  ]);
  putFrontendDoneRecords(services, "open-dough", [
    makeMe.aDoneRecord
      .completed({
        identity: linked.identity,
        title: localTitle,
        completedAt,
      })
      .please(),
  ]);
  const launches = [
    ...selectionLaunchRecords(now),
    cueSession(localSessionTitle, 20, "open-dough"),
    cueSession(duplicateTitle, 21),
    ...extra,
  ];
  const answer = makeMe.aMachineAnswer;
  for (const record of launches) observeReviewCue(answer, record);
  services.answerMachine(answer.please());
  const reports = await installFrontendFinalReport(page, {
    kind: "available",
    turnId: "selection-report",
    text: report.message,
  });
  for (const record of launches) {
    const message = record.completion?.message;
    if (typeof message === "string" && message.startsWith("Report for ")) {
      reports.answerNext(
        {
          kind: "available",
          turnId: `cue-${record.session.sessionId}`,
          text: message,
        },
        record.session.sessionId,
      );
    }
  }
  const review = await installFrontendStoryReviewState(page, {
    "open-dough": [linked.identity],
  });
  await page.goto("/?project=open-dough");
  await expectProjectChoice(page, "Open Dough");
  await expect(
    page.getByRole("button", { name: /Start session in/ }),
  ).toBeVisible();
  const shown =
    tap === undefined
      ? await showRecentlyDone(page)
      : await (async () => {
          const parts = recentlyDoneParts(page);
          await tap(parts.button);
          await parts.header.click();
          return parts;
        })();
  await expect(shown.entries).toHaveCount(
    Math.min(launches.length, recentlyDoneSessionsInitialLimit),
  );
  return { shown, row: shown.row, review };
}
