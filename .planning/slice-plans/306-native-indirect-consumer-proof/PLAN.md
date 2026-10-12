# Accept indirect consumer discovery and proof judgment natively

**Identity:** SEED-132#accept-indirect-consumer-proof-natively
**Source:** [selected story](../../seeds/SEED-132-acceptance-follows-reachable-behavior.md#accept-indirect-consumer-proof-natively)

## Goal and scope

Give the releasing developer observed native evidence that implementation finds
indirect consumers from changed effects and acceptance obtains sufficient proof
or leaves dependent delivery unaccepted. Preserve sufficient unrelated evidence.
The seed's five examples and constraints apply in full.

Include isolated representative projects, candidate installation, bounded fresh
sessions, necessary fixture/observation work and immediate assessment. Exclude
historical application repairs, automatic consumer graphs, universal full suites,
a new acceptance schema, release/tagging and ODF-150 watch restart. Changes to the
underlying guidance beyond the covered implemented behavior need separate scope
judgment; a failed acceptance run does not authorize that expansion.

## Existing solutions and decisions

PFE selects the existing `tests/git-publication-native.sh` entry and
`tests/support/delivery-evidence-native-run.sh` journey for fixture installation,
shared supervision, host commands, stream decoding and temporary retention.
Its consumer scenario/observer/assessor files already own factory-contract,
stale-exclusion and unchanged-badge cases. Extend this family only as needed for
the new shapes and implementation entry; do not create a second native runner.
The current prompt starts at an implementation return, so it cannot by itself
prove discovery during implementation. Add an ordinary implementation request
alongside acceptance, without supplying missing consumer identities.

The existing consumers observer searches response/transcript text for test names
and acceptance words. That is a useful diagnostic summary, not sufficient proof
that an assertion ran. Reuse stream command/result observations and the selection
case's proof-logger concept for actual selected/executed results where suitable;
review ambiguous prose against the explicit expectations below. Keep observation
and judgment separate. Do not grow a generic prose classifier or certify a run
from generated summary fields alone.

Recover plan 304 and its PROOF.md at
`cfdca05274dc9845b7f9666e35a0ad68ce6ec73b` for historical setup, assertion purpose
and failure observations. [ODF-150](../../../docs/maintainer/findings/ODF-150.md)
retains the verified Claude Code aggregate-text and no-store recurrences. That
walkthrough and the factory fixture supply provenance and preservation evidence;
neither supplies fresh native proof of these examples.

The ADR index and in-file statuses agree: 0000–0006 are Accepted; 0007–0009
remain Proposed. Follow [ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md):
evidence or justified reuse per affected requirement on Codex, Cursor and Claude
Code, selected by unresolved risk; separate shared integration from behavior.
[ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
keeps candidate acceptance separate from release. [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
and [AGENTS.md](../../../AGENTS.md) preserve shared source ownership and runtime
audience if an in-scope guidance correction is later authorized. Do not edit
installed managed copies. The existing [North Star](../../NORTH-STAR.md) adds no
consumer-acceptance direction; no new architecture topic or exception is needed.

## Preparation observations and remaining probes

Observed on 2026-10-12 in
`/Users/terryyin/git/open-dough/.worktrees/accept-indirect-consumer-discovery-and-proof-jud`
at base `1a2508307d7f87befed3e03fd1698453f8b9709c`, Node `v24.21.0`.
All scratch directories were removed before record writes.

1. **Existing proof discriminates its narrower boundary.** Source
   `tests/support/delivery-evidence-consumers-native-scenario-content.sh` in Bash.
   For each of `changed-contract`, `corrected-consumer`, `unchanged-boundary`,
   create a scratch directory under this checkout and call
   `delivery_evidence_consumers_write_baseline_revision "$fixture"` and
   `delivery_evidence_consumers_write_promises_and_return "$fixture" "$scenario"`.
   In it run `node --test --test-reporter=tap tests/producer.test.mjs
   e2e/stand-in-compat.test.mjs tests/status-badge.test.mjs`.
   Changed: exit 1, two pass/one fail, `releaseTag is required` at the stand-in;
   corrected and unchanged: exit 0, three pass each. This observes the actual
   consumer result, not native discovery or either new fixture shape.
2. **Installation prefix reaches candidate bytes on each host layout.** Source
   `tests/support/delivery-evidence-native-run.sh`; for `codex`, `cursor`, `claude`,
   run `delivery_evidence_create_fixture consumers "$PWD" "$host"
   changed-contract "$scratch"`, where scratch is under this checkout. `cmp`
   of `src/skills/dough-story-refinement/references/executable-proof.md` against
   each installed copy passed: `.agents/skills/` for Codex/Cursor and
   `.claude/skills/` for Claude. This settles local fixture installation only,
   not host loading, credentials or useful skill behavior.
3. **Available entry and unpaid runtime prefix.**
   `bash tests/git-publication-native.sh --help` exited 0 and exposes selected
   `--native HOST --case delivery-evidence/consumers --results-dir DIR`.
   `codex --version` returned `codex-cli 0.162.1`; `cursor agent --version`
   returned `2026.10.01-e373342`; `claude --version` returned `2.1.296`.
   No native task was launched. Version output does not prove authentication,
   installed skill loading or usable streams. Those credentialed operations
   are the early probe in slice 1 and each newly selected host in slice 3.
4. **New cases remain new work.** Current case profile contains only the three
   factory/control scenarios. Aggregate-text and no-store fixtures and their
   observation discrimination must be built and exercised in their owning slices.
   No current command is claimed to execute nonexistent cases. Record their
   exact selected command before each native launch.

## Run authority and bounded selection

Preparation grants no Take, implementation, native invocation or release. Before
execution starts, the developer's execution instruction must explicitly authorize
the selected paid native runs, their hosts and bounded attempts; otherwise retain
this plan and stop that execution path. This is a future execution requirement,
not an unanswered goal or scope question in this preparation.

Start with one Claude Code aggregate run (slice 1), then one Claude Code no-store
run (slice 2), because both verified recurrences occurred there. For slice 3,
first assess available historical evidence against the exact candidate, adapters,
helpers, fixtures and runtime. Select fresh Codex and Cursor journeys for every
still-unproved requirement; combine related observations in a journey where that
preserves an unhinted discovery. Include incomplete-return and unchanged-control
observations on each host unless directly applicable behavior evidence supports
reuse. The minimum is evidence per requirement and tool, not every fixture on
every tool; do not infer another host's pass or another shape's purpose from one.

Use fresh sessions and isolated repositories, pin the candidate and installed
content hashes, and record runtime, prompt, input and observation identities.
Use existing supervisor bounds (3600-second deadline and 15-second grace unless
a smaller supported bound is chosen), one initial attempt per selected journey,
and no automatic retries. Diagnose a failure or timeout before any authorized
retry; name the changed premise and remaining bound. If native execution cannot
load the guidance or expose command/results, stop dependent runs and revise the
route; a substitute or self-report does not settle that probe. Keep paid runs
outside default tests and CI. Ordinary deterministic support checks remain free.

## Ordered slices

### 1. Discover the aggregate assertion in fresh native implementation
Type: Behavior
Status: planned
Proof: One Claude Code implementation-to-acceptance journey starting from a
heading reorder, with actual aggregate assertion results and a reviewed verdict.

Behavior: A session receives only the requested reorder and repository surface
→ traces the rendered effect to its enclosing text assertion → inspects its
membership purpose, obtains discriminating proof and accepts only aligned work
or leaves dependent delivery incomplete.

Reconstruct a small faithful historical shape: a surrounding membership claim
assertion reaches text from a session section, including the heading boundary
introduced by reordering. The focused change tests can pass while the aggregate
assertion fails. Preserve the legitimate membership promise; deleting it or merely
weakening its assertion is not success. Demonstrate baseline pass, changed failure,
and purpose-preserving correction pass with the real fixture suite before paying
for the run. Mark reconstruction as such; it is not a historical application rerun.

Extend the existing family with an implementation entry and reliable observation,
keeping the missing consumer name out of the prompt and out of any authored plan
handed to the native agent. Assess command results, inspected setup, final diff
and installed skill use. As the first paid probe, stop dependent slices if native
loading, observation or this behavior is unavailable. A discovered failure left
unaccepted can satisfy safe acceptance; a session that never discovers it cannot.
Record the exact missing promise rather than hiding it behind a successful process.

Safe stop: a judged aggregate result, reusable support and diagnosed gaps; no claim
that conditional I/O or other hosts pass. One shape and one native proof loop.

### 2. Discover no-store callers after an I/O precondition changes
Type: Behavior
Status: planned
Proof: One fresh Claude Code journey observes both entry-point purposes without
creating the resource whose absence exposes the changed precondition.

Behavior: A read becomes unconditional → implementation follows the endpoint and
scenario setup beyond the named focused files → discovers the missing/blank preset
and named-genome holding consumers, observes their results and accepts preserved
behavior with sufficient proof or returns dependent work incomplete.

Reuse slice 1's runner and observation. Build a bounded representative endpoint
fixture retaining the two distinct no-store purposes from the historical evidence.
Demonstrate baseline pass, unconditional-read failure and a purpose-preserving
correction pass; keep the missing-store setup intact. Expose enough repository
surface for effect-based discovery without naming missing consumers in the task.
An unrelated status formatter with valid prior proof remains a control. Inspect
why each setup exists: equivalent purposes may share evidence, but neither error
result may disappear. Native assessment must observe discovery and sufficient
proof or refusal, not merely an added store or a list of possible callers.

Safe stop: a judged I/O result without an all-host claim. If recurrence is observed,
record the current gap and stop dependent acceptance; investigate before retrying.
One changed precondition and its two meaningful consuming purposes share this loop.

### 3. Complete native acceptance decisions across affected tools
Type: Behavior
Status: planned
Proof: A per-requirement evidence account for Codex, Cursor and Claude Code joins
fresh command/results and installed skill use to accepted or incomplete promises,
including the green-return/unrun-caller case and sufficient unchanged proof.

Behavior: The maintainer assesses risk-selected native journeys or justified reuse
→ each affected requirement has sufficient evidence on each tool → acceptance is
complete only when every requirement passes; missing or contradictory proof stays
pending and prevents affected release.

Use the bounded selection above. Each previously unobserved host begins with a
native loading/command-result probe; failure stops its dependent runs. Include a
return with green named proof and a discovered caller deferred to CI. Observe the
native acceptance operation obtaining proof or marking the dependent promise
incomplete before delivery; retain independent valid evidence. Show unchanged
status proof accepted without a demand for an unrelated rerun. Preserve the
changed-surface-suite rule and project failure policy in every verdict.

Record evidence or justified reuse by requirement/host, with candidate, runtime,
inputs, decisive observations, result and judgment. An unproved requirement leaves
this slice planned and this acceptance story incomplete. Update the active source
with the remaining gap; do not complete acceptance merely because the harness
ships. Do not restart ODF-150's watch. At acceptance, remove spent passing/diagnosed
artifacts under ADR 0005, retaining only current execution needs until wrap-up.

Safe stop: a truthful partial account remains useful; all-host completion needs
all affected requirements settled. This is one cross-tool acceptance decision,
not a new runner per host or a blanket integration recheck.

## Outside-in proof ownership

| Source promise | Owner and decisive observation |
| --- | --- |
| Unhinted implementation discovery of aggregate text (example 1) | Slice 1; changed effect, inspected enclosing assertion, executed result and acceptance decision. Slice 3 settles remaining host evidence. |
| No-store caller discovery and distinct error purposes (example 2) | Slice 2; both real setups/results, absent resource preserved, native discovery and verdict. Slice 3 settles remaining hosts. |
| Green proof does not excuse a caller left to CI (example 3) | Slice 3; actual acceptance operation obtains missing proof or leaves dependent delivery incomplete. No publication on missing affected proof. |
| Proportional selection and valid reuse (example 4) | Slices 2–3; unrelated formatter unchanged, sufficient prior proof retained; stale reached-boundary exclusion cannot excuse missing proof. |
| Honest native evidence and all-tool completion (example 5) | Slices 1–3; candidate-installed guidance use, complete attributed command/results and inspected final state. Slice 3 owns the complete per-tool account and pending/release boundary. |

## Verification, sizing and current decisions

For changed support run its focused fixture discrimination and assessor
counterexamples, including claimed-but-unexecuted commands, fabricated green
returns, removed assertions, supplied missing resources, incomplete streams and
harness-contaminated answers. Include equivalent valid wording. Test shared
assessment once and changed adapter differences per affected tool. Extend the
existing credential-free publication-native test only as needed; its baseline
command is `bash scripts/test.sh tests/git-publication-native.sh`. Do not claim
that deterministic pass proves native behavior. Each new route must first prove
its selected fixture and observation before the corresponding paid attempt.

AGENTS.md requires representative useful-behavior review for guidance changes;
`.githooks/pre-commit` requires staged lint and dashboard typecheck for staged
script files. Apply ordinary execution's independent post-change refactor and
delivery gates. Broaden local checks only for changed consumers; hosted CI alone
does not impose an unrelated local all-suite gate. No numeric slice time limit
was supplied; boundedness includes fixture work, focused checks, review and one
native loop per selected journey. Unexpected harness redesign or repeated failed
probes requires reassessment before widening this plan.

No slice-plan refinement was needed: distinct observations share one runner and
map every final promise. No remaining design or proof-ownership concern was found.
Permitted credentialed probes stop dependent work on failure. Readiness judges
the plan, not native success or execution authority.

## Learnings

No native behavior is proved during preparation; the observed limits above govern
execution and evidence reuse.
