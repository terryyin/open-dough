// How a Done capture case's stated facts become its checkout, dated work and
// named records. Lives beside ./doneCaptureCaseBuilder.ts, which states them.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { PublishedSource } from "../../src/publishedSource.ts";
import {
  aCheckout,
  type Checkout,
  keep,
  minutesAgo,
  source,
} from "./doneCaptureCase.ts";
import {
  type Dated,
  type Places,
  performIn,
  placesOf,
} from "./doneCaptureCasePlaces.ts";

export type Times = { launched: number; done?: number };
// The project as published from the checkout's origin trunk.
const published: Pick<PublishedSource, "id" | "ref"> = {
  id: source,
  ref: "refs/heads/main",
};
export type LaunchBuilder = ReturnType<typeof makeMe.aLaunchRecord.adHoc>;
// The case's checkout, the tree of its base, its worktrees by branch, and
// the commits its dated precondition work made.
export type CaseFacts<Work extends string> = {
  checkout: Checkout;
  baseTree: string;
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
  const checkout = await aCheckout({
    history: facts.workspaces.reduce(
      (history, branch) => history.withWorkspace(branch, { from: "base" }),
      makeMe.aRepository.withBaseBeforeEveryLaunch(facts.baseFiles),
    ),
    withOrigin: facts.origin,
  });
  const places = await placesOf<Worktree>(checkout);
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
        checkout,
        baseTree: places.baseTree,
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
    baseTree: places.baseTree,
    worktrees,
    work,
    records,
    timeline,
    performWork,
  };
}
