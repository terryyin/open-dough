// A published session record from another machine stands as its own Recently
// done entry only while no kept launch here reports through it; a kept
// counterpart, Done on its source card or still live, stands for it, and only
// that resolved membership changes the source card (`newestFirst`).
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import { newestFirst } from "../../src/recentlyDoneListing.ts";

const source = {
  identity: "SEED-390#probe-follow-up-source",
  title: "Explain the CI pause",
};
const published = publishedSessionRecordSchema.parse(
  makeMe.aSessionRecord.closedAt("2026-11-16T13:00:00.000Z").please(),
);
const card = makeMe.aDoneRecord
  .completed({ ...source, completedAt: "2026-11-16T12:00:00.000Z" })
  .please();
const catalogued = makeMe.aDoneCatalog.holding([card]).please().done.records;

const keptFollowUp = (done: boolean): LaunchWithState => {
  const record = makeMe.aLaunchRecord
    .adHoc({
      title: "Follow-up here",
      followUp: makeMe.aFollowUp.ofStory(source, "a".repeat(40)).please(),
    })
    .reportingThrough({
      origin: "https://dashboard.example",
      reference: published.sessionId,
      command: "node report.mjs",
    })
    .launchedAt("2026-11-16T12:30:00.000Z");
  if (done) record.markedDoneAt("2026-11-16T12:59:00.000Z");
  return makeMe.anObservedLaunch
    .of(record.please())
    .withSessionState(makeMe.aSessionState.retained("working").please())
    .please();
};

const shape = (listed: ReturnType<typeof newestFirst>) =>
  listed.map((each) =>
    "record" in each
      ? { card: each.record.identity, holds: each.followUps.length }
      : "published" in each
        ? { published: each.published.sessionId }
        : { session: each.session.request.title },
  );

test("a published record with no kept counterpart is its own entry and leaves the source card empty", () => {
  expect(
    shape(newestFirst(catalogued, [], "open-dough", [], [published])),
  ).toEqual([
    { published: published.sessionId },
    { card: source.identity, holds: 0 },
  ]);
});

test("a kept Done follow-up reporting through the record stands for it on its source card", () => {
  const kept = keptFollowUp(true);
  expect(
    shape(newestFirst(catalogued, [kept], "open-dough", [kept], [published])),
  ).toEqual([{ card: source.identity, holds: 1 }]);
});

test("a kept live counterpart also stands for the record, leaving the source card empty", () => {
  const kept = keptFollowUp(false);
  expect(
    shape(newestFirst(catalogued, [], "open-dough", [kept], [published])),
  ).toEqual([{ card: source.identity, holds: 0 }]);
});
