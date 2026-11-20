// The Done capture family's stereotype: a Default main checkout whose history
// predates the case, launch records kept in a private machine store, dated
// checkout work, the Done mark and the typed review that reads the result.
// Times are minutes before the case's clock: launch at 60, Done at 10.
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { onTestFinished, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { performCheckoutWork } from "../../../Distribution/tests/support/repository-checkout-work.mjs";
import {
  integrationDeveloper,
  materializeLocalCheckout,
  materializeRepository,
} from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { CheckoutWorkBuilder } from "../../../Distribution/tests/support/repositoryCheckoutWorkTestData.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import {
  keptRecords,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import {
  reviewedFileDiff,
  reviewedFileText,
} from "../../server/storyReviewFileResponse.ts";
import { storyReview } from "../../server/storyReviewSnapshot.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";

export const source = "open-dough";

// Whole seconds, so stated times read back from Git unchanged.
const now = Math.floor(Date.now() / 1000) * 1000;
export const minutesAgo = (minutes: number) =>
  new Date(now - minutes * 60_000).toISOString();

// A history whose base revision predates every launch the case states.
export const historyBeforeTheCase = () =>
  makeMe.aRepository.withRevision("base", {
    backlog: null,
    committer: { ...integrationDeveloper, date: "2019-01-01T00:00:00Z" },
  });

export type Checkout = Awaited<ReturnType<typeof aCheckout>>;

// The project's Default main checkout, with an origin when the case's work
// takes in or publishes trunk.
export async function aCheckout({
  history = historyBeforeTheCase(),
  withOrigin = false,
}: { history?: RepositoryBuilder<"base">; withOrigin?: boolean } = {}) {
  const repository = withOrigin
    ? await materializeRepository(history.please())
    : await materializeLocalCheckout(undefined, history.please());
  onTestFinished(repository.cleanup);
  return { ...repository, base: repository.revisions.base };
}

type LaunchFacts = {
  sessionId?: string;
  title?: string;
  launchedAt?: string;
};

// A session established in the checkout at `revision` (its base by default).
export const anEstablishedSession = (
  checkout: Checkout,
  {
    sessionId = "established-default-main",
    title = "Established in Default main",
    launchedAt = minutesAgo(60),
    revision = checkout.base,
  }: LaunchFacts & { revision?: string } = {},
) =>
  makeMe.aLaunchRecord
    .adHoc({ title })
    .inDefaultCheckout({
      workspace: checkout.integration,
      landing: "review",
      revision,
    })
    .inClaudeSession({ sessionId })
    .launchedAt(launchedAt);

// A blank launch whose start found the checkout on main at its base.
export const aDefaultLaunch = (
  checkout: Checkout,
  {
    sessionId = "default-launch",
    title = "Fix the typo",
    launchedAt = minutesAgo(60),
    gitDirectory = path.join(checkout.integration, ".git"),
  }: LaunchFacts & { gitDirectory?: string | undefined } = {},
) =>
  makeMe.aLaunchRecord
    .adHoc({ title })
    .startingInDefaultCheckout({
      workspace: checkout.integration,
      startingRevision: checkout.base,
      repository: gitDirectory,
      branch: "refs/heads/main",
    })
    .inClaudeSession({ sessionId })
    .launchedAt(launchedAt);

// A launch whose start established the worktree `workspace` of the checkout
// on `branch` at `startingRevision` (the base by default), for review.
export const anIsolatedLaunch = (
  checkout: Checkout,
  {
    workspace,
    branch,
    startingRevision = checkout.base,
    sessionId = `isolated-${branch}`,
    title = "Keep a draft",
    launchedAt = minutesAgo(60),
  }: LaunchFacts & {
    workspace: string;
    branch: string;
    startingRevision?: string;
  },
) =>
  makeMe.aLaunchRecord
    .adHoc({ title })
    .inIsolatedWorkspace({
      workspace,
      branch,
      startingRevision,
      repository: realpathSync(path.join(checkout.integration, ".git")),
    })
    .inClaudeSession({ sessionId })
    .launchedAt(launchedAt);

// Keeps these records as the project's whole store in a private machine
// home, and answers the home.
export function keep(...records: LaunchRecord[]) {
  const home = mkdtempSync(path.join(tmpdir(), "dough-done-capture-"));
  vi.stubEnv("HOME", home);
  if (process.platform === "win32") vi.stubEnv("USERPROFILE", home);
  onTestFinished(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    rmSync(home, { recursive: true, force: true });
  });
  keepLaunchStore(home, { [source]: records });
  return home;
}

// A kept session established in a checkout at its base: the family's usual start.
export async function aKeptSession(options: { withOrigin?: boolean } = {}) {
  const checkout = await aCheckout(options);
  const record = anEstablishedSession(checkout).please();
  keep(record);
  return { checkout, record };
}

export const work = <Name extends string>(
  checkout: Checkout,
  steps: CheckoutWorkBuilder<Name>,
) => performCheckoutWork(checkout, steps.please());

// The same checkout, working in its worktree `workspace` instead.
export const inWorktree = (checkout: Checkout, workspace: string) => ({
  ...checkout,
  integration: workspace,
});

export const markDone = (record: LaunchRecord, at = minutesAgo(10)) =>
  setRecordDoneAt(source, record.session, at);

export const undoDone = (record: LaunchRecord) =>
  setRecordDoneAt(source, record.session, undefined);

const reviewRead = async (record: LaunchRecord) =>
  makeMe.aSessionReviewRead
    .ofSession(record.session.sessionId)
    .keeping(await keptRecords(source));

// The typed review of the kept session, at its first run or at `run`.
export async function review(record: LaunchRecord, run?: number | string) {
  const input = (await reviewRead(record)).please();
  const read =
    run === undefined
      ? input
      : { ...input, read: { ...input.read, run: `${run}` } };
  return storyReview(read, new AbortController().signal);
}

type NamedFile = { baseline: string; tree: string; path: string };

export async function fileText(record: LaunchRecord, file: NamedFile) {
  const read = (await reviewRead(record)).readingFile(file).please();
  return reviewedFileText(read, new AbortController().signal);
}

export async function fileDiff(record: LaunchRecord, file: NamedFile) {
  const read = (await reviewRead(record)).readingFile(file).please();
  return reviewedFileDiff(read, new AbortController().signal);
}

export const notCaptured = {
  kind: "landing-unavailable",
  comparison: "session-commits",
  explanation: "This session's changes were not captured.",
};

export const noCommits = {
  kind: "landing-unavailable",
  comparison: "session-commits",
  explanation: "This session made no commits in the Default main checkout.",
};
