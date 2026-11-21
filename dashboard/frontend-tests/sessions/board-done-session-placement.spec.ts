// The Board's one placement rule (`columnSessionsOf`) decides where each Done
// session lives: on its unfinished Backlog or Taken card, on a listed
// published done card (`newestFirst`), or standing alone in Recently done.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { CataloguedDoneRecord } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { columnSessionsOf } from "../../src/columnSessions.ts";
import { newestFirst } from "../../src/recentlyDoneListing.ts";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { sessionKey } from "../../src/sessionReference.ts";

const sourceId = "open-dough";
const unfinished = { identity: "SEED-1#unfinished", title: "Unfinished" };
const completed = { identity: "SEED-2#completed", title: "Completed" };
const gone = { identity: "SEED-3#gone", title: "Gone" };

function launch(
  story: { identity: string; title: string },
  {
    minutesAgo,
    done = true,
    source = sourceId,
    name = story.title,
  }: {
    minutesAgo: number;
    done?: boolean;
    source?: string;
    name?: string;
  },
): LaunchWithState {
  const launchedAt = new Date(Date.now() - minutesAgo * 60_000).toISOString();
  const record = makeMe.aLaunchRecord.executing({ ...story, source });
  record
    .launchedAt(launchedAt)
    .inClaudeSession({ sessionId: `${name}-${source}` });
  if (done) record.markedDoneAt(launchedAt);
  return makeMe.anObservedLaunch
    .of(record.please())
    .withSessionState(makeMe.aSessionState.retained("working").please())
    .please();
}

const catalogued = (
  identity: string,
  minutesAgo: number,
): CataloguedDoneRecord => ({
  identity,
  completedAt: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
  fileName: `${identity}.md`,
  blob: "blob",
});

const keys = (sessions: readonly LaunchWithState[] | undefined) =>
  (sessions ?? []).map((record) => sessionKey(record.session));

// One project's retained sessions across an unfinished story, a completed
// story and a story with no card, plus another project's launch of the
// unfinished identity.
function boardSessions() {
  const unfinishedOlder = launch(unfinished, { minutesAgo: 9, name: "u-old" });
  const unfinishedNewer = launch(unfinished, { minutesAgo: 8, name: "u-new" });
  const unfinishedOpen = launch(unfinished, { minutesAgo: 1, done: false });
  const completedDone = launch(completed, { minutesAgo: 7 });
  const unrelated = launch(gone, { minutesAgo: 6 });
  const otherProject = launch(unfinished, {
    minutesAgo: 5,
    source: "other-project",
  });
  const goneOpen = launch(gone, { minutesAgo: 2, done: false, name: "g-o" });
  return {
    unfinishedOlder,
    unfinishedNewer,
    unfinishedOpen,
    completedDone,
    unrelated,
    otherProject,
    goneOpen,
    records: [
      unfinishedOlder,
      unfinishedNewer,
      unfinishedOpen,
      completedDone,
      unrelated,
      otherProject,
      goneOpen,
    ],
  };
}

const placedOnBoard = (records: readonly LaunchWithState[]) =>
  columnSessionsOf(sourceId, records, [unfinished.identity]);

// Recently done, fed only the Done sessions the rule leaves to it, beside
// a historical done card for the unfinished identity.
const recentlyDone = (records: readonly LaunchWithState[]) =>
  newestFirst(
    [catalogued(unfinished.identity, 4), catalogued(completed.identity, 3)],
    placedOnBoard(records).done ?? [],
    sourceId,
  );

const nestedOn = (listed: ReturnType<typeof newestFirst>, identity: string) =>
  listed.flatMap((each) =>
    "record" in each && each.record.identity === identity
      ? keys(each.sessions)
      : [],
  );

test("an unfinished card holds its own Done sessions, oldest first", () => {
  const { records, unfinishedOlder, unfinishedNewer } = boardSessions();
  expect(keys(placedOnBoard(records).doneOnCard(unfinished.identity))).toEqual(
    keys([unfinishedOlder, unfinishedNewer]),
  );
});

test("Recently done receives none of an unfinished card's Done sessions", () => {
  const { records, unfinishedOlder, unfinishedNewer } = boardSessions();
  const left = keys(placedOnBoard(records).done);
  expect(left).not.toContain(sessionKey(unfinishedOlder.session));
  expect(left).not.toContain(sessionKey(unfinishedNewer.session));
});

test("a historical done card for an unfinished story holds none of its sessions", () => {
  const { records } = boardSessions();
  expect(nestedOn(recentlyDone(records), unfinished.identity)).toEqual([]);
});

test("a completed story's Done sessions nest on its done card", () => {
  const { records, completedDone } = boardSessions();
  expect(nestedOn(recentlyDone(records), completed.identity)).toEqual(
    keys([completedDone]),
  );
});

test("Done sessions of no card stand alone in Recently done", () => {
  const { records, unrelated } = boardSessions();
  const standalone = recentlyDone(records).flatMap((each) =>
    "session" in each ? keys([each.session]) : [],
  );
  expect(standalone).toEqual(keys([unrelated]));
});

test("another project's session with the same identity stands alone there", () => {
  const { records, otherProject } = boardSessions();
  const elsewhere = columnSessionsOf("other-project", records, []);
  expect(keys(elsewhere.done)).toEqual(keys([otherProject]));
  expect(
    keys(placedOnBoard(records).doneOnCard(unfinished.identity)),
  ).not.toContain(sessionKey(otherProject.session));
});

test("open sessions of no unfinished card stay in the Taken column", () => {
  const { records, goneOpen } = boardSessions();
  expect(keys(placedOnBoard(records).taken)).toEqual(keys([goneOpen]));
});
