# Return complete usable delegated handoffs

Status: planned — execution not started.
Source: [SEED-004 story 22](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#return-complete-usable-delegated-handoffs).
Authority: The owner's 2026-09-14 instruction authorizes narrowed refinement
and slice planning, with further slice refinement if necessary. It does not
authorize execution, commits, pushes, release, or moving the story to Taken.

## Goal and boundary

Remove the remaining delegated-handoff friction after v0.3.17: unfinished
verification ownership, no-op waiting, stale owned watches, and cosmetic proof
retries. Keep the released report contents, proof inspection/reuse, recovery,
and coordinator delivery rules. The seed retains the finding evidence and
release comparison; they establish a problem, not proven effectiveness.

Use four Behavior slices, each with one decision and proof loop. The common
rule is to act on actual work/evidence state through existing host facilities.
A progress return is not completion; an equivalent evidence representation is
not missing proof. Waiting and watch cleanup concern the current delegated
obligation, not a general monitoring system.

Exclude new schedulers, adapters, runtime services, persistent handoff files,
schema validators, test/CI redesign, delivery-rule rewrites, broader story 21
proof discovery, installation changes, and release work. Do not edit managed
installed copies. If existing host controls cannot support a promised action,
report the limitation and stop that affected change before adding machinery.

## Existing solution and decisions

PFE assessment: the existing execution delegation reference owns implementation
assignments and returns; refactoring owns its conditional verification and
return; wrap-up owns proof acceptance. The release comparison and targeted
cross-product search found no shared delegated-command completion protocol.
CI notification adapters implement a different lifecycle: reuse their principle
of explicit ownership, not their observer runtime for worker commands.

| Existing home | Change or reuse |
| --- | --- |
| [Delegation](../../../src/skills/dough-execute-plan/references/delegation.md) | Add the missing completion/wait/watch decisions here; clarify that the proof block is an example representation with required substantive evidence. Keep one authoritative explanation per rule. |
| [Refactor verification](../../../src/skills/dough-post-change-refactor/SKILL.md#verify-edits) | Link to the shared verification ownership rule when running verification, without importing implementation responsibilities or repeating the protocol. Preserve unchanged-proof reuse and existing completion markers. |
| [Proof acceptance](../../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof) | Apply equivalent-evidence acceptance alongside existing inspection; preserve rejection of actual evidence gaps and coordinator delivery. |
| [Execution entry](../../../src/skills/dough-execute-plan/SKILL.md) | Reuse normal loading of delegation before dispatch. Add a link only if the behavior review demonstrates a missing entry path. |
| [CI observation](../../../src/skills/dough-execute-plan/references/ci-monitor.md) | Preserve its observer, ownership, shutdown, and host adapters; no change planned. |

These are source placement decisions, not runtime success claims. No Structure
slice, new file, or North Star topic is warranted. No existing North Star file
was found under the planning root. Follow [AGENTS.md](../../../AGENTS.md) for
one shared source, runtime audience, and representative behavior review.
Current relevant Accepted ADRs, checked against the [index](../../../docs/adrs/README.md):
[0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
requires proportionate change and cohesive reuse;
[0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
keeps source edits distinct from released fixes;
[0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
separates behavior review from native acceptance and permits evidence reuse;
[0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires actionable runtime prose and one home per rule. No ADR exception or
lifecycle policy change is proposed.

## Proof and delivery

For each slice, walk the ordinary execution/refactor entry and linked guidance
with the stated precondition. Inspect actions, available command/watch state,
and returned evidence at the coordinator boundary. Check invocation, required
context, and useful outcome. A manual walkthrough is labelled manual; exact
prose matching, fixture-supplied success, and an agent's “done” alone are not
behavioral proof. Use small disposable commands and supplied reports rather
than production projects or full test suites.

For any fresh native session, use the ordinary task and starting conditions
without supplying this plan's expected answer. Record the literal invocation,
candidate revision/diff, host, inputs, inspected actions/results, and limits in
Execution learnings. Do not create a permanent harness or repeat unchanged
checks. Missing host capability is an incomplete observation, not success.
Host documentation available during execution determines actual wait/resume and
cleanup operations; this plan does not prescribe cross-host APIs or indefinite
waits. A blocked path must preserve known state and name recovery ownership.

| Promise | Proof owner |
| --- | --- |
| Verification reaches a terminal result or an explicit incomplete handoff, including refactoring | Slice 1 |
| Waits obtain meaningful state without no-op calls | Slice 2 |
| Redundant owned watches retire; unread failures and unrelated observers survive | Slice 3 |
| Equivalent complete reports avoid cosmetic resends; gaps still block | Slice 4 |
| Released report contents, proof reuse, review before delivery | Each affected slice preserves its existing path; slice 4 checks the final coordinator handoff. ODF-040 is not a new fix. |
| Accurate finding follow-up | Each slice updates only its mapped finding after delivery; slice 4 records the ODF-040 preservation assessment without claiming correction. |

Conventional implementation review uses `git diff --check`, relative-link and
anchor checks, and the behavioral walkthroughs. No exact-wording tests are
planned. Use the existing execution skill's independent refactoring and owned
changes/delivery gates during separately authorized execution. At planning time,
no custom hooks path or local pre-commit hook was found; `scripts/lint.mjs`
formats JS/JSON/shell, not Markdown. Resolve the current selective formatting
and hook contract before delivery; do not run a broad formatter for these prose
changes. Coordinate overlapping source edits with the taken story 21.

Native acceptance remains separately pending until demonstrated or justified by
reuse for affected requirements on Codex, Cursor, and Claude Code under ADR
0005. Select representative sessions by the unresolved host risks, not every
case on every host. Before release, assign missing observations to a linked
acceptance story or sufficient existing evidence under that ADR; this plan
selects no release and grants no validation exception. Later real-use recurrence
is separate from both source review and native acceptance.

## Ordered slices

### 1. Own verification through its actual result
Type: Behavior
Status: delivered 2026-09-14

Behavior: Required delegated verification yields a running command identity →
the agent follows the supported continuation → the coordinator receives its
terminal result or a precise incomplete stop, never progress as completion.

Change: Clarify ownership in the existing delegation reference and link the
same rule from refactor verification. Retain command identity and known state
in the ordinary handoff only when needed for continuation or recovery. Preserve
existing proof requirements, no-change refactor reuse, and uncommitted returns.

Proof: Walk a short yielded verification through pass, with failure/unavailable
continuation as boundary variants. Inspect that the terminal observation, not
the launch result, supports completion. Check that both implementation and
refactor invocation reach the same rule. The incomplete variant names state,
outstanding proof, and recovery ownership without a completion marker; unchanged
accepted refactor proof still needs no new command. One completion decision
owns these variants.

Safe stop: Verification returns are honest without the remaining optimizations.
After delivery, record the actual ODF-007 response and effectiveness limit.

### 2. Wait for delegated results without empty calls
Type: Behavior
Status: delivered 2026-09-14

Behavior: A coordinator awaits a delegated result → it uses an available
notification/wait/resume facility → it continues on meaningful state without
shell no-ops issued solely to keep the turn alive.

Change: Put the coordinator wait decision beside delegation, using current
host capabilities. Distinguish useful bounded state retrieval from no-op
polling. Keep progress communication valid and preserve slice 1's ownership;
do not universally prescribe ending an agent's turn or blocking indefinitely.

Proof: Walk one pending delegated result through its completion notification or
supported wait response; inspect intervening actions for no-op calls. In the
missing-facility variant, the coordinator reports the exact limitation and
recovery need rather than inventing an API or assuming completion. Do not alter
CI polling/observation behavior.

Safe stop: Useful waiting stands alone and does not depend on watch cleanup.
After delivery, record the actual ODF-038 response and effectiveness limit.

### 3. Retire redundant verification watches
Type: Behavior
Status: delivered 2026-09-14

Behavior: A delegated verification obligation ends with an owned command watch
still live → the owner accounts for unread evidence and retires that watch via
supported controls → no avoidable watch remains for completed work.

Change: Extend delegation's command ownership with bounded watch lifetime.
Prefer existing completion handling over creating extra watches. Account for
already-queued duplicates without restarting verification; preserve unrelated
watches and the coordinator's CI observer. Report unavailable cleanup rather
than claiming it succeeded or changing a host adapter.

Proof: Walk a completed command with one owned watch, unread failure evidence,
and an unrelated observer. Inspect that the owned watch retires, failure
evidence stays available, and the unrelated observer survives. A queued
duplicate causes no repeated test; absent cleanup controls produce a truthful
limitation. This is one watch-retirement decision with boundary variants.

Safe stop: Cleanup removes redundant obligations without requiring report changes.
After delivery, record the actual ODF-036 response and effectiveness limit.

### 4. Accept equivalent complete proof without cosmetic retries
Type: Behavior
Status: planned

Behavior: A worker returns complete inspectable evidence in an equivalent
layout → the coordinator inspects and uses it → no resend occurs solely to
match the preferred proof block.

Change: Clarify representation flexibility at delegation and its existing
acceptance consumer. Keep substantive fields and literal commands precise;
retain explicit completion markers that have a separate workflow contract.
Do not add a parser, validator, or new report schema. Preserve current delivery
ownership instead of restating ODF-040 as a missing rule.

Proof: Give the coordinator the same complete evidence using title-cased
headings, then inspect acceptance without a report-only follow-up. Contrast
with a canonical-looking report missing the terminal result or contradicting
failure evidence: that remains incomplete. Inspect the final path retains
review before delivery and reuses unchanged accepted proof. One semantic
acceptance decision owns these variants.

Safe stop: Complete evidence is usable without weakening review.
After delivery, record the ODF-043 response and effectiveness limit; record
ODF-040 only as an existing-rule preservation assessment, not a new fix.

## Sizing and assessment

No numeric target or hard limit was supplied. Each slice has one bounded
behavior decision, focused proof, and local cleanup. All use the same existing
handoff model; there are no temporary layers or deferred cleanup slices.
Four separate slices avoid conflating command completion, waiting, watch
retirement, and report acceptance into one multi-result test.

Host semantics are the specific uncertainty in slices 1–3. Their missing-control
variants bound the guidance change without committing to new runtime mechanisms;
actual success claims still require observed capabilities and results. No other
slice-specific sizing or cumulative-design concern was identified. Construction
already separates the independent outcomes; no additional slice-plan refinement
was applied. This assessment does not authorize implementation.

## Execution learnings

Execution identity (recorded 2026-09-14 at setup):

- Originating checkout and branch: `/Users/terryyin/git/open-dough` on `main`;
  Taken-only claim commit `7cc1e90`.
- Execution checkout and branch:
  `/private/tmp/open-dough-048-delegated-handoffs` on
  `cursor/048-complete-delegated-handoffs`, created from the claim commit.
- Integration target: `main`; authorized push destination: `origin`.
- CI observer: mailbox `/tmp/dough-ci-501/watch-LzixQz`, workflow `ci.yml`
  (name `CI`, push-triggered, verified), branch
  `cursor/048-complete-delegated-handoffs`, repo `terryyin/open-dough`.
  Bridge limitation: this session's Cursor host hook is bound to the
  originating checkout, so worktree-owned mailbox notifications are not
  delivered in-session (probe from the execution checkout produced no
  `CI_MONITOR_READY`; probe from the originating checkout did). Coverage is
  therefore not promised in-session; the detached observer still records
  terminal results for authoritative inspection at shutdown. No AI polling.
- Hook contract: no `core.hooksPath` and no non-sample `.git/hooks` hooks at
  claim time; the Taken transition was safe. `scripts/lint.mjs` covers
  JS/JSON/shell only; no broad formatter applies to these Markdown changes.

Slice 3 (delivered 2026-09-14): Added `## Retire owned watches when
verification ends` to `src/skills/dough-execute-plan/references/delegation.md`
between the ownership and return-contract sections (bounded watch lifetime;
unread evidence accounted before retirement; queued duplicates never restart
verification; CI observer lifecycle explicitly preserved; absent controls give
a truthful limitation). Accepted proof: `git diff --check`; link/anchor
checks; `bash tests/execution-payload-update.sh` (pass); manual five-variant
walkthrough, labelled manual. Post-change refactor: `none — already clean`.
Observation for later: the truthful-limitation-report pattern now appears in
three decisions in delegation.md; healthy parallel structure, but watch for a
fourth instance.

Slice 2 (delivered 2026-09-14): Added `## Await delegated results without
empty calls` to `src/skills/dough-execute-plan/references/delegation.md`
(supported notification/wait/resume facility; no no-op calls; bounded state
retrieval and progress communication stay valid; missing-facility variant
reports the exact limitation and recovery need; CI lifecycle untouched).
Accepted proof: `git diff --check`; link/anchor checks;
`bash tests/execution-payload-update.sh` (pass); manual two-variant
walkthrough, labelled manual. Post-change refactor restored the file's section
structure with a new `## Return a targeted report with focused proof` heading
(slice 1's insertion had left the return contract under the ownership
heading); slice 1's boundary and anchor remain valid. Slices 3–4 attach after
the wait section or extend ownership without restructuring.

Slice 1 (delivered 2026-09-14): Added `## Own verification to its terminal
result` to `src/skills/dough-execute-plan/references/delegation.md` and one
linking sentence in `src/skills/dough-post-change-refactor/SKILL.md`
`## Verify edits`. Accepted proof: `git diff --check`; link/anchor resolution
for `#own-verification-to-its-terminal-result`;
`bash tests/execution-payload-update.sh` (pass); manual three-variant
walkthrough (yielded pass, failed/inaccessible incomplete stop, refactor via
link with unchanged-proof reuse), labelled manual. Post-change refactor:
`none — already clean`, no proof invalidated. Slices 2–3 must attach wait and
watch-retirement decisions beside the new section without duplicating the
ownership rule. `tests/story-payload-update.sh` does not cover the edited
skills. Native acceptance remains separately pending under ADR 0005; no
behavioral effectiveness is claimed beyond source review.
