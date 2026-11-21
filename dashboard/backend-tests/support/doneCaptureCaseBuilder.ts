// A Done capture case: the project's Default main checkout over a history
// that predates the case, the launch records named in it, and the timeline
// stating each launch and Done in minutes before the case's clock.
// Lives beside ./doneCaptureCase.ts, which holds the case's clock and effects.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { CheckoutWorkBuilder } from "../../../Distribution/tests/support/repositoryCheckoutWorkTestData.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import {
  aCheckout,
  type Checkout,
  minutesAgo,
  work as perform,
} from "./doneCaptureCase.ts";

type Times = { launched: number; done?: number };
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
  record: (checkout: Checkout) => LaunchBuilder;
  times: Times;
  refine?: Refinement<string>;
};

export class DoneCaptureCaseBuilder<
  Session extends string = never,
  Work extends string = never,
> {
  constructor(
    private readonly history: RepositoryBuilder<"base"> = makeMe.aRepository.withBaseBeforeEveryLaunch(),
    private readonly origin = false,
    private readonly launches: Readonly<Record<string, Launch>> = {},
    private readonly work?: CheckoutWorkBuilder<Work>,
  ) {}

  // Dated work the checkout holds before the action under test.
  withWork<Name extends string>(work: CheckoutWorkBuilder<Name>) {
    return new DoneCaptureCaseBuilder<Session, Name>(
      this.history,
      this.origin,
      this.launches,
      work,
    );
  }

  // The checkout also has an origin, for work that takes in or publishes trunk.
  withOrigin() {
    return new DoneCaptureCaseBuilder<Session, Work>(
      this.history,
      true,
      this.launches,
      this.work,
    );
  }

  // The checkout also has a worktree on `branch` at its base.
  withWorkspace(branch: string) {
    return new DoneCaptureCaseBuilder<Session, Work>(
      this.history.withWorkspace(branch, { from: "base" }),
      this.origin,
      this.launches,
      this.work,
    );
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
      (checkout) => makeMe.aLaunchRecord.ofDefaultMainLaunch(session, checkout),
      refine,
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
      (checkout) =>
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
    return new DoneCaptureCaseBuilder<Session | Name, Work>(
      this.history,
      this.origin,
      {
        ...this.launches,
        [session]: { record, times, refine: refine as Refinement<string> },
      },
      this.work,
    );
  }

  // Materializes the checkout (removed when the test finishes), performs its
  // dated work, and builds each named record launched, and Done, at its
  // stated time.
  async please() {
    const checkout = await aCheckout({
      history: this.history,
      withOrigin: this.origin,
    });
    const work = (
      this.work === undefined ? {} : await perform(checkout, this.work)
    ) as Record<Work, string>;
    const records = {} as Record<Session, LaunchRecord>;
    const timeline = {} as Record<
      Session,
      { launchedAt: string; doneAt?: string }
    >;
    for (const [session, { record, times, refine }] of Object.entries(
      this.launches,
    )) {
      const launchedAt = minutesAgo(times.launched);
      const doneAt =
        times.done === undefined ? undefined : minutesAgo(times.done);
      const recipe = record(checkout).launchedAt(launchedAt);
      const launch = refine?.(recipe, { checkout, work }) ?? recipe;
      records[session as Session] = (
        doneAt === undefined ? launch : launch.markedDoneAt(doneAt)
      ).please();
      timeline[session as Session] = {
        launchedAt,
        ...(doneAt !== undefined && { doneAt }),
      };
    }
    return { checkout, work, records, timeline };
  }
}

export const aDoneCaptureCase = () => new DoneCaptureCaseBuilder();
