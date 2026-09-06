# Install the latest released Open Dough guidance safely

**Status: COMPLETE — all five slices accepted 2026-09-06.** Focused shell
proof and three native installation observations passed. Earlier E1–E4 evidence
is retained within its stated boundaries. Initial launch failures and authorized
retry results are recorded below; no acceptance blocker remains.
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

| Platform | Native evidence retained | New installation evidence |
| --- | --- | --- |
| Codex | E1 slices 11–12: installed updater and fresh ADR skill use; E2: version decisions/no-op. Original updater discovery: Codex 0.153.4 session `01a07569-9c9e-7412-bcae-87049e00f575`. | Slice 4 complete: authorized isolated native retry followed the revised guide, byte-verified all payload/record files, preserved guidance, and cleaned its checkout. |
| Cursor | E1 slice 14: native updater, fresh ADR skill use, other-platform preservation; E2: version decisions/no-op. This later evidence covers stable discovery that original Quick 008 leaf 18's file read did not establish. | Slice 3 complete: authorized native retry followed the revised guide, delivered exactly the pinned payload/record, preserved guidance, and cleaned its checkout. |
| Claude Code | E1 slice 16: native updater, fresh ADR skill use, coexistence; E2: version decisions/no-op. Original updater discovery: Claude Code 2.1.263 session `e2c8f582-0545-44b3-8037-b1f1b8a397d4`. | Slice 5 complete: authorized native retry inspected the full pinned call chain, installed and verified exactly the declared Claude payload/record, preserved guidance, and cleaned its checkout. |

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
Status: completed 2026-09-06
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

Execution evidence (2026-09-06): added one valid `v0.1.11` release after
inspection of `v0.1.10`, using the existing payload/commit/tag helpers and checking
that the new metadata validates. The same direct-install sequence returned
nonzero with `Release selection changed after inspection; not replacing inspected
files or installing.` No installer trace, success report, branch execution, or
target difference occurred. Before workflow cleanup, recorded HEAD still matched
the original peeled commit and `git diff HEAD` was empty; afterward the child
checkout was absent while the outer fixture and assertions remained. The EXIT
observer only records evidence before the workflow's existing removal; it does
not add a product cleanup path. Original success/updater cases remained green.
`bash tests/pin-and-inspect.sh`, ShellCheck, shfmt, and `git diff --check` passed.
About two minutes active work. E3–E4 still own other failure causes; no shared
code or refusal wording needed changing.

### 3. Install safely from the corrected instructions in Cursor
Type: Behavior
Status: completed — authorized native retry 2026-09-06
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

Execution attempt (2026-09-06, Darwin arm64): Cursor Agent
`2026.09.02-c22c1a3` (desktop `3.19.13`). Launched once from the fresh Cursor
adopter with `cursor agent --print --force --trust --sandbox enabled
--output-format stream-json --workspace <target> <request>`, retaining status and
stderr. Exit status **1**, zero-byte event stream, no session ID or tool calls:

> Error: EPERM: operation not permitted, mkdir '/Users/terryyin/.cursor/projects/private-tmp-open-dough-safe-native-9i1I9B-cursor-adopter'

The target remained byte-for-byte unchanged according to Git's baseline and full
untracked-file inventory; original ADR skill/caller and all three platform
sentinels survived. Installer and branch marker logs stayed empty. Cursor created
no agent-owned checkout, so its pin/inspection/execution, payload verification,
reporting, and workflow cleanup are **unobserved**, not passed. Stderr SHA-256:
`9de6ffd4b6de0fe170c09c3005ccdd51445e376c941cb3537c5e1007ab7da0b3`.
The shared fixture recipe/source identity below was used. No unchanged retry or
permission broadening; continued with slice 4. Preparation plus launch/review
was under five minutes; native process wait was about one second.

Successful retry (2026-09-06): the user requested another attempt and explicitly
authorized transmission of this disposable public Open Dough fixture and synthetic
adopter to Cursor's configured model service after automatic approval review
rejected the initial elevated retry. The approved run retained Cursor sandboxing
and all existing launch flags. Version `2026.09.02-c22c1a3`, Darwin arm64;
session `cdbdd351-db77-41d1-9e5f-a13ce5fc774f`. Launcher status **0**, empty stderr,
terminal result `is_error: false`, reported native duration 54.767 seconds (plus
launcher startup). No model or shared setting was changed.

Source `file:///private/tmp/open-dough-safe-retry.kAa5K5/source`, expected and
agent-selected `v0.1.10`, peeled commit
`9d5050ea5efe1f65a941777dd2e9c39f74ee6f99`. Fresh target was the sibling
`cursor adopter`; the source branch remained divergent at
`969a2d513365a88037c0c9899300c65fd69758e2`. Preparation reused the earlier recipe,
with the corrected literal Codex invocation in the README-linked guide.

Decisive chronological excerpts from `cursor.events.jsonl` (line numbers):
- 15/19 and 33/34: successful README and linked guide reads.
- 72: Git-only tag listing returned competing `v0.1.1`, `v0.1.2`, and
  `v0.1.10`, including the latter's peeled commit above.
- 92: `git ... fetch --depth 1 ... 9d5050e...`, detached checkout, and
  `HEAD=9d5050ea5efe1f65a941777dd2e9c39f74ee6f99` / `Pinned OK`.
- 106–113: eight successful, untruncated reads of the installer, all four
  helper/dependency files, and all three public payload sources under
  `/tmp/open-dough-install.Z7tPai/release/`.
- 129/130: after those reads, `resolve-url`, captured tag/commit/version/HEAD
  comparisons, `validate-checkout`, source-version comparison, then
  `bash "${snapshot}/install.sh" --target "${target_project}" --platform "${platform}"`
  with captured `platform=cursor`; no `apply` or `--force`. Output:
  `Installed Open Dough public guidance in .../cursor adopter/.cursor/skills`
  and `Recorded version 0.1.10.`
- 140: all three `cmp` checks passed, `installed=0.1.10 selected=0.1.10`,
  unchanged tracked diff, and removal of the owned checkout and seven scratch
  records completed with `cleaned`.
- 149: accurate final source/tag/commit, Cursor destination, three installed
  paths plus VERSION, and fresh-session invocation; no claim of observed invocation.

Independent checks against `git show <selected-commit>:src/skills/<file>` matched
all three payload bytes and VERSION. Git baseline plus full untracked inventory
showed exactly four additions under `.cursor/skills/`; original ADR skill/caller,
other-platform sentinels, unrelated file, and source remained unchanged. Installer
trace contained exactly one direct install and the branch marker stayed empty.
The agent-owned checkout and seven scratch records were absent while the outer
fixture remained, independently confirming cleanup. No home-guidance write was
present in tool events. This closes only the changed initial-install path; E1–E4
still own unchanged discovery, invocation, updating, coexistence, and failures.
Transcript SHA-256:
`f7b7861da2743d62641a12a0f0776d342828b0fea5be2e8f36943ff51534a6e6`.
Decisive evidence is retained here before eventual disposable-log cleanup.

### 4. Install safely from the corrected instructions in Codex
Type: Behavior
Status: completed — authorized native retry 2026-09-06
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

Execution attempt (2026-09-06, Darwin arm64): `codex-cli 0.144.1`.
Used the established `sandbox-exec` profile from the delivery-to-use launcher,
with proof/state paths under the disposable fixture and protected skills,
worktrees, packages, plugins, and configuration. Requested `codex exec --json
--ephemeral --ignore-user-config` with isolated sqlite/log paths, existing
externally sandboxed execution convention, and the fresh Codex target. No model
or shared settings were changed. Launcher exit status **71**, zero-byte event
stream, and no native session:

> sandbox-exec: sandbox_apply: Operation not permitted

The enclosing task sandbox refused the existing isolated launcher before Codex
started. Target baseline/inventory stayed unchanged; both trace files were empty.
All installation-path observations and agent-owned cleanup remain **unobserved**.
Stderr SHA-256:
`d34a4e4359a4dc36526cf5b363da32f7b7594a3a09eea17cbdfd6425b052d93e`.
No claim about CLI-version equivalence is inferred from this failed launch;
E1–E2 retain only their earlier observations. Continued to slice 5 without retrying
or removing isolation. Active launch/review was under five minutes; no native wait.

Successful retry (2026-09-06): the user explicitly authorized transmission of
the disposable public fixture and synthetic adopter to Codex's configured model
service after automatic approval review requested destination-specific consent.
The approved elevated launch retained the existing `sandbox-exec` profile,
protected home guidance/configuration/plugin/package/worktree paths, and isolated
state/log paths. No model or shared settings were changed. Darwin arm64,
`codex-cli 0.144.1`, session `01a0768a-809c-7143-825d-4f7702370197`, launcher
status **0** and terminal `turn.completed`. Native execution took about 88 seconds;
active launch/audit/record work stayed within the leaf budget.

Same immutable retry fixture URL as slice 3:
`file:///private/tmp/open-dough-safe-retry.kAa5K5/source`; selected `v0.1.10`,
peeled commit `9d5050ea5efe1f65a941777dd2e9c39f74ee6f99`, fresh sibling target
`codex adopter`, selected root `.agents/skills/`.

Chronological `codex.events.jsonl` evidence:
- Lines 5/8 (`item_1`/`item_3`): README and linked guide read before fetched code.
- Line 10 (`item_4`): `git ls-remote --tags -- <source>` returned competing
  releases; native selection chose `v0.1.10`, fetched its peeled commit with
  `--depth 1`, detached, and compared HEAD. Recorded owned checkout:
  `/tmp/open-dough-install.MQAVeD/release`.
- Line 13 (`item_6`): all eight required files were printed from that snapshot.
  Independent transcript comparison found each file's entire tagged contents
  in the returned output, so the 400-line per-file read limit truncated none.
- Line 16 (`item_8`): captured tag/commit/version/HEAD comparisons after
  `resolve-url`, followed by `validate-checkout` and source-version comparison,
  then direct `bash "${snapshot}/install.sh" --target "${target_project}"
  --platform "${platform}"`, with `platform=codex`; no `apply` or `--force`.
  Exit 0: `Installed Open Dough public guidance in .../codex adopter/.agents/skills`
  and `Recorded version 0.1.10.`
- Line 18: the first post-install verification wrapper failed before checks with
  `zsh:4: read-only variable: status`. This was neither an installer failure nor
  a successful verification. The same native session repaired only its wrapper.
- Line 21 (`item_11`): Bash wrapper used `verify_status`, compared all three
  files, checked VERSION, compared baseline file hashes, enumerated exactly the
  four new managed paths, printed `VERIFICATION_OK`, and removed the owned
  checkout. Exit 0; no second installer call, repin, or payload change.
- Lines 22/23: truthful final source/tag/commit, version, four paths, preserved
  guidance and cleaned checkout; fresh `$dough-update` invocation suggested,
  without claiming that invocation was observed; successful turn completion.

Independent byte comparisons against the selected Git tree and exact four-file
untracked inventory passed. The target's tracked baseline (including original ADR
skill/caller and other-platform sentinels) and source remained unchanged; installer
trace had exactly one install, branch marker was empty, and the agent-owned
checkout was absent while the outer fixture still existed. No home-guidance write
was present in tool events. Launcher stderr contained denied optional system-skill,
plugin metadata and trust persistence, cache/state warnings, and an intentionally
plain sentinel's frontmatter warning; these did not prevent the task, and protected
paths were not made writable to suppress them. E1–E4 retain unchanged behavior.
Transcript SHA-256:
`39ae4e1a2d041e367fc1d397e78201490f487a1ede3b1270c03634bac66262b0`;
stderr SHA-256:
`9c5cd8b372a07a1080e35b5460effd68839d0b320249b6069cae7edb83be23c4`.

### 5. Install safely from the corrected instructions in Claude Code
Type: Behavior
Status: completed — authorized native retry 2026-09-06
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

Execution attempt (2026-09-06, Darwin arm64): Claude Code `2.1.263`.
Used `claude --print --dangerously-skip-permissions --no-session-persistence
--output-format stream-json --verbose <request>` under the enclosing task's
unchanged sandbox, from the fresh Claude target. Exit status **1**, empty stderr,
7,293-byte event stream. Session: `53926afa-2997-4b4f-bc56-4f41beb7e90f`.
Decisive chronological events:

- Three `SessionStart:startup` hook responses had exit code 1:
  `EPERM: operation not permitted, mkdir '/Users/terryyin/.claude/session-env/53926afa-2997-4b4f-bc56-4f41beb7e90f'`.
- Initialization was followed by a synthetic assistant event with
  `error: authentication_failed` and `Not logged in · Please run /login`.
- Terminal result had `is_error: true`, `terminal_reason: api_error`, and zero
  API usage. Its `subtype: success` did **not** mean installation succeeded.

No agent installation tools ran; this demonstrates authentication was unavailable
to this launch, not whether the user's ordinary host session is logged in. Target
baseline/inventory stayed unchanged and both trace files were empty. All required
installation observations and agent-owned cleanup remain **unobserved**. Event
stream SHA-256:
`c27fcd4e9d2b355d13f43972c373c0df1aafb669cd72fa89a7587b95495b4795`.
Active launch/review was under five minutes; process wait was under one second.
No authentication/settings changes or repeated launch were attempted.

Successful retry (2026-09-06): the user explicitly authorized sending the
same disposable public fixture and synthetic adopter to Claude Code's configured
model service. The elevated run used the established print/no-session-persistence
launcher with verbose stream events, without changing models, authentication,
or shared settings. Darwin arm64, Claude Code `2.1.263`, session
`02b2fb98-25d5-48a5-b10d-e6078773cb13`, launcher status **0**, empty stderr,
terminal `is_error: false` / `terminal_reason: completed`. Native duration was
82.971 seconds; active launch/audit/record work stayed within the leaf budget.
Authentication worked in this launch; no login reset was needed.

Same source `file:///private/tmp/open-dough-safe-retry.kAa5K5/source`, independently
selected `v0.1.10`, peeled commit
`9d5050ea5efe1f65a941777dd2e9c39f74ee6f99`; fresh sibling target `claude adopter`,
selected native root `.claude/skills/`.

Chronological `claude.events.jsonl` evidence:
- Lines 15/17 and 21/22: README and linked installation guide read.
- Lines 43/44: Git-only remote tag listing with competing numeric releases and
  the selected annotated tag's peeled commit.
- Lines 49/50: `git init`, exact-commit `fetch --depth 1`, detached checkout,
  `head=9d5050ea5efe1f65a941777dd2e9c39f74ee6f99` and `OK pinned`. Owned
  snapshot: `/tmp/open-dough-install.U8kRpH/release`.
- Lines 53/54: command reads all eight pinned files; the host saved its 36 KB
  output to a tool-result file rather than returning the whole body inline.
  Lines 56/57 explicitly read that complete persisted result before execution.
  Independent comparison after removing Read's line-number prefixes found all
  eight entire tagged file contents in its 1,091 lines. The preview alone was
  not used as inspection evidence.
- Lines 63/64: `resolve-url`, captured tag/commit/version/HEAD comparisons,
  `validate-checkout`, source-version comparison, then direct
  `bash "${snapshot}/install.sh" --target "${target_project}" --platform "${platform}"`
  with `platform=claude`; no `apply`, `--force`, or repin. Output:
  `Installed Open Dough public guidance in .../claude adopter/.claude/skills`
  and `Recorded version 0.1.10.`
- Lines 67/69: three successful byte comparisons, VERSION `0.1.10`, and target
  status showing only the new managed directories.
- Lines 71/72: remove owned checkout and scratch record; subsequent `ls`
  reports `No such file or directory` and `cleaned up successfully`.
- Lines 77/78: source Git status remains clean. Lines 82/83: truthful final
  source/tag/commit, tool, four paths, preservation, cleanup, and fresh-session
  instruction, followed by successful terminal result. Two preliminary read-only
  listing errors (absent optional CLAUDE.md and a mistyped find terminator) were
  handled before pinned-code inspection; neither altered files or release choice.

Independent checks matched all three installed files against the selected Git
tree and VERSION against `0.1.10`. Full Git inventory showed exactly the four
expected new `.claude/skills/` files and no tracked changes. The original ADR
skill/caller, other-platform sentinels, unrelated files, and source were unchanged.
Exactly one installer trace and an empty branch marker confirmed the intended
execution path. The agent-owned checkout and scratch record were absent while
the outer fixture remained. No home-guidance write appeared in tool events;
normal Claude session/tool-output metadata is separate from installed guidance.
E1–E4 continue to own unchanged discovery/invocation, updates, repeat/force, and
fault behavior. Transcript SHA-256:
`22a1c176b6294c516cce0548b1b92a0c31093aa741cde05dd2027e155dd78f12`.

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

### Initial blocked-attempt provenance and cleanup (2026-09-06)

Slice 3 prepared a disposable source with `tests/helpers/release-fixture.bash`:
competing annotated tags `v0.1.1`, `v0.1.2`, and `v0.1.10`, where highest numeric
`v0.1.10` has the oldest tag date. Candidate README/guide were committed on the
divergent source branch alongside branch helper/installer execution markers.
These were fixture commits only; immutable release tags were not moved.

- Supplied URL: `file:///private/tmp/open-dough-safe-native.9i1I9B/source`.
- Expected numeric release: `v0.1.10`; peeled commit
  `deecdc221b259ff71a4f6f75df53e3de818bc842`.
- Divergent source branch commit:
  `f65fab5e7f01bef7037daff1d75f5c89bde19371`.
- Fresh targets under that root: `cursor adopter`, `codex adopter`, and
  `claude adopter`. None had a selected managed skill. Each had all three
  platform sentinels, original `.agents/skills/adr-awareness/SKILL.md`, its
  `AGENTS.md` caller, and an unrelated project file committed as the baseline.
- Each request supplied only the install URL, target, direction to read README
  and follow the linked instructions, preservation, and no commit/push. It did
  not provide tag selection, platform paths, or bypass installation commands.
- All launcher statuses, stderr, event streams, source and target Git status,
  and empty installer/branch traces were reviewed before cleanup. No native
  agent chose a release, inspected repository code, executed the installer, or
  created its temporary checkout. Source Git status stayed clean. Fixture cleanup
  is not agent-owned workflow cleanup evidence.
- After recording the decisive excerpts and digests above, the test-owned fixture,
  raw disposable logs, and temporary preparation/launcher scripts were removed.
  Source/tag paths above are provenance, not links to retained evidence.

The initial sandbox access failures blocked those launches. On the user's
request to try again, elevated retries were submitted without removing the
established launcher isolation. Automatic approval review required explicit
service-specific authorization for fixture transfer; the user authorized Cursor,
then both Codex and Claude Code. All three approved retries passed as recorded
in slices 3–5. No native acceptance is inferred from shell tests; E1–E4 remain
retained within the stated boundaries. The completed behavior commits are
`03bdc06` (guide and successful direct install) and `286c4df` (stale selection).
Final document review restored the literal `$dough-update` invocation after shell
formatting had added braces; no native installer ran against that typo. A focused
check confirmed the Codex literal, all README/guide relative links and anchors,
and exact equality of the guide/fixture post-inspection command sequence. No
shipped skill or earlier retained behavior was changed by this correction.
The supplied plan/story edits were preserved. No main-worktree edits, Donut
installation/removal, push, or release publication was performed by this task.

### Final acceptance and retry cleanup

The same prepared immutable retry source was used by three separate fresh native
installations, in Cursor → Codex → Claude Code order. Each tool selected the
numeric `v0.1.10` release, inspected the exact commit before executing fetched
code, revalidated without repinning, directly installed only its native payload,
verified all bytes/record, preserved preexisting guidance, and cleaned its owned
checkout. No shipped skill, helper, installer, platform mapping, or payload was
changed; E1–E4 therefore remain valid with their original provenance limits.

The native commands' source selection was observed independently of the fixture's
expected commit. Codex's recovered verification-wrapper error and Claude's full
persisted-output inspection are explicitly recorded, rather than replacing tool
evidence with final summaries. Native response waits were about 55, 88, and 83
seconds respectively, excluding launcher startup and permission review waits.
No extra lifecycle, no-op, fault matrix, or broader test suite was run.

After verifying each agent's cleanup while the outer fixture still existed,
decisive event excerpts and full-log digests were recorded in the corresponding
slices. The disposable retry root `/private/tmp/open-dough-safe-retry.kAa5K5`,
its raw logs, and attempt-owned preparation/launcher/evidence scripts were then
removed. These paths identify historical provenance; the evidence needed to
review acceptance is retained above. Normal native session metadata was left to
its host, and no home-level guidance was modified by installation.

Story 5a is complete in its existing seed record. Publication, main-worktree
self-installation, Donut adoption/removal, and next-backlog execution remain out
of scope. The exact requested worktree and branch were used throughout.

## Execution controls and learnings

- The reviewed plan remains five leaves and three new native installations.
  No completed proof was discarded or converted into a new task. The original
  14-leaf lifecycle matrix stays retired. Story goal, scope, and order are unchanged.
- Refinement exposed three concrete traps: `assert_payload` checks only a marker
  for the updater; test-owned EXIT cleanup can mask workflow cleanup; and old
  native delivery wrappers prepare an existing installation and capture summaries.
  The leaves now address those within their original proof loops.
- At refinement, all remaining leaves were Ready: bounded edits, one success or
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
- All five leaves are now complete: slices 1–2 have focused green product checks,
  and slices 3–5 have separate successful native tool-event evidence plus cleanup.
  The original refinement and failed-launch history remains intact; it does not
  override these later accepted results. No product change was needed on retry.
