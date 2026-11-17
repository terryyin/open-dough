// Frontend fixtures for closed ad hoc story follow-ups on Recently done cards
// (`../../frontend-tests/sessions/recently-done-follow-up-*.spec.ts`): a named
// source story, builders for its own sessions and story follow-ups, and a Board
// opened on substituted machine answers.

import type { Page } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { standaloneSessionName } from "../dashboardPage.ts";
import { expect } from "./frontendApp.ts";
import {
  frontendRevision,
  putFrontendDoneRecords,
  type FrontendServiceState,
} from "./frontendServiceState.ts";

export const sourceStory = {
  identity: "SEED-390#probe-follow-up-source",
  title: "Explain the CI pause",
};
export const otherStory = {
  identity: "SEED-391#other-follow-up-source",
  title: "Keep the scroll position",
};
export const completedAt = "2026-11-16T12:00:00.000Z";
export const revision = frontendRevision;
const sha = (n: number) => n.toString(16).padStart(2, "0").repeat(20);

export function storyFollowUp(
  title: string,
  sessionId: string,
  {
    source = "open-dough",
    identity = sourceStory.identity,
    file,
    doneAt,
    launchedAt,
  }: {
    readonly source?: string;
    readonly identity?: string;
    readonly file?: {
      readonly path: string;
      readonly line?: number;
      readonly side?: "old" | "new";
    };
    readonly doneAt?: string;
    readonly launchedAt?: string;
  } = {},
): LaunchRecord {
  const followUp = {
    story: {
      identity,
      revision,
      ...(file === undefined
        ? {}
        : {
            file: {
              path: file.path,
              baseline: sha(1),
              tree: sha(2),
              completion: sha(3),
              ...(file.line === undefined || file.side === undefined
                ? {}
                : { line: file.line, side: file.side }),
            },
          }),
    },
  };
  const record = makeMe.aLaunchRecord
    .adHoc({ instruction: title, title, source, followUp })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .completedWith({ message: "" });
  if (launchedAt !== undefined) record.launchedAt(launchedAt);
  if (doneAt !== undefined) record.markedDoneAt(doneAt);
  return record.please();
}

export function ownStorySession(
  sessionId: string,
  launchedAt: string,
  doneAt: string,
): LaunchRecord {
  return makeMe.aLaunchRecord
    .executing(sourceStory)
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .launchedAt(launchedAt)
    .completedWith({ message: "" })
    .markedDoneAt(doneAt)
    .please();
}

export function publishSourceCard(services: FrontendServiceState) {
  putFrontendDoneRecords(services, "open-dough", [
    makeMe.aDoneRecord
      .with({
        ...sourceStory,
        completedAt,
        developer: "Terry Yin",
        agent: "viktor-chan",
        host: "codex",
      })
      .please(),
  ]);
}

export async function openBoard(
  page: Page,
  services: FrontendServiceState,
  records: readonly LaunchRecord[],
  { unavailable = [] }: { readonly unavailable?: readonly LaunchRecord[] } = {},
) {
  const answer = makeMe.aMachineAnswer;
  for (const record of records) {
    if (unavailable.includes(record)) answer.observingUnavailable(record);
    else if (record.doneAt === undefined) answer.observingOpen(record);
    else answer.observingDone(record);
  }
  services.answerMachine(answer.please());
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: /Start session in/ }),
  ).toBeVisible();
}

export const adHocName = (title: string) =>
  standaloneSessionName("Ad hoc", title);
