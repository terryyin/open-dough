import { expect, onTestFinished, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { checkIntervalMs } from "../../src/revisionCheckSchedule.ts";
import {
  mountSessionCards,
  readyStory,
  revealPage,
} from "./session-card-mount.ts";
import { cardSession } from "./session-card-page.ts";

test("a sessions read told to ask again keeps the listed sessions, and a hidden page stops waiting on its read", async () => {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  onTestFinished(() => {
    vi.useRealTimers();
  });
  const listed = makeMe.aLaunchRecord
    .executing(readyStory)
    .inCodexSession({ sessionId: "listed-thread" })
    .please();
  const { answerWith, readSessionsSince } = await mountSessionCards({
    reading: {
      ...makeMe.aMachineAnswer.observingDone(listed).please(),
      revision: "listed",
    },
  });
  const { entry, details } = cardSession();
  await expect.element(entry.getByText("Ready for review")).toBeVisible();
  await details.click();
  await expect
    .element(entry.getByText(listed.session.sessionId, { exact: true }))
    .toBeVisible();

  const nextPoll = async (expectedCount: number) =>
    expect
      .poll(async () => {
        await vi.advanceTimersByTimeAsync(checkIntervalMs / 5);
        return readSessionsSince.mock.calls.length;
      })
      .toBe(expectedCount);

  answerWith(undefined);
  for (const expectedCount of [2, 3]) {
    await nextPoll(expectedCount);
    expect(readSessionsSince.mock.lastCall?.[0]).toBe("listed");
    await expect.element(entry.getByText("Ready for review")).toBeVisible();
    await expect
      .element(entry.getByText(listed.session.sessionId, { exact: true }))
      .toBeVisible();
  }

  let settle = () => {};
  answerWith(
    new Promise<undefined>((resolve) => {
      settle = () => {
        resolve(undefined);
      };
    }),
  );
  await nextPoll(4);
  const signal = readSessionsSince.mock.lastCall?.[1];
  expect(signal?.aborted).toBe(false);
  revealPage();
  await expect.poll(() => signal?.aborted).toBe(true);
  settle();
  await vi.advanceTimersByTimeAsync(checkIntervalMs);
  expect(readSessionsSince).toHaveBeenCalledTimes(4);
  await expect.element(entry.getByText("Ready for review")).toBeVisible();
});
