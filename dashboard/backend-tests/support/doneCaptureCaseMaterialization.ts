// How a Done capture case's stated facts become its checkout, dated work and
// named records. Lives beside ./doneCaptureCaseBuilder.ts, which states them.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import { realpathSync } from "node:fs";
import path from "node:path";
import { onTestFinished } from "vitest";
import {
  materializeLocalCheckout,
  materializeRepository,
} from "../../../Distribution/tests/support/repository-fixture.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import { keep, minutesAgo, source } from "./doneCaptureCase.ts";
import {
  type Dated,
  type Places,
  performIn,
  placesOf,
} from "./doneCaptureCasePlaces.ts";

export type Checkout = Awaited<ReturnType<typeof aCheckout>>;

// The project's execution checkout over `history`, with an origin when the
// case's work takes in or publishes trunk, naming its Git directory as Git
// resolves it so its worktrees report the same repository.
async function aCheckout(
  history: RepositoryBuilder<string>,
  withOrigin: boolean,
) {
  const built = history.please();
  const repository = withOrigin
    ? await materializeRepository(built)
    : await materializeLocalCheckout(undefined, built);
  onTestFinished(repository.cleanup);
  const { base } = repository.revisions as Readonly<Record<"base", string>>;
  const gitDirectory = realpathSync(path.join(repository.integration, ".git"));
  return { ...repository, base, gitDirectory };
}

export type Times = { launched: number; done?: number };
// The project as published from the checkout's origin trunk.
const published: Pick<PublishedSource, "id" | "ref"> = {
  id: source,
  ref: "refs/heads/main",
};
export type LaunchBuilder = ReturnType<typeof makeMe.aLaunchRecord.adHoc>;
// The case's checkout, the tree of its base, its worktrees by branch, the
// commits its dated precondition work made, and its clock.
export type CaseFacts<Work extends string> = {
  at: typeof minutesAgo;
  checkout: Checkout;
  worktrees: Readonly<Record<string, string>>;
  work: Record<Work, string>;
};
// Further record facts that name the case's work, such as a kept capture.
export type Refinement<Work extends string> = (
  launch: LaunchBuilder,
  facts: CaseFacts<Work>,
) => LaunchBuilder;
export type Launch = {
  record: (places: Places) => LaunchBuilder;
  times: Times;
  refine?: Refinement<string>;
};

export type Facts<Work extends string> = {
  baseFiles?: Readonly<Record<string, string>>;
  workspaces: readonly string[];
  history?: (history: RepositoryBuilder<string>) => RepositoryBuilder<string>;
  origin: boolean;
  launches: Readonly<Record<string, Launch>>;
  work: readonly { in?: string; steps: Dated<Work> }[];
  kept: boolean;
};

// Materializes the checkout (removed when the test finishes), performs its
// dated work, and builds each named record launched, and Done, at its
// stated time.
export async function materialize<
  Session extends string,
  Work extends string,
  Worktree extends string,
>(facts: Facts<Work>) {
  const checkout = await aCheckout(
    (facts.history ?? ((history) => history))(
      facts.workspaces.reduce(
        (history, branch) => history.withWorkspace(branch, { from: "base" }),
        makeMe.aRepository.withBaseBeforeEveryLaunch(facts.baseFiles),
      ),
    ),
    facts.origin,
  );
  const places = await placesOf<Worktree>(checkout, facts.workspaces);
  const { worktrees } = places;
  const performWork = performIn(places);
  let work = {} as Record<Work, string>;
  for (const { in: worktree, steps } of facts.work)
    work = {
      ...work,
      ...(await performWork(steps, { in: worktree as Worktree })),
    };
  const records = {} as Record<Session, LaunchRecord>;
  const timeline = {} as Record<
    Session,
    { launchedAt: string; doneAt?: string }
  >;
  for (const [session, { record, times, refine }] of Object.entries(
    facts.launches,
  )) {
    const launchedAt = minutesAgo(times.launched);
    const doneAt =
      times.done === undefined ? undefined : minutesAgo(times.done);
    const recipe = record(places).launchedAt(launchedAt);
    const launch =
      refine?.(recipe, {
        at: minutesAgo,
        checkout,
        worktrees,
        work,
      }) ?? recipe;
    records[session as Session] = (
      doneAt === undefined ? launch : launch.markedDoneAt(doneAt)
    ).please();
    timeline[session as Session] = {
      launchedAt,
      ...(doneAt !== undefined && { doneAt }),
    };
  }
  if (facts.kept) keep(...Object.values<LaunchRecord>(records));
  return {
    published,
    at: minutesAgo,
    checkout,
    worktrees,
    work,
    records,
    timeline,
    performWork,
  };
}
