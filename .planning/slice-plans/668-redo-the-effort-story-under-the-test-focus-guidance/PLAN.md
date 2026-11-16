# Redo the effort story under the test-focus guidance

**Source:** [selected story](../../seeds/SEED-391-check-test-focus-guidance-by-redoing-a-story.md#redo-the-effort-story-under-the-test-focus-guidance)
**Identity:** SEED-391#redo-the-effort-story-under-the-test-focus-guidance

## Goal and scope

Give Terry a keep, revise or remove recommendation for each of the five edits
in `934a51a30`, each resting on a moment observed in a rerun of
SEED-388#show-the-effort-a-launch-runs-with. The story section owns the
scope, the five edits and their moments, the limits and the key examples;
this plan adds none.

This story changes no product code, test or guidance. Its increments are this
plan's recorded observations. Everything B and P write stays in scratch
repositories under `~/open-dough-scratch/seed-391/`, outside this repository
and its worktrees.

Assumptions: A's transcript and Git history stay as observed below; Terry's
revision of the guidance follows this story and is not part of it.

## Existing solution and direction

PFE result: nothing is added to the product. The rerun reuses what exists:

- A's evidence: commits `4b75c2888..c741f265f`, and transcript
  `~/.claude/projects/-Users-terryyin-git-open-dough--worktrees-show-and-keep-the-effort-a-claude-code-launch-ru/fa9d77b7-c44c-4f51-9e03-d7b0073a5c6e.jsonl`
  with its `subagents/` directory.
- The launch form: `claude --bg` as `dashboard/server/hosts/claude/launch.ts`
  builds it, with `--model opus --effort medium`, from the scratch clone.
- Cost and active time: the transcript layout, prices and cache rules in the
  user memory `claude-session-cost-analysis-facts`, applied identically to A,
  B and P.

No ADR or North Star topic applies.

## Current decisions

- **Scratch B.** `~/open-dough-scratch/seed-391/b-remote.git` is a bare
  repository holding `main` at `4b75c2888` plus one commit that applies
  `git diff 934a51a30^ 934a51a30 -- Distribution/src/skills` to `.agents/skills`
  and `.claude/skills` (`git apply -p4 --directory=<dir>`), and the story branch
  `claude/show-and-keep-the-effort-a-claude-code-launch-ru` at that commit.
  `~/open-dough-scratch/seed-391/b` is a clone of it on that branch; `origin`
  is the bare repository and no other remote exists. The patch is committed
  so B starts from a clean workspace.
- **B's instruction** is A's first message
  (`/dough-execute-plan SEED-388#show-the-effort-a-launch-runs-with` with its
  `Established start` block) with `workspace` set to the clone,
  `publishedSha`, `candidateSha` and `startingRevision` set to the patched
  commit, the `Dashboard reporting context` block removed, and one added
  line: `No publication authority: deliver local-only. Stop at the
  execution-complete record.` Nothing else is added.
- **Memory.** Before launch, copy
  `~/.claude/projects/-Users-terryyin-git-open-dough/memory/` to the memory
  directory Claude Code derives for the clone path, so B reads the memory A's
  successor sessions read.
- **Scratch P.** The same construction at `0e6b0f3dc`: plan directory `664-…`
  removed, the effort story's state block set to
  `{"schemaVersion":1,"refinement":"refined","approach":"unselected"}`, the
  patch applied, all in one commit on `main` of `p-remote.git`, cloned to
  `~/open-dough-scratch/seed-391/p`. Its instruction:
  `/dough-slice-planning SEED-388#show-the-effort-a-launch-runs-with` with
  `Plan only. Publish and announce nothing.` It runs on `opus` at `medium`,
  as the original preparation session `7ec559bb-…` did.
- **One at a time.** P starts after B has finished, so P's scratch test run
  does not load B's.
- **The executing session stays out of B and P.** It sends no message to
  either session after launch. A session that stops with a question is
  recorded as stopped at that point; its question is quoted in the result.
- **Retention.** The scratch directories and B's and P's transcripts stay
  until wrap-up, which removes them after Terry has read the result.

## Proof ownership

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| One variable; a session that does not know the comparison; nothing leaves the scratch workspace | 1: `git -C b diff --stat 4b75c2888 HEAD` lists only the eight installed guidance files; B's first transcript rows show `claude-opus-5-5`, `medium`, the loaded memory index and the instruction above; `git ls-remote origin` in this repository shows no `show-and-keep-the-effort` ref and `main` unchanged by B |
| Tests edited outside effort, loosened or value-updated; assertions added; branching parameterized tests | 2: table built from `git -C b diff <patched commit>..<B's last slice commit>` beside the same table from `git diff 4b75c2888 eda73008b` |
| Refactor brief, refactor return, follow-up carried into learnings | 3: quoted from B's coordinator transcript and its refactor subagent transcript, and B's `PLAN.md` at its execution-complete commit, beside A's from `fa9d77b7-…` |
| Active time and cost of B beside A's | 3: one method over both transcript sets, stated with the result |
| Planning puts a Structure slice ahead of the change, or budgets the updates again | 4: P's written plan, quoted |
| A recommendation per edit, with limits | 5: the `## Result` section of this plan |
| B stops early | The slice that meets it records how far B reached; later moments are recorded not exercised |

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| The guidance patch applies to the installed skill copies of the old revision | Slice 1 scratch construction | 2026-11-16, detached scratch worktree at `3b1479996`: `git diff 934a51a30^ 934a51a30 -- Distribution/src/skills \| git apply --check -p4 --directory=.agents/skills -` and the same for `.claude/skills` → both apply. The Take `4b75c2888` changes only `.planning/PRODUCT-BACKLOG.md` and `.planning/agents/yui-chan.json` (`git diff --stat 3b1479996 4b75c2888`), so the result holds there. Worktree removed. |
| The trunk commit carries the same guidance the seed first named | Slice 1 patch source | `git patch-id` of `321e622c6` and `934a51a30` over `Distribution/src/skills` are equal (`3b6ce2a2…`). |
| A's instruction, model, effort and evidence are readable | Slices 1–3 | Transcript `fa9d77b7-…`: first message is the instruction quoted above; 340 responses, all `claude-opus-5-5` at `medium`; permission mode `auto`; Claude Code `2.1.325`, the version installed now; 20 subagent transcripts. |
| The old plan and the refined story exist where B and P read them | Slices 1, 4 | `git ls-tree 3b1479996` holds `.planning/slice-plans/664-show-the-effort-a-launch-runs-with/PLAN.md`; `0e6b0f3dc` holds the story section with state `refined`. |
| Dependencies resolve as they did for A | B's and P's own setup | `git diff --stat 3b1479996 HEAD -- package.json package-lock.json dashboard/package.json dashboard/package-lock.json .node-version` → empty. |
| An execution of the 0.3.102 skills accepts this `Established start` in a clone with a local bare remote and local-only authority, and reads the copied memory | Slice 1 launch | Not observable without starting the paid session. Slice 1 is the probe: it settles this before B's result is relied on, and its failure stops slices 2–5. |

## Concerns

Slice-plan refinement was not needed: one probe, three independent readings
of the reruns and one result, each with its own proof. Remaining concern,
bounded by the slice 1 probe: whether the old execution skills start from
this scratch construction. This review found no other slice-specific concern.

## Ordered slices

Each slice targets 15 active minutes; time waiting on B or P is command time.
The [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
governs any failure, including one inside B or P, which is recorded and not
repaired from outside. Local gate: this story runs no test of its own; it
keeps the machine awake for B's and P's runs by starting on AC power and
wrapping the wait in `caffeinate -s -i`
([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)).
B's and P's sessions are the story's own paid runs, authorized by its
execution; no paid native-host test is run.

### 1. The rerun starts blind, on one changed variable, inside its scratch remote
Type: Behavior
Status: planned
Proof: slice 1 row above.

Behavior: the scratch construction under Current decisions exists and B is
launched → B's session accepts its start and delegates the effort plan's
slice 1, on A's model and effort with memory loaded, and the real remote
holds nothing from it. Probe: when B refuses the start or stops before its
first delegation, record the quoted stop, end B, and stop this plan for
replanning.

### 2. B's test changes are read beside A's
Type: Behavior
Status: planned
Proof: slice 2 row above.

Behavior: B has recorded execution completion or stopped → this plan holds,
for A and for B, each test file edited that is not about effort with
"loosened" or "value updated", each positional, count, whole-list or
whole-object assertion added, and each parameterized test whose body branches
on its case.

### 3. B's refactor pass, brief, follow-up, time and cost are read beside A's
Type: Behavior
Status: planned
Proof: slice 3 rows above.

Behavior: B has finished → this plan quotes B's slice 1 refactor brief, the
refactor return's candidates and named follow-ups, and the learnings B's plan
carries, each beside A's, and states active time and cost for both with the
method used.

### 4. The planning replay shows how the effort story is planned now
Type: Behavior
Status: planned
Proof: slice 4 row above.

Behavior: B has finished and scratch P exists → P's session writes its plan
or stops → this plan quotes how P treats the consumers of the server default:
a Structure slice ahead of the change, a budgeted update, or neither, with
P's cost.

### 5. Each guidance edit has a recommendation
Type: Behavior
Status: planned
Proof: a `## Result` section holding five rows.

Behavior: slices 2–4 are recorded → `## Result` gives each edit its observed
moment, then keep, revise (naming the wording that failed) or remove, or
"not exercised"; it states the story's limits, including whether B's value
updates followed the old plan's instruction, and lists what Terry reads
first.
