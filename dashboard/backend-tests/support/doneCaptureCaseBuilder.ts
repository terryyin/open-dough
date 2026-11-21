// A Done capture case: the project's Default main checkout over a history
// that predates the case, the launch records named in it, and the timeline
// stating each launch and Done in minutes before the case's clock.
// Lives beside ./doneCaptureCase.ts, which holds the case's clock and effects.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import type { RepositoryBuilder } from "../../../Distribution/tests/support/repositoryTestData.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import { aCheckout, type Checkout, minutesAgo } from "./doneCaptureCase.ts";

type Times = { launched: number; done?: number };
type Launch = {
  record: (checkout: Checkout) => ReturnType<typeof makeMe.aLaunchRecord.adHoc>;
  times: Times;
};

export class DoneCaptureCaseBuilder<Session extends string = never> {
  constructor(
    private readonly history: RepositoryBuilder<"base"> = makeMe.aRepository.withBaseBeforeEveryLaunch(),
    private readonly origin = false,
    private readonly launches: Readonly<Record<string, Launch>> = {},
  ) {}

  // The checkout also has an origin, for work that takes in or publishes trunk.
  withOrigin() {
    return new DoneCaptureCaseBuilder<Session>(
      this.history,
      true,
      this.launches,
    );
  }

  // The checkout also has a worktree on `branch` at its base.
  withWorkspace(branch: string) {
    return new DoneCaptureCaseBuilder<Session>(
      this.history.withWorkspace(branch, { from: "base" }),
      this.origin,
      this.launches,
    );
  }

  // A blank launch whose start found the checkout on main at its base.
  withDefaultMainLaunch<Name extends string>(session: Name, times: Times) {
    return this.#with(session, times, (checkout) =>
      makeMe.aLaunchRecord.ofDefaultMainLaunch(session, checkout),
    );
  }

  // A session established in the checkout at its base, for review.
  withEstablishedSession<Name extends string>(session: Name, times: Times) {
    return this.#with(session, times, (checkout) =>
      makeMe.aLaunchRecord.ofEstablishedDefaultMainSession(session, checkout),
    );
  }

  #with<Name extends string>(
    session: Name,
    times: Times,
    record: Launch["record"],
  ) {
    return new DoneCaptureCaseBuilder<Session | Name>(
      this.history,
      this.origin,
      {
        ...this.launches,
        [session]: { record, times },
      },
    );
  }

  // Materializes the checkout (removed when the test finishes) and builds each
  // named record launched, and Done, at its stated time.
  async please() {
    const checkout = await aCheckout({
      history: this.history,
      withOrigin: this.origin,
    });
    const records = {} as Record<Session, LaunchRecord>;
    const timeline = {} as Record<
      Session,
      { launchedAt: string; doneAt?: string }
    >;
    for (const [session, { record, times }] of Object.entries(this.launches)) {
      const launchedAt = minutesAgo(times.launched);
      const doneAt =
        times.done === undefined ? undefined : minutesAgo(times.done);
      const launch = record(checkout).launchedAt(launchedAt);
      records[session as Session] = (
        doneAt === undefined ? launch : launch.markedDoneAt(doneAt)
      ).please();
      timeline[session as Session] = {
        launchedAt,
        ...(doneAt !== undefined && { doneAt }),
      };
    }
    return { checkout, records, timeline };
  }
}

export const aDoneCaptureCase = () => new DoneCaptureCaseBuilder();
