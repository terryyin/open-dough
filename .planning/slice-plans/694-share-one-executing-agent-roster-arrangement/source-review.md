# Source review

Launch: a fresh general-purpose reviewer, without conversation inheritance,
given only the seed section's Goal and Scope for
SEED-334#share-one-executing-agent-roster-arrangement and the plan's complete
correction input (Provenance, Current finding, Outcome, Preserved,
Constraints); told to read no other files, change nothing, and number
independently observable promises.

Unnumbered context: retrospective correction of
SEED-334#retire-integrated-ui-test-and-its-documents (plan 688); baseline at
`6b0aa3eda` with both helpers building the same arrangement, differing only in
agent name and the optional `.planning/open-dough.json` file; impact is that
the two copies can silently diverge.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | `publishRosterStory` and `openRoster` publish the same `roster` revision (Taken SEED-021#identify-taken-work-owner, one agent executing it on origin/main through Claude, described revision `"b3".repeat(20)`, `putFrontendPublished` + `backlogApart`) through one shared arrangement, parameterized by agent name and optional files | slice 1 | observed: dashboard/tests/support/frontendExecutingRoster.ts publishExecutingRoster (agent, files) called by story-url-destination.spec.ts and openRoster in agent-roster-collection.spec.ts; duplicates removed |
| 2 | Each journey keeps its agent name: Akiho (story URL), Yui (roster collection) | slice 1 | observed: publishExecutingRoster(frontendServices, "Akiho") in story-url-destination.spec.ts roster test; "Yui" in openRoster; both journeys passed (.git/worktrees/share-one-frontend-arrangement-of-an-agent-execu/open-dough/evidence/acc2-proof.json, 8/8 expected) |
| 3 | The roster collection journey still publishes its optional `.planning/open-dough.json` through the shared arrangement's optional files; the story URL journey keeps its own settings variation | slice 1 | observed: openRoster passes { [settingsPath]: settings } as files; nerds/unknown-collection cases passed (.git/worktrees/share-one-frontend-arrangement-of-an-agent-execu/open-dough/evidence/acc2-proof.json); story URL journey's answerSharedStoryProjects unchanged |
| 4 | Every assertion and step of story-url-destination.spec.ts "opening the roster…" is kept | slice 1 | observed: git diff of story-url-destination.spec.ts touches only imports and the publish call; 'opening the roster…' passed (.git/worktrees/share-one-frontend-arrangement-of-an-agent-execu/open-dough/evidence/acc2-proof.json) |
| 5 | Every assertion and step of agent-roster-collection.spec.ts is kept | slice 1 | observed: git diff of agent-roster-collection.spec.ts touches only imports, constants and openRoster's publish; all 4 cases passed (.git/worktrees/share-one-frontend-arrangement-of-an-agent-execu/open-dough/evidence/acc2-proof.json) |
| 6 | No product change | slice 1 | observed: git diff touches only dashboard/tests/support and dashboard/frontend-tests files |
| 7 | Follow the MakeMe and page-object conventions the test-entry selector chooses for both specs | slice 1 | observed: scenario facts (agent name, settings file) stay in the specs; makeMe builds the data; page objects (rosterParts, role locators) unchanged |
| 8 | No edited code file over 250 lines | slice 1 | observed: wc -l: frontendExecutingRoster.ts 46, frontendStoryUrlDestination.ts 65, agent-roster-collection.spec.ts 110, story-url-destination.spec.ts 179 |
| 9 | Default timeouts, never `test.slow()` | slice 1 | observed: no timeout or test.slow() in the diff |
