// Public session-selection/read boundary for deriving the one published Done
// story a retained ad hoc session completed. Real Git claim/completion
// history; the request has no identity. Do not preload the association.
// Competing-history and ambiguous-candidate cases live beside this file.
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { expect, test } from "../../tests/support/codexStart.ts";
import {
  associationOf,
  retainAdHocCompletedStory,
} from "../../tests/support/adHocCompletedAssociation.ts";
import { keepLaunchRecords } from "../../tests/support/launchStore.ts";

test.use({ serverMode: "boundary" });

test("a storyless ad hoc record links only to the one completed story from real claim and completion history", async ({
  request,
  dashboard,
  origin,
}) => {
  const { record, identity, completion, reference } =
    await retainAdHocCompletedStory(dashboard, origin, {
      title: "Pygardon-shaped ad hoc session",
    });
  expect(record.request.workflow).toBe("ad-hoc");
  expect(
    "identity" in record.request ? record.request.identity : undefined,
  ).toBeUndefined();
  expect(record.landing?.identity).toBeUndefined();
  expect(record.request.reporting?.reference).toBe(reference);
  expect(record.landing?.revision).toBe(completion);
  expect(record.establishedSession).toBeDefined();

  const answer = await associationOf(request, dashboard, record.session);
  expect(answer).toEqual({ kind: "linked", identity });
});

test("no matching claim leaves the session standalone", async ({
  request,
  dashboard,
  origin,
}) => {
  const { record } = await retainAdHocCompletedStory(dashboard, origin, {
    title: "No matching claim",
    claimPublisher: "other-publisher-not-this-session",
  });
  expect(await associationOf(request, dashboard, record.session)).toEqual({
    kind: "absent",
  });
});

test("Done already present at base is not a first completion", async ({
  request,
  dashboard,
  origin,
}) => {
  const linked = await retainAdHocCompletedStory(dashboard, origin, {
    title: "Completed once",
  });
  const record = {
    ...linked.record,
    landing: makeMe.aLaunchLanding
      .capturedFrom({
        repository: origin.project,
        remote: "origin",
        target: "refs/heads/main",
      })
      .forLaunch(linked.reference)
      .comparing({
        base: linked.completion,
        revision: linked.completion,
      })
      .receivedAt(linked.record.landing?.receivedAt ?? new Date().toISOString())
      .please(),
  };
  keepLaunchRecords(dashboard, [record]);
  expect(await associationOf(request, dashboard, record.session)).toEqual({
    kind: "absent",
  });
});

test("wrong target does not associate", async ({
  request,
  dashboard,
  origin,
}) => {
  const { record } = await retainAdHocCompletedStory(dashboard, origin, {
    title: "Wrong target",
    landing: { target: "refs/heads/other" },
  });
  expect(await associationOf(request, dashboard, record.session)).toEqual({
    kind: "absent",
  });
});

test("a landing in another repository stays standalone even when it holds the completed story", async ({
  request,
  dashboard,
  origin,
}) => {
  const { record } = await retainAdHocCompletedStory(dashboard, origin, {
    title: "Same history in a different repository",
    landing: { repository: origin.origin },
  });
  expect(await associationOf(request, dashboard, record.session)).toEqual({
    kind: "absent",
  });
});

test("an unreadable completion revision is unavailable, not a confirmed miss", async ({
  request,
  dashboard,
  origin,
}) => {
  const linked = await retainAdHocCompletedStory(dashboard, origin, {
    title: "Unreadable revision",
    advanceTrunk: false,
  });
  // Well-formed SHA absent from the repository: claim history cannot be read.
  const missing = "0123456789abcdef0123456789abcdef01234567";
  const record = {
    ...linked.record,
    landing: makeMe.aLaunchLanding
      .capturedFrom({
        repository: origin.project,
        remote: "origin",
        target: "refs/heads/main",
      })
      .forLaunch(linked.reference)
      .comparing({ base: linked.base, revision: missing })
      .receivedAt(linked.record.landing?.receivedAt ?? new Date().toISOString())
      .please(),
  };
  keepLaunchRecords(dashboard, [record]);
  const answer = await associationOf(request, dashboard, record.session);
  expect(answer.kind).toBe("unavailable");
  if (answer.kind === "unavailable") {
    expect(answer.explanation).toMatch(
      /could not be read|could not be checked/i,
    );
  }
});
