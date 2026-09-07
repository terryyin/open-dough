---
id: SEED-007
status: active
planted: 2026-09-07
planted_during: Story 7 refinement follow-up on repeated native validation
trigger_when: Improve existing tests under ADR 0005; reconsider stories before revisiting old plans
scope: Existing test migration and minimal runner support
---

# SEED-007: Deliver trustworthy cross-tool acceptance with fewer native runs

## Outcome

Maintainers can finish implementation stories with inexpensive feedback, then
validate related changes through dedicated native acceptance stories. Each native
result is trustworthy, retained, and reused where applicable across Codex,
Cursor, and Claude Code.

Follow [Accepted ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).
The [migration assessment](../research/adr-0005-migration-assessment.md) confirms
both plan/test changes and small runner improvements are needed. Preserve the
existing cheap CI suite and real native interfaces. Research and alternatives
remain in [the research report](../research/cross-tool-validation.md).

## Boundaries

- Extend the existing tests; no new test platform, provider service, approval
  gate, paid schedule, evidence database, or general impact-analysis engine.
- Keep all three platforms' native claims visible. Cheap test success and an
  implementation story's completion do not close a native acceptance story.
- Preserve completed historical evidence; assess its relevance without rewriting
  earlier outcomes. Internal test infrastructure is not installed in clients.
- Keep genuine client adoption/use in its own outcome stories. Moving general
  validation must not remove the useful work promised to the client.

## Stories

<a id="select-and-retain-native-checks"></a>

### 1. Run one needed native check without replaying or losing the others

**Status:** Unplanned. **Type:** Test tooling. **Dependency:** Existing native cases; no slice-plan migration prerequisite.

**Value:** A failed case or new assessment no longer forces a maintainer to pay
for unrelated successful sessions.

**Scope:** Extend the existing native wrappers with shared case selection,
required fixture setup, bounded execution, and retained per-case results. Apply
the interface to the three delivery wrappers and context checks. Store a compact
local result with candidate, platform/runtime, relevant inputs and decisive
artifacts. Support reassessment of retained results without launching a model;
manual impact judgment is sufficient when recorded explicitly.

**Acceptance scenarios:**

- Given selected cases for a native story, list their host, purpose, required
  setup, and usable prior evidence without starting an agent. Running a single
  case launches only that case and its necessary journey dependencies.
- Given a timeout, missing executable, denied operation, or truncated stream,
  return a nonpassing result, stop the process within its configured bound, and
  preserve evidence. Previous successful results remain available. Test these
  paths using substitute processes in CI, without provider access.
- Given successful execution, scratch cleanup preserves a usable result and
  artifacts. Cursor evidence identifies Cursor Agent, not the editor version.
- Given sufficient saved evidence and a revised assessor, reassess without a
  native call. Changed relevant inputs or missing observations remain pending
  rather than being labeled a reused pass. Exercise both outcomes in cheap tests.
- Given an update-to-use claim, fresh use consumes the verified real update's
  resulting installation. Independent case selection never fabricates a missing
  transition by seeding only its final state.

**Completion evidence:** Working selected-case/reassessment paths and passing
substitute-process CI tests for each adapter. Native qualification remains
explicitly assigned to Story 3; no cross-OS runner or generic cache is required.

<a id="trust-native-verdicts"></a>

### 2. Detect native behavior failures instead of rewarding the expected words

**Status:** Unplanned. **Type:** Test migration. **Dependency:** Story 1's retained artifacts.

**Value:** A green acceptance result means the installed guidance was used and
behaved correctly, rather than the agent repeating answers supplied by the test.

**Scope:** Migrate the current delivery/context prompts and assessments. Keep
expected contract facts outside prompts, retain legitimate invocation hints for
explicit cases, and capture host-native loading evidence plus observed state.
Keep shared behavioral assertions with minimal event-format adapters.

**Acceptance scenarios:**

- Given an undisclosed ADR disagreement or edited installation, the ordinary
  task prompt supplies neither the expected conclusion nor the skill body.
  Native evidence must show discovery/invocation and the expected response/state.
- Given a real native skill expansion without a separate shell read, accept valid
  activation evidence. Given self-report with no activation evidence, do not pass.
- Given correct words in a negated answer, a failed command followed by a success
  claim, missing terminal events, or modified protected files, automated grading
  does not pass. Reviewed good/bad transcript and snapshot fixtures cover all
  three adapters in CI.
- Given ambiguous but potentially legitimate behavior, retain an inconclusive
  result for human judgment. Record any resolution against its evidence rather
  than silently weakening assertions or rerunning until green.

**Completion evidence:** Revised cases and passing positive/counterexample CI
coverage. Existing coached observations stay historical; revised native
interpretation claims remain pending in Story 3.

<a id="accept-standalone-client-workflow"></a>

### 3. Establish that the standalone client candidate works in all three tools

**Status:** Pending native acceptance; not selected for execution.
**Type:** Native behavioral acceptance.
**Dependencies:** Stories 1–2 and a relevant candidate from the reconsidered
standalone updater story. Define its current native claims when refining this
acceptance story; neither old slice-plan updates nor publication are dependencies.

**Value:** The maintainer can release the changed client workflow on independent
native evidence while qualifying the migrated tests in the same useful batch.

**Scope:** Refine prepublication native claims from the reconsidered product
story. Use Quick 019 leaves 9a–11d only as historical input, not fixed scope. Assess earlier standalone ADR-use evidence for valid reuse; execute
only unresolved representative cases against one identified candidate. Keep the
full helper-policy matrix in cheap tests. Local tagged fixtures may establish
update transitions without manufacturing another public release.

**Acceptance scenarios:**

- Given a fresh installation with its source unavailable, the installed guidance
  is discovered and used correctly, with explicit and automatic activation where
  promised. Include uncoached clear/conflict cases where Story 2's changed
  assessments lack applicable evidence. Record separate evidence for Codex,
  Cursor, and Claude Code.
- Given a verifiable bootstrapped installation and a newer tagged fixture,
  ordinary native update uses the saved source without a URL or force, installs
  the correct payload/records, and makes the improvement usable in a fresh
  session. Preserve unrelated guidance, other tool roots, and reviewable changes.
- Given an edited-equal installation, ordinary native update refuses without
  writes or automatic force. Given explicit force, it replaces only the selected
  managed payload with verified latest content. Use each as a distinct decision
  boundary; do not replay every cheap refusal variation natively.
- Given all results, record actual loading, outcomes, runtime/candidate identity,
  and any human resolution per platform. Unknown or failed claims keep this story
  pending. Reused evidence is labeled with its applicability rationale.
- Given publication preparation, check that the release candidate still matches
  the relevant tested inputs. Reassess changes rather than replaying the whole
  batch. Actual released self-adoption remains with the source client story.

**Completion evidence:** The per-platform matrix below is resolved, with retained
artifacts and measured run/exception information. This also supplies native
qualification for Stories 1–2's changed adapters and assessments on the covered
cases; it does not imply support for untested UI or operating-system surfaces.

| Platform | Discovery / activation / behavior | Affected install / update / coexistence |
| --- | --- | --- |
| Codex | Pending — review prior proof and fill changed claims | Pending — standalone candidate |
| Cursor | Pending — review prior proof and fill changed claims | Pending — standalone candidate |
| Claude Code | Pending — review prior proof and fill changed claims | Pending — standalone candidate |

<a id="separate-native-acceptance"></a>

### 4. Reconcile retained plans after reconsidering their stories

**Status:** Deferred until underlying stories are reconsidered. **Type:** Planning migration.

**Value:** A maintainer can tell what can finish now, what still needs native
proof, and what blocks publication without replaying checks in every story.

**Scope:** Reconsider SEED-001 Story 7, upcoming SEED-004 Stories 5–8, and
SEED-006 Stories 3–4 before deciding which plans remain relevant. Update only
retained plans against the revised stories and native acceptance ownership;
retire obsolete plans rather than polishing them. Keep useful client outcomes
and completed evidence. This work comes last and does not block test tooling,
assessor migration, or native-story refinement.

**Acceptance scenarios:**

- Given an existing slice plan, reconsider its story first. If the plan is
  obsolete, retire it; if retained, align its native claims with the revised
  story or reusable proof without duplicating the native acceptance matrix.
- Given implementation work whose stated criteria pass, it can finish while its
  linked native story remains pending. Publishing affected behavior still waits
  for that native story; updating a status cannot silently remove the obligation.
- Given postpublication self-adoption or Donut use, retain the actual useful
  client outcome. The prepublication candidate check does not depend on that
  future published installation.
- Given a later extraction story with a different candidate, give its native
  claims their own named follow-up at refinement; do not pretend Story 3 proves
  guidance that does not exist yet. No orphaned pending claims remain in the
  migrated planning scope.

**Completion evidence:** Updated backlog, criteria, and claim-to-story map for
all three platforms; no native execution needed for this planning change.

## Order and completion

Start with Stories 1–2 to improve tests and infrastructure. Refine Story 3
against the current product outcome and candidate before native execution.
Do Story 4 last, after reconsidering the underlying stories; update only plans
that remain relevant. Existing slice plans are not being resumed. Backlog
selection governs execution; this seed adds no separate native approval procedure.

Keep this seed until the migration stories and their native acceptance are
complete. No test code, client installation, native run, or release is changed
by this decomposition. Deferred research options are not additional criteria.
