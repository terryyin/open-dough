// A kept launch whose reporting reference is a published session record's
// UUID stands for that record in Recently done (`newestFirst`), whether the
// launch is Done or still live, and whether the overview's listing gives the
// launch or an action's answer gives it in full
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

const reporting = {
  origin: "https://dashboard.example",
  reference: published.sessionId,
  command: "node report.mjs",
};

const doneLaunch: LaunchWithState = makeMe.anObservedLaunch
  .of(
    makeMe.aLaunchRecord
      .adHoc({ title: "Published here" })
      .reportingThrough(reporting)
      .markedDoneAt(new Date().toISOString())
      .please(),
  )
  .withSessionState(makeMe.aSessionState.retained("working").please())
  .please();

const liveLaunch: LaunchWithState = makeMe.anObservedLaunch
  .of(
    makeMe.aLaunchRecord
      .adHoc({ title: "Still live" })
      .reportingThrough(reporting)
      .please(),
  )
  .withSessionState(makeMe.aSessionState.retained("working").please())
  .please();

test.each([
  {
    state: "Done",
    givenBy: "the overview's listing",
    launch: sessionListing(doneLaunch),
    doneSessions: [sessionListing(doneLaunch)],
  },
  {
    state: "Done",
    givenBy: "a full answer",
    launch: doneLaunch,
    doneSessions: [doneLaunch],
  },
  {
    state: "live",
    givenBy: "the overview's listing",
    launch: sessionListing(liveLaunch),
    doneSessions: [],
  },
  {
    state: "live",
    givenBy: "a full answer",
    launch: liveLaunch,
    doneSessions: [],
  },
])(
  "a $state launch given by $givenBy stands for its published record",
  ({ launch, doneSessions }) => {
    const listed = newestFirst(
      [],
      doneSessions,
      "open-dough",
      [launch],
      [published],
    );
    expect(listed.some((each) => "published" in each)).toBe(false);
  },
);
