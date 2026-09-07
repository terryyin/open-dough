# Run one needed native check without replaying or losing the others

Status: planned; refinement recommended for leaves 3 and 6–8. No implementation
or native execution is authorized by this planning artifact.

## Source

- [SEED-007 Story 1](../../seeds/SEED-007-cross-tool-validation.md#select-and-retain-native-checks),
  the first [product backlog](../../PRODUCT-BACKLOG.md) item. E1–E5 define scope.
- Owner direction: keep this to system/codebase readiness for ADR 0005. No open
  product question remains; prepare the plan after refinement.
- Borrowed Donut's `story-refinement` and `slice-planning` skills, plus their
  `planning.mdc` and `problem-decomposition.mdc` rules, by reading them in the
  Donut checkout at `cae5ed116fea947917ee8ffb31af7ad3602c5f1c` (these files clean).
  Consulted only the `slice-plan-refinement` trigger gate. No skills are copied,
  installed, generalized, or added to Open Dough's distributed payload.
- Open Dough source inspected: `a5fdbc2a91c7253bf9af22209929cd7aeb7bfbf7`.
- [Accepted ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  governs cheap runner coverage, dedicated native acceptance, bounded execution,
  and explicit evidence reuse. [ADR 0000 — Use ADRs](../../../docs/adrs/0000-use-adrs-accepted.md)
  preserves human ownership. Index and relevant record statuses agree; no
  supersession, conflict, or exception affects this plan. Release identity and
  ADR statuses are unchanged; no release work is planned.

## Goal and scope

Give a maintainer a usable selected-check and saved-evidence workflow around
existing wrappers. A later acceptance story can then spend native calls only
where needed and report pending claims honestly. This story finishes with
functional, inexpensive proof; it does not claim the current prompts or native
verdicts are trustworthy under the stronger acceptance contract.

Touch only the three `tests/dough-adr-awareness-*-delivery-to-use.sh` wrappers,
`tests/dough-adr-awareness-context.sh`, immediately needed shared support and
fixtures, credential-free regression tests, and brief test usage documentation.
Keep shared mechanics in one implementation with minimal native CLI adapters.
Keep existing no-argument deterministic checks and explicit native opt-in.

Excluded: new cases, prompt/semantic-assessor redesign (Story 2), actual native
qualification (Story 3), old-plan migration (Story 4), changes to source or
installed skills, updater behavior, releases, Donut/client writes, general
caching/impact analysis, arbitrary saved-workspace restoration, scheduling,
databases, and new native operating-system support. No old plan is resumed.

## Execution context and current decisions

The context wrapper already selects host and clear/conflict scenario and captures
structured events. Its exit trap deletes evidence. Delivery wrappers run all
three sessions in sequence; shared fixture setup installs its own cleanup trap.
Claude preserves failed scratch but removes successful evidence. Cursor delivery
records `cursor --version` and only prose; context already uses
`cursor agent --version` and stream JSON. `native-codex.sh` owns existing macOS
isolation and is also used by other harnesses: keep its default callers working.

Use these local implementation decisions; they add no product policy:

- Inventory the existing five cases per host: `context/clear`,
  `context/conflict`, `delivery/legacy-refusal`, `delivery/ordinary-update`, and
  `delivery/updated-use`. This is a fixed inventory for these wrappers, not a
  registration framework. Keep the existing full `--native` journey callable.
- Add listing and selected-case options to the current entry points, with a
  common result-directory option. Listing is read-only and never runs an agent
  or probes its version. Invalid host/case/options fail before setup or launch.
  Put exact implemented usage in `tests/README.md` with the owning leaves.
- An ordinary update needs inspected bootstrap and the newer local tagged
  fixture, not a native legacy refusal. Updated use additionally needs the
  verified native update in the same isolated target and a fresh use session.
  Record that dependency's attempt ID. Do not reconstruct a journey from final
  bytes. Reassessment can reuse evidence; executing updated use in a new scratch
  target reruns its required update rather than restoring archived workspaces.
- Use a small local result directory outside scratch, with distinct attempt
  paths and a compact machine-readable record. Report its path on every exit.
  Require a writable destination before launching. Retain only case evidence,
  not CLI account/configuration directories or entire temporary repositories.
  Generated results must not enter the distributed payload or routine commits.
- Record case/host, fresh versus reassessed origin, execution status/reason,
  actual native executable/version and exposed model/runtime settings, source
  revision plus relevant working-tree input hashes, fixture candidate tag/commit,
  prompt/helper/adapter/fixture identities, assessor identity, dependency IDs,
  and decisive artifact references. Store raw stdout/stderr/events, response,
  and the state observations consumed by the existing assertions before cleanup.
  An unavailable runtime value is unknown, not inferred from the editor.
- Separate execution completion from assessment and current native acceptance.
  Preserve the original outcome; a derived reassessment records its own assessor,
  result, and explicit applicability rationale. Existing coached/wording-based
  passes retain their limited interpretation. Story 2 can use the same saved
  artifacts without this story strengthening its semantic assertions.
- No automatic retry or auto-reuse. A timeout has a configurable deadline and
  finite termination grace, including owned subprocess cleanup. Truncated or
  missing terminal evidence is nonpassing even with exit 0. Test lifecycle and
  stream completeness here; semantic activation/outcome counterexamples belong
  to Story 2. Never turn a blocked prerequisite into a passing dependent case.
- Reassessment runs existing case assertions against retained evidence, not a
  whole wrapper with setup/launch side effects. Separate only what this requires.
  Compare the named relevant inputs and require recorded runtime applicability;
  a revised assessor is allowed, but missing observations or other changed
  relevant inputs keep reuse pending. No inference from repository HEAD alone.
  Listing may identify a prior result as unreviewed; it cannot silently certify it.

## Outside-in proof

Exercise the real wrapper entry points with substitute native commands and
recorded outputs, without credentials or provider calls. Substitutes log every
invocation so tests can prove both requested calls and absent calls, including
version queries, retries, reassessment, and unrelated hosts/cases. Use the real
installer and local tagged fixtures for deterministic setup. Substitutes must
perform the fixture update where a test checks update-to-use provenance; merely
printing success is insufficient.

Keep new executable test entry points under `tests/` and helper/substitute
processes under `tests/support/` or a non-`.sh` fixture path so `scripts/test.sh`
does not accidentally run them as standalone tests. Capability-named focused
tests may be `native-case-selection.sh`, `native-result-retention.sh`,
`native-runner-failures.sh`, and `native-result-reassessment.sh`; add these only
with their behavior. Do not build a parallel test framework.

| Contract / observation | Owning leaves |
| --- | --- |
| E1: inventory, dependency description, invalid selection, no native calls during listing | 1 |
| E1/E2: selected context only, durable successful attempt and exact inputs/runtime | 2 |
| E3: hung owned process tree terminates within bound, evidence survives, no retry | 3 |
| E3: unavailable/denied launch remains nonpassing with evidence | 4 |
| E3: truncated or absent terminal stream cannot pass on exit 0 | 5 |
| E1/E2/E5: selected delivery sessions and genuine update provenance per adapter; failed dependency leaves use pending | 6–8, separately per host |
| E2/E3: new success/failure never overwrites prior attempts; unwritable result destination prevents launch | 2–5 |
| E4: offline reassessment, preserved original, applicability rationale, changed/missing evidence pending | 9 |
| Shared mechanics, existing default/legacy callers preserved, broad cheap CI, no installed infrastructure | Focused checks in each leaf; whole-story completion below |
| Native discovery, invocation/application, behavior, affected install/update/coexistence | Pending in Story 3; matrix below |

## Ordered slices

All leaves are Behavior slices with an observable wrapper result. Add the
necessary support inside the first behavior that uses it; no standalone framework
or speculative Structure slice. Each proof is credential-free.

### 1. Inspect the available check before spending a native call
Type: Behavior
Status: planned
Proof: Selection tests list the fixed inventory and dependencies for all three
hosts; installed sentinel agent commands record zero calls. Invalid input exits
nonzero before fixture creation. Existing default checks still pass.

Behavior: Existing wrappers → request listing or invalid selection → get the
case/host/purpose/setup and prior-result references, or an actionable usage error,
without native execution. Add brief usage alongside the options.

Sizing: approximately five minutes, medium confidence; keep inventory static.

### 2. Keep a selected context attempt after scratch cleanup
Type: Behavior
Status: planned
Proof: Invoke each existing host/scenario path with a successful substitute;
check only the selected session ran, scratch is gone, and record plus required
artifacts remain readable. A second attempt gets a distinct path. An unwritable
result destination launches nothing. Check Cursor Agent runtime identification.

Behavior: Selected context case and writable result destination → run the case
→ receive a durable, identified attempt usable after cleanup. Listing can now
show that saved attempt as prior evidence, explicitly unreviewed for reuse.

Sizing: five–ten minutes, medium confidence; reuse existing structured streams
and snapshot functions. If record wiring needs separable beats, split at the
first host's complete retained attempt before expanding adapters.

### 3. Stop a hung attempt and its owned subprocesses
Type: Behavior
Status: planned
Proof: A substitute starts a child, emits partial output, and ignores normal
termination. The wrapper returns nonpassing within deadline plus grace; neither
owned process remains alive and partial evidence persists. A previously completed
attempt is unchanged. Invocation log proves no retry.

Behavior: Running context attempt hangs → configured deadline expires → runner
terminates its owned work, reports timeout, and finalizes retained evidence.

Sizing: low confidence; refinement recommended. Supervision must fit both local
native wrapping and credential-free CI. Bound the proof to owned processes;
do not enlarge it into cross-OS native support or replace Codex isolation.

### 4. Preserve why a selected attempt could not execute
Type: Behavior
Status: planned
Proof: Missing executable, nonzero launch, and explicit denied-operation fixtures
produce nonpassing records with available stderr/reason and no retry. Previous
success remains byte-identical; cleanup cannot mask the original failure.

Behavior: Selected context attempt cannot run successfully → launch/failure is
observed → return a retained failure instead of losing it through `set -e` or
an exit trap. Unknown runtime is recorded when no version can be obtained.

Sizing: approximately five minutes, medium confidence; use leaf 2's finalizer.

### 5. Reject an incomplete native stream despite a successful process exit
Type: Behavior
Status: planned
Proof: Per-host recorded complete, truncated, and missing-terminal streams drive
the same completion checks. Incomplete evidence with exit 0 remains nonpassing;
raw evidence survives. No semantic expected-answer changes enter the assertions.

Behavior: Native command exits → inspect required stream completion → classify
an incomplete attempt as nonpassing, separate from its later behavioral verdict.

Sizing: approximately five minutes, medium confidence; use the existing context
event formats. Unknown event shapes stay inconclusive for later native review.

### 6. Run just the required Codex delivery journey
Type: Behavior
Status: planned
Proof: Through the Codex wrapper, substitutes demonstrate refusal alone, ordinary
update without refusal, and updated use consuming the verified update's target.
The call log omits unrelated cases; failed update launches no use. Each required
attempt has retained artifacts and relationship IDs. Default deterministic and
existing full-journey entry points retain their behavior.

Behavior: Selected Codex delivery case → set up only its prerequisites and run
through existing isolation → retain the requested case and necessary dependency
results, with a real update-to-use chain where claimed.

Sizing: low confidence; refinement recommended. First delivery integration must
unwind the shared setup trap and sequence without losing state assertions. Use
the existing transition helpers; do not generalize to unrelated harnesses.

### 7. Run just the required Cursor delivery journey
Type: Behavior
Status: planned
Proof: Repeat leaf 6's selection/dependency contract through the Cursor wrapper;
retain stream JSON plus derived response, record `cursor agent --version`, and
exercise incomplete output through leaf 5's gate. Other tool roots and companion
integration remain unchanged in the real fixture update.

Behavior: Selected Cursor delivery case → use the shared journey mechanics and
Cursor's native command adapter → retain that journey with correct runtime and
raw evidence. Existing prose assertions retain their present interpretation.

Sizing: medium-low confidence; refinement recommended if stream-output adaptation
and journey migration cannot close one focused proof loop. Reuse the context
wrapper's Cursor stream capture rather than inventing a new event parser.

### 8. Run just the required Claude Code delivery journey
Type: Behavior
Status: planned
Proof: Repeat leaf 6's selection/dependency contract through the Claude wrapper;
retain stream JSON plus response on success and failure, replacing its special
failure-only cleanup. Exercise terminal completeness and unchanged other tool
roots/companion integration. Preserve existing refusal assertions.

Behavior: Selected Claude Code delivery case → use the shared journey mechanics
and its native command adapter → retain the selected attempt and genuine
dependencies on either outcome.

Sizing: medium-low confidence; refinement recommended for the same integration
boundary as leaf 7. Reuse context's structured capture; leave semantic repair
and proof of native activation to Stories 2–3.

### 9. Reassess a saved attempt without another native session
Type: Behavior
Status: planned
Proof: Saved good/bad attempts, revised assessor fixtures, explicit applicability
records, changed relevant input/runtime conditions, and missing artifact cases
exercise offline reassessment. All agent sentinels record zero calls. Original
attempts stay byte-identical; a new assessment identifies its inputs and reason.
Unreviewed/stale/insufficient evidence cannot become a reused pass.

Behavior: Maintainer supplies a saved attempt and applicability judgment → run
the current case assessment over its retained observations → append a supported
reassessment or report pending with the missing/stale evidence identified.

Sizing: five–ten minutes, medium confidence; extract only the existing assertions
needed to run offline. No cache lookup policy or old-artifact migration.

## Completion and native evidence ownership

Run focused tests with each leaf. At story completion, run `npm test` and
`npm run lint` once to check the full cheap suite and shared-caller regressions.
No `--native` invocation is part of this plan's verification. These changes must
remain internal test infrastructure; neither installed skill contents nor the
installer's payload contract changes. Record actual cheap observations here
when executed, without promoting substitute evidence to native proof.

| Platform | Evidence at planning time | Story 1 functional acceptance | Native claims / owner |
| --- | --- | --- | --- |
| Codex | Source inspected: JSONL context/delivery, existing macOS isolation; no new runtime observation | Pending: selection, retention, failure bounds, reassessment via Codex adapter substitutes | Pending in SEED-007 Story 3: discovery, invocation/application, intended behavior, affected install/update/coexistence and changed harness qualification |
| Cursor | Source inspected: structured context capture; delivery prose-only and editor-version defect | Pending: same substitute coverage plus Cursor Agent version and stream capture | Pending in Story 3 for the same claim categories, independently in Cursor |
| Claude Code | Source inspected: structured context capture; delivery retains only failed scratch | Pending: same substitute coverage plus success/failure stream retention | Pending in Story 3 for the same claim categories, independently in Claude Code |

Earlier native results remain historical. This plan does not declare any reused
proof applicable. Story 3 reviews candidate/runtime applicability before native
execution and independently qualifies the covered changed adapters alongside
Story 2's assessments. Implementation completion cannot close that story or
authorize release of affected behavior.

## Learnings and readiness

No implementation learning yet. Refinement is complete at story level.
**Refinement recommended: leaves 3 and 6–8**, because process ownership and the
first delivery integration/stream migrations have plausible paths beyond the
borrowed skill's ten-minute limit. Leaf sizing is an estimate, not an execution
guarantee. No extra native feasibility run is justified by current source
inspection. A later leaf refinement stays inside this story and this PLAN.
