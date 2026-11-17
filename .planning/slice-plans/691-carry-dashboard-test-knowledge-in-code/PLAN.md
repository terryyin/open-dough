# Carry dashboard test knowledge in test code and remove its Markdown

**Identity:** SEED-334#carry-dashboard-test-knowledge-in-code
**Source:** [Document removal](../../seeds/SEED-334-product-wide-end-to-end-tests.md#carry-dashboard-test-knowledge-in-code)

This provisional plan is **awaiting story refinement — not ready for slice-plan refinement or execution**.

## Preserved scope and mapping

Maps the document share of the earlier scope of
SEED-334#retire-integrated-ui-test-and-its-documents at
`87dfb8fbf1f6dc78cbd279e8fb33d1396da9d8a6`. Findings below were read at that
revision on 2026-11-18; recheck before changing.

- No test reads or parses any of these documents. The retry spec reads
  `fixtures/preparation-assignment-v0.3.51.mjs.txt`, which stays.
- `manual/2026-10-13-mobile-dashboard/` also holds four `.jpg` files and
  `phone-ad-hoc-direction-collapse-dom.txt`; the folder goes whole.
- Already stale: `feature-groups.md` counts 8 Backend folders (there are 9)
  and calls `frontend-tests` flat; `support/runLifecycle.ts:41` and
  `support/dashboardServer.ts:66` cite README sections that no longer exist.
- `fixtures/observed-runs-ci.yml` is a historical `ci.yml` snapshot whose
  bytes mention `shards.md`; it stays unedited.

## Provisional slices

### 1. Remove the documents whose facts the code already carries
Type: Structure
Status: provisional
Proof: delete the manual folder, `fluent-side-panel-pilot.md`,
`fixtures/preparation-assignment-v0.3.51.md`, `fixture-origins.md` and
`proof-record.md`. Rehome: the release commit, blob and sha256 as a comment at
`backend-tests/launches/agent-launch-preparation-codex-retry.spec.ts:77`; the
proof-record pass criteria (exit 0, `phase: "completed"`, `strictStatus:
"passed"`) as JSDoc in `proofRecordTypes.ts`; origin sharing and the
story-columns snapshot in `startOriginPreparation.ts` and `launchJourney.ts`;
the pilot's stop-at-three-journeys decision in `sidePanelPages.ts` or
SEED-300. Repoint `AGENTS.md:33`, SEED-300, `ciProofCollected.ts:7` and
`browser-test-group.yml:145`.

### 2. Carry host stand-in and comparison-proof facts in their modules
Type: Structure
Status: provisional
Proof: delete `native-host-fixtures.md` and `intent-ci-comparison-proof.md`.
The Cursor stand-in policy goes to `dashboardTest.ts:119` (243 lines: keep it
within 250); "each card concern has one owner" to `storyCardOpenSessions.ts`
and `storyCardSessionListing.ts`; reader invariants and the later
pending-proof map to the comparison readers, `ciProofArtifacts.ts` and
`backend-tests/intent/ci-comparison-finality-later-judgment.spec.ts`.
Measurements, current observations and the under-1,000 ms claim are dropped.
Repoint `e2e/README.md:24`.

### 3. Move shard job-count procedure into its skill
Type: Structure
Status: provisional
Proof: delete `shards.md`. The job-count reasoning moves into
`.agents/skills/rebalance-ci-shards/SKILL.md` under
[author-open-dough-skills](../../../.agents/skills/author-open-dough-skills/SKILL.md);
the producers table, split, E2E projects, times and deadline are already in
`ci.yml`, `testFiles.mjs`, `specTimes.ts`, `suiteDeadline.mjs` and
`Distribution/tests/support/` checks. Decide whether the reviewed deadline
ceiling (450 s, `timeout-minutes: 8`) and `retries: 0` each get one assertion
in `ci-browser-groups.test.mjs`. Repoint `ci.yml:176,185`,
`e2e/README.md:73`, `Distribution/tests/README.md:19` and
`frontend-tests/README.md:51`.

### 4. Check feature-folder membership instead of describing it
Type: Structure
Status: provisional
Proof: delete `feature-groups.md`. One constant maps each feature folder to
its responsibility, and a check under `Distribution/tests/support/` fails for
an `e2e/` or `backend-tests/` spec outside those folders. Repoint
`e2e/README.md:37`, `Distribution/tests/README.md:12` and
`backend-tests/README.md:54`.

### 5. Refuse a Frontend spec that starts the real server, and remove the hub
Type: Structure
Status: provisional
Proof: an ESLint `no-restricted-imports` block for
`dashboard/frontend-tests/**` refuses `dashboardServer`, `fakeGitHub`,
`dashboardTest` and the fake hosts; a scratch import fails `npm run lint`.
Delete `README.md` (251 lines). Rehome the dual-server note to
`backend-tests/runtime/serving-modes.spec.ts`, the one-device touch and
one-check-per-CSS-branch rules to `pageTest.ts` or `responsiveStart.ts`, and
the repeat helper's usage to its script header. Fix the stale citations in
`pageTest.ts`, `dashboardServer.ts` and the `runLifecycle.ts` message.
Repoint `AGENTS.md:31`, `dashboard/README.md:223`, `e2e/README.md:50`,
`Distribution/tests/README.md:7,155`, `test-environment.md:71`,
`frontend-tests/README.md:50`, `backend-tests/README.md:43,68,70`,
`ProjectFindings.md:44` and `DearDough.md:379`.
`find dashboard/tests -name '*.md'` returns nothing and a link check finds no
live link to a removed file.

## Refinement inputs

Historical records keep their links: `docs/maintainer/` findings and history,
`.planning/evidence/`, `.planning/done/`, `CHANGELOG.md`. Decide per rule
whether an executable check earns its place or the fact is a comment; the two
checks in slices 4 and 5 are the smallest set found. SEED-334#keep-one-browser-test-group-roster
edits `dashboard/tests/README.md`; whichever lands second adapts. Interim-group
notes are dropped whether or not the group has retired.
