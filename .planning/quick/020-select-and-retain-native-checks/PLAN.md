# Run one needed native check without replaying or losing the others

Status: executing; slices 1–3 done. Remaining leaves were refined in place
(supervisor+timeout; one selected delivery case per host). No `--native` run is
part of this plan's verification.

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
`native-run-timeout.sh`, `native-runner-failures.sh`, and
`native-result-reassessment.sh`; add these only with their behavior. Do not
build a parallel test framework.

| Contract / observation | Owning leaves |
| --- | --- |
| E1: inventory, dependency description, invalid selection, no native calls during listing | 1 |
| E1/E2: selected context only, durable successful attempt and exact inputs/runtime | 2 |
| E3: hung owned process tree terminates within bound, evidence survives, no retry | 3–4 |
| E3: unavailable/denied launch remains nonpassing with evidence | 5 |
| E3: truncated or absent terminal stream cannot pass on exit 0 | 6 |
| E1/E2/E5: selected Codex delivery sessions and genuine update provenance; failed dependency leaves use pending | 7–9 |
| E1/E2/E5: same selected delivery contract through the Cursor adapter | 10–12 |
| E1/E2/E5: same selected delivery contract through the Claude Code adapter | 13–15 |
| E2/E3: new success/failure never overwrites prior attempts; unwritable result destination prevents launch | 2–6 |
| E4: offline reassessment, preserved original, applicability rationale, changed/missing evidence pending | 16 |
| Shared mechanics, existing default/legacy callers preserved, broad cheap CI, no installed infrastructure | Focused checks in each leaf; whole-story completion below |
| Native discovery, invocation/application, behavior, affected install/update/coexistence | Pending in Story 3; matrix below |

## Ordered slices

Leaves are one Behavior or one immediately enabling Structure. Add support
inside the first leaf that uses it; no standalone framework. Each proof is
credential-free. Completed slices 1–2 are unchanged.

### 1. Inspect the available check before spending a native call
Type: Behavior
Status: done
Proof: Selection tests list the fixed inventory and dependencies for all three
hosts; installed sentinel agent commands record zero calls. Invalid input exits
nonzero before fixture creation. Existing default checks still pass.

Behavior: Existing wrappers → request listing or invalid selection → get the
case/host/purpose/setup and prior-result references, or an actionable usage error,
without native execution. Add brief usage alongside the options.

Sizing: approximately five minutes, medium confidence; keep inventory static.

### 2. Keep a selected context attempt after scratch cleanup
Type: Behavior
Status: done
Proof: Invoke each existing host/scenario path with a successful substitute;
check only the selected session ran, scratch is gone, and record plus required
artifacts remain readable under `DIR/<host>/<case>/<attempt-id>/` so listing
reports them as unreviewed prior-evidence. A second attempt gets a distinct
path. An unwritable result destination launches nothing. Check Cursor Agent
runtime identification.

Behavior: Selected context case and writable result destination → run the case
→ receive a durable, identified attempt usable after cleanup. Listing can now
show that saved attempt as prior evidence, explicitly unreviewed for reuse.

Sizing: five–ten minutes, medium confidence; reuse existing structured streams
and snapshot functions. If record wiring needs separable beats, split at the
first host's complete retained attempt before expanding adapters.

### 3. Bound an owned context command without changing successful runs
Type: Structure
Status: done
Proof: `bash tests/native-result-retention.sh` and
`bash tests/native-case-selection.sh` still pass. Selected context runs accept
a deadline and termination grace, defaulting high enough that recorded-success
substitutes are unchanged. No hang fixture yet.

Internal change: the selected context runner owns the native command's process
group and can enforce a deadline plus finite grace, including on Ubuntu without
`sandbox-exec`. Do not replace Codex symlink isolation or add new OS support.
Immediate next Behavior: leaf 4's hung-attempt timeout.

Sizing: approximately five minutes, medium confidence after split; wire only
what leaf 4 needs.

### 4. Stop a hung context attempt and keep partial evidence
Type: Behavior
Status: planned
Proof: A substitute starts a child, emits partial output, and ignores normal
termination. With a short deadline, the wrapper returns nonpassing within
deadline plus grace; neither owned process remains alive; partial evidence is
retained; a previously completed attempt is byte-identical; the invocation log
shows no retry. Focused test: `tests/native-run-timeout.sh`.

Behavior: Running selected context attempt hangs → configured deadline expires →
runner terminates owned work, reports timeout, and finalizes retained evidence.

Sizing: approximately five minutes, medium confidence; uses leaf 3's supervisor
and leaf 2's result layout. Bound the proof to owned processes.

### 5. Preserve why a selected attempt could not execute
Type: Behavior
Status: planned
Proof: Missing executable, nonzero launch, and explicit denied-operation fixtures
produce nonpassing records with available stderr/reason and no retry. Previous
success remains byte-identical; cleanup cannot mask the original failure.

Behavior: Selected context attempt cannot run successfully → launch/failure is
observed → return a retained failure instead of losing it through `set -e` or
an exit trap. Unknown runtime is recorded when no version can be obtained.

Sizing: approximately five minutes, medium confidence; use leaf 2's finalizer.

### 6. Reject an incomplete native stream despite a successful process exit
Type: Behavior
Status: planned
Proof: Per-host recorded complete, truncated, and missing-terminal streams drive
the same completion checks. Incomplete evidence with exit 0 remains nonpassing;
raw evidence survives. No semantic expected-answer changes enter the assertions.

Behavior: Native command exits → inspect required stream completion → classify
an incomplete attempt as nonpassing, separate from its later behavioral verdict.

Sizing: approximately five minutes, medium confidence; use the existing context
event formats. Unknown event shapes stay inconclusive for later native review.

### 7. Run just Codex delivery/legacy-refusal
Type: Behavior
Status: planned
Proof: Through the Codex wrapper, a substitute runs only `delivery/legacy-refusal`.
The call log omits update and use. The attempt is retained. Default
deterministic and full `--native` (no `--case`) journeys keep their behavior.
The shared setup trap does not delete the retained refusal.

Behavior: Selected Codex `delivery/legacy-refusal` → set up only that
prerequisite → run through existing isolation → retain that case.

Sizing: approximately five–ten minutes, medium confidence; first delivery
integration unwinds the shared trap. Use existing transition helpers; do not
generalize to unrelated harnesses.

### 8. Run just Codex delivery/ordinary-update
Type: Behavior
Status: planned
Proof: Selected ordinary-update runs inspected bootstrap plus a real fixture
update, not a native legacy-refusal session. Call log omits refusal and use.
Retained artifacts include the genuine update provenance.

Behavior: Selected Codex `delivery/ordinary-update` → set up only its
prerequisites → retain the update attempt.

Sizing: approximately five minutes, medium confidence; reuses leaf 7's selected
delivery path.

### 9. Run just Codex delivery/updated-use
Type: Behavior
Status: planned
Proof: Updated use consumes the verified update's target and records that
attempt ID. Failed update launches no use and leaves use pending. Call log
omits refusal.

Behavior: Selected Codex `delivery/updated-use` → run the required update then
fresh use on that same installation, or retain the failed update and skip use.

Sizing: approximately five minutes, medium confidence; reuses leaves 7–8.

### 10. Run just Cursor delivery/legacy-refusal
Type: Behavior
Status: planned
Proof: Repeat leaf 7's selected-refusal contract through the Cursor wrapper;
retain stream JSON plus derived response; record `cursor agent --version`.
Other tool roots stay unchanged. Existing prose assertions keep their meaning.

Behavior: Selected Cursor `delivery/legacy-refusal` → shared journey plus
Cursor adapter → retain that attempt.

Sizing: approximately five minutes, medium confidence; reuse context Cursor
stream capture.

### 11. Run just Cursor delivery/ordinary-update
Type: Behavior
Status: planned
Proof: Repeat leaf 8's update-only contract through the Cursor wrapper, with
Cursor Agent runtime identity and retained stream JSON.

Behavior: Selected Cursor `delivery/ordinary-update` → retain the genuine
update without a native refusal session.

Sizing: approximately five minutes, medium confidence; reuses leaves 8 and 10.

### 12. Run just Cursor delivery/updated-use
Type: Behavior
Status: planned
Proof: Repeat leaf 9's update-to-use and failed-update-pending contract through
Cursor. Incomplete output still uses leaf 6's gate.

Behavior: Selected Cursor `delivery/updated-use` → verified update then fresh
use on that target, or pending use after failed update.

Sizing: approximately five minutes, medium confidence; reuses leaves 9 and 10.

### 13. Run just Claude Code delivery/legacy-refusal
Type: Behavior
Status: planned
Proof: Repeat leaf 7's selected-refusal contract through the Claude wrapper;
retain stream JSON plus response on failure as well as success, replacing
failure-only scratch preservation. Preserve existing refusal assertions.

Behavior: Selected Claude Code `delivery/legacy-refusal` → shared journey plus
Claude adapter → retain the attempt on either outcome.

Sizing: approximately five minutes, medium confidence; reuse context structured
capture.

### 14. Run just Claude Code delivery/ordinary-update
Type: Behavior
Status: planned
Proof: Repeat leaf 8's update-only contract through Claude, retaining stream
JSON on success and failure.

Behavior: Selected Claude Code `delivery/ordinary-update` → retain the genuine
update without a native refusal session.

Sizing: approximately five minutes, medium confidence; reuses leaves 8 and 13.

### 15. Run just Claude Code delivery/updated-use
Type: Behavior
Status: planned
Proof: Repeat leaf 9's update-to-use and failed-update-pending contract through
Claude. Other tool roots and companion integration stay unchanged.

Behavior: Selected Claude Code `delivery/updated-use` → verified update then
fresh use on that target, or pending use after failed update.

Sizing: approximately five minutes, medium confidence; reuses leaves 9 and 13.

### 16. Reassess a saved attempt without another native session
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

Slice 1: listing and invalid selection are shared in `tests/support/native-cases.sh`
plus `tests/support/native-case-inventory.sh`. Exact flags are in `tests/README.md`
(`--list`, `--results-dir DIR`, `--case CASE`). Listing is read-only, prints
unreviewed prior-evidence under `DIR/<host>/<case>/<attempt-id>/` when present,
and never certifies reuse. Focused proof: `bash tests/native-case-selection.sh`.
Selected delivery `--case` is recognized and rejected before setup so it cannot
fall through to the full `--native` journey; leaves 7–15 replace that interim.
Open Dough has no Donut execute-plan CI mailbox; this execution does not promise
CI observation.

Slice 2: selected context `--native HOST SCENARIO --results-dir DIR` retains
`DIR/<host>/<case>/<attempt-id>/` (record, events, response, observations) and
prints `result-path:` after deleting scratch. Unwritable DIR fails before
launch. Cursor runtime is `cursor agent --version`. Cheap substitutes use
`tests/support/native-agent-recorded.sh`. `native-codex.sh` isolates only when
`codex` is a symlink (real native); non-symlink substitutes skip `sandbox-exec`
so Ubuntu CI can run selected context. Focused proof:
`bash tests/native-result-retention.sh`. `--native` without `--results-dir`
still uses disposable scratch. Failures still lose scratch evidence (leaf 5).

Slice 3: selected context `--native` accepts `--deadline SECONDS` (>= 1, default
3600) and `--grace SECONDS` (>= 0, default 15). Invalid values fail before
setup. Process-group ownership lives in `tests/support/native-run-supervise.sh`
(`setsid` when present, otherwise `perl setpgrp`). Codex still isolates only
when `codex` is a symlink. Delivery wrappers parse the flags but do not
supervise yet. `tests/support/native-cases.sh` is at the 250-line limit; do not
grow it. Focused proof: `bash tests/native-case-selection.sh` and
`bash tests/native-result-retention.sh`. Hung-attempt kill remains leaf 4.

Remaining-leaf refinement (after slices 1–2): old leaf 3 split into Structure
(deadline/grace ownership, defaults leave success unchanged) plus Behavior
(hang, kill owned tree, retain partial evidence). Old delivery leaves 6–8 split
into one case per host (Codex 7–9, Cursor 10–12, Claude 13–15) so each leaf has
one proof loop. Reassessment is leaf 16. Leaf sizing remains a hypothesis.
