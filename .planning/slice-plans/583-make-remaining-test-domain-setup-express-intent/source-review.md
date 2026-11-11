# Source-only review

**Story:** SEED-302#make-remaining-test-domain-setup-express-intent

**Launch:** Fresh general-purpose reviewer (`inherit`), no conversation inheritance.
Input was only the story Goal, Scope, key examples, and exclusions from
`.planning/seeds/SEED-302-remaining-makeme-test-data.md#make-remaining-test-domain-setup-express-intent`.
No plan, product, proof, or other project files were supplied.

**Reviewer agent:** cae4146d-de17-48ff-958e-6a312925792e

## Qualifications

- Q1. Commitment 9 is an alternative: migrate valid setup **or** record the
  controlled input shape; both are allowed outcomes per audited location.
- Q2. Commitment 10 applies to inputs the test exercises (literal protocol,
  legacy, or malformed), not to all setup facts.
- Q3. Commitment 14 is constrained by following the test data architecture.
- Q4. Commitment 15 is conditional: it applies when converting a listed shared
  fixture.
- Q5. Shared MakeMe builders handle incidental defaults (2) while
  case-distinguishing domain facts remain readable at the call site (1).

## Trigger / journey examples

- E1. Pre: An unresolved Codex creation still builds workspace, endpoint, and
  request facts inline beside recovery shell arguments. Trigger: Convert that
  creation through shared construction. Result: The call site names the saved
  workspace, endpoint, and request through MakeMe. The recovery case keeps its
  exact shell-quoting arguments visible.
- E2. Pre: A CI comparison assembles retained build, adapter attempt, and proof
  figures by hand at the test site. Trigger: Convert the comparison setup
  through the shared builders. Result: The test names the build revision, run
  or adapter attempt, and proof at the call site. The retained build and
  endpoint response come from their respective builders.
- E3. Pre: A published story fixture hand-renders a seed and backlog entry with
  matching identity and title, plus purpose prose the dashboard must show.
  Trigger: Convert the membership facts through shared construction. Result:
  Seed and backlog entry share identity and title from MakeMe. The fixture
  still states the purpose text the dashboard is expected to show.

## Exclusions

- X1. This increment does not change product behavior.
- X2. This increment does not invent suite-local domain models.
- X3. This increment does not convert browser page-object mechanics (SEED-300).
- X4. This increment does not enforce first-layer test-case length (SEED-301).
- X5. Locations outside the audit are out of scope.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Maintainers reviewing a test can read the domain facts that distinguish its scenario at the call site. | slice 9 | |
| 2 | Shared MakeMe builders supply incidental defaults. | slice 9 | |
| 3 | Shared MakeMe builders produce the shapes the product consumes. | slice 9 | |
| 4 | Use the line-linked audit (`../evidence/makeme-test-data-audit.md`) as the conversion list. | slice 9 | |
| 5.1 | The conversion list covers launch requests across the shell, Node, and dashboard suites. | slice 2 | observed: converted audited launch-request call sites through makeMe.aLaunchRequest; focused dashboard launch groups passed (backend/frontend/integrated) |
| 5.2 | The conversion list covers saved and observed sessions across the shell, Node, and dashboard suites. | slice 3 | observed: converted retained launch/session/attempt/receipt audit sites through MakeMe (sessionsReplayRecords, retainedReport, openStorySessionAcceptance, open-session-continue, completion-input, done-codex, cursor belonging/owned-CI); focused dashboard selections passed |
| 5.3 | The conversion list covers project and launch-option configuration across the shell, Node, and dashboard suites. | slice 5 | observed: converted project sources, options definitions, project CI adapter settings, and valid terminal-theme recovery through MakeMe; focused dashboard/node/shell fixture selections passed; corrupt/invalid inputs kept literal |
| 5.4 | The conversion list covers published planning records across the shell, Node, and dashboard suites. | slice 6 | observed: converted audited published seed/plan/backlog membership through MakeMe and renderStorySection/Seed; focused dashboard/node/shell selections passed; delivery-evidence scenario copies remain controlled shapes |
| 5.5 | The conversion list covers CI provider and policy facts across the shell, Node, and dashboard suites. | slice 7 | observed: converted CI provider/policy audit sites through MakeMe aCiRun/aGitHubJob/aCiAdapterAttempt and reuse/policy builders; encoding and malformed fields stay harness/call-site; focused skill and dashboard CI selections passed |
| 5.6 | The conversion list covers CI comparison and proof answers across the shell, Node, and dashboard suites. | slice 8 | |
| 6 | Fix the shared fixture where it owns construction for several callers. | slice 9 | |
| 7 | Reuse or extend the existing builders. | slice 9 | |
| 8 | Use the production shape or encoder for each boundary. | slice 9 | |
| 9 | For each audited location, migrate the valid setup or record the specific input shape the case needs to control. | slice 9 | |
| 10 | Preserve literal protocol, legacy, or malformed inputs that the test exercises. | slice 9 | |
| 11 | Preserve captured evidence. | slice 9 | |
| 12 | Preserve real actions. | slice 9 | |
| 13 | Preserve independent assertions. | slice 9 | |
| 14 | Keep case-defining dates, identities, and choices explicit, following the test data architecture. | slice 9 | |
| 15 | When converting a listed shared fixture, update its callers that share that construction. | slice 9 | |
| E1 | Unresolved Codex creation: call site names saved workspace, endpoint, and request through MakeMe; recovery keeps exact shell-quoting arguments visible. | slice 2 | observed: dashboard/backend-tests/launches/agent-launch-creation-recovery.spec.ts and frontend/integrated creation-gates: workspace/endpoint/request via aCreationRecord; inspectionArgs/shellCommand remain at call site |
| E2 | CI comparison: test names build revision, run or adapter attempt, and proof at the call site; retained build and endpoint response come from their builders. | slice 8 | |
| E3 | Published membership: seed and backlog share identity and title from MakeMe; fixture still states purpose text the dashboard must show. | slice 6 | observed: dashboard/tests/publishedFactsIsolation.ts: seed and backlog share identity/title from aBacklogEntry; purpose prose stated at call site via renderStorySection goal |
