import { createElement } from "react";
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import type { PublishedSessions } from "../../src/publishedSessions.ts";
import { RecentlyDoneReadGaps } from "../../src/RecentlyDone.tsx";
import { recentlyDoneProblems } from "../../src/recentlyDoneView.ts";
import type { UnavailableGap } from "../../src/readWaitBound.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";

const doneGap = {
  status: "unavailable",
  problem: "Done stories could not be read. The done catalog is missing.",
} satisfies UnavailableGap;

const listingGap = {
  status: "unavailable",
  problem: "Published sessions could not be read. The origin listing failed.",
} satisfies UnavailableGap;

test("an unavailable published listing contributes its problem", () => {
  expect(recentlyDoneProblems(undefined, listingGap)).toEqual([
    listingGap.problem,
  ]);
});

test("the done-catalog problem precedes the published-listing problem", () => {
  expect(recentlyDoneProblems(doneGap, listingGap)).toEqual([
    doneGap.problem,
    listingGap.problem,
  ]);
});

test("a listed published session contributes no problem", () => {
  const listed: PublishedSessions = {
    status: "listed",
    revision: "a".repeat(40),
    sessions: [
      publishedSessionRecordSchema.parse(makeMe.aSessionRecord.please()),
    ],
  };

  expect(recentlyDoneProblems(doneGap, listed)).toEqual([doneGap.problem]);
});

test("Recently done renders the two read gaps in order", async () => {
  await mountComponent(
    createElement(RecentlyDoneReadGaps, {
      problems: recentlyDoneProblems(doneGap, listingGap),
      unreadable: [],
      details: { failed: undefined, retry: () => undefined },
    }),
  );

  await expect
    .poll(() =>
      page
        .getByRole("paragraph")
        .elements()
        .map((gap) => gap.textContent),
    )
    .toEqual([doneGap.problem, listingGap.problem]);
});
