// Integration owner, declared before measurement: actual Git author/parent
// queries, profile blob batching (including UTF-8 and missing files), merge
// ordering and ancestry feed the same production evidence/endpoint rules.
// Rule variants are independently owned by ci-comparison-published-endpoints.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { materializeRepository } from "../../../Distribution/tests/support/repository-fixture.mjs";
import { renderAgentProfile } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { publishedStoryHistory } from "../../server/publishedStoryHistory.ts";
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

test("Git history acquisition supplies author, profile, parent and ancestry facts to comparison derivation", async () => {
  const profile = makeMe.anAgentProfile
    .executing({
      name: "Yui",
      identity: endpointIdentity,
      mode: "story-branch",
      branch: "story",
    })
    .please();
  const profileText = `${renderAgentProfile(profile)}\nObservation: café 🐈\n`;
  const done = makeMe.aDoneRecord
    .with({
      identity: endpointIdentity,
      title: "Compare CI",
      completedAt: "2026-11-09T00:00:00.000Z",
      agent: endpointAgent.agent,
    })
    .please();
  const facts = endpointPrefix
    .withRevision("profile-note", {
      author: endpointAuthor,
      files: { [endpointProfilePath]: profileText },
    })
    .withRevision("done", {
      author: endpointAuthor,
      doneRecords: [done],
      remove: [endpointProfilePath],
    })
    .withRevision("trunk", {
      parents: ["claim"],
      files: { "other-story.txt": "other work\n" },
    })
    .withRevision("landing", {
      parents: ["trunk", "done"],
      author: endpointAuthor,
      doneRecords: [done],
      remove: [endpointProfilePath],
    })
    .withRevision("foreign", {
      parents: ["trunk"],
      files: { "other-story.txt": "foreign work\n" },
    })
    .withRevision("foreign-merge", {
      parents: ["foreign", "landing"],
      doneRecords: [done],
      remove: [endpointProfilePath],
    })
    .please();
  const repository = await materializeRepository(facts);
  try {
    const revision = repository.revisions;
    const history = publishedStoryHistory({
      cwd: repository.integration,
      maxBuffer: 64 * 1024 * 1024,
    });
    const authored = await history.authoredAt(
      revision["foreign-merge"],
      endpointAuthor.email,
    );
    expect(authored.map(({ commit }) => commit)).toEqual([
      revision.landing,
      revision.done,
      revision["profile-note"],
      revision.work,
      revision.claim,
    ]);
    const profiles = await history.profileTextsAt(endpointProfilePath, [
      revision.start,
      revision.claim,
      revision["profile-note"],
      revision.done,
    ]);
    expect(profiles.has(revision.start)).toBe(false);
    expect(profiles.has(revision.done)).toBe(false);
    expect(profiles.get(revision["profile-note"])).toBe(profileText);
    const ordered = await history.orderedAt(revision["foreign-merge"]);
    expect(ordered[0]).toBe(revision["foreign-merge"]);
    expect(ordered.indexOf(revision.landing)).toBeLessThan(
      ordered.indexOf(revision.done),
    );
    const merges = await history.mergesBetween(
      revision["foreign-merge"],
      revision.start,
    );
    expect(merges).toContainEqual({
      commit: revision["foreign-merge"],
      parents: [revision.foreign, revision.landing],
    });
    expect(merges).toContainEqual({
      commit: revision.landing,
      parents: [revision.trunk, revision.done],
    });
    expect(await history.isAncestor(revision.work, revision.done)).toBe(true);
    expect(await history.isAncestor(revision.work, revision.trunk)).toBe(false);
    const story = makeMe.aReviewedStory
      .with({
        identity: endpointIdentity,
        profileDirectory: ".planning/agents",
      })
      .please();
    const evidence = await publishedStoryEvidence(
      story,
      revision["foreign-merge"],
      history,
      endpointAuthor.name,
    );
    expect(evidence.merges).toEqual([revision.landing]);
    expect(
      await landingOf(
        revision["foreign-merge"],
        revision.start,
        new Set(evidence.merges),
        evidence.commits.map(({ commit }) => commit),
        history,
      ),
    ).toEqual({ merge: revision.landing, branchSide: revision.done });
    expect(
      await deliveredCompletion(
        story,
        revision.done,
        revision["foreign-merge"],
        history,
      ),
    ).toBe(revision.landing);
  } finally {
    await repository.cleanup();
  }
});
