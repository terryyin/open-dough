// Typed revision-stream subscription and check replies for the production
// stream and polling delivery owners (`../../src/revisionStreamSchedule.ts`,
// `../../src/revisionCheckSchedule.ts`).
import { createElement } from "react";
import { onTestFinished, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { StoryBranchHeads } from "../../src/authenticatedBranchRead.ts";
import { noteLimit } from "../../src/readingLimit.ts";
import type {
  RevisionCheck,
  RevisionStreamHandlers,
  RevisionStreamSubscription,
} from "../../src/revisionCheckRead.ts";
import {
  checkIntervalMs,
  useRevisionCheckSchedule,
  type RevisionDeliveryAnswers,
} from "../../src/revisionCheckSchedule.ts";
import { useRevisionStreamSchedule } from "../../src/revisionStreamSchedule.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

const shownRevision = "a1".repeat(20);
export const nextRevision = "b2".repeat(20);
const source = makeMe.aPublishedSource.openDough.please();

export type ControlledSubscription = {
  readonly handlers: RevisionStreamHandlers;
  readonly close: ReturnType<typeof vi.fn>;
  // Delivery-clock time of the open.
  readonly openedAt: number;
};

let nextEpoch = Date.parse("2020-01-01T00:00:00.000Z");

export function controlledRevisionDelivery(): {
  readonly subscribeRevision: RevisionDeliveryAnswers["subscribeRevision"];
  readonly checkRevision: RevisionDeliveryAnswers["checkRevision"];
  readonly subscriptions: ControlledSubscription[];
  readonly deliverCheck: (at: number, check: RevisionCheck) => void;
  readonly deliverLoss: (at: number) => void;
} {
  const subscriptions: ControlledSubscription[] = [];
  const subscribeRevision: RevisionDeliveryAnswers["subscribeRevision"] = (
    ...args
  ) => {
    const [, shown, watched, handlers] = args;
    if (shown !== shownRevision) {
      throw new Error(`Unexpected shown revision ${shown}`);
    }
    if (watched.length !== 0) {
      throw new Error(`Unexpected watched branches ${watched.join(",")}`);
    }
    const close = vi.fn();
    const held: ControlledSubscription = {
      handlers,
      close,
      openedAt: Date.now(),
    };
    subscriptions.push(held);
    return { close } satisfies RevisionStreamSubscription;
  };
  const checkRevision: RevisionDeliveryAnswers["checkRevision"] = () =>
    Promise.resolve({
      changed: false,
      heads: new Map(),
    });
  return {
    subscribeRevision,
    checkRevision,
    subscriptions,
    deliverCheck: (at, check) => {
      subscriptions[at]?.handlers.onCheck(check);
    },
    deliverLoss: (at) => {
      subscriptions[at]?.handlers.onLost();
    },
  };
}

export function onDeliveryClock() {
  const now = nextEpoch;
  nextEpoch += 3_600_000;
  vi.useFakeTimers({ now });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  return now;
}

export function imposeStandingLimitSeconds(seconds: number) {
  noteLimit(seconds);
}

function DeliveryOwner(props: RevisionDeliveryAnswers) {
  useRevisionStreamSchedule(props);
  useRevisionCheckSchedule(props);
  return null;
}

export async function mountRevisionDelivery(
  options: Pick<
    RevisionDeliveryAnswers,
    "subscribeRevision" | "checkRevision" | "delivery"
  > & {
    readonly watchedHeads?: StoryBranchHeads;
  },
): Promise<{
  readonly depart: () => void;
  readonly changed: string[];
  readonly unchanged: number;
  readonly failed: unknown[];
  readonly received: number;
  readonly lost: number;
}> {
  const changed: string[] = [];
  const failed: unknown[] = [];
  let unchanged = 0;
  let received = 0;
  let lost = 0;
  const answers: RevisionDeliveryAnswers = {
    subscribeRevision: options.subscribeRevision,
    checkRevision: options.checkRevision,
    source,
    shownRevision,
    watchedHeads: options.watchedHeads ?? new Map(),
    readSettled: true,
    visibility: "visible",
    delivery: options.delivery,
    onReceived: () => {
      received += 1;
    },
    onDeliveryLost: () => {
      lost += 1;
    },
    onChanged: (revision) => {
      changed.push(revision);
    },
    onUnchanged: () => {
      unchanged += 1;
    },
    onBranchesMoved: () => {},
    onFailed: (error) => {
      failed.push(error);
    },
  };
  const { rerender } = await mountComponent(
    createElement(DeliveryOwner, answers),
  );
  return {
    depart: () => {
      rerender(createElement("div"));
    },
    get changed() {
      return changed;
    },
    get unchanged() {
      return unchanged;
    },
    get failed() {
      return failed;
    },
    get received() {
      return received;
    },
    get lost() {
      return lost;
    },
  };
}

export { checkIntervalMs };
