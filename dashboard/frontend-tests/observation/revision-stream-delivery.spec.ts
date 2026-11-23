// Revision delivery enters through a typed subscription beside checkRevision.
// The production stream scheduler owns watch, silence, reopen, rate-limit
// pause and close.
import { expect, test, vi } from "vitest";
import { ReadProblem } from "../../src/readProblem.ts";
import { revisionStreamSilenceMs } from "../../src/revisionStreamSchedule.ts";
import {
  checkIntervalMs,
  controlledRevisionDelivery,
  imposeStandingLimitSeconds,
  mountRevisionDelivery,
  nextRevision,
  onDeliveryClock,
} from "./revision-stream-delivery-supply.ts";

test("a typed changed revision asks the pin once and closes the subscription", async () => {
  onDeliveryClock();
  const control = controlledRevisionDelivery();
  const mounted = await mountRevisionDelivery({
    ...control,
    delivery: "stream",
  });
  await expect.poll(() => control.subscriptions.length).toBe(1);
  expect(control.subscriptions[0]?.close).not.toHaveBeenCalled();

  control.deliverCheck(0, { changed: true, revision: nextRevision });
  expect(mounted.changed).toEqual([nextRevision]);
  expect(mounted.received).toBe(1);
  expect(control.subscriptions[0]?.close).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(checkIntervalMs);
  expect(control.subscriptions.length).toBe(1);
});

test("an unanswered loss reopens at the pace and reports at the silence bound from observation start; an answered loss reports at once", async () => {
  onDeliveryClock();
  const control = controlledRevisionDelivery();
  const mounted = await mountRevisionDelivery({
    ...control,
    delivery: "stream",
  });
  await expect.poll(() => control.subscriptions.length).toBe(1);

  control.deliverLoss(0);
  expect(mounted.lost).toBe(1);
  expect(mounted.failed).toEqual([]);
  expect(control.subscriptions[0]?.close).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(checkIntervalMs - 1);
  expect(control.subscriptions.length).toBe(1);
  await vi.advanceTimersByTimeAsync(1);
  expect(control.subscriptions.length).toBe(2);

  // The bound runs from the observation start, the first open.
  const silenceAt =
    (control.subscriptions[0]?.openedAt ?? 0) + revisionStreamSilenceMs;
  await vi.advanceTimersByTimeAsync(silenceAt - 1 - Date.now());
  expect(mounted.failed).toEqual([]);
  await vi.advanceTimersByTimeAsync(1);
  expect(mounted.failed).toHaveLength(1);
  expect(mounted.failed[0]).toBeInstanceOf(ReadProblem);
  expect(control.subscriptions[1]?.close).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(checkIntervalMs);
  expect(control.subscriptions.length).toBe(3);
  control.deliverCheck(2, { changed: false, heads: new Map() });
  expect(mounted.unchanged).toBe(1);
  control.deliverLoss(2);
  expect(mounted.failed).toHaveLength(2);
});

test("departure closes the held subscription", async () => {
  onDeliveryClock();
  const control = controlledRevisionDelivery();
  const mounted = await mountRevisionDelivery({
    ...control,
    delivery: "stream",
  });
  await expect.poll(() => control.subscriptions.length).toBe(1);
  mounted.depart();
  await expect
    .poll(() => control.subscriptions[0]?.close.mock.calls.length ?? 0)
    .toBe(1);
});

test("a standing rate limit pauses opening the subscription until it ends", async () => {
  onDeliveryClock();
  imposeStandingLimitSeconds(30);
  const control = controlledRevisionDelivery();
  await mountRevisionDelivery({
    ...control,
    delivery: "stream",
  });
  expect(control.subscriptions.length).toBe(0);
  await vi.advanceTimersByTimeAsync(29_999);
  expect(control.subscriptions.length).toBe(0);
  await vi.advanceTimersByTimeAsync(1);
  await expect.poll(() => control.subscriptions.length).toBe(1);
});
