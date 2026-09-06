# Install the latest released Open Dough guidance safely

**Status: EXECUTING.** Refined 2026-09-06; slice 1 completed 2026-09-06.
Branch: `codex/safe-install`; source baseline: `92f30c5`.

Source: [SEED-001, Story 5a](../../seeds/SEED-001-install-and-update-open-dough.md#install-latest-release).
Contract: [Accepted ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md).
Borrowed Donut's `.agents/skills/slice-planning/SKILL.md` and then the full
`.agents/skills/slice-plan-refinement/SKILL.md`, with its planning and
problem-decomposition rules, from checkout
`43f0dbe0d47840e31f4773723cfed2d663e56bc8`.

## Goal and scope

An adopter installs the supplied URL's highest numeric release into the running
tool's project-local skill root, using only inspected pinned repository code.
The payload is the existing `dough-update/SKILL.md`,
`dough-adr-awareness/SKILL.md`, and `dough-adr-awareness/RECOGNITION.md`, plus the
selected updater's `VERSION` record. Preserve existing guidance, repeat/force
policy, truthful failures, and use in Codex, Cursor, and Claude Code.

This enables backlog item four's first Donut adoption and redundant ADR skill
removal. That item owns equivalence assessment, deletion, and caller repair.
Publication, real-project self-adoption, extraction, migration automation,
local-difference reconciliation, rollback, changelog presentation, and broader
documentation work remain outside this plan.

## Reuse decisions and evidence

The owner requested reuse of established cross-platform experience. Apply the
repository guard by reusing evidence for unchanged behavior and checking the
changed installation path. A documentation correction does not invalidate skill
discovery, invocation, ADR behavior, or updater semantics when their inputs,
paths, and source stay unchanged. There is no blanket evidence expiry date.

| Evidence | Retained conclusion | Boundary for reuse |
| --- | --- | --- |
| E1: [Quick 007](../007-generalize-project-guidance/PLAN.md), slices 7–12, 14, 16 | The three-file payload installs, updates, preserves companion/other-platform guidance, and is natively usable in each tool. | Reuse native skill discovery, application, and coexistence. Its original default-branch delivery runs do not prove the corrected initial release-install instructions. |
| E2: [completed Story 5b](../../seeds/SEED-001-install-and-update-open-dough.md#update-only-when-needed) | Each native tool demonstrated pinned, version-aware updating; equal versions cause no installer call or writes. | Reuse updater discovery/invocation and older/equal/newer behavior. No repeated no-op or update-to-use sessions for this documentation change. |
| E3: original Quick 008 leaves 1–7; `tests/install.sh`, `tests/install-latest-release.sh`, `tests/install-omits-internal.sh`; Quick 007 slice 10 and `tests/install-repeat-force-public-payload.sh` | Shared installer payload/record verification, ordinary-repeat protection, explicit force, numeric resolution, validation, and internal omissions already work. | Preserve direct `install.sh` dispatch and its options. These checks support shared behavior, not proof that native agents follow the revised instructions. |
| E4: [completed Quick 012](../012-harden-public-guidance-installation/PLAN.md); `tests/install-refuses-unsafe-topology.sh`, `tests/install-reports-real-copy-failure.sh`; `tests/update-when-needed.sh` | Containment/collision refusal and truthful copy/verification failure preserve the previous successful record. | No implementation redo or native fault matrix unless these mechanisms change. Direct-install workflow cleanup is owned by the changed guide and observed in slices 1–2. |

These are recorded earlier observations, not tests run in this planning pass.
`92f30c5` identifies the current source inspected for planning, not every earlier
native run. Keep the provenance limitations above when reporting acceptance.

### Per-platform acceptance

| Platform | Native evidence retained | New evidence still pending |
| --- | --- | --- |
| Codex | E1 slices 11–12: installed updater and fresh ADR skill use; E2: version decisions/no-op. Original updater discovery: Codex 0.153.4 session `01a07569-9c9e-7412-bcae-87049e00f575`. | Slice 4: follow the corrected public install instructions and deliver the verified payload. |
| Cursor | E1 slice 14: native updater, fresh ADR skill use, other-platform preservation; E2: version decisions/no-op. This later evidence covers stable discovery that original Quick 008 leaf 18's file read did not establish. | Slice 3: follow the corrected public install instructions and deliver the verified payload. |
| Claude Code | E1 slice 16: native updater, fresh ADR skill use, coexistence; E2: version decisions/no-op. Original updater discovery: Claude Code 2.1.263 session `e2c8f582-0545-44b3-8037-b1f1b8a397d4`. | Slice 5: follow the corrected public install instructions and deliver the verified payload. |

Reopen only evidence affected by a change to skill name/frontmatter/content,
native destination/discovery configuration, relevant tool behavior, updater
policy, installer dispatch/flags, payload, or target context. Record the specific
invalidated claim and add its focused check. A new tool version alone is a cue
to assess relevant changes, not to repeat every scenario. Missing evidence is
still pending; success in another tool never substitutes for it.

## Current decisions

- Correct `README.md` and its existing `docs/installation-and-updates.md` entry
  points in place. Use one shared agent procedure with a small platform table;
  remove all conflicting clone-then-run installation examples, including legacy
  bootstrap wording that points to the same unsafe sequence. No new migration
  behavior or documentation-size target.
- Before any fetched script executes, capture the target, list tags with Git,
  choose the highest numeric release using decimal-string comparison, use an
  annotated tag's peeled commit, fetch exactly that commit, and detach HEAD.
  Reuse the Git-first sequence already described in `src/skills/dough-update/SKILL.md`;
  do not create another installer API or a general bootstrap framework.
- Inspect that snapshot's `install.sh`, all three public sources, and the helper
  plus its three sourced dependencies under `src/install/`. After inspection,
  use its existing `resolve-url` and `validate-checkout` commands. Compare the
  returned tag/commit/version with the captured selection, HEAD, and validated
  source version; stop on mismatch or failure. Do not fetch replacement code.
- Invoke the same snapshot's `install.sh --target <captured-project> --platform
  <running-tool>`. Ordinary install must not dispatch through `apply`, which has
  different existing-installation semantics. Pass `--force` only for an already
  authorized reinstall. Keep this existing policy wording unchanged in meaning.
- Keep temporary ownership across pin, inspection, and execution. The installing
  workflow cleans its own temporary checkout on success and failure; the guide
  must not hide inspection inside a one-shot command that already executes code.
  Report the exact source/tag/commit/tool/paths and actual installer outcome;
  preserve failure status and do not promise rollback.
- Expect no changes to shipped skills or installer/helper code. Such a change
  must serve this story and triggers only its affected evidence review. Do not
  modify other projects, add a tool-version matrix, or build a new test harness.

## Outside-in proof and ownership

Acceptance combines retained E1–E4 with the new observations below. It does not
require repeating all promises in one new session.

| Promise / story example | Owning evidence | Required observation |
| --- | --- | --- |
| Supplied URL, highest numeric release, inspected pinned code, complete payload/record and accurate report | Slice 1; native slices 3–5; E3 | Guide is reachable from README; no default-branch script runs; selected commit equals inspected/executed commit; declared payload and record match. |
| Fresh native discovery, invocation, ADR behavior, same-release no-op | E1–E2, platform rows above | Retain actual native observations for unchanged skills; byte checks alone would be insufficient without that evidence. |
| Ordinary repeat stops; explicit force affects only managed files | E3; slice 1 preserves direct-installer dispatch | Existing edited installations remain protected; changed instructions never route ordinary install through `apply` or imply force. |
| Source has no usable latest release, validation fails, or selection changes after inspection | E3 for existing release failures; slice 2 for changed selection; slice 1 preserves rejection instructions | No fallback, repin, installer call, or target writes; truthful failure and cleanup. |
| Partial copy/verification failure leaves the last successful record and reports incomplete files | E4; slice 1 preserves failure propagation; slices 1–2 observe workflow cleanup | Preserve the direct installer error/record behavior and unconditional cleanup instructions; no separate native or shell fault matrix. |
| Correct project/tool, coexistence, original ADR guidance/callers, source/home preservation, no internal payload | E1, E3–E4; native slices 3–5 | Only three selected payload files and the version record change; other guidance stays intact. |
| Latest-only, no requested-version or branch fallback | E2–E3; slices 1–2 | Instructions preserve rejection before fetching/writing and never substitute a lower or unversioned source. |

## Refinement review

No execution attempt or overrun prompted this pass. Preserve the same five
outcomes, their order, and all completed E1–E4 evidence. Refinement resolves
concrete proof/setup ambiguity without another native scenario or product feature.

| Previous slice | Classification | Resolution |
| --- | --- | --- |
| 1: public installation | Refine | Bound the document edits and direct-install fixture extension. Observe the workflow's cleanup before test teardown; compare all payload bytes and arm the branch-execution marker before bootstrap. |
| 2: failure handling | Refine | Narrow the new proof to a valid newer release appearing after inspection. Existing no-tag, metadata, topology, and copy failures remain E3–E4. |
| 3: Cursor installation | Refine | Make fresh-target preparation and full transcript capture explicit; the old delivery harness installs a baseline and cannot be run unchanged. |
| 4: Codex installation | Ready | Keep one native installation; apply the now-explicit shared preparation/evidence protocol and Codex event output. |
| 5: Claude Code installation | Ready | Keep one native installation; apply the same protocol and Claude event output. |

Each Refine slice is replaced in place below. There is no story escalation,
new Structure prerequisite, or added test matrix. Promise ownership above is
unchanged except that existing refusal policies are explicitly assigned to E3.

## Ordered slices

### 1. Install the inspected release through the public entry point
Type: Behavior
Status: completed 2026-09-06
Proof: One direct-install extension in `tests/pin-and-inspect.sh`, run with
`bash tests/pin-and-inspect.sh`; check touched Markdown links and shell lint.
Keep its existing updater scenarios and assertions intact.

Behavior: No selected installation; a branch differs from its tagged release →
follow the corrected README-linked procedure → install the inspected snapshot's
complete declared payload and truthful version, then clean the owned checkout.

Bounded change:
- In `README.md` and `docs/installation-and-updates.md`, replace the three unsafe
  clone/pin examples with the existing Git-first agent procedure and minimal
  platform adaptations. Keep platform anchors and update guidance; point legacy
  reinstall to that same safe procedure. No documentation runner or new script.
- Reuse the fixture's known peeled commit, poisoned branch, and target sentinels.
  Export/arm its branch-execution marker before bootstrap starts, not after the
  opportunity for an unsafe helper call. Use a fresh target for direct install.
- Exercise the guide's exact post-inspection commands: resolve, compare captured
  tag/commit/version and HEAD, validate source metadata, then direct `install.sh`.
  Record inspection of the installer, helper/dependencies, and three sources.
  An agent's latest-tag choice is proven in slices 3–5; a fixture's hard-coded
  tag is only evidence of pin-to-execution mechanics.
- Compare all three installed files byte-for-byte with this pinned snapshot and
  check its version record. `assert_payload` currently checks only a marker in
  the updater; add a direct `cmp` here, without broadening the shared helper.
  Check untouched sentinels and zero branch execution. Retain ordinary/force
  semantics and unconditional error/cleanup instructions so E3–E4 remain valid.
- Give this workflow a child temporary checkout under the test-owned outer
  directory. Observe the child absent after the workflow returns while the outer
  directory and assertions still exist. Outer test teardown is not cleanup proof.

Stop-safe boundary: the corrected install instructions and their focused proof
are green together. Check links, shell lint, and record evidence here; no half
published workflow, unrelated test refactor, or new public executable.
Sizing: about five minutes including edits, focused checks, cleanup, and this
record; medium confidence with existing fixture setup. If composing a generic
bootstrap/parser or document runner starts taking time, drop that addition.

Execution evidence (2026-09-06): README now routes all three platform anchors
and legacy reinstall to one staged Git-first guide. The guide names all eight
inspection files, checks captured tag/peeled commit/version/HEAD and validated
metadata, then invokes direct `install.sh`; ordinary/force and failure policies
are preserved. No shipped skill, installer, helper, payload, or native path changed,
so E1–E4 remain valid within their stated boundaries.

`bash tests/pin-and-inspect.sh` passed including unchanged updater examples and
one fresh direct install: branch marker armed before Git bootstrap; eight reads
recorded; all three payload files and VERSION byte-matched the pinned snapshot;
sentinels survived; branch execution stayed zero. Workflow-owned child checkout
was absent while the test-owned parent still existed. `shellcheck`, repository
`shfmt -d -i 2 -ci -sr`, `git diff --check`, and README/guide relative link/anchor
checks passed. About five minutes active implementation/check time; no extra
framework or public executable. Native guide-following remains slices 3–5.

### 2. Refuse a newly selected release after inspection
Type: Behavior
Status: planned
Proof: One stale-selection case added to the same direct-install fixture; run
`bash tests/pin-and-inspect.sh` and applicable shell lint.

Behavior: A valid release is pinned and inspected; the source then gains a valid
higher numeric release → revalidate before direct installation → refuse without
repinning, calling an installer, writing the target, or recording success, and
clean the workflow-owned checkout.

Use the existing candidate/commit/tag helpers to add a valid newer release after
inspection. A malformed tag/metadata fixture could pass for the wrong reason.
Run slice 1's same resolve/compare/validate sequence; check nonzero result,
truthful mismatch output, no installer trace, and unchanged target. Observe the
old HEAD and files unchanged before cleanup, then the child checkout absent
before the outer fixture teardown. Adjust refusal wording only if needed.

Reuse E3 for no-tag/invalid metadata and E4 for topology and copy/verification
failures. This leaf does not implement or re-prove those error policies. If a new
caller swallows errors or adds a separate cleanup path, reopen only that affected
proof instead of calling this one mismatch example complete coverage.
Stop-safe boundary: the new refusal example and unchanged success/updater
assertions are green; no intentionally failing test is left for another slice.
Sizing: about five minutes including the fixture change, checks, cleanup, and
record; medium confidence. One new cause and one refusal observation.

### 3. Install safely from the corrected instructions in Cursor
Type: Behavior
Status: planned
Proof: One native Cursor installation using the shared protocol below; capture
`cursor agent --print --output-format stream-json` events with the existing
workspace/sandbox launch conventions and current environment permissions.

Behavior: Cursor has no selected installation → ask it to install from README
and the supplied fixture URL → it follows the corrected pin/inspect/validate
path and installs the verified payload only under `.cursor/skills/`.

This slice owns its small source/target preparation, launch, transcript review,
result checks, and cleanup. Borrow the existing launcher, not the delivery
wrapper's baseline installation or its update/ADR prompts.
Stop-safe boundary: record the observed Cursor result and decisive evidence;
other platforms can remain pending without any red product change.
Sizing: about five minutes active work including preparation and evidence;
medium confidence. Record native response waits separately. Reuse E1–E2.

### 4. Install safely from the corrected instructions in Codex
Type: Behavior
Status: planned
Proof: One native Codex installation under the same protocol, using
`codex exec --json` to retain tool events; a last-message file alone is insufficient.
Reuse the established isolated launcher within current environment permissions.

Behavior: Codex has no selected installation → ask it to install from README
and the supplied fixture URL → it follows the corrected pin/inspect/validate
path and installs the verified payload only under `.agents/skills/`.

Own only this platform's target, launch, checks, record, and cleanup. Reuse the
source preparation recipe from slice 3, rebuilding an immutable fixture if needed.
Stop-safe boundary: a recorded Codex result; no extra discovery/updater session.
Sizing: about five minutes active work including focused proof/cleanup;
medium confidence. Native response waits are a stated exception; E1–E2 stand.

### 5. Install safely from the corrected instructions in Claude Code
Type: Behavior
Status: planned
Proof: One native Claude Code installation under the same protocol, using
`claude --print --output-format stream-json --verbose` with the established
launch isolation and current environment permissions.

Behavior: Claude Code has no selected installation → ask it to install from
README and the supplied fixture URL → it follows the corrected pin/inspect/validate
path and installs the verified payload only under `.claude/skills/`.

Own only this platform's target, launch, checks, record, and cleanup. Reuse the
same source preparation recipe; keep E1–E2 rather than adding another lifecycle.
Stop-safe boundary: record the Claude Code result; full story acceptance then
combines all three new installation observations with retained evidence.
Sizing: about five minutes active work including focused proof/cleanup;
medium confidence. Native response waits are a stated exception.

### Shared native preparation and evidence for slices 3–5

Preparation is inside the first native slice that runs, not a separate framework
or open-ended infrastructure step:

- Reuse `tests/helpers/release-fixture.bash` to build controlled competing tags
  and a divergent branch. Add the candidate README and guide to the fixture's
  source branch so the agent can read the actual public instructions. Keep valid
  release tags immutable; the tagged skills/helpers are the candidate payload.
  Reading source instructions before pinning is allowed; executing its scripts
  before pinning/inspection is the prohibited behavior.
- Make a fresh target with neither selected managed skill present. Use existing
  target/sentinel helpers, plus a small original `adr-awareness` file and caller
  and other-platform sentinels. Record their initial bytes. Do not run the old
  `delivery_prepare_fixture`: it installs a baseline and changes this precondition.
- Supply the install request, source URL, and target. Let the agent find/follow
  README and choose its native destination; do not supply a bypass command or
  call an installed updater. Reuse native launch conventions only, not the old
  wrapper's update/fresh-ADR lifecycle. Do not change models or shared settings.

The local `--help` surfaces were inspected during refinement: Codex supports
JSONL events, Cursor supports `stream-json`, and Claude supports `stream-json`
and verbose output. This resolves how to request transcripts; it is not a native
installation result or a new discovery verification. Keep current permissions;
these output flags do not authorize broader execution access.

For each single native run, inspect chronological tool events for tag selection,
Git-only pinning, reads of the complete executable call chain and public payload,
post-inspection validation, and the exact direct installer command/commit. Check
all three installed files against the selected snapshot and the version record;
check the target diff, local guidance/caller and other-platform sentinels, actual
outcome report, and the agent's own temporary cleanup before outer fixture teardown.
Keep launcher status and stderr; a successful log-capture command is not proof
that the native run succeeded.

Record host/version, session/transcript reference, exact source/tag/commit,
inspection-to-execution evidence, payload checks, preservation, cleanup, and the
actual result in the existing slice/platform row. Copy decisive short excerpts
before disposable logs are removed; do not leave dead temporary paths as the only
proof. A final summary or printed commit alone cannot replace tool-call evidence.

Stop after that installation observation. Reuse E1–E4 for unchanged discovery,
ADR behavior, updating, repeat/force, and faults. Reopen only evidence with an
identified changed input/behavior. An unavailable host or incomplete trace stays
pending; copying files or another tool's result cannot close it. Continue other
ready platform slices without repeatedly retrying an unchanged blocker.

## Execution controls and learnings

- The reviewed plan remains five leaves and three new native installations.
  No completed proof was discarded or converted into a new task. The original
  14-leaf lifecycle matrix stays retired. Story goal, scope, and order are unchanged.
- Refinement exposed three concrete traps: `assert_payload` checks only a marker
  for the updater; test-owned EXIT cleanup can mask workflow cleanup; and old
  native delivery wrappers prepare an existing installation and capture summaries.
  The leaves now address those within their original proof loops.
- All remaining leaves are Ready after this pass: bounded edits, one success or
  refusal outcome, and one focused proof loop each. No additional Structure or
  refinement gate is required before execution. Roughly 25 minutes active work
  plus native waits remains a hypothesis, not a guarantee.
- Include checks, slice-local cleanup, and evidence recording in the five-minute
  target. At five minutes inspect hidden work. At ten, preserve attempt-owned
  WIP/learning and refine the affected leaf unless one focused test or external
  wait explains elapsed time. State that exception at the threshold; it does not
  cover active debugging. A second non-exempt overrun requires story-boundary
  review; renaming/retrying leaves does not reset the count.
- Product/test changes must finish green with focused tests and applicable lint.
  Native evidence-only leaves need their result/cleanup record, not unrelated
  code changes or full-suite reruns. If a shared guide change invalidates an
  earlier platform observation, reopen that claim explicitly; independent later
  platform work does not invalidate it by itself.
- This refinement changed only this PLAN. No product verification, implementation,
  native installation, commit, or push occurred. Execution may start with slice 1;
  acceptance remains pending until new observations and retained proof agree.
