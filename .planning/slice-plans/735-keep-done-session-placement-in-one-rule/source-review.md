# Source-only review

Fresh general-purpose reviewer, launched 2026-11-20 with no conversation
inheritance. Its input was only the SEED-419 story (Goal, Scope) and the
correction input (provenance, Goal and scope with exclusions, Current findings
1–4). It received no slicing, decisions, premises or proof, read no project
files and changed none.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P1 | One placement rule decides where the Board shows a Done session. Story Goal ("editing one placement rule … without coordinated edits across Recently done, story cards"); Story Scope ("Restructure the Board's Done-session placement"); correction Goal and scope. Finding 4 context. | slice 1 | observed: columnSessionsOf alone places Done sessions (doneOnCard, remaining done) and Recently done receives only its output: dashboard/frontend-tests/sessions/board-done-session-placement.spec.ts |
| P2 | Placement is proved by the rule's own tests, so other journeys need no edit when placement changes. Story Goal ("one placement rule and its own tests, without coordinated edits across … dozens of E2E journeys"); Story Scope ("the tests that prove them"). Finding 1 context. | slice 4 | |
| P3 | The story-card Done disclosure takes restructured inputs. Story Scope ("the story-card Done disclosure's inputs and the tests that prove them"). Finding 3 context. | slice 2 | observed: StoryCardDoneSessions mounts with only sessions, storyCardAssignments and a followUpOf slot; StoryCard supplies SessionFollowUp: dashboard/frontend-tests/sessions/story-card-done-disclosure.spec.ts; dashboard/src/StoryCardDoneSessions.tsx; e2e/sessions/agent-launch-story-card-done.spec.ts |
| P4 | Preserved: an unfinished Backlog or Taken card holds its own story's Done sessions in a collapsed **Done** disclosure. Correction Goal and scope; Story Scope. | slice 1 | observed: unfinished card holds its own Done sessions oldest first; collapsed disclosure: board-done-session-placement.spec.ts; dashboard/frontend-tests/sessions/story-card-done-disclosure.spec.ts; e2e/sessions/agent-launch-story-card-done.spec.ts |
| P5 | Preserved: otherwise a listed published done card holds them. Correction Goal and scope. | slice 1 | observed: completed story's Done sessions nest on its done card, none on an unfinished identity's historical card: board-done-session-placement.spec.ts; dashboard/frontend-tests/sessions/recently-done-story-sessions.spec.ts |
| P6 | Preserved: otherwise they stand alone in Recently done. Correction Goal and scope. | slice 1 | observed: sessions of no card and another project's same identity stand alone: board-done-session-placement.spec.ts; e2e/sessions/recently-done-returned-sessions.spec.ts |
| P7 | Preserved: Recently done counts its rendered top-level entries. Correction Goal and scope; Story Scope. | slice 1 | observed: Column paging count uses rendered top-level entries: dashboard/frontend-tests/sessions/recently-done-active-story-sessions.spec.ts; e2e/sessions/agent-launch-done-listing.spec.ts |
| P8 | Preserved: sidebar navigation reveals a nested entry. Correction Goal and scope. | slice 1 | observed: sidebar open reveals the nested Done entry on its unfinished card: e2e/sessions/recently-done-returned-sessions.spec.ts; dashboard/frontend-tests/sessions/recently-done-sessions-select-development.spec.ts |
| P9 | Preserved: scan emphasis leads with title and progress and emphasizes the current session. Correction Goal and scope; Story Scope. | slice 3 | |

## Unnumbered source context

- Provenance: retrospective correction of SEED-414 (commits `4f7b65f0c`,
  `fb448cfb9`, `a7f578415`, `758e195d3`; landed `ee5ed8957`); the developer
  chose to refactor forward over a revert.
- Exclusions: no visible behavior, wording, retention, ad hoc follow-up
  grouping or review-semantics change; the wider SEED-413 renovation stays out.
  "Specs this correction does not touch stay on their current runner" bounds
  the work and is not a rejection rule.
- Finding 2 (Playwright scan spec, weak colour assertions, open-session wash
  check in E2E) is not numbered by the reviewer. The developer's accepted
  correction proposal explicitly moves the scan spec to Vitest; slice 3 owns
  it under that human direction.
