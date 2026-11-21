// A Done launch whose reporting reference is a published session record's
// UUID stands for that record in Recently done (`newestFirst`), whether the
// overview's listing gives the launch or an action's answer gives it in full
// (../../src/sessionListing.ts).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import { newestFirst } from "../../src/recentlyDoneListing.ts";
import { sessionListing } from "../../src/sessionListing.ts";

const published = publishedSessionRecordSchema.parse(
  makeMe.aSessionRecord.please(),
);

const doneLaunch: LaunchWithState = makeMe.anObservedLaunch
  .of(
    makeMe.aLaunchRecord
      .adHoc({ title: "Published here" })
      .reportingThrough({
        origin: "https://dashboard.example",
        reference: published.sessionId,
        command: "node report.mjs",
      })
      .markedDoneAt(new Date().toISOString())
      .please(),
  )
  .withSessionState(makeMe.aSessionState.retained("working").please())
  .please();

test.each([
  { givenBy: "the overview's listing", launch: sessionListing(doneLaunch) },
  { givenBy: "a full answer", launch: doneLaunch },
])(
  "a Done launch given by $givenBy stands for its published record",
  ({ launch }) => {
    const listed = newestFirst([], [launch], "open-dough", [published]);
    expect(listed.some((each) => "published" in each)).toBe(false);
  },
);
