# Redo the effort story under the test-focus guidance

**Source:** [selected story](../../seeds/SEED-391-check-test-focus-guidance-by-redoing-a-story.md#redo-the-effort-story-under-the-test-focus-guidance)
**Source review:** [independent promises](source-review.md)
**Identity:** SEED-391#redo-the-effort-story-under-the-test-focus-guidance

## Goal and scope

Give Terry a keep, revise or remove recommendation for each of the five edits
in `934a51a30`, each resting on a moment observed in a rerun of
SEED-388#show-the-effort-a-launch-runs-with. The story section owns the
scope, the five edits and their moments, the limits and the key examples;
this plan adds none.

The trial changes no product code, test or guidance. Separate mandatory
CI repairs follow the failure policy and do not enter the frozen trial
inputs. Its research increments are this plan’s recorded observations.
Everything B and P write stays in scratch
repositories under `~/open-dough-scratch/seed-391/`, outside this repository
and its worktrees.

Assumptions: A's transcript and Git history stay as observed below; Terry's
revision of the guidance follows this story and is not part of it.

## Existing solution and direction

PFE result: nothing is added to the product. The rerun reuses what exists:

- A's evidence: commits `4b75c2888..c741f265f`, and transcript
  `~/.claude/projects/-Users-terryyin-git-open-dough--worktrees-show-and-keep-the-effort-a-claude-code-launch-ru/fa9d77b7-c44c-4f51-9e03-d7b0073a5c6e.jsonl`
  with its `subagents/` directory.
- Codex-first launch: `codex exec --json` from the scratch clone, with no
  model/effort override. Configured defaults at amendment: `gpt-6.1-sol`,
  `xhigh`; confirm effective values from native session metadata.
- A's billing uses `claude-session-cost-analysis-facts`; Codex uses its own
  recorded usage/billing evidence. Apply one stated time definition where
  the logs permit it. Missing Codex cost remains unavailable.

No ADR or North Star topic applies.

## Current decisions

- Terry authorized Codex first. B/P use configured Codex defaults; this is
  cross-host mechanism evidence, not a guidance-only A/B effect estimate.
- B is frozen: patched start `c629d0d9`, last product/test commit `8b9005acc`,
  execution completion `57f805ee2`; local scratch origin only. Its extra
  product retrospective is retained as G2 for the final evaluation.
- P follows B, plan only. No comparison knowledge or follow-up input is given
  to either participant. Scratch artifacts stay until Terry reads the result.
- [Execution context](execution-context.md) retains exact workspace, branch,
  published revisions, observer, setup, scratch construction and prompt protocol.
- Mandatory owned CI correction is slice 2; [its input](ci-repair.md) and
  [pause/restoration context](execution-context.md#owned-ci-interruption-2026-11-16)
  preserve the completed work and research agent's seven active minutes.

## Proof ownership

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| Historical patch; blind Codex session; scratch containment | 1: `git -C b-codex diff --stat 4b75c2888 HEAD` lists only the eight installed guidance files; B's native metadata records Codex's effective model/effort, available context and the [exact instruction](execution-context.md#current-decisions); `git ls-remote origin` in this repository shows no `show-and-keep-the-effort` ref and `main` unchanged by B |
| Tests edited outside effort, loosened or value-updated; assertions added; branching parameterized tests | 3: table built from `git -C b-codex diff <patched commit>..<B's last slice commit>` beside the same table from `git diff 4b75c2888 eda73008b` |
| Refactor brief, refactor return, follow-up carried into learnings | 4: quoted from B's coordinator transcript and its refactor subagent transcript, and B's `PLAN.md` at its execution-complete commit, beside A's from `fa9d77b7-…` |
| Active time and provider-specific usage/cost of B beside A's | 4: stated transcript time definition, provider-specific recorded billing basis, and explicit unavailable values |
| Planning puts a Structure slice ahead of the change, or budgets the updates again | 5: P's written plan, quoted |
| A recommendation per edit, with limits | 6: the `## Result` section of this plan |
| B stops early | The slice that meets it records how far B reached; later moments are recorded not exercised |

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| The guidance patch applies to the installed skill copies of the old revision | Slice 1 scratch construction | 2026-11-16, detached scratch worktree at `3b1479996`: `git diff 934a51a30^ 934a51a30 -- Distribution/src/skills \| git apply --check -p4 --directory=.agents/skills -` and the same for `.claude/skills` → both apply. The Take `4b75c2888` changes only `.planning/PRODUCT-BACKLOG.md` and `.planning/agents/yui-chan.json` (`git diff --stat 3b1479996 4b75c2888`), so the result holds there. Worktree removed. |
| The trunk commit carries the same guidance the seed first named | Slice 1 patch source | `git patch-id` of `321e622c6` and `934a51a30` over `Distribution/src/skills` are equal (`3b6ce2a2…`). |
| A's instruction, model, effort and evidence are readable | Slices 1, 3–4 | Transcript `fa9d77b7-…`: first message is the instruction retained in [execution context](execution-context.md#current-decisions); 340 responses, all `claude-opus-5-5` at `medium`; permission mode `auto`; Claude Code `2.1.325`, the version installed now; 20 subagent transcripts. |
| The old plan and the refined story exist where B and P read them | Slices 1, 5 | `git ls-tree 3b1479996` holds `.planning/slice-plans/664-show-the-effort-a-launch-runs-with/PLAN.md`; `0e6b0f3dc` holds the story section with state `refined`. |
| Dependencies resolve as they did for A | B's and P's own setup | `git diff --stat 3b1479996 HEAD -- package.json package-lock.json dashboard/package.json dashboard/package-lock.json .node-version` → empty. |
| Codex running the patched 0.3.102 skills accepts this `Established start` in a clone with local bare remote and local-only authority | Slice 1 launch | The Claude attempt refused trust before a session existed. Codex CLI 0.169.0 is installed; configured defaults are `gpt-6.1-sol` / `xhigh`, approval `never`, sandbox `danger-full-access`. Native startup, effective settings and first delegation remain bounded by slice 1's probe. No trust or permission bypass is added. |

## Concerns

Codex-first refinement retains all five cohesive boundaries: one native
startup probe, three independent readings of the reruns and one result.
The failed Claude launch used about three active minutes and no paid
session; the amended probe keeps that history and uses a separate clone.
The remaining native-start uncertainty is bounded by slice 1, including
Codex's ability to use the old skill's delegation contract. No product
solution, architecture or observation moment changes. Host/model/context
and provider billing differences are explicit limits, not guidance effects.

## Ordered slices

Each slice targets 15 active minutes; time waiting on B or P is command time.
The [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
governs any failure, including one inside B or P, which is recorded and not
repaired from outside. Local gate: the trial runs no test of its own; it
keeps the machine awake for B's and P's runs by starting on AC power and
wrapping the wait in `caffeinate -s -i`
([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)).
B's and P's sessions are the story's own paid runs, authorized by its
execution; no paid native-host test is run.
The independent CI correction uses [its local gate](ci-repair.md#remaining-proof-and-ownership).

### 1. The Codex rerun starts blind on the historical patch inside its scratch remote
Type: Behavior
Status: done
Proof: slice 1 row above.

Behavior: the [scratch construction and prompt protocol](execution-context.md#current-decisions) exist and B is
launched → B's session accepts its start and delegates the effort plan's
slice 1, on recorded Codex defaults with its ordinary user context, and the real remote
holds nothing from it. Probe: when B refuses the start or stops before its
first delegation, record the quoted stop, end B, and stop this plan for
replanning.

### 2. Shared cold inputs leave navigation its default case budget
Type: Structure
Status: done
Proof: [owned CI correction and proof](ci-repair.md).

Behavior: a preview worker prepares immutable app/server inputs in the existing
cold-input worker lifetime before its cases run; a boundary-only worker
prepares no app. Relative browser/API URLs, test facts, isolation and all
existing scenario assertions remain intact. No case/hook timeout changes.
Reuse `prepareServerInputs` and the globally declared worker-fixture pool;
settle compatibility of existing `serverMode` consumers before changing scope.
The later known hook-only dashboard startups remain a separate diagnosis,
not an excuse to add an eager app dependency or redesign browser addressing.

This mandatory CI interruption preserves the two already-proved repair edits.
After local proof/refactoring, publish progress without a done mark if hosted
proof is still pending; the existing observer must validate the actual repair.
All 19 failed navigation cases and the Cursor-survivor consequence stay owned
until their demonstrated repair and applicable CI are accepted. A passing
unchanged local run is no disposition. If the same failures remain after this
changed condition, retain them and refine only the affected remaining repair.

Hosted acceptance: exact repair `d59ab3e8`, run 43899583428/1, success;
[proof and restoration](ci-repair.md#applicable-hosted-acceptance).
Refactor disposition for this completion update: records-only.

### 3. B's test changes are read beside A's
Type: Behavior
Status: done
Proof: slice 3 row above.

Behavior: B has recorded execution completion or stopped → this plan holds,
for A and for B, each test file edited that is not about effort with
"loosened" or "value updated", each positional, count, whole-list or
whole-object assertion added, and each parameterized test whose body branches
on its case.

### 4. B's refactor pass, brief, follow-up, time and cost are read beside A's
Type: Behavior
Status: done
Proof: slice 4 rows above.

Behavior: B has finished → accessible first-refactor briefs, returned
candidates/follow-ups and completion learnings are recorded beside A’s, with
timing/usage/cost methods and unavailable values explicit. G3 owns the original
B brief’s readability prerequisite for the final guidance judgment.

### 5. The planning replay shows how the effort story is planned now
Type: Behavior
Status: done
Proof: slice 5 row above.

Behavior: B has finished and scratch P exists → P's session writes its plan
or stops → this plan quotes how P treats the consumers of the server default:
a Structure slice ahead of the change, a budgeted update, or neither, with
P's cost.

### 6. Each guidance edit has a recommendation
Type: Behavior
Status: planned
Proof: a `## Result` section holding five rows.

Behavior: slices 3–5 are recorded → `## Result` gives each edit its observed
moment, then keep, revise (naming the wording that failed) or remove, or
"not exercised"; it states the story's limits, including whether B's value
updates followed the old plan's instruction, and lists what Terry reads
first.

## Accepted execution evidence

[Observations](execution-observations.md) retain the quoted Claude trust
refusal, Codex native settings/delegation/terminal proof, containment limits
and acceptance comparison. Slice 1 was published at
`5ea5ca123ecc8b5b87321adb69a3920bcec8f732`; G1 is proved. Original source and
review history stay linked; all ordered statuses and obligation provenance
are preserved.

## Story obligations

### G1. Scratch launch refused before execution; Codex-first retry authorized
Reported: slice 1 — "The single native Claude launch returned exit 1: Workspace not trusted. No B session, transcript or first delegation exists; the slice 1 probe stopped before execution. Terry subsequently authorized Codex first; the amended probe owes execution in a separate clone."
Story clause: "One fresh Codex session executes"
Disposition: proved by slice 1: b-codex-terminal-proof.json; native thread 01a1e48a-0078-76a1-929a-c853646f3acc accepted the blind start, delegated implementation, and exited 0 at clean execution-complete commit 57f805ee2596619f80e007b9f2eff248cc5da112; no push and guard stopped. Protocol deviation is retained separately as G2.
Commitment: 1


### G2. B exceeded the no-retrospective protocol
Reported: slice 1 — "B performed a coordinator product retrospective at 14:38:18.047–14:40:14.840 UTC, although the trial source excludes it. The exact prompt stopped at the execution-complete record without disabling the skill's earlier retrospective. Only eight plan lines changed after the fourth slice commit; product/test observations are pinned before this extra review."
Story clause: "no wrap-up, retrospective or landing."
Disposition: receiving slice 6


### G3. Original Codex refactor brief is not readable
Reported: slice 4 — "B’s first refactor message is encrypted in its root and child logs. Supported native thread/read for both omits its plaintext. Count/remedy wording is unobserved; the final judgment needs readable source or an explicit changed promise. The operator requested the developer’s choice while independent work continues."
Story clause: "The coordinator's slice 1 refactor brief"
Disposition: receiving slice 6
Commitment: 6
### G4. Intermediate refactor messages are encrypted
Reported: slice 4 — "Intermediate candidate discussion is encrypted, although the final first-refactor return and actual changed files are readable."
Story clause: "An Open Dough maintainer can decide, edit by edit"
Disposition: no user cost "The story's outcome is that evidence and a recommendation per edit": the final return supplies the requested candidate dispositions and named-follow-up result, with actual diff and completion learnings; intermediate private analysis is not a required deliverable.

## Research evidence acceptance

- Slice 3: [frozen test inventory](test-inventory.md), ids 8–13 accepted.
- Slice 4: [refactor and measurements](refactor-and-metrics.md), ids 14–16
  accepted as provider usage, defined proxies and explicit unavailable totals.
  [Observation history](execution-observations.md) retains the comparisons.
  B’s original brief remains G3; final returns supply candidate evidence.
- Refactor disposition for these updates: records-only.
- Slice 5: [planning replay](planning-replay.md), commitment 2 accepted:
  P's Structure slice 2 immediately precedes the default Behavior slice 3.
