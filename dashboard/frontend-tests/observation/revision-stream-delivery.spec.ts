// Revision delivery enters through a typed subscription beside checkRevision.
// The production stream scheduler owns watch, silence, reopen, rate-limit
// pause and close; polling keeps its typed check path.
import { expect, test, vi } from "vitest";
import { ReadProblem } from "../../src/readProblem.ts";
import {
  checkIntervalMs,
  controlledRevisionDelivery,
  imposeStandingLimitSeconds,
  mountRevisionDelivery,
  nextRevision,
  onDeliveryClock,
  shownRevision,
  source,
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

test("delivery loss reports fallback and reopens at the pace", async () => {
  onDeliveryClock();
  const control = controlledRevisionDelivery();
  const mounted = await mountRevisionDelivery({
    ...control,
    delivery: "stream",
  });
  await expect.poll(() => control.subscriptions.length).toBe(1);

  control.deliverCheck(0, {
    changed: false,
    heads: new Map(),
  });
  expect(mounted.unchanged).toBe(1);
  control.deliverLoss(0);
  expect(mounted.lost).toBe(1);
  expect(mounted.failed).toHaveLength(1);
  expect(mounted.failed[0]).toBeInstanceOf(ReadProblem);
  expect(control.subscriptions[0]?.close).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(checkIntervalMs - 1);
  expect(control.subscriptions.length).toBe(1);
  await vi.advanceTimersByTimeAsync(1);
  await expect.poll(() => control.subscriptions.length).toBe(2);
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

test("polling delivery asks through the typed check path", async () => {
  onDeliveryClock();
  const control = controlledRevisionDelivery();
  await mountRevisionDelivery({
    ...control,
    delivery: "check",
    visibility: "revealed",
  });
  await vi.advanceTimersByTimeAsync(0);
  await expect.poll(() => control.checks.length).toBe(1);
  expect(control.checks[0]).toEqual({
    source,
    shown: shownRevision,
    watched: [],
  });
  expect(control.subscriptions.length).toBe(0);
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
