# Repeat native guidance checks using focused examples

**Identity:** SEED-393#repeat-native-guidance-checks-on-real-story-examples
**Source:** [Repeat native guidance checks using focused examples](../../seeds/SEED-393-test-quality-learning-from-effort-replays.md#repeat-native-guidance-checks-on-real-story-examples)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Maintainers select and repeat a real-work guidance check without rebuilding its
experiment, judging actual code and decisive proof. Deliver a focused effort-
replay refactoring case, coherent Native guidance checks naming, and the same
short procedure demonstrated with `unblocked-supplier`.

Keep candidate acceptance distinct from comparison with a stated baseline.
Extracted tasks have their own basis and baseline; historical effort A and both
Bs stay frozen provenance. No runtime-guidance improvement/adoption, release,
new host, automatic paid suite, generic scoring system or new experiment engine.
Stories 1, 2 and 4 retain their outcomes. There is no blocking dependency.

This is preparation only. A later instruction to execute this whole plan covers
the two specifically selected native journeys in slices 3 and 4; this session
launches neither. A stopped or failed native observation is evidence, never a
reason to repeat until green. Diagnose its cause and change the basis or plan
before any newly authorized observation; retain the original result.

## Existing solutions and architecture

PFE: `Distribution/evaluation/README.md`, `comparison.md`, `baselines.md`,
`src/native-comparison-{run,preflight,catalog,retain}.sh` and existing cases own
selection, isolation, neutral tasks, observation, assessment and immutable
baseline reuse. Publication and delivery-evidence checks also demonstrate
ordinary inspection of semantic judgments alongside executable observations.
Reuse these owners; add one case-specific fixture/observer/assessor, not a
second runner, parser, report schema or setup platform.

Use a brief case basis like assay calibration: an irrelevant perturbation must
not trigger an incidental test; a defect in its promise must trigger it. This
is a candidate assessment mechanism, not evidence of native success. Its limit
is semantic judgment: a passing mutation exercise cannot certify every mixed
case, branch, reader guarantee or clean claim. Inspect actual final code and
executed proof, and name relevant residue in an ordinary brief return.

Applicable Accepted decisions, with agreeing index/in-file statuses:

- [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md): consistent domain names; maintainer tooling stays maintenance material.
- [ADR 0005 — Native validation and A/B testing](../../../docs/adrs/0005-cross-tool-validation-accepted.md): real native sessions establish host behavior; deterministic controls establish tooling; preserve acceptance/comparison and historical evidence.
- [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md): one authoritative procedure and direct, concise instructions.
- [ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md): establish criteria and baseline first; inspect quality before effort; qualify conclusions.

No conflict, exception or new consequential architecture choice. The existing
North Star has dashboard topics only; this follows the established evaluation
boundaries and needs no new topic. Internal skill edits, if needed by caller
reconciliation, follow [authoring guidance](../../../.agents/skills/author-open-dough-skills/SKILL.md).

## Current decisions

- Use Native guidance checks for the umbrella, with `native-guidance-check.sh`
  as its entry and `cases/guidance-checks/` as the collection. Reconcile generic
  journey/catalog names and active callers; keep comparison-specific names for
  actual pair, baseline and comparison operations. Preserve identities and kept
  observations byte for byte, including recorded old paths and hashes. Use Git
  recovery instead of rewriting history or adding a second behavioral entry.
- Put the short select/basis/run/review procedure in `guidance-checks.md`.
  Keep `comparison.md` for actual pair/record/recovery detail and `baselines.md`
  for capture/reuse/reassessment; link those owners. The current comparison
  guide is exactly 250 lines: moving catalog/single-journey guidance to the
  umbrella guide is its cohesive reorganization, owned by slice 1. Existing
  expected runtime/test modules are below 250 lines (largest check 238); check
  proposed files again during execution and retain cohesive responsibilities.
- Extract the new case from frozen Codex B product/test `8b9005acc`, with
  `fbfaa116b961a445cc606fd05363bf75f6ecad5f`'s corrected assessment as
  assessor-only provenance. Use the actual launch behavior and meaningful test
  consumers. Start with a bounded refactoring request, not another whole-story
  default implementation. The original real code/context may remain where its
  removal would weaken the judgment. Retain the extraction and its differences
  explicitly; this is not a comparison against original A.
- Materialize reusable case inputs from tracked files or pinned recoverable
  Git sources, not the developer's absolute scratch paths. Existing local B
  inputs are owned by this story until extraction/disposition. Neither prompts
  nor setup expose prior outcomes, assessor answers or repaired final code to
  the participant. Setup may supply prerequisites, not the behavior assessed.
- The first native observation is a frozen baseline for the extracted case,
  using the committed case/candidate guidance and explicit Codex settings.
  Qualification means the case's journey and assessment were actually reached;
  an honestly observed candidate failure is useful and remains a failure.
  A native launch without assessable final code/proof does not fulfill the
  story's demonstration. Retain an incomplete result and stop dependent claims.

## Outside-in proof and premise observations

All observations below are 2026-11-17 in this preparation workspace at
`5525f9f04455c484f15dd20039adc4f503489c10`. Fetched `bd2e79cd9` changes
neither evaluation tooling nor this seed. No scratch source edit was retained.

| Promise / consuming operation | Observed form and result; remaining work |
| --- | --- |
| Maintainer selects an existing case | `PATH=/opt/homebrew/bin:$PATH Distribution/evaluation/src/native-comparison.sh --list --where workflow='ordinary execution'` returned `unblocked-supplier` with its traits, exit 0. `--help` printed the journey, capture, pair and recovery forms (usage exit 2). Slice 1 rechecks through renamed entry. |
| Native route reaches its unpaid boundary | Bash 5.3.20 and Node 24.21.0 match requirements; Git/jq/Codex are on PATH. `PATH=/opt/homebrew/bin:$PATH bash -c 'source Distribution/evaluation/src/native-comparison-retain.sh; source Distribution/evaluation/src/native-comparison-preflight.sh; native_comparison_preflight codex unblocked-supplier "$PWD" "$PWD"'` passed; `codex login status` reported logged in using ChatGPT. The first ad hoc source call omitted `retain.sh` and refused before work; the complete call above settled that omission. No native launch or fixture qualification is inferred. |
| A saved native baseline is consumed by today's assessor | `PATH=/opt/homebrew/bin:$PATH Distribution/evaluation/src/native-comparison.sh --assess-baseline Distribution/evaluation/cases/comparison/unblocked-supplier/comparisons/20261114T162130-7b8c-baseline.json` exited 0 with `status: pass`: preserved partial work, one integration/filing, independent and executed proof. Source integrity `f9e4123df34433aedf76e74c5a5b0fb7a284d0db95d9435415ae8ed38069b8ad`. Slice 1 repeats after relocation; slice 5 obtains the fresh selected journey, not a claim that reassessment is a fresh run. |
| Old names/hashes can recover original evidence | `PATH=/opt/homebrew/bin:$PATH Distribution/evaluation/src/native-comparison.sh --recover Distribution/evaluation/cases/comparison/paused-supplier/comparisons/20261114T102744-1921.txt` exited 0: 49 inputs byte-identical at `764c4e0fe0ce9f478750323de6a9f30c76a7e61a`, historical directory `Distribution/tests/native-comparison/paused-supplier`, record unchanged. Slice 1 must preserve this result after renaming; recovery is not rematerialization or a paid rerun. |
| Effort source contains a real missed judgment | [Corrected comparison at fbfaa116](https://github.com/terryyin/open-dough/blob/fbfaa116b961a445cc606fd05363bf75f6ecad5f/.planning/slice-plans/668-redo-the-effort-story-under-the-test-focus-guidance/claude-comparison.md) records the unchanged Codex E2E diagnostic: argv length expected 3, actual 5 including medium, exit 1. Direct `git show 8b9005acc:dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts` and `.../agent-launch-ad-hoc-boundary.spec.ts` show real reader-based observations and retained mixed cases. This proves the source judgment, not a not-yet-built extraction. Slices 2 and 3 prove its new fixture and assessment. |
| Retained source is recoverable | `git bundle verify /Users/terryyin/open-dough-scratch/seed-391/retained/replays.bundle` passed against required ancestor `4b75c28885e49ace352561cad01907926e066fdd`; heads are Codex `57f805ee2` and Claude `9cd8ee5f2`. Its README names the unchanged A and recovery/disposal owner. Slice 2 retains the portable necessary inputs (as a tracked overlay; Codex B is not on origin) before scratch disposal at wrap-up. |
| New fixture preserves the decision; Codex produces assessable evidence | These are new capability/qualification outcomes, not observed facts. Slices 2–3 establish fixture discrimination locally before any paid launch. Slice 4 is the early paid probe of the new native case; failure or missing evidence stops its dependent qualification/comparison claims and changes the remaining plan. Slice 5 qualifies only its selected existing case/profile. Model/host conditions are recorded at launch; stale setup or authentication is rechecked there. |

## Ordered slices

Each slice targets 15 active minutes, excluding commands through the slice
clock. Keep proof and cleanup with the outcome. No speculative Structure slice.

### 1. Select and recover cases through Native guidance checks
Type: Behavior
Status: done

Behavior: given the existing collection and kept observations, a maintainer
selects a case through the consistently named entry/guidance and can recover
the same historical evidence. Reconcile the entry, generic internals, case
root, help/catalog descriptions, active docs, check discovery, fixtures/imports
and formatting exclusions together. Actual comparison operations keep their
domain names. Carry the procedure and guide reorganization described above.

Proof: existing catalog, case, pair, incomplete, refresh/recovery and baseline
controlled checks run through the renamed entry; default invocation starts no
native host. Repeat the saved-baseline assessment and historical recovery from
the premise table. Compare immutable record/archive bytes before and after;
inspect old-name matches so active callers and historical strings are treated
according to their purpose. Trace callers beyond direct imports, including
test wrappers, shared-inputs and CI discovery. Preserve old qualifications as
dated evidence; do not claim that new hashes imply a fresh native run.

Accepted 2026-11-17: entry `src/native-guidance-check.sh` with its catalog,
preflight, options, run, turn and retain modules; collection
`cases/guidance-checks/` (shared fixture `supplier-fixture.sh`); tests in
`tests/native-guidance-checks/`; procedure and catalog in `guidance-checks.md`.
Pair, baseline, basis, verdict, archive and recovery keep comparison names, as
do record identities (`case: native-comparison/<case>`) and historical path
matchers in `native-comparison-basis.sh`, which recovery needs. All 8 kept
records are byte-identical; `--assess-baseline` passed (source integrity
`f9e4123d…`) and `--recover` reached 49 byte-identical inputs at `764c4e0f`.
`npm run test:evaluation` and `npm run lint` passed (load 23–75; 180 s
deadline timeouts in standalone reruns reproduced identically at `cc72d082c`).
Learning: `--recover` prints an empty `record-history` until the move is
committed. Queued plan 621 (SEED-346) still names pre-rename paths; retrace it
when that story is next refined.

### 2. Select and observe an effort-derived refactoring task
Type: Behavior
Status: done

Behavior: given the retained real-work input, a maintainer selects the
effort-derived case from the catalog by its traits and runs its controlled
journey through the entry. The fixture materializes origin `4b75c2888` plus a
tracked overlay of Codex B's `dashboard/` and `e2e/` bytes (`git diff
4b75c2888 8b9005acc -- dashboard e2e`, 33 files) kept in the case directory,
because neither Codex B commit is on origin. The neutral task is a bounded
refactoring request over the launch-command tests
(`agent-launch-model-boundary`, `agent-launch-ad-hoc-boundary` and the
unchanged E2E consumer `e2e/launches/agent-launch-ad-hoc.spec.ts`). The
independent observer retains the final diff and the executed backend and E2E
results. Record origin, overlay provenance, extraction differences,
traits/prerequisites, measured preparation and per-run durations, and that its
own baseline comes from slice 4.

Proof: the controlled journey through `native-guidance-check.sh` with a
substitute host materializes the fixture, gives the participant only the task
and the overlaid project (no assessor answers, prior outcomes or repaired
code), and retains final code plus executed proof for an unchanged-workspace
outcome. `--list --where workflow=…` selects the case. Measure one E2E
consumer run; if it makes the controlled journey unaffordable, stop for a
scope decision with that measurement rather than dropping the consumer.

Accepted 2026-11-17: case `launch-command-tests`. The fixture copies
`overlay/` (B's whole bytes at `8b9005acc` of the 33 changed `dashboard/` and
`e2e/` paths; a single diff file exceeded the 250-line limit) over origin
`4b75c2888`, commits it, installs the payload and runs `npm ci`. The observer
keeps `case-evidence/final-turn-N.diff` against a post-setup tree (payload
install changes `.cursor/hooks.json`) and its own backend/E2E JSON reports.
Starting state: backend 28 passed; the unchanged E2E consumer fails 4 with
"Expected length: 3 / Received length: 5". Measured at load 24–31:
materialize 10 s, `npm ci` 11 s, backend 30 s, E2E 30 s; the credential-free
case test takes about 30 s. `assess.bash` is a failing placeholder owned by
slice 3. `npm run test:evaluation` passed 71/71 (load 11–83).

### 3. Reject inadequate refactoring of the effort-derived task
Type: Behavior
Status: planned

Behavior: the case's assessor applies the predeclared basis to the observer's
retained code and proof: protective refactoring passes; mechanical value
updates, weakened owning proof and unsupported clean claims fail.

Proof: the case's controlled end-to-end journey accepts a protective reference
outcome and rejects a mechanical-value-only result and weakened owning proof.
An unrelated default perturbation leaves incidental name/absence tests green;
wrong name/instruction faults fail their owning tests and a wrong default fails
its dedicated proof. Restore each fault. Observe real entry behavior, not
fabricated green receipts or output-reader unit proof alone. Inspect retained
mixed feedback/status cases, branches, meaningful positive witnesses and any
reader guarantees against actual final code. A false clean claim fails review;
an honest residue statement does not waive an unmet promised criterion. Keep
semantic review ordinary and separate from automatic necessary checks.

If extraction loses a necessary consumer or proof, restore enough original
context within this slice; do not simplify the task into a synthetic surrogate
and reuse A. If meaningful discrimination cannot be retained at bounded cost,
stop that path for a scope decision with the failed extraction evidence.

### 4. Qualify the focused case with one frozen native observation
Type: Behavior
Status: planned

Behavior: after names, fixture and controls are committed, explicitly select
one frozen Codex capture of the effort-derived case using the existing
`--native codex --case <case> --baseline <committed-payload> --save-baseline
<new-file>` operation. Pin `--model gpt-6.1-sol --effort xhigh` and the case/
harness revision. This is the early native probe; no baseline from original A.

Proof: review final code, recorded execution-owned and independent proof and
assessment against slice 3's criteria. Record pass/fail/incomplete accurately,
requested/applied conditions, blind-context limits, load, duration and unknown
measurements. Export sufficient portable evidence, reassess after raw cleanup
in an isolated copy, preserving the original archive. If semantic inspection
needs code/proof the compact archive cannot reconstruct, keep that reusable
case-specific evidence through existing retention; never claim archive-only
reassessment proves the missing semantic judgment. A completed failing
candidate can qualify the check if its evidence explains the actual failure;
no guidance-improvement claim follows from one observation.

### 5. Repeat the procedure with the available-supplier case
Type: Behavior
Status: planned

Behavior: select `unblocked-supplier` through the same procedure and perform
one explicitly selected frozen Codex journey with the same model/effort and a
new archive filename. Use its own preserved-work, exactly-once and executed-
proof criteria; do not impose the refactoring case's controls on this task.

Proof: existing controls reject claim-only completion, lost work, missing proof
and duplicate filing. Inspect the fresh native journey and retain its actual
verdict and limits. Demonstrate a separate derived reassessment without
rewriting the existing `20261114T162130-7b8c-baseline.json`. Comparison examples
use matched task/basis or explicitly fresh evidence; deterministic pair checks
cover that route without adding a mandatory paid pair. Reconcile the short
guide with both actual demonstrations and disclose unverified scope/residue.

## Verification and delivery

Apply the shared [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written to failures encountered in execution/delivery. Negative fixture
controls and frozen historical failures remain evidence of the case's judgment;
they do not waive a failing delivery check.

Local gate: named changed-case checks plus the evaluation family through the
shared runner (`npm run test:evaluation`), because renamed shared inputs and
entry/case paths reach all families. Use focused `npm test -- <named-paths>`
during a slice; run applicable lint/link checks on affected maintained files.
Trace every changed contract/path to callers and preserve consumer proof under
[own executable proof](../../../.agents/skills/dough-story-refinement/references/executable-proof.md).
Prepare the pinned toolchain via `scripts/setup-native.mjs` per the evaluation
setup guide. The preparation checkout currently has no own `node_modules`;
none of the read-only premise commands needed it. Browser-based case proof
requires fresh checkout-bound setup; do not borrow a parent checkout's modules.

For long local checks/native observations use the maintained
[macOS sleep guard and power condition](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake on AC under `caffeinate -s -i`; on battery plug in or follow
the documented lid-open `caffeinate -i` alternative and inspect the sleep log.
Inspect this machine's load, memory and competing work before the two native
launches; sequence them, retain their individual deadlines/results and stop on
missing prerequisites. Existing supplier evidence measured about 15 minutes for
one turn; the new extraction has no measured duration yet. No timing gain is
promised. Check native input identity again after any hash-bound change.

Use the execution workflow's independent post-change refactoring, agent commits
and delivery/CI ownership. Before changing tests apply installed MakeMe and,
for browser tests, page-object selection. Keep default timeouts and never use
`test.slow()`. Before readiness/commit review, check affected file sizes and
cohesion, not just changed lines. At wrap-up retain portable case inputs,
qualifications and useful findings; dispose of spent raw runs and the owned
scratch replay inputs only after their still-needed evidence is recoverable.

## Plan review

Slice-plan refinement was not needed: the four Behavior slices each own one
observable outcome and proof loop. Naming precedes frozen captures; controlled
case proof precedes its paid probe; the second case exercises the common
procedure with separate domain criteria. Cumulatively this remains one case/
runner/retention model, not case-specific runner branches. Four slices are
within the eight-slice limit. No remaining slice-specific concern was found;
the unobserved native behavior is bounded by the paid probe and explicit stop
above.
Refined in execution, 2026-11-17: original slice 2 stopped at 2.5 active
minutes with no changes. False premise: Codex B `8b9005acc`/`57f805ee2` are
not on origin (`git merge-base --is-ancestor` fails; no remote branch
contains them); `fbfaa116` and `4b75c2888` are. Decision: a tracked overlay on
origin `4b75c2888`, which keeps scratch paths out and publishes no experiment
branch. Fixture/observer and controlled discrimination are independent
outcomes and proof loops, so slice 2 split into slices 2 and 3; later slices
renumbered to 4 and 5 (five of eight). Evidence: B's two backend launch specs
ran 28 passed in 14.8 s at load 24–31 in a worktree at `8b9005acc`
(`s2-src-backend.log`); the E2E consumer is untimed.
Readiness is recorded by the preparation recorder, not this prose.
