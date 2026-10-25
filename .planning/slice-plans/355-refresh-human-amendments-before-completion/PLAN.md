# Keep human amendments visible before Story Branch completion

**Identity:** SEED-010#refresh-human-amendments-before-completion
**Source:** [Selected story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#refresh-human-amendments-before-completion)
**Finding:** [ODF-354](../../../docs/maintainer/findings/ODF-354.md)

## Goal and scope

A developer who amends a Taken story section or its plan on trunk during
Story Branch execution has the amended text in front of the execution
coordinator at the next slice delivery, before the execution-complete record
and before wrap-up deletes the copy. A clean amendment is absorbed into the
branch copy and becomes the source the remaining work is accepted against; a
conflicting one is named and left with the human while independently
delivered work stays.

Included: one installed freshness command that fetches the authorized remote
trunk and compares trunk's selected story section and active plan with the
execution branch's copy from the Take revision as base, answering
`unchanged`, `amended` (with the changed text and a clean application over
the branch's own plan edits) or `conflict`; an `absorb` that writes the clean
application into the workspace for the increment's commit; three gates in
published guidance, at the slice's plan update, the execution-complete record
and wrap-up's deletion, with the amended-source handling and the
`awaiting story review` stop; a controlled replay family covering the ODF-354
shape, a plan-only amendment, an unchanged source under unrelated trunk
advance and a conflict, credential-free first and then developer-run native
rounds; the ODF-354 record with the assessment, response revision, outcomes
per host, burden per boundary, release state and first-use criterion.

Excluded (the story's deferred promises): Trunk Mode; amendments not
published to remote trunk; amendments to other records; notifying the
developer; a semantic drift detector beyond the textual comparison, the
done-slice rule and the existing acceptance rules; rerunning the source-only
review for process alone; release or cross-project rollout; any compliance
or rate claim.

Assumptions: the executing coordinator reads and judges the result; the Take
revision is the base; amendments are commits on remote trunk; the story
section is addressable by its anchor and the plan by the Taken entry's link;
one fetch and comparison per boundary is a proportionate burden under ADR
0010; native rounds are paid and developer-run.

## Existing solutions and architectural direction

PFE: every part of the comparison exists except the boundary command and the
gates.

- [execution-source.mjs](../../../src/skills/dough-execute-plan/scripts/execution-source.mjs)
  already reads a revision's backlog, finds the identity's entry with its
  `href` and `plan.target`, and isolates the selected story section with
  `sectionOf(home, href)`; `show(cwd, rev, path)` reads a path at a revision.
  [execution-start-recovery.mjs](../../../src/skills/dough-execute-plan/scripts/execution-start-recovery.mjs)
  `sameSelectedSource` compares selected text, plan text and plan target; the
  start uses it to refuse a resumed claim whose published source changed. The
  new command reuses the reader and gives the comparison a Take base and a
  three-way result instead of equality.
- [publication-git.mjs](../../../src/skills/dough-execute-plan/scripts/publication-git.mjs)
  supplies `git`, `revParse`, `originTrackingRef` and `fetchedTarget`.
  Git supplies the rest: `git fetch`, `git merge-base` for the Take
  revision, `git merge-file -p` for the three-way application.
- [product-backlog-plan-reader.mjs](../../../src/skills/dough-product-backlog/scripts/product-backlog-plan-reader.mjs)
  `readPlanSlices` reads slice headings and statuses, which the done-slice
  rule compares between base, branch and trunk.
- The three gates are existing boundaries: [Deliver the change](../../../src/skills/dough-execute-plan/references/wrap-up.md#deliver-the-change)
  step 5 already runs `story-obligations.mjs check --slice N` before the done
  transition; [Record execution completion](../../../src/skills/dough-execute-plan/references/finish-or-stop.md#record-execution-completion)
  runs `check --completion` before the record;
  [Delete spent history](../../../src/skills/dough-story-wrap-up/SKILL.md#delete-spent-history-including-shared-records)
  deletes the story section and plan. The freshness command runs immediately
  before each. [Accept proof](../../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof)
  and [story obligations](../../../src/skills/dough-execute-plan/references/story-obligations.md)
  already define how an amended source is applied: human amendments outrank
  plan and return; a disposition quotes the story; `owner changed` records an
  authorized change. Nothing new is invented for applying the amendment.
- Git fixtures: [closure-git-fixtures.mjs](../../../src/skills/dough-story-wrap-up/scripts/closure-git-fixtures.mjs)
  (`createCleanTrunkFixture`, `advanceOriginFromAnotherWriter`,
  `publishStoryConflictingWithTrunk`, `executionBranch`) and
  [closure-story-conflict-cases.mjs](../../../src/skills/dough-story-wrap-up/scripts/closure-story-conflict-cases.mjs)
  already build a bare origin, an execution branch and a trunk that moved
  past it, and show `history-preserving-publication.mjs integrate` preserving
  a conflict. The baseline reproduction and the command's tests reuse them.
- Native proof: the `delivery-evidence` families
  (`tests/support/delivery-evidence-native-cases.sh`,
  `delivery-evidence-*-native-{scenario-content,observe,assess}.sh`,
  `delivery-evidence-native-prompt.sh`, `tests/delivery-evidence-native-routing.sh`,
  `tests/native-publication.md`) replay a slice delivery against an installed
  candidate with a declared-signal assessor and counterexamples; their
  fixture is a local `git init` workspace, so the new family adds the bare
  origin and execution branch the story-branch-closure fixture
  (`tests/support/story-branch-closure-native-fixture.sh`) already shapes.
- Accepted ADRs: [0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  (empiricism, proportionate burden), [0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  (edit `src/skills/`, release separately), [0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  (native proof per tool, no cross-host inference), [0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  (guidance addresses the executing agent), [0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  (judge the response against the stated baseline with its costs). ADR 0009
  (Git branching and integration) is Proposed and binds nothing here. No
  exception and no North Star topic.

## Preparation observations and decisive premises

Observed in this workspace on 2026-10-25 (Darwin arm64, base `c74db648`,
Bash 5.3 via `PATH="/opt/homebrew/bin:$PATH"`, Node 24.21.0 per
`.node-version`); scratch scripts ran from the job's temporary directory and
the workspace holds no scratch edit.

1. **The selected section is isolated from sibling edits.** A scratch Node
   script called `sectionOf(seed, href)` on this seed for this story's href:
   region lines 383–571, first line the anchor, last line the Architecture
   paragraph; the same call on the seed with a line added under
   `## Human-Owned Decisions` returned identical text (`false` for
   "unrelated seed edit changes section text"). Example 3's sibling edit
   therefore reads `unchanged`.
2. **The Take revision is the merge base.** In a `createCleanTrunkFixture`
   with a plan committed and pushed to both `main` and `exec/story`, then a
   branch commit marking slice 1 done, an unrelated trunk advance and a
   clone's plan amendment pushed to `main`: after `git fetch`,
   `git merge-base refs/remotes/origin/main HEAD` equalled the pushed Take
   commit (`forkIsTake: true`). Story Branch increments never reach trunk
   and trunk is never merged into the branch before closure, so the base
   needs no retained SHA.
3. **Three-way application discriminates the examples.** Same fixture:
   `git merge-file -p ours base theirs` with the branch's status edit and
   trunk's added slice 3 returned exit 0 with both `Status: done` and
   `3. C` present (`cleanAmendment: clean`); with trunk rewriting the slice
   1 heading the branch marked done it exited 1 (`conflict exit 1`). The
   base equalled trunk's text only before the amendment, so `unchanged` is
   base-equals-trunk, not branch-equals-trunk.
4. **A done slice rewritten away from the conflicting hunk is not a textual
   conflict.** `git merge-file` conflicts only on overlapping hunks, so an
   amendment to a done slice's body lines below its `Status:` line applies
   cleanly; the command therefore also compares `readPlanSlices` entries
   between base and trunk and reports `conflict` for a changed or removed
   slice the branch marks done (Current decision below). Settled by the
   construction of the rule, with its proof in slice 1.
5. **The Taken entry links the plan on trunk.** `PRODUCT-BACKLOG.md` on
   fetched trunk carries `([plan](slice-plans/…/PLAN.md))` on both Taken
   entries, and `readPublishedExecutionSource` refuses a Taken entry without
   its link, so the plan path is read from the fetched entry, not from the
   conversation.
6. **Guidance tests pin navigation, not wording.**
   `story-obligations-guidance.test.mjs` requires, within step 5 of Deliver
   the change, "Before marking the slice done or committing" followed by
   `story-obligations.mjs' check --plan '<PLAN.md>' --slice N` and "refusal
   blocks the done transition and commit"; the completion test requires
   `check --completion` before the fenced record example and "refusal blocks
   the execution-complete record … every open return, receiving, or interim
   … Then add this record"; `execution-completion-record-guidance.test.mjs`
   requires the wrap-up deletion section to keep "executable plan … even when
   the plan was retained or carries its execution-complete record". The new
   text goes before those phrases.
7. **Payload declaration.** `install.sh` `managed_files` lists each
   `dough-execute-plan/scripts/*.mjs` and reference individually (line 216
   declares `execution-start-source.mjs execution-source.mjs …`);
   `tests/payload-declaration-links.sh` checks relative links from declared
   files. The new script and reference must be declared.
8. **Credential-free routes run here.**
   `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs tests/delivery-evidence-native-routing.sh`
   passed quietly (exit 0).
9. **Host CLIs are present:** `claude`, `codex`, `cursor-agent` at
   `~/.local/bin`. Presence settles nothing about paid follow-through;
   slice 4's developer-run rounds are the probe.

Remaining paid premise, bounded by slice 4: that the controlled
`story-amended` fixture reproduces the unnoticed amendment under the
pre-gate guidance on the observed host, and that the gated guidance
surfaces and absorbs it. Its cheap prefix (fixture, discriminators, dispatcher)
is observed in slices 1 and 3; the rounds are developer-run.

## Outside-in proof ownership

| Promise (story) | Owner | Observable result |
| --- | --- | --- |
| Examples 1–4 (result): `unchanged`, `amended` with changed text and clean application, `conflict` naming both texts and the trunk revision | 1 | `source-freshness.test.mjs` on `createCleanTrunkFixture` cases: story promise and plan slice added → `amended`; plan-only edit over branch status edits → `amended` with merged text keeping `done`; sibling-section edit, unrelated files and a release commit → `unchanged`; rewritten or removed done slice → `conflict`; exit 0/1/2 |
| Rejection: no overwrite, nothing written to trunk, only the two records touched | 1 | `absorb` writes exactly the two paths' merged text into the working tree and refuses on `conflict`; origin trunk SHA unchanged after every case; a trunk-only file stays absent on the branch |
| Baseline (example 7, credential-free part): the ODF-354 shape conflicts at closure without the gate | 1 | A fixture test deletes the section and plan on the branch while trunk amended them and shows `history-preserving-publication.mjs integrate` returning `preserved`/`conflict` naming both paths |
| Gates (examples 1, 5, 6): the check runs before the obligations check, before the record, before deletion; `amended` is absorbed and applied through existing rules; `conflict` stops with `awaiting story review` | 2 | `source-freshness-guidance.test.mjs` pins navigation in the three sections; existing guidance tests and `tests/payload-declaration-links.sh` stay green; AGENTS.md behavior-review walkthrough recorded in the slice's acceptance |
| Controlled discriminators: assessor rejects silent whole-trunk merge, overwritten branch statuses, absorbed-without-disposition, auto-resolved conflict and a false `unchanged` | 3 | `tests/delivery-evidence-amended.sh`, `tests/delivery-evidence-native-routing.sh`, `tests/native-evidence-identity.sh` green through `scripts/test.sh` |
| Example 7 (native baseline) and examples 1, 2, 4 (native): gated guidance surfaces and absorbs or stops | 4 | Developer-run rounds per host recorded with limits; baseline round under the slice 1 payload reproduces the unnoticed amendment or records non-reproduction |
| Example 8: completion record | 4 | ODF-354 names the assessment, response revision, outcomes and limits per host, burden per boundary, release state and first-use criterion; no effectiveness claim |

Each slice runs its focused checks through `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh <paths>` (DD-330: env and quiet-pass rule), the consumer-trace record for changed contracts, and `tests/payload-declaration-links.sh` when declared files or links change. No whole-suite local gate is added; CI runs after publication.

## Ordered slices

### 1. A freshness command tells a Story Branch coordinator whether trunk amended the selected story or plan
Type: Behavior
Status: done
Proof: `src/skills/dough-execute-plan/scripts/source-freshness.test.mjs` through `scripts/test.sh` covers the four example shapes and the sibling-section case, the exit codes, `absorb`'s exact writes and refusal, unchanged origin trunk, and the closure-conflict baseline; `tests/payload-declaration-links.sh` green after declaring the script.

Behavior: Given an owned Story Branch workspace whose remote trunk holds the
identity as Taken with its plan link, when the coordinator runs
`node '<installed-execute-plan>/scripts/source-freshness.mjs' check --workspace <path> --identity <id> --remote <remote> --target-ref refs/heads/<trunk>`,
the command fetches the target, takes `merge-base(<fetched trunk>, HEAD)` as
the base, reads the backlog entry on fetched trunk for the story's href and
plan path, reads the selected section (by `sectionOf`) and the plan at base,
branch and trunk, and prints one JSON result: `unchanged` (exit 0) when both
trunk texts equal the base; `amended` (exit 1) with each changed record's
path, the trunk revision, the changed text and the clean three-way
application; `conflict` (exit 2) with both texts and the conflicting record
when `git merge-file` conflicts or a slice the branch marks done is changed
or removed on trunk. `absorb` with the same inputs writes the clean
application of both records into the working tree and refuses on
`conflict`, writing nothing. Neither command commits, pushes, or writes to
trunk or to any other path. A workspace whose fetched backlog does not list
the identity as Taken, or whose base holds no such entry, is refused with the
reason. Add the script to `install.sh` `managed_files`. Add one fixture test
for the baseline: branch deletes the section and plan, trunk amended them,
`history-preserving-publication.mjs integrate` preserves the conflict naming
both paths.

### 2. Delivery, completion and deletion gates surface the amendment before accepting or deleting the copy
Type: Behavior
Status: done
Proof: `src/skills/dough-execute-plan/scripts/source-freshness-guidance.test.mjs` pins that step 5 of Deliver the change runs `source-freshness.mjs' check` before `story-obligations.mjs' check --plan '<PLAN.md>' --slice N`, that Record execution completion runs it before `check --completion`, that wrap-up's deletion section runs it before deleting, and that each links the new reference; `story-obligations-guidance.test.mjs`, `execution-completion-record-guidance.test.mjs`, `planned-completion-guidance.test.mjs` and `tests/payload-declaration-links.sh` stay green.

Behavior: Given installed guidance and a Story Branch execution whose trunk
copy of the story section or plan changed after the Take, when the
coordinator reaches the slice's plan update, the execution-complete record or
wrap-up's deletion, the gate's result is in front of them before the
obligations check, the record or the deletion: on `unchanged` the boundary
continues; on `amended` the coordinator reads the changed text, runs
`absorb`, stages the two records with the increment, and applies the amended
source under Accept proof and story obligations (a new or changed promise is
a return or receives a named remaining slice; an amended exclusion settles
its obligation with the quote; an added slice becomes remaining work under
plan refinement, moving the execution-complete record when work reopens),
then reruns `check` until `unchanged`; on `conflict` the coordinator records
`awaiting story review` naming the record, both texts and the trunk
revision, delivers nothing dependent, keeps delivered slices and proof, and
stops under human judgment. Wrap-up on `amended` or `conflict` deletes
nothing and returns to execution's handling in the same session.

Edit `src/skills/` only: a new
`dough-execute-plan/references/source-freshness.md` holding the command, the
three results, `absorb`, the amended-source application and the conflict
stop, written for the executing agent (ADR 0006), Story Branch Mode only;
one sentence with the command at each of the three gates
(`wrap-up.md` step 5 before the existing obligations sentence,
`finish-or-stop.md` Record execution completion before `check --completion`,
`dough-story-wrap-up/SKILL.md` Delete spent history before the list), each
linking the reference; a row in `dough-execute-plan/SKILL.md`'s boundary
table where delivery is listed. Declare the reference in `install.sh`. Run
the AGENTS.md behavior-review walkthrough (invocation context, required
context, useful outcome including the conflict stop) on the reference and
record it in acceptance.

### 3. A controlled replay family discriminates surfaced from unnoticed amendments
Type: Behavior
Status: done
Proof: `tests/delivery-evidence-amended.sh` runs every scenario's controls through the observer and assessor without a host and proves each declared counter-signal is rejected; `tests/delivery-evidence-native-routing.sh` and `tests/native-evidence-identity.sh` green; `tests/git-publication-native.sh --native claude --case delivery-evidence/amended` refuses nothing at dispatch (dry route).

Behavior: Given the `amended` case registered in
`delivery-evidence-native-cases.sh` with scenarios `story-amended` (the
ODF-354 shape: a Decision-binding promise and an example added to the story
section and a slice added to the plan on trunk after the Take),
`plan-amended`, `unrelated-advance` (sibling-section edit, a release commit
and a trunk-only file) and `conflict` (a done slice rewritten on trunk), when
a coordinator at the slice's delivery boundary applies the installed
guidance in a fixture with a bare origin, an execution branch forked at the
Take and a workspace on it, the observation records per record whether the
branch copy equals trunk's text, whether `source-freshness.mjs check` and
`absorb` ran, the plan's statuses and obligations, whether the trunk-only
file reached the branch, the origin trunk SHA before and after, and the
response's `awaiting story review` naming. Assessor signals: `surfaced`
(result named in the stream), `absorbed-with-disposition`,
`statuses-preserved`, `trunk-unmerged`, `trunk-unchanged`,
`conflict-stopped`; counterexamples for a silent whole-trunk merge,
overwritten branch statuses, absorption without a disposition, an
auto-resolved conflict and a false `unchanged`. Neither prompt nor fixture
names what changed. Add `delivery-evidence-amended-native-{scenario-content,observe,assess}.sh`,
the prompt branch, fixtures under `tests/fixtures/delivery-evidence/amended-*`,
the routing-test entry and the `tests/native-publication.md` paragraph; the
fixture installs the candidate payload or a named revision's payload for the
baseline round.

### 4. Native rounds judge the response against the ODF-354 baseline, recorded at ODF-354
Type: Behavior
Status: done
Proof: retained attempts show the baseline round (slice 1 payload, Claude `story-amended`) accepting the slice without reading trunk, or record non-reproduction; the candidate rounds show Claude `story-amended` surfacing and absorbing with a disposition, Claude `conflict` stopping with `awaiting story review`, Codex and Cursor `story-amended` recorded per host; stream replay green; ODF-354 updated.

Behavior: Given the slice 3 family installed with the slice 2 candidate, when
the developer runs the named rounds, each retained attempt's raw stream,
command log, record comparison, plan statuses, obligations and response are
inspected by the coordinator, and the finding records the actual response
and its limits.

Developer-operated observation (question per round: under this payload, does
the coordinator surface a trunk amendment at the delivery boundary, and what
does it do with it?). Rounds, all named now, each one attempt with
`PATH="/opt/homebrew/bin:$PATH" native_case_deadline=300 native_case_grace=15 bash tests/git-publication-native.sh --native <host> --case delivery-evidence/amended --results-dir <ROOT>`
on the named scenario: baseline Claude `story-amended` at the slice 1
payload; candidate Claude `story-amended`, Claude `conflict`, Codex
`story-amended`, Cursor `story-amended`. Diagnose a failed or inconclusive
attempt before any retry, and retry only with a stated explanation. The
developer runs them because they are paid; the coordinator inspects every
retained attempt before accepting it and adds the maintained streams to the
corpus for `tests/native-stream-replay.sh`. A missing host round is a
recorded limit, not a claim; a baseline that surfaces the amendment without
the gate is recorded as non-reproduction and the benefit judgment names it.
Then update ODF-354: the assessment (the boundaries above and the recorded
Pygardon occurrence), the actual response revision, the containing release
(pending unless evidenced), each attempt's outcome and limit per host, the
burden observed (one fetch and comparison per boundary, records written,
rounds added), the first ordinary-use criterion (the first Story Branch
execution after adoption whose selected story section or plan is amended on
remote trunk after its Take), the avoided late repair it is judged against
under ADR 0010, and no effectiveness or saving claim. Run
`tests/payload-declaration-links.sh` and the focused checks. No release or
rollout is authorized.

## Current decisions

- One command, `source-freshness.mjs`, with `check` and `absorb`, beside the
  other execution scripts; it reads the backlog entry on fetched trunk and
  the base from `merge-base`, taking no retained SHA and no plan path from
  the caller.
- `unchanged` means trunk equals the base for both records, or trunk's
  change is already contained in the branch copy (its clean three-way
  application equals the branch copy), so a rerun after `absorb` passes as the
  story's gate acceptance ("the branch copy matches trunk's text") and
  examples 4–6 require. Branch edits alone never produce `amended`, since
  Story Branch increments do not reach trunk.
- The branch copy is the workspace's working tree, so an uncommitted edit of
  the slice being delivered survives `absorb`.
- Refusals exit 3 with a `reason`; exit 0/1/2 are unchanged/amended/conflict.
- `conflict` is a `git merge-file` conflict on either record, or a plan
  slice the branch marks `done` whose block the clean application changes or
  removes, judged with `readPlanSlices`. Everything else that changed is
  `amended`.
- `absorb` writes working-tree text only; the increment's existing commit and
  publication carry it. The story section is merged three-way like the plan
  and spliced back without touching sibling sections; since execution never
  edits it, its application is trunk's section word for word.
- Guidance scopes the gates to Story Branch Mode; the command itself is
  mode-agnostic Git.
- The native family's baseline installs the slice 1 payload so the
  comparison is gate-absent versus gate-present on the same fixture, as
  ADR 0010 asks.

## Story obligations

### G1. The freshness command is refused inside the Codex sandbox (discovered at slice 4 acceptance)
Reported: slice 4 — "In the candidate Codex `story-amended` round, `source-freshness.mjs check` was refused twice with `EPERM` on `mkdtemp` under the system temp directory and under `/tmp`; the coordinator reached the result only after pointing `TMPDIR` into the workspace's `.git`."
Story clause: "has the amended text in front of the execution
coordinator at the next slice delivery"
Disposition: proved by slice 4: `source-freshness.test.mjs` "with the system temporary directory unwritable, check and absorb compare inside the repository and leave only the records changed" (failed before the fix with the same `mkdtemp` refusal), and the Codex retry at `2b46202c` ran `check` without refusal (`tests/fixtures/native-streams/codex/delivery-evidence/amended/story-amended/20261025T135700-1825`).

## Learnings

- Slice 1: with the base fixed at the Take, `unchanged` defined only as
  trunk-equals-base would stay `amended` forever after `absorb`; slice 2's
  reference describes `unchanged` as in Current decisions. A second trunk
  amendment overlapping an absorbed first one reads as `overlapping-edit`
  conflict and stops for the human.
- Slice 2: the boundary table's "Before delivery" row has about 600 bytes
  of read-budget headroom; a future delivery-time reference goes inline in
  step 5 or behind a link.
- Slice 3: slice 4's rounds run from this checkout's harness. Baseline:
  `PATH="/opt/homebrew/bin:$PATH" native_case_deadline=300 native_case_grace=15 delivery_evidence_only_scenario=story-amended delivery_evidence_payload_revision=7fb2bf98 bash tests/git-publication-native.sh --native claude --case delivery-evidence/amended --results-dir <ROOT>`;
  candidate rounds omit `delivery_evidence_payload_revision` and set
  `delivery_evidence_only_scenario` to `story-amended` or `conflict` and
  `--native` to `claude`, `codex` or `cursor`. The observation's `payload:`
  line names the installed payload; a baseline round's evidence identity
  still hashes the candidate's `src/skills` inputs, so the `payload:` line is
  the baseline's identity. 7fb2bf98 must stay reachable (Story Branch
  integration preserves history). The fixture directory is now `de.XXXXXX`
  for every family so the agent's path names no case.

## Acceptance evidence

- Slice 1: source-only review by a fresh general-purpose agent given only the
  selected story section (extracted to the job's scratch `story.md`); its
  commitments R1–R9, C1–C4 and R18 (credential-free part) were compared with
  `source-freshness.test.mjs`: amended story and plan with exact `absorb`
  writes and an `unchanged` rerun (examples 1, R15); plan-only amendment
  keeping `done` statuses (example 2); sibling edit, unrelated files and a
  release commit `unchanged` with the trunk-only file absent (example 3, C2);
  rewritten and removed done slices `conflict` with both texts and the trunk
  revision, `absorb` writing nothing (example 4, R7, R16a, C1); origin trunk
  SHA unchanged per run (C1b); closure `integrate` preserving a conflict on
  seed and plan without the check (baseline). Untested refusals:
  `fetch-failed`, `trunk-absent`, `no-common-base`, `no-plan-link`,
  `record-absent`, `invalid-source-link`. Proof:
  `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/source-freshness.test.mjs`,
  `tests/payload-declaration-links.sh` and the install payload tests, all
  quiet passes after the refactor split.

- CI repair after slice 1 (run 40193361689, `test (2/3)`): the quiet-pass
  rule failed `tests/support/product-backlog-git-merge.test.mjs` because a
  fixture commit SHA began with the hex-only branch name `acbd` and Git
  warned the refname was ambiguous; the branches became `order-acbd` and
  `order-acdb`, and `commitBranch` documents the rule. Proof: a scratch repro
  warning for a hex-only name and not for an `order-` name, and
  `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/support/product-backlog-git-merge.test.mjs`
  quiet pass.
- Slice 2: the slice 1 source-only review's commitments were reused (story
  section unchanged; rerunning it for process alone is a deferred promise of
  this story) and compared with the gates: R10a step 5 runs `check` before
  the obligations check; R10b Record execution completion runs it before
  `check --completion`; R10c wrap-up's deletion runs it before deleting and,
  on `amended`/`conflict`, deletes nothing and returns to execution (example
  6); R11–R15 the reference's Absorb an amendment (read change, `absorb`,
  owned paths, dispositions, moved completion record, rerun to `unchanged`,
  examples 1, 2, 5); R16a–f Stop on a conflict (example 4). The reference is
  linked from the "Before finishing or stopping" table row; the "Before
  delivery" row stays under the read budget by carrying the command inline in
  step 5. AGENTS.md behavior review walked example 1 (amended at slice 3),
  example 4 (done-slice conflict stop) and example 6 (wrap-up returns to
  execution); missing inputs refuse with exit 3 and stop the boundary. Proof:
  `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/*/scripts/*guidance*.test.mjs tests/payload-declaration-links.sh`
  and the install payload tests, quiet passes after the refactor. Agent
  behavior under the guidance is slices 3–4's.

- Slice 3: the slice 1 source-only review's commitments R17a–d (four
  replay shapes) and the counterexample constraints C1–C2 were compared with
  `tests/delivery-evidence-amended.sh`: each scenario's premise is confirmed
  by the installed check (story-amended amended/amended, plan-amended plan
  only, unrelated-advance unchanged, conflict done-slice); controlled streams
  pass the assessor; silent whole-trunk merge, overwritten statuses,
  absorption without disposition, auto-resolved conflict and false
  `unchanged` are rejected as field rows and, except false `unchanged` and
  push-to-trunk, as observed real states; the unnoticed baseline is observed
  as `check-ran: false`. A stub-host dry dispatch of
  `tests/git-publication-native.sh --native claude --case delivery-evidence/amended`
  refused nothing and retained the 7fb2bf98 payload attempt. Proof:
  `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/delivery-evidence-amended.sh tests/delivery-evidence-native-routing.sh tests/native-evidence-identity.sh`
  and `... tests/native-*.sh tests/git-publication-native*.sh tests/delivery-evidence-*.sh tests/proof-scheduling-native.sh tests/payload-declaration-links.sh`,
  quiet passes after the refactor. Native agent behavior and Codex/Cursor
  stream shapes are slice 4's.

- CI repair after slice 3 (run 40196634857, `test (3/3)`): an unhandled
  `EPIPE` crashed `execution-increment-fresh-publication.test.mjs` when a
  rejecting pre-commit hook made `git commit -F -` exit before reading its
  message. `publication-git.mjs` `execWithInput` now writes child input and
  ignores stdin `EPIPE`, used by `execution-increment-preparation.mjs`,
  `agent-commit.mjs` and `workspace-agent-authorship.mjs`. New ~320 KB-message
  hook-rejects tests in `execution-increment-fresh-commit.test.mjs` and
  `agent-commit.test.mjs` failed on the old files and pass now; proof
  `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/execution-increment*.test.mjs src/skills/dough-execute-plan/scripts/agent-commit.test.mjs`
  quiet pass.

- Slice 4: the source-only review's R18 and R19a–g were compared with the
  retained rounds and ODF-354. Baseline Claude `story-amended` at the slice 1
  payload left the amendment unnoticed (check never ran, story copy at the
  Take); candidate Claude `story-amended`, Claude `conflict` and Cursor
  `story-amended` passed; Codex `story-amended` was refused by its sandbox
  (G1) and, after the fix, retried once with that stated explanation: correct
  behavior, failing only on the assessor's literal `amended` wording, a
  harness fault corrected to the plan's declared signal (`amend` word stem;
  unchanged-only and unnamed responses still rejected) and recorded openly in
  ODF-354. Six attempts joined the replay corpus. ODF-354 records the
  assessment, response revisions, pending release, per-host outcomes and
  limits, burden per boundary, first ordinary-use criterion and the avoided
  late repair, with no effectiveness claim. Proof:
  `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/delivery-evidence-amended.sh tests/delivery-evidence-native-routing.sh tests/native-evidence-identity.sh tests/native-stream-replay.sh tests/native-assessor-counterexample-guard.sh src/skills/dough-execute-plan/scripts/source-freshness.test.mjs`,
  the wider native subset and `tests/payload-declaration-links.sh`, quiet
  passes. Limits: one attempt each; plan-amended, unrelated-advance and
  Codex/Cursor conflict not run natively.

## Plan concerns and readiness

Refinement was not needed: each slice owns one proof loop (command,
gates, discriminators, paid rounds and record), the gates depend on the
command and the rounds on the family, and no slice combines independent
outcomes. Remaining slice-specific concerns: none identified. The only
unsettled premise is paid and bounded by slice 4's developer-run rounds,
whose non-reproduction changes the benefit judgment, not the mechanism.

## Execution complete

Product advice: Execute the queued correction
[SEED-010#source-freshness-for-planless-and-reamended-work](../../seeds/SEED-010-learn-from-execution-retrospectives.md#source-freshness-for-planless-and-reamended-work)
(plan 357) before the next release: the Story Branch freshness gates refuse
quick stories and plan-homed corrections (`no-plan-link`) and read a second
amendment over absorbed text as a false conflict. Otherwise no product change;
the first ordinary-use criterion at ODF-354 stays the next observation.
