# Compute story readiness from preparation and dependency facts

**Identity:** SEED-138#compute-execution-readiness
**Source:** [selected story](../../seeds/SEED-138-computed-execution-readiness.md#compute-execution-readiness)

## Goal and scope

A prepared story becomes startable the moment its last recorded prerequisite
is published as satisfied, with no further readiness write, and the dashboard
and the start command answer "can this start?" the same way. The preparing
agent's assessment stays the one record of preparation readiness; whether a
story may start is derived from that record and the dependency agreement and is
never stored again.

Included: one shared derivation of start eligibility over the two recorded
facts, consumed by the dashboard card and by the installed start command; a
card badge row that shows the derived meaning; a readiness basis that covers
the dependency agreement but not its fulfillment, with a compatible comparison
for records assessed before this change; guidance that a recorded dependency is
not a readiness reason and that a supplier's wrap-up agent reassesses a
consumer whose reasons duplicated the satisfied condition; the dashboard and
requirements documentation that describe these meanings.

Excluded: informational dependencies that allow parallel execution; any change
to how an owned Taken execution continues; any mechanical interpretation of
reason text; a change to whether the dashboard offers Start for a story whose
assessment alone blocks (it stays offered with its note, and the start command
refuses, as today); a legacy duplicated reason whose supplier wrapped up before
this story lands (a preparing agent re-reviews it on request).

Assumptions: the dependency agreement and the preparation record live in the
same canonical home, so the derivation costs no further read; a satisfied
dependency changes nothing the preparing agent reviewed.

## Design and existing solutions

- **Two shared readers, one derivation** (reuse, then change).
  `product-backlog-story-state.mjs` (`readStoryState`) and
  `product-backlog-story-dependencies.mjs` (`readStoryDependencies`) already
  interpret the two facts for the CLI, the start command, and the dashboard.
  A new pure module beside them, `product-backlog-start-eligibility.mjs`,
  derives start eligibility from the two already-read results: `eligible`
  when the assessment is `ready` and `blocking` is empty; otherwise `blocked`
  with the blockers in order: each unsatisfied dependency (supplier, href,
  rationale, condition, decision) and the assessment (status, reasons) when it
  is not `ready`, or a gap when preparation is not recorded or a reader
  refused. It imports no filesystem module, like the readers, so the browser
  bundle can import it (proved by the existing import test pattern in
  `tests/support/story-state.test.mjs`).
- **Start command** (change). `execution-source.mjs` composes
  `requireResolvedStoryDependencies` and the `ready` check in sequence; it will
  call the derivation once and refuse with every blocker named. The owned
  Taken continuation keeps bypassing the dependency gate
  (`publishedClaimOwned`), as today. Refusal text keeps the substrings the
  existing proofs and the dashboard assert, `execution is blocked by` for a
  dependency and `published preparation is not-ready` for the assessment, so
  the message names both blockers in one refusal.
- **Dashboard** (change). `preparationEnrichment.ts` already attaches
  `preparation` and `dependencies` to the same entry, and `WorkCard.tsx`
  renders `PreparationFacts`, `DependenciesCard`, and `CardLaunches` from it.
  A projection `dashboard/src/startEligibility.ts` maps the dashboard's own
  loading and unavailable shapes to gaps and otherwise calls the shared
  derivation. `PreparationCard.tsx` shows the green "Ready for execution" badge
  only for `eligible`; a ready assessment behind unsatisfied dependencies shows
  "Blocked by N dependencies" (singular for one) in its place; "Not ready",
  "Changed since readiness review", and the gap badges stay as today.
  `CardLaunches.tsx` keeps gating Start on dependencies and reads its reason
  from the same projection; `launchWorkflow.ts` keeps the note "Not marked
  Ready for execution" for the assessment-only case. `BadgeLegend` and
  `dashboard/STORY-PREPARATION.md`, `dashboard/README.md` describe the badge.
- **Readiness basis** (change). `digestSource` in
  `product-backlog-story-state-basis.mjs` strips story-state fences and hashes
  the rest. It will digest a `json dough-story-dependencies` fence by its
  agreement only (per dependency: `supplier`, `implementation`, `rationale`,
  `condition`, the same subset `dependency-resolution.mjs` compares as the
  agreement), leaving `state`, `resolution`, and `decision` out. A malformed
  fence is digested as written. `normalizeAssessmentView` already compares the
  recorded basis against the current and the former whole-document basis; it
  gains a third comparison against the basis a record from before this change
  carries (the same scoped text with the fence digested as written), so an
  unchanged home keeps `changedSinceReview: false` while a legacy record whose
  dependency state changed since review keeps `true`.
- **Guidance** (change). `record-preparation.md` (criteria table and the
  sentence under it), `dough-slice-planning/SKILL.md` ("every remaining
  concern becomes a `not-ready` reason"), `dough-product-backlog/SKILL.md`
  ("Dependency changes report changed content since review"),
  `supplier-dependencies.md` (the consumer visit and "never rerecord Ready
  automatically"), and `docs/project-visibility-requirements.md` (the blocking
  dependencies section) are edited in `src/skills` and `docs`, never in the
  installed copies under `.claude/skills` or `.agents/skills`.
- **Vocabulary** (decision). "Readiness" keeps the meaning
  [ADR 0002, principle 5](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (Accepted) gives it: the preparing agent's recorded assessment. The derived
  value is "start eligibility", `eligible` or `blocked`, in code, start output,
  and documentation. The dashboard's green badge text stays "Ready for
  execution" because every existing journey and the legend use it; its
  meaning becomes the derived one, which the legend states. Principle 2 (one
  representation) is why the derivation is one shared module. ADR 0008 is
  Proposed and binds nothing. No Accepted decision conflicts.

## Preparation observations and decisive premises

Observed 2026-10-17 in this preparation workspace at `92ceb58e`, Node 24.21.0;
scratch files lived in the job's temporary directory, the
scratch edit below was reverted, and `git diff --stat -- src` is empty.

| Premise | Consuming observation and result | Consequence / remaining owner |
| --- | --- | --- |
| The reported symptom reproduces: a consumer recorded `not-ready` with a reason naming its supplier stays `not-ready` after the supplier's resolution, while the dependency gate opens. | A scratch script drove `updateStoryDependency`, `recordStoryState`, and `requireResolvedStoryDependencies` on in-memory seed text. Before resolution: `not-ready`, 1 blocking, gate refuses "execution is blocked by SEED-901#b". After `satisfied`: `not-ready` retained, `changedSinceReview: true`, 0 blocking, gate passes. A `ready` consumer behind a `waiting` dependency reads `ready` with 1 blocking, and after resolution `ready` with `changedSinceReview: true`. | Symptom and the review-change noise both reproduced; slices 1 to 3 own them. |
| Digesting a dependency fence by its agreement leaves a resolution outside the readiness basis. | Scratch edit to `digestSource` replacing each dependency fence's payload by its agreement subset; the same script then read `changedSinceReview: false` after resolution in both cases, with the recorded basis unchanged. | True; slice 3 implements it with the legacy comparison. |
| Existing unit proofs discriminate the basis change. | `node --test tests/support/story-state.test.mjs tests/support/story-dependencies.test.mjs`: 13 pass at baseline and 13 pass under the scratch edit. The "detects changed review" case adds a new agreement, which still changes the digest. | False: no existing unit proof observes a resolution's effect on the basis; slice 3 adds the discriminating cases named in its proof. |
| Dashboard journeys observe the changed surfaces. | `dashboard/tests/story-dependencies.spec.ts` asserts, on one card, "Not marked Ready for execution" and "2 blocking dependencies", then after both suppliers are satisfied "Dependencies · 0 blocking", "Not ready", and "Changed since readiness review", then the start refusal "published preparation is not-ready". Its fixture `twoDependencies` records the assessment after the dependencies. Reading only; the spec itself runs in slices 1 and 3. | The "Changed since readiness review" assertion inverts in slice 3 and the badge assertions extend in slice 1; the refusal substring is kept. |
| The start command's refusal substrings are consumed. | `workspace-publication-startup-dependencies-cases.mjs` matches `/execution is blocked by SEED-B#b/`, `/normal reconciliation cannot supply/`, `/completion condition/`; the dashboard spec matches `published preparation is not-ready`. Reading only. | Slice 2 keeps both substrings in the single refusal. |
| A wrap-up agent's reassessment write after a resolution needs no new digest. | In the scratch run the recorded basis before resolution equalled the current basis after it. | Slice 4's guidance may tell the agent to record with the digest it read before resolving; a stale-basis refusal still falls back to re-reading. |
| Playwright journeys run in this checkout, and the dependency journey observes the surfaces slices 1 and 3 change. | `scripts/setup-native.mjs npm` timed out at its 45 s deadline on the cold cache and left a partial install under which every spec failed to load ("did not expect test.use() to be called here"); after `rm -rf node_modules && npm ci` and the `browser` and `check` stages (Chromium 153.0.8010.12), `npm run test:dashboard -- story-dependencies.spec.ts --reporter=list` ran: the touch and malformed journeys passed; the two-supplier journey hit the 30 s test timeout at its refresh wait with the machine at load average 50, then passed alone in 56.6 s with `--timeout 150000` at load average 57, reaching every assertion named above. | Route available; the failure is machine load, not trunk. The executing agent reruns the spec before editing it and compares its time relatively when the machine is loaded. |

## Outside-in proof ownership

| Promise / example | Owning slice and observable proof |
| --- | --- |
| Ready assessment behind one waiting dependency shows no green badge, shows "Blocked by 1 dependency", Start unavailable naming the supplier; after `satisfied`, "Ready for execution" and Start available (key example 1, 3) | 1: `start-eligibility.spec.ts` journey through the real CLI publications; unit table in `tests/support/start-eligibility.test.mjs`. |
| `decision-needed` blocks like `waiting`; nothing reads a supplier's closure as fulfillment (key example 4) | 1: unit table; existing spec assertion on "Decision needed" retained. |
| Malformed or absent facts show a gap and no green badge; the start command refuses with that gap (key example 6) | 1: existing "malformed and unreadable dependency facts" journey plus a no-green assertion; 2: existing "a malformed published dependency cannot look like no blockers" case. |
| Start command admits a story that is `ready` with every dependency satisfied, with no readiness write between (key example 1) | 2: existing "all dependencies must be satisfied before a ready story starts" case, extended to assert no story-state change between resolution and the published Take. |
| Start refusal names every blocker the dashboard shows (dependency and assessment) | 2: new case in `workspace-publication-startup-dependencies-cases.mjs`: `not-ready` consumer behind a `waiting` supplier is refused once, matching both substrings. |
| A satisfied dependency leaves "Changed since readiness review" off; an agreement edit still flags; legacy records stay accurate (key examples 1, 7) | 3: new cases in `tests/support/story-dependencies.test.mjs`; the inverted assertion in `story-dependencies.spec.ts`. |
| A preparing agent records `ready` for a story that waits only on suppliers; a dependency is not a readiness reason (key example 5) | 4: `record-preparation.md` criteria and `dough-slice-planning/SKILL.md` state it; behavior review walk recorded under Learnings. |
| A wrap-up agent reassesses a consumer whose reasons duplicated the satisfied condition, by judgment, keeping other reasons (key example 2) | 4: `supplier-dependencies.md` consumer visit names the step and its recorder command; behavior review walk recorded under Learnings. |
| Becoming eligible grants no permission and launches nothing | 1 and 2: no launch call in the dashboard journeys; no Take published on a refusal (existing assertions). |

## Ordered slices

### 1. Dashboard card shows derived start eligibility
Type: Behavior
Status: done
Proof: `dashboard/tests/start-eligibility.spec.ts` publishes, through the real
CLI, a consumer recorded `ready` behind one `waiting` supplier: the card shows
"Blocked by 1 dependency", no "Ready for execution", Start disabled with the
dependency reason, then after the real `update-dependency` to `satisfied` the
card shows "Ready for execution" and Start enabled, with no story-state write.
The existing two-supplier journey keeps "Not ready" and shows "Blocked by 2
dependencies" beside it; the malformed journey shows no green badge.
`preparation-legend.spec.ts` reads the new legend entry.
`tests/support/start-eligibility.test.mjs` tables eligible, dependency-blocked
(waiting, decision-needed, two suppliers with one satisfied), assessment-blocked,
both, not-recorded, and refused-reader inputs, and checks the module imports no
filesystem or Node-only module. `npm run typecheck:dashboard` and
`npm run lint` green.

Behavior: a Backlog card has readable preparation and dependency facts → the
page renders → the badge row shows the derived meaning: green "Ready for
execution" only when the assessment is `ready` and no dependency is
unsatisfied; "Blocked by N dependencies" when dependencies block; "Not ready"
when the assessment blocks; the gap badges as today. The Start reason names the
same blockers. The legend, `dashboard/STORY-PREPARATION.md`, and
`dashboard/README.md` state the badge's derived meaning. Taken cards keep
today's badges.

Accepted proof: `node --test tests/support/start-eligibility.test.mjs
tests/support/story-state.test.mjs tests/support/story-dependencies.test.mjs
tests/support/dashboard-test-files.test.mjs` (30 pass); `npm run test:dashboard
-- story-dependencies.spec.ts story-dependencies-touch.spec.ts
start-eligibility.spec.ts preparation-legend.spec.ts --reporter=list` and the
badge consumers `published-facts-arrival`, `published-facts-failures`,
`transient-detail-recovery`, `published-facts-reading`,
`dashboard-columns-height`, `agent-launch-start-dependencies` (pass; tests that
hit the 30 s timeout at load average 70 to 110 passed alone with
`--timeout 150000`); `npm run typecheck:dashboard`, `npm run lint`. The shared
derivation is `deriveStartEligibility` in
`src/skills/dough-product-backlog/scripts/product-backlog-start-eligibility.mjs`;
the dashboard projection is `startEligibilityOf` in
`dashboard/src/startEligibility.ts`.

### 2. Start command refuses through the same derivation
Type: Behavior
Status: done
Proof: in `workspace-publication-startup-dependencies-cases.mjs`, a new case
publishes a consumer recorded `not-ready` behind a `waiting` supplier and
asserts one `source-refused` receipt whose error matches both
`/execution is blocked by SEED-B#b/` and `/published preparation is not-ready/`,
with no workspace, Take, or branch. The existing dependency, readiness,
one-shot, admission, and recovery cases stay green; "all dependencies must be
satisfied before a ready story starts" additionally asserts the consumer's
story-state bytes are unchanged between the resolution and the published Take.
`dashboard/tests/agent-launch-start-dependencies.spec.ts` green.

Behavior: a queued or retained start reads the fetched canonical home → the
command derives start eligibility once through the shared module → `eligible`
continues to the plan checks and Take as today; `blocked` refuses naming every
blocker; an owned Taken continuation keeps bypassing the dependency gate.

Accepted proof: `node --test` over `workspace-publication.test.mjs`, the
`workspace-publication-admission*`, startup admission-recovery and recovery,
`one-shot*` tests in `src/skills/dough-execute-plan/scripts`, and
`tests/support/{supplier-dependency-refusal,story-dependencies,start-eligibility,story-state}.test.mjs`
(134 pass), including "one start refusal names a waiting dependency and a
not-ready assessment" and the extended byte-equality case;
`agent-launch-start-dependencies.spec.ts`, `story-dependencies.spec.ts`,
`execution-start-result.spec.ts`; `tests/product-backlog-payload-update.sh`;
`npm run lint`. `readPublishedExecutionSource` in `execution-source.mjs`
derives once; `blockedByDependencies` in
`product-backlog-story-dependencies.mjs` is the one dependency refusal text.

### 3. A satisfied dependency leaves the readiness review unchanged
Type: Behavior
Status: done
Proof: new cases in `tests/support/story-dependencies.test.mjs` through the
real CLI: after `record-state --assessment ready`, `update-dependency` to
`satisfied` with resolution reads `changedSinceReview: false`; editing the
agreement's `condition` reads `true`; a planted record whose stored basis was
computed over the fence as written (bytes from before this change) reads
`false` while the home is unchanged and `true` once its dependency state
changes; a malformed fence still reads as today. `story-dependencies.spec.ts`
asserts no "Changed since readiness review" after both suppliers are
satisfied. Existing story-state, dependency, supplier-resolution, and startup
readiness cases stay green.

Behavior: a consumer's readiness is recorded → a supplier's resolution writes
`state`, `resolution`, or `decision` in the dependency fence → the recorded
judgment reads with `changedSinceReview: false`; a change to the story text,
the plan, or the agreement itself still reads `true`.

Accepted proof: `node --test tests/support/story-state*.test.mjs
tests/support/story-dependencies.test.mjs tests/support/supplier-*.test.mjs
tests/support/start-eligibility.test.mjs` with the startup, admission,
recovery, one-shot queued escalation and established-start tests in
`src/skills/dough-execute-plan/scripts` (129 pass), including the three new
basis cases, which fail with agreement digests or the as-written comparison
disabled; `tests/product-backlog-payload-update.sh`; `story-dependencies.spec.ts`
and `start-eligibility.spec.ts` (inverted and new absence assertions). The
agreement subset is `dependencyAgreement` in
`product-backlog-story-state-basis.mjs`, shared with the stale-agreement check.

### 4. Guidance records dependencies once and reassesses duplicated reasons by judgment
Type: Behavior
Status: done
Proof: the behavior review under `AGENTS.md` walked for one representative use
of each edited skill and recorded under Learnings: a preparing agent planning a
consumer that waits on a supplier records `ready`; a wrap-up agent resolving a
consumer whose sole reason named the condition records `ready` with the current
digests through `record-state`, and one whose other reason remains records
`not-ready` with that reason alone. `npm run lint` green; the edited files are
under `src/skills` and `docs` only (`git diff --stat` shows no installed copy).

Behavior: an agent reads `record-preparation.md` or `dough-slice-planning` for
a story with a recorded dependency → the criteria state that the dependency
agreement is the only record of a prerequisite and is not a readiness concern
→ the agent records `ready` when goal, scope, examples, plan, proof, and
premises are settled. A wrap-up agent follows `supplier-dependencies.md` for a
consumer with `not-ready` reasons → the visit names rereading those reasons,
removing by judgment the ones that state only the satisfied condition, and
recording a fresh assessment through the ordinary recorder, never matching
text in code and never recording `ready` while another reason remains.
`dough-product-backlog/SKILL.md` and
`docs/project-visibility-requirements.md` describe the derived meaning and the
basis boundary.

Accepted proof: `npm run lint` green; the guidance tests under
`src/skills/dough-story-refinement/scripts/*-guidance.test.mjs`,
`execution-completion-record-guidance`, `one-shot-guidance`,
`established-start-guidance`, and `tests/support/story-dependencies.test.mjs`
(81 pass; none asserts a changed phrase); `git diff --stat` touched only
`src/skills` and `docs`. Behavior review walks are under Learnings.

## Story obligations

### G1. Detail assessment summary keeps "Ready for execution" while the card shows blocked
Reported: slice 1 — "The detail's `assessmentSummaryText` still says "Ready for execution" for a ready assessment, even when the card shows "Blocked by N dependencies"."
Story clause: "The recorded assessment, its reasons, and review-change indication remain visible on the card and in the detail with shared wording"
Disposition: no user cost "The preparing agent's assessment stays the one record of preparation readiness": the detail line is labelled "Assessment:" and describes the recorded assessment the story keeps visible with shared wording; the card badge row and the Start reason (`WorkCard.tsx` via `startEligibilityOf`) carry the derived answer, observed in `start-eligibility.spec.ts` "a ready story waits on its dependency and becomes startable once it is satisfied".

### G2. A satisfied dependency still shows "Changed since readiness review"
Reported: slice 1 — "The new journey's card therefore also shows "Changed since readiness review" after the dependency write; I made no assertion on it, and slice 3 owns removing it."
Story clause: "so a supplier's resolution leaves "Changed since readiness review" off"
Disposition: proved by slice 3: `dashboard/tests/start-eligibility.spec.ts` "a ready story waits on its dependency and becomes startable once it is satisfied, with no readiness write" asserts "Changed since readiness review" absent after satisfaction, and `tests/support/story-dependencies.test.mjs` "a supplier's resolution leaves the readiness review unchanged while an agreement edit flags it" reads `changedSinceReview: false`; both fail with agreement digests disabled.

### G3. One-shot and admission starts keep their own gates
Reported: slice 2 — "So a one-shot start of a not-ready story behind a waiting supplier names only the dependency. The admission paths in `execution-admission-source.mjs` also still use only `requireResolvedStoryDependencies`."
Story clause: "The start command and the dashboard consume this one meaning instead of combining the facts separately"
Disposition: no user cost "whether a story may start is derived from that record and the dependency agreement, never stored again": `requireOneShotStart` (`one-shot-ownership.mjs`) is a different contract that admits unrecorded preparation and refuses only a recorded not-ready reason, and it still refuses a dependency-blocked story through the same dependency reader, so its yes/no answer for a blocked story matches; admission accepts work no backlog list holds, which has no queued preparation to derive from. The queued and retained start, the path the dashboard's Start execution uses, derives once in `readPublishedExecutionSource`, observed by "one start refusal names a waiting dependency and a not-ready assessment".

## Current decisions

- The derived value is named start eligibility, `eligible` or `blocked`;
  "readiness" keeps ADR 0002's meaning, the preparing agent's assessment.
- The green badge text stays "Ready for execution"; its meaning becomes the
  derived one, stated in the legend and `STORY-PREPARATION.md`.
- Start refusal keeps the substrings `execution is blocked by` and
  `published preparation is not-ready`, naming both blockers in one message.
- The dashboard keeps offering Start, with its note, when only the assessment
  blocks; the start command refuses, as today.
- The readiness basis digests a dependency fence by its agreement subset
  (`supplier`, `implementation`, `rationale`, `condition`); a legacy
  comparison keeps records assessed before this change accurate.
- Guidance edits land in `src/skills` and `docs`; installed copies follow a
  release.

## Learnings

- Slice 1: the refactor split `story-dependencies.spec.ts`; the ready-story
  journey lives in `start-eligibility.spec.ts`, the touch test in
  `story-dependencies-touch.spec.ts`, and the two-supplier journey that slice 3
  inverts stays in `story-dependencies.spec.ts`. `WorkDependencies.blocking`
  in the dashboard is now the reader's blocking array, not a count.
- Slice 2: a new shared module imported by a payload script needs its entry in
  `install.sh` (and `tests/product-backlog-payload-update.sh`); only the
  installed-CLI startup case catches a missing entry.
- Slice 3: a ready assessment recorded before a dependency agreement is added
  still shows "Changed since readiness review", because the agreement is in
  the basis; slice 4's guidance keeps the order: record the dependency, then
  the assessment.
- Slice 4 behavior review (AGENTS.md), walked by reading the edited guidance:
  (a) a preparing agent planning consumer A that waits on supplier B records
  B's agreement through `update-dependency`, then, with only that wait open,
  `dough-slice-planning` and the `record-preparation.md` criteria lead it to
  `read-state` and `record-state --assessment ready` with no reason; the card
  shows "Blocked by 1 dependency" from the agreement alone (key example 5).
  (b) B's wrap-up agent, after `resolve-dependency` records `satisfied`,
  follows "Reassess a consumer's reasons after satisfaction" in
  `supplier-dependencies.md`: A's sole reason "Waiting for B" is spent, so it
  records `ready` with the `read-state` digests, which still match after the
  resolution, and publishes it with A's resolution (key example 2). Had A also
  carried "Acceptance examples for the retry path are unresolved", it records
  `not-ready` with that reason alone; a stale-basis refusal sends it back to
  re-read and rejudge. Invocation context, required context, and the stop on a
  missing recorder or home are unchanged.
