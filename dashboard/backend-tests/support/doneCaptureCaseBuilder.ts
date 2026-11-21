// A Done capture case: the project's Default main checkout over a history
// that predates the case, the launch records named in it, and the timeline
// stating each launch and Done in minutes before the case's clock.
// Lives beside ./doneCaptureCase.ts, which holds the case's clock and effects.
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

type Times = { launched: number; done?: number };
// The project as published from the checkout's origin trunk.
const published: Pick<PublishedSource, "id" | "ref"> = {
  id: source,
  ref: "refs/heads/main",
};
type LaunchBuilder = ReturnType<typeof makeMe.aLaunchRecord.adHoc>;
// The case's checkout and the commits its dated precondition work made.
export type CaseFacts<Work extends string> = {
  checkout: Checkout;
  work: Record<Work, string>;
};
// Further record facts that name the case's work, such as a kept capture.
export type Refinement<Work extends string> = (
  launch: LaunchBuilder,
  facts: CaseFacts<Work>,
) => LaunchBuilder;
type Launch = {
  record: (places: Places) => LaunchBuilder;
  times: Times;
  refine?: Refinement<string>;
};

type Facts<Work extends string> = {
  baseFiles?: Readonly<Record<string, string>>;
  workspaces: readonly string[];
  origin: boolean;
  launches: Readonly<Record<string, Launch>>;
  work: readonly { in?: string; steps: Dated<Work> }[];
  kept: boolean;
};
export class DoneCaptureCaseBuilder<
  Session extends string = never,
  Work extends string = never,
  Worktree extends string = never,
> {
  constructor(
    private readonly facts: Facts<Work> = {
      workspaces: [],
      origin: false,
      launches: {},
      work: [],
      kept: false,
    },
  ) {}

  // Dated work the checkout holds before the action under test, on main or,
  // `in` a named worktree, there.
  withWork<Name extends string>(
    steps: Dated<Name>,
    { in: worktree }: { in?: Worktree } = {},
  ) {
    return new DoneCaptureCaseBuilder<Session, Work | Name, Worktree>({
      ...this.facts,
      work: [...this.facts.work, { in: worktree, steps }],
    } as Facts<Work | Name>);
  }

  // The project's launch store keeps the case's records, in a private
  // machine home removed when the test finishes.
  kept() {
    return new DoneCaptureCaseBuilder<Session, Work, Worktree>({
      ...this.facts,
      kept: true,
    });
  }

  // The checkout's base, before every launch, holds these files.
  withBaseFiles(files: Readonly<Record<string, string>>) {
    return new DoneCaptureCaseBuilder<Session, Work, Worktree>({
      ...this.facts,
      baseFiles: files,
    });
  }

  // The checkout also has an origin, for work that takes in or publishes trunk.
  withOrigin() {
    return new DoneCaptureCaseBuilder<Session, Work, Worktree>({
      ...this.facts,
      origin: true,
    });
  }

  // The checkout also has a worktree on `branch` at its base, named in the
  // case's `worktrees` by the canonical path Git registers.
  withWorkspace<Branch extends string>(branch: Branch) {
    return new DoneCaptureCaseBuilder<Session, Work, Worktree | Branch>({
      ...this.facts,
      workspaces: [...this.facts.workspaces, branch],
    });
  }

  // A blank launch whose start found the checkout on main at its base.
  withDefaultMainLaunch<Name extends string>(
    session: Name,
    times: Times,
    refine?: Refinement<Work>,
  ) {
    return this.#with(
      session,
      times,
      ({ checkout }) =>
        makeMe.aLaunchRecord.ofDefaultMainLaunch(session, checkout),
      refine,
    );
  }

  // A Default main launch that identified the named `worktree`, then at the
  // case's base, as its own branch.
  withDeclaringLaunch<Name extends string>(
    session: Name,
    times: Times,
    worktree: Worktree,
  ) {
    return this.#with(session, times, ({ checkout, baseTree, worktrees }) =>
      makeMe.aLaunchRecord.ofDeclaringDefaultMainLaunch(session, checkout, {
        workspace: worktrees[worktree] ?? "",
        branch: worktree,
        tree: baseTree,
      }),
    );
  }

  // A session established in the checkout at its base, for review.
  withEstablishedSession<Name extends string>(
    session: Name,
    times: Times,
    refine?: Refinement<Work>,
  ) {
    return this.#with(
      session,
      times,
      ({ checkout }) =>
        makeMe.aLaunchRecord.ofEstablishedDefaultMainSession(session, checkout),
      refine,
    );
  }

  #with<Name extends string>(
    session: Name,
    times: Times,
    record: Launch["record"],
    refine?: Refinement<Work>,
  ) {
    return new DoneCaptureCaseBuilder<Session | Name, Work, Worktree>({
      ...this.facts,
      launches: {
        ...this.facts.launches,
        [session]: { record, times, refine: refine as Refinement<string> },
      },
    });
  }

  // Materializes the checkout (removed when the test finishes), performs its
  // dated work, and builds each named record launched, and Done, at its
  // stated time.
  async please() {
    const checkout = await aCheckout({
      history: this.facts.workspaces.reduce(
        (history, branch) => history.withWorkspace(branch, { from: "base" }),
        makeMe.aRepository.withBaseBeforeEveryLaunch(this.facts.baseFiles),
      ),
      withOrigin: this.facts.origin,
    });
    const places = await placesOf<Worktree>(checkout);
    const { worktrees } = places;
    const performWork = performIn(places);
    let work = {} as Record<Work, string>;
    for (const { in: worktree, steps } of this.facts.work)
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
      this.facts.launches,
    )) {
      const launchedAt = minutesAgo(times.launched);
      const doneAt =
        times.done === undefined ? undefined : minutesAgo(times.done);
      const recipe = record(places).launchedAt(launchedAt);
      const launch = refine?.(recipe, { checkout, work }) ?? recipe;
      records[session as Session] = (
        doneAt === undefined ? launch : launch.markedDoneAt(doneAt)
      ).please();
      timeline[session as Session] = {
        launchedAt,
        ...(doneAt !== undefined && { doneAt }),
      };
    }
    if (this.facts.kept) keep(...Object.values<LaunchRecord>(records));
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
}

export const aDoneCaptureCase = () => new DoneCaptureCaseBuilder();
