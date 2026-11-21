// The Done capture family's stereotype: a Default main checkout whose history
// predates the case, launch records kept in a private machine store, dated
// checkout work and the Done mark.
// Times are minutes before the case's clock: launch at 60, Done at 10.
import { mkdtempSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { onTestFinished, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { performCheckoutWork } from "../../../Distribution/tests/support/repository-checkout-work.mjs";
import {
  materializeLocalCheckout,
  materializeRepository,
} from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { CheckoutWorkBuilder } from "../../../Distribution/tests/support/repositoryCheckoutWorkTestData.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import {
  keptRecords,
  setRecordDoneAt,
} from "../../server/launchRecordStore.ts";
import { captureBranchResult } from "../../server/sessionBranchCapture.ts";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { keepLaunchStore } from "../../test-support/support/launchStore.ts";

export const source = "open-dough";

// Whole seconds, so stated times read back from Git unchanged.
const now = Math.floor(Date.now() / 1000) * 1000;
export const minutesAgo = (minutes: number) =>
  new Date(now - minutes * 60_000).toISOString();

// A history whose base revision, holding `files`, predates every launch the
// case states.
export const historyBeforeTheCase = (
  base: { files?: Readonly<Record<string, string>> } = {},
) => makeMe.aRepository.withBaseBeforeEveryLaunch(base.files);

export type Checkout = Awaited<ReturnType<typeof aCheckout>>;

// The project's Default main checkout, with an origin when the case's work
// takes in or publishes trunk, naming its Git directory as Git resolves it so
// its worktrees report the same repository.
export async function aCheckout<Name extends string = "base">({
  history,
  withOrigin = false,
}: { history?: RepositoryBuilder<Name | "base">; withOrigin?: boolean } = {}) {
  const built = (history ?? historyBeforeTheCase()).please();
  const repository = withOrigin
    ? await materializeRepository(built)
    : await materializeLocalCheckout(undefined, built);
  onTestFinished(repository.cleanup);
  const { base } = repository.revisions as Readonly<Record<"base", string>>;
  const gitDirectory = realpathSync(path.join(repository.integration, ".git"));
  return { ...repository, base, gitDirectory };
}

export const canonicalGitDirectory = (checkout: Checkout) =>
  checkout.gitDirectory;

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
    title,
    launchedAt = minutesAgo(60),
    revision,
  }: LaunchFacts & { revision?: string } = {},
) =>
  makeMe.aLaunchRecord
    .ofEstablishedDefaultMainSession(sessionId, checkout, { title, revision })
    .launchedAt(launchedAt);

// A blank launch whose start found the checkout on main at its base, naming
// its repository as Git resolves it.
export const aDefaultLaunch = (
  checkout: Checkout,
  {
    sessionId = "default-launch",
    title,
    launchedAt = minutesAgo(60),
    gitDirectory,
  }: LaunchFacts & { gitDirectory?: string | undefined } = {},
) =>
  makeMe.aLaunchRecord
    .ofDefaultMainLaunch(sessionId, checkout, { title, gitDirectory })
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
      repository: canonicalGitDirectory(checkout),
    })
    .inClaudeSession({ sessionId })
    .launchedAt(launchedAt);

// The project's checkout with an origin, holding `files` at its base, and its
// worktree on `branch` there.
export async function aCheckoutWithWorktree(
  branch: string,
  files: Readonly<Record<string, string>> = {},
) {
  const checkout = await aCheckout({
    history: historyBeforeTheCase({ files }).withWorkspace(branch, {
      from: "base",
    }),
    withOrigin: true,
  });
  const workspace = checkout.execution;
  if (workspace === undefined)
    throw new Error(`Missing the ${branch} worktree.`);
  return { checkout, workspace };
}

// That checkout with its worktree named by the canonical path Git registers.
export async function aCheckoutWithCanonicalWorktree(
  branch: string,
  files: Readonly<Record<string, string>> = {},
) {
  const { checkout, workspace } = await aCheckoutWithWorktree(branch, files);
  return { checkout, workspace: realpathSync(workspace) };
}

// That checkout and the kept isolated launch whose start created the worktree.
export async function anIsolatedBranch(
  branch: string,
  files: Readonly<Record<string, string>> = {},
) {
  const { checkout, workspace } = await aCheckoutWithWorktree(branch, files);
  const record = anIsolatedLaunch(checkout, { workspace, branch }).please();
  keep(record);
  return { checkout, workspace, record };
}

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

// The record the store now keeps for the session `sessionId`.
export const keptRecordOf = async (sessionId: string) =>
  (await keptRecords(source)).find(
    (kept) => kept.session.sessionId === sessionId,
  );

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

// A Done whose branch capture, once read, waits until released before
// answering its result.
export function aHeldDone(record: LaunchRecord, at = minutesAgo(10)) {
  let release!: () => void;
  let reached!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const reading = new Promise<void>((resolve) => {
    reached = resolve;
  });
  const marking = setRecordDoneAt(source, record.session, at, {
    capture: async (candidate, doneAt) => {
      const read = await captureBranchResult(candidate, doneAt);
      reached();
      await held;
      return read;
    },
  });
  return { reading, release, marking };
}

export const undoDone = (record: LaunchRecord) =>
  setRecordDoneAt(source, record.session, undefined);
