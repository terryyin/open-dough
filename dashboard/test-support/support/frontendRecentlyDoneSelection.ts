// Frontend fixtures for Recently done sessions Select / association journeys:
// three projects, Pygardon's published done story, and the four retained Done
// sessions selection cases open the page on.

import type { Locator, Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { MachineAnswerBuilder } from "../../../Distribution/tests/support/machineAnswerTestData.mjs";
import {
  doneRecordFileName,
  renderDoneRecord,
} from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { expectProjectChoice } from "../dashboardPage.ts";
import {
  recentlyDoneParts,
  showRecentlyDone,
} from "../recentlyDoneSessionsSidebarPage.ts";
import { expect } from "./frontendApp.ts";
import { installFrontendFinalReport } from "./frontendFinalReportSubstitutes.ts";
import {
  putFrontendDonePublication,
  putFrontendDoneRecords,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

const minute = 60_000;

export const linked = {
  identity: "SEED-501#finished-in-pygardon",
  title: "Pygardon finished story",
};
export const report = {
  identity: "SEED-301#queued",
  title: "Open Dough reported session",
  message: "Landed the reported change on main.",
};
export const takenElsewhere = {
  identity: "slice-plans/303-taken",
  title: "Pygardon's taken story session",
};
export const adHoc = {
  instruction: "Tidy Doughnut's notes",
  title: "Doughnut ad hoc session",
};

export type NewerSessions = {
  readonly doughnut?: number;
  readonly pygardon?: number;
};

function newerIn(
  project: keyof NewerSessions,
  count: number,
  { from, to }: { readonly from: number; readonly to: number },
  at: (minutes: number) => string,
): LaunchRecord[] {
  return Array.from(Array(count).keys(), (index) => {
    const title = `${project} newer session ${String(index + 1)}`;
    const done = from - ((from - to) * index) / count;
    return makeMe.aLaunchRecord
      .adHoc({ instruction: title, title, source: project })
      .inClaudeSession({ sessionId: `${project}-newer-${String(index)}` })
      .launchedAt(at(done + 0.5))
      .markedDoneAt(at(done))
      .please();
  });
}

export function selectionLaunchRecords(
  now: number,
  newer: NewerSessions = {},
): LaunchRecord[] {
  const at = (minutes: number) =>
    new Date(now - minutes * minute).toISOString();
  return [
    makeMe.aLaunchRecord
      .executing({ ...linked, source: "pygardon" })
      .inClaudeSession({ sessionId: "linked-done" })
      .launchedAt(at(90))
      .markedDoneAt(at(1))
      .please(),
    makeMe.aLaunchRecord
      .executing({ identity: report.identity, title: report.title })
      .onStoryBranch({
        workspace: "/tmp/retired-workspace",
        branch: "claude/reported",
      })
      .inClaudeSession({ sessionId: "reported-session", shortId: "reported" })
      .completedWith({ message: report.message })
      .launchedAt(at(70))
      .markedDoneAt(at(2))
      .please(),
    makeMe.aLaunchRecord
      .executing({ ...takenElsewhere, source: "pygardon" })
      .inClaudeSession({ sessionId: "taken-elsewhere" })
      .launchedAt(at(80))
      .markedDoneAt(at(3))
      .please(),
    makeMe.aLaunchRecord
      .adHoc({ ...adHoc, source: "doughnut" })
      .launchedAt(at(60))
      .markedDoneAt(at(4))
      .please(),
    ...newerIn("pygardon", newer.pygardon ?? 0, { from: 50, to: 10 }, at),
    ...newerIn("doughnut", newer.doughnut ?? 0, { from: 3.5, to: 1.25 }, at),
  ];
}

export function observeFrontendSelectionLaunch(
  answer: MachineAnswerBuilder,
  record: LaunchRecord,
): MachineAnswerBuilder {
  if (record.request.title === report.title) {
    return answer.observing(
      makeMe.anObservedLaunch
        .of(record)
        .withSessionState(makeMe.aSessionState.retained("review").please())
        .withWorkspace("missing")
        .please(),
    );
  }
  // Ad hoc without a listed conversation offers no Open (confirmed miss path).
  if (record.request.title === adHoc.title) {
    return answer.observingUnavailable(record);
  }
  return answer.observingDone(record);
}

// Publishes Pygardon's done story (or names its record unreadable).
function putFrontendLinkedDone(
  services: FrontendServiceState,
  {
    completedAt = new Date().toISOString(),
    unreadableLinkedRecord = false,
  }: {
    readonly completedAt?: string;
    readonly unreadableLinkedRecord?: boolean;
  } = {},
): void {
  const record = makeMe.aDoneRecord
    .completed({ ...linked, completedAt })
    .please();
  const fileName = doneRecordFileName(linked.identity);
  if (unreadableLinkedRecord) {
    putFrontendDonePublication(services, "pygardon", {
      catalog: JSON.stringify({
        schemaVersion: 1,
        records: [],
        unreadable: [{ fileName, blob: "b".repeat(40) }],
      }),
      bodies: {
        [fileName]: renderDoneRecord({
          ...record,
          identity: "SEED-502#named-inside",
        }),
      },
    });
    return;
  }
  putFrontendDoneRecords(services, "pygardon", [record]);
}

// Opens the three-project Frontend page with selection launches and Pygardon's
// done story published; installs a final-report answer for the reported row.
export async function openFrontendSelectionPage(
  page: Page,
  services: FrontendServiceState,
  {
    newer = {},
    address = "/?project=open-dough",
    unreadableLinkedRecord = false,
    tap,
  }: {
    readonly newer?: NewerSessions;
    readonly address?: string;
    readonly unreadableLinkedRecord?: boolean;
    readonly tap?: (control: Locator) => Promise<void>;
  } = {},
) {
  const now = Date.now();
  services.listThreeProjects();
  putFrontendLinkedDone(services, { unreadableLinkedRecord });
  const answer = makeMe.aMachineAnswer;
  for (const record of selectionLaunchRecords(now, newer))
    observeFrontendSelectionLaunch(answer, record);
  services.answerMachine(answer.please());
  await installFrontendFinalReport(page, {
    kind: "available",
    turnId: "selection-report",
    text: report.message,
  });
  await page.goto(address);
  await expectProjectChoice(
    page,
    address.includes("project=pygardon") ? "Pygardon" : "Open Dough",
  );
  if (address.includes("view=roster")) {
    await expect(
      page.getByRole("region", { name: "Agent roster" }),
    ).toBeVisible();
  } else if (address.includes("perspective=intent")) {
    await expect(page.getByRole("main", { name: "Intent" })).toBeVisible();
  } else {
    await expect(
      page.getByRole("button", { name: /Start session in/ }),
    ).toBeVisible();
  }
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
    4 + (newer.doughnut ?? 0) + (newer.pygardon ?? 0),
  );
  return { shown, row: shown.row };
}
