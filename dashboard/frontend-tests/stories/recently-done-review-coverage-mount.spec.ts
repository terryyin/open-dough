// A story's review mark covers the sessions this machine knows were completed
// by then, as they appear: a session that completes after the mark leaves the
// story to review again, one that loads after an Unreview is not reviewed, and
// an open session neither counts nor carries a Needs review cue. A retained
// session and its published record count once, at the published `closedAt`.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import {
  catalogs,
  followUp,
  mountKeptCounterpart,
  source,
} from "../sessions/recently-done-card-membership-mount-page.ts";
import {
  cueOf,
  onTheBoard,
  pollWithFakeTimers,
} from "../sessions/recently-done-review-cue-mount-page.ts";
import {
  machineReader,
  mountSessions,
  openSessionRow,
  pollNow,
} from "../sessions/recently-done-sidebar-mount-page.ts";
import {
  reviewCard,
  reviewStateStore,
} from "./recently-done-review-state-mount-page.ts";

// Mounts the source story's card over a machine reader a case changes.
async function mountStory(
  first: ReturnType<typeof makeMe.aMachineAnswer.please>,
  markedAt?: string,
) {
  const machine = machineReader(first);
  const store = reviewStateStore(
    markedAt === undefined ? {} : { "open-dough": [source.identity] },
    markedAt === undefined ? {} : { [source.identity]: markedAt },
  );
  const { done, doneBodies } = catalogs({ "open-dough": [source] });
  const shown = await mountSessions(machine, {
    done,
    doneBodies,
    reviewStates: store.read,
  });
  await shown.header.click();
  // Shows the machine's next answer once its poll has read it.
  const arrive = async (
    answer: ReturnType<typeof makeMe.aMachineAnswer.please>,
  ) => {
    const before = machine.reads();
    machine.answer(answer);
    await expect
      .poll(() => {
        pollNow();
        return machine.reads();
      })
      .toBeGreaterThan(before);
  };
  return { card: reviewCard(source.title), shown, arrive };
}

test("a story with no completed session is Reviewed once marked, and a session completed afterwards leaves it to review", async () => {
  pollWithFakeTimers();
  const { card, shown, arrive } = await mountStory(
    makeMe.aMachineAnswer.please(),
  );
  await onTheBoard(async () => {
    await card.markAsReviewed.click();
    await expect.element(card.reviewedButton).toBeVisible();
  });

  const later = "Completed after the mark";
  await arrive(
    makeMe.aMachineAnswer
      .observingDone(followUp(later, new Date(Date.now() + 1000).toISOString()))
      .please(),
  );
  await expect.element(card.markAsReviewed).toBeVisible();
  expect(card.partiallyReviewed.query()).toBeNull();
  await expect.poll(() => cueOf(shown.row(later))).toBe(true);
});

test("after Unreview, a session completed before the old mark that loads afterwards is not reviewed", async () => {
  pollWithFakeTimers();
  const { card, shown, arrive } = await mountStory(
    makeMe.aMachineAnswer.please(),
    minutesAgo(5),
  );
  await onTheBoard(async () => {
    await card.reviewedButton.click();
    await card.confirm.click();
    await expect.element(card.markAsReviewed).toBeVisible();
  });

  const earlier = "Completed before the old mark";
  await arrive(
    makeMe.aMachineAnswer
      .observingDone(followUp(earlier, minutesAgo(10)))
      .please(),
  );
  await expect.poll(() => cueOf(shown.row(earlier))).toBe(true);
  await expect.element(card.markAsReviewed).toBeVisible();
});

test("an open session neither counts toward the story's review nor carries a Needs review cue", async () => {
  const open = "Still working";
  const { card } = await mountStory(
    makeMe.aMachineAnswer
      .observingDone(followUp("Completed before the mark", minutesAgo(10)))
      .observingOpen(followUp(open, undefined))
      .please(),
    minutesAgo(5),
  );
  await expect.element(card.reviewedButton).toBeVisible();
  expect(card.partiallyReviewed.query()).toBeNull();
  expect(openSessionRow()?.querySelector("h3")?.textContent).toBe(open);
  expect(cueOf(openSessionRow())).toBe(false);
});

test("a kept session and its published record count once, at the published closing time", async () => {
  const store = reviewStateStore(
    { "open-dough": [source.identity] },
    { [source.identity]: minutesAgo(5.5) },
  );
  await mountKeptCounterpart(store.read);
  const card = reviewCard(source.title);
  await expect.element(card.markAsReviewed).toBeVisible();
  expect(card.partiallyReviewed.query()).toBeNull();
});
