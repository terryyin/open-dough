// Rule variants use raw canonical Git/history facts, preserving the production
// claim, owning/foreign merge, side, landing and completion algorithms.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { repositoryHistoryReads } from "../../../Distribution/tests/support/repositoryHistoryReads.mjs";
import { publishedStoryEvidence } from "../../server/storyPublishedEvidence.ts";
import {
  deliveredCompletion,
  landingOf,
} from "../../server/storyPublishedEndpointDerived.ts";
import { expect, test } from "../../tests/support/pageTest.ts";
import {
  endpointPrefix,
  endpointIdentity,
  endpointAuthor,
  endpointAgent,
  endpointProfilePath,
} from "../support/comparisonEndpointPrefix.ts";

const story = makeMe.aReviewedStory
  .with({ identity: endpointIdentity, profileDirectory: ".planning/agents" })
  .please();

test("the comparison selects its own landing through first-parent claims and excludes a later foreign merge", async () => {
  const done = makeMe.aDoneRecord
    .with({
      identity: endpointIdentity,
      title: "Compare CI",
      completedAt: "2026-11-09T00:00:00.000Z",
      agent: endpointAgent.agent,
    })
    .please();
  const facts = endpointPrefix
    .withRevision("done", {
      author: endpointAuthor,
      doneRecords: [done],
      remove: [endpointProfilePath],
    })
    .withRevision("trunk", {
      parents: ["claim"],
      files: { "shared.txt": "trunk edit\n" },
    })
    .withRevision("foreign", {
      parents: ["claim"],
      files: { "shared.txt": "foreign edit\n" },
    })
    .withRevision("foreign-resolution", {
      parents: ["trunk", "foreign"],
      files: { "shared.txt": "foreign resolution\n" },
    })
    .withRevision("landing", {
      parents: ["foreign-resolution", "done"],
      author: endpointAuthor,
      doneRecords: [done],
      remove: [endpointProfilePath],
      files: { "shared.txt": "owning resolution\n" },
    })
    .withRevision("later-trunk", {
      parents: ["foreign-resolution"],
      files: { "other-story.txt": "later work\n" },
    })
    .withRevision("later-foreign", {
      parents: ["later-trunk", "landing"],
      doneRecords: [done],
      remove: [endpointProfilePath],
    })
    .please();
  const { publishedStoryHistory: history } = repositoryHistoryReads(facts);
  const evidence = await publishedStoryEvidence(
    story,
    "later-foreign",
    history,
    endpointAuthor.name,
  );
  expect(evidence.claims).toEqual(["claim"]);
  expect(evidence.merges).toEqual(["landing"]);
  expect(evidence.commits.map(({ commit }) => commit)).toEqual([
    "done",
    "work",
  ]);
  expect(
    await landingOf(
      "later-foreign",
      "start",
      new Set(evidence.merges),
      evidence.commits.map(({ commit }) => commit),
      history,
    ),
  ).toEqual({ merge: "landing", branchSide: "done" });
  expect(
    await deliveredCompletion(story, "done", "later-foreign", history),
  ).toBe("landing");
});

test("a story-first fast-forward uses its own merge tip and excludes the trunk-side parent", async () => {
  const facts = endpointPrefix
    .withRevision("trunk", {
      parents: ["claim"],
      files: { "other-story.txt": "another writer\n" },
    })
    .withRevision("story-tip", {
      parents: ["work", "trunk"],
      author: endpointAuthor,
      files: { "other-story.txt": "another writer\n" },
    })
    .please();
  const { publishedStoryHistory: history } = repositoryHistoryReads(facts);
  const evidence = await publishedStoryEvidence(
    story,
    "story-tip",
    history,
    endpointAuthor.name,
  );
  expect(
    await landingOf(
      "story-tip",
      "start",
      new Set(evidence.merges),
      evidence.commits.map(({ commit }) => commit),
      history,
    ),
  ).toEqual({ merge: "story-tip", branchSide: "story-tip" });
});

test("a later story-first merge keeps the original completion", async () => {
  const done = makeMe.aDoneRecord
    .with({
      identity: endpointIdentity,
      title: "Compare CI",
      completedAt: "2026-11-09T00:00:00.000Z",
      agent: endpointAgent.agent,
    })
    .please();
  const facts = endpointPrefix
    .withRevision("trunk", {
      parents: ["claim"],
      files: { "other-story.txt": "another writer\n" },
    })
    .withRevision("landing", {
      parents: ["trunk", "work"],
      author: endpointAuthor,
      files: { "shared.txt": "story edit\n" },
    })
    .withRevision("completion", {
      parents: ["landing"],
      author: endpointAuthor,
      doneRecords: [done],
      remove: [endpointProfilePath],
    })
    .withRevision("later-work", {
      parents: ["claim"],
      files: { "later-story.txt": "later work\n" },
    })
    .withRevision("later-merge", {
      parents: ["later-work", "completion"],
      doneRecords: [done],
      remove: [endpointProfilePath],
    })
    .please();
  const { publishedStoryHistory: history } = repositoryHistoryReads(facts);
  const completion = await deliveredCompletion(
    story,
    "completion",
    "later-merge",
    history,
  );
  expect(completion).toBe("completion");
  expect(completion).not.toBe("later-merge");
});

test("only this story's execution profile starts its attributed work", async () => {
  const other = makeMe.anAgentProfile
    .executing({
      name: "Yui",
      identity: "SEED-2#other",
      mode: "story-branch",
      branch: "other",
    })
    .please();
  const preparing = makeMe.anAgentProfile
    .preparing({ name: "Yui", identity: endpointIdentity })
    .please();
  const executing = makeMe.anAgentProfile
    .executing({
      name: "Yui",
      identity: endpointIdentity,
      mode: "story-branch",
      branch: "story",
    })
    .please();
  const facts = makeMe.aRepository
    .withRevision("start")
    .withRevision("other-story", {
      author: endpointAuthor,
      agentProfiles: [other],
    })
    .withRevision("other-work", {
      author: endpointAuthor,
      files: { "other.txt": "other work" },
    })
    .withRevision("preparation", {
      author: endpointAuthor,
      agentProfiles: [preparing],
    })
    .withRevision("claim", {
      author: endpointAuthor,
      agentProfiles: [executing],
    })
    .withRevision("work", {
      author: endpointAuthor,
      files: { "work.txt": "this story" },
    })
    .please();
  const { publishedStoryHistory: history } = repositoryHistoryReads(facts);
  const evidence = await publishedStoryEvidence(
    story,
    "work",
    history,
    endpointAuthor.name,
  );
  expect(evidence.claims).toEqual(["claim"]);
  expect(evidence.commits).toEqual([{ commit: "work", parent: "claim" }]);
});
