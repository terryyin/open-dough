// A Done capture case: the project's Default main checkout over a history
// that predates the case, the launch records named in it, and the timeline
// stating each launch and Done in minutes before the case's clock.
// Lives beside ./doneCaptureCase.ts, which holds the case's clock and effects,
// and ./doneCaptureCaseMaterialization.ts, which builds what it states.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import type { Dated, Places } from "./doneCaptureCasePlaces.ts";
import { dashboardOrigin } from "./publisherDashboardOrigin.ts";
import {
  type Facts,
  type Launch,
  type LaunchBuilder,
  materialize,
  type Refinement,
  type Times,
} from "./doneCaptureCaseMaterialization.ts";

export type { Refinement } from "./doneCaptureCaseMaterialization.ts";

// The landing a declaring session received.
type DeclaredLanding = Parameters<LaunchBuilder["withDeclaredLanding"]>[0];

export class DoneCaptureCaseBuilder<
  Session extends string = never,
  Work extends string = never,
  Worktree extends string = never,
  Revision extends string = "base",
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
    return new DoneCaptureCaseBuilder<Session, Work | Name, Worktree, Revision>(
      {
        ...this.facts,
        work: [...this.facts.work, { in: worktree, steps }],
      } as Facts<Work | Name>,
    );
  }

  // The project's launch store keeps the case's records, in a private
  // machine home removed when the test finishes.
  kept() {
    return new DoneCaptureCaseBuilder<Session, Work, Worktree, Revision>({
      ...this.facts,
      kept: true,
    });
  }

  // The checkout's base, before every launch, holds these files.
  withBaseFiles(files: Readonly<Record<string, string>>) {
    return new DoneCaptureCaseBuilder<Session, Work, Worktree, Revision>({
      ...this.facts,
      baseFiles: files,
    });
  }

  // The checkout's history also holds these named revisions.
  withHistory<Name extends string>(
    revisions: (history: RepositoryBuilder<"base">) => RepositoryBuilder<Name>,
  ) {
    return new DoneCaptureCaseBuilder<Session, Work, Worktree, Name>({
      ...this.facts,
      history: revisions as NonNullable<Facts<Work>["history"]>,
    });
  }

  // The checkout also has an origin, for work that takes in or publishes trunk.
  withOrigin() {
    return new DoneCaptureCaseBuilder<Session, Work, Worktree, Revision>({
      ...this.facts,
      origin: true,
    });
  }

  // The checkout also has a worktree on `branch` at its base, named in the
  // case's `worktrees` by the canonical path Git registers.
  withWorkspace<Branch extends string>(branch: Branch) {
    return new DoneCaptureCaseBuilder<
      Session,
      Work,
      Worktree | Branch,
      Revision
    >({
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
        makeMe.aLaunchRecord
          .startedOnMainOf(checkout)
          .inClaudeSession({ sessionId: session }),
      refine,
    );
  }

  // A Default main launch that identified the named `worktree`, then at the
  // case's base, as its own branch.
  withDeclaringLaunch<Name extends string>(
    session: Name,
    times: Times,
    worktree: Worktree,
    refine?: Refinement<Work>,
  ) {
    return this.#with(
      session,
      times,
      ({ checkout, baseTree, worktree: at }) =>
        makeMe.aLaunchRecord.ofDeclaringDefaultMainLaunch(session, checkout, {
          workspace: at(worktree),
          branch: worktree,
          tree: baseTree,
        }),
      refine,
    );
  }

  // A launch whose start established the named `worktree` on its branch at
  // the case's base, naming the repository as Git resolves it.
  withIsolatedLaunch<Name extends string>(
    session: Name,
    times: Times,
    worktree: Worktree,
    refine?: Refinement<Work>,
  ) {
    return this.#with(
      session,
      times,
      ({ checkout, worktree: at }) =>
        makeMe.aLaunchRecord
          .isolatedIn(checkout, {
            workspace: at(worktree),
            branch: worktree,
          })
          .inClaudeSession({ sessionId: session }),
      refine,
    );
  }

  // A Default main launch that declared its landing from the named
  // `worktree` at the case's base, reporting to the dashboard; `landing`
  // states the scenario's further landing data.
  withDeclaredLandingLaunch<Name extends string>(
    session: Name,
    times: Times,
    worktree: Worktree,
    landing: (places: Places) => DeclaredLanding = () => ({}),
  ) {
    return this.#with(session, times, (places) =>
      makeMe.aLaunchRecord
        .startedOnMainOf(places.checkout)
        .inClaudeSession({ sessionId: session })
        .withDeclaredLanding({
          repository: places.checkout.gitDirectory,
          workspace: places.worktree(worktree),
          branch: worktree,
          committedTip: places.checkout.base,
          origin: dashboardOrigin,
          ...landing(places),
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
        makeMe.aLaunchRecord
          .establishedOnMainOf(checkout)
          .inClaudeSession({ sessionId: session }),
      refine,
    );
  }

  #with<Name extends string>(
    session: Name,
    times: Times,
    record: Launch["record"],
    refine?: Refinement<Work>,
  ) {
    return new DoneCaptureCaseBuilder<Session | Name, Work, Worktree, Revision>(
      {
        ...this.facts,
        launches: {
          ...this.facts.launches,
          [session]: { record, times, refine: refine as Refinement<string> },
        },
      },
    );
  }

  // Materializes the case: see ./doneCaptureCaseMaterialization.ts.
  // Its checkout names the revisions its history holds.
  async please() {
    const made = await materialize<Session, Work, Worktree>(this.facts);
    return made as typeof made & {
      checkout: { revisions: Readonly<Record<Revision, string>> };
    };
  }
}

export const aDoneCaptureCase = () => new DoneCaptureCaseBuilder();
