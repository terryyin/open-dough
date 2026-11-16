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
- Codex-first launch: `codex exec --json` from the scratch clone, with no
  model/effort override. Configured defaults at amendment: `gpt-6.1-sol`,
  `xhigh`; confirm effective values from native session metadata.
- A's billing uses `claude-session-cost-analysis-facts`; Codex uses its own
  recorded usage/billing evidence. Apply one stated time definition where
  the logs permit it. Missing Codex cost remains unavailable.

No ADR or North Star topic applies.

## Current decisions

- **Execution resume (2026-11-16).** Story Branch Mode in
  `/Users/terryyin/git/open-dough/.worktrees/redo-the-effort-story-under-the-test-focus-guida`,
  branch `codex/redo-the-effort-story-under-the-test-focus-guida`, agent
  Aino-chan, publisher `dashboard-territory.local-open-dough`. Established
  Take/candidate `72c22dfe813bf250426c9032cfae75e3e8663459` is published on
  `origin/main` and the execution branch; starting revision
  `4e9cc50ba81cf93a6ba1bc5784f964c207dcac7c`. The originating/default checkout
  is `/Users/terryyin/git/open-dough`; all work stays in the established
  owned worktree. No new claim or workspace is created. Existing planning
  authority is retained; no explicit replan override was supplied.
- **Checkout readiness.** Selected Node `24.21.0` matches `.node-version`.
  `node scripts/setup-native.mjs npm` completed a locked install here;
  `npm run lint -- --staged` exited 0. The tracked pre-commit hook is
  check-only; `npm run format` selects changed files. AC power confirmed
  before the scratch runs.
- **CI observer.** GitHub Actions `terryyin/open-dough`, push workflow
  `ci.yml` (`CI`, id `351271804`), execution-branch target
  `codex/redo-the-effort-story-under-the-test-focus-guida`. Codex coordinator
  `aino-seed391`, stream cell `g660:13`, session `32972`, PID `69942`,
  directory `/tmp/dough-ci-501/watch-kLDg1n`, execution checkout above.
  That stream was stopped at the initial Claude refusal. On the Codex-first
  resume, the same coordinator rearmed stream cell `g666:8`, session `63725`,
  PID `59140`, directory `/tmp/dough-ci-501/watch-nVUAv2`; the old directory
  is terminal `stopped`. The established Take's trunk CI remains unobserved
  by this branch observer.

- **Codex-first amendment (2026-11-16).** Terry authorized Codex first after
  the native Claude trust refusal. B and P now run on Codex defaults; the
  five slices and guidance observations remain. This is cross-host mechanism
  evidence, not a controlled one-variable A/B result. Preserve the refused
  Claude setup unchanged. No trust-setting change or Claude retry is needed
  for this Codex path. The matched Claude replay remains pending its trust
  prerequisite after the Codex-first run; no earlier authority is withdrawn.
- **Scratch B.** `~/open-dough-scratch/seed-391/b-codex-remote.git` is a bare
  repository holding `main` at `4b75c2888` plus one commit that applies
  `git diff 934a51a30^ 934a51a30 -- Distribution/src/skills` to `.agents/skills`
  and `.claude/skills` (`git apply -p4 --directory=<dir>`), and the story branch
  `claude/show-and-keep-the-effort-a-claude-code-launch-ru` at that commit.
  `~/open-dough-scratch/seed-391/b-codex` is a clone of it on that branch; `origin`
  is the bare repository and no other remote exists. The patch is committed
  so B starts from a clean workspace.
- **B's instruction** is A's first message
  (`/dough-execute-plan SEED-388#show-the-effort-a-launch-runs-with` with its
  `Established start` block) with `workspace` set to the clone,
  `publishedSha`, `candidateSha` and `startingRevision` set to the patched
  commit, the `Dashboard reporting context` block removed, and one added
  line: `No publication authority: deliver local-only. Stop at the
  execution-complete record.` Use `$dough-execute-plan` for Codex and supply
  the installed scratch skill path; add no comparison information.
- **User context.** Preserve the copied Claude memory from the refused
  attempt, but do not inject it into Codex as if it were native equivalent
  context. B and P use ordinary Codex user context. Record what their
  transcripts actually show; no claim of memory parity with A.
- **Scratch P.** The same construction at `0e6b0f3dc`: plan directory `664-…`
  removed, the effort story's state block set to
  `{"schemaVersion":1,"refinement":"refined","approach":"unselected"}`, the
  patch applied, all in one commit on `main` of `p-codex-remote.git`, cloned to
  `~/open-dough-scratch/seed-391/p-codex`. Its instruction:
  `$dough-slice-planning SEED-388#show-the-effort-a-launch-runs-with` with
  `Plan only. Publish and announce nothing.` It uses ordinary Codex defaults,
  with effective model/effort recorded; it is not the original Claude
  preparation session's model/effort.
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
| Historical patch; blind Codex session; scratch containment | 1: `git -C b-codex diff --stat 4b75c2888 HEAD` lists only the eight installed guidance files; B's native metadata records Codex's effective model/effort, available context and the instruction above; `git ls-remote origin` in this repository shows no `show-and-keep-the-effort` ref and `main` unchanged by B |
| Tests edited outside effort, loosened or value-updated; assertions added; branching parameterized tests | 2: table built from `git -C b-codex diff <patched commit>..<B's last slice commit>` beside the same table from `git diff 4b75c2888 eda73008b` |
| Refactor brief, refactor return, follow-up carried into learnings | 3: quoted from B's coordinator transcript and its refactor subagent transcript, and B's `PLAN.md` at its execution-complete commit, beside A's from `fa9d77b7-…` |
| Active time and provider-specific usage/cost of B beside A's | 3: stated transcript time definition, provider-specific recorded billing basis, and explicit unavailable values |
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
repaired from outside. Local gate: this story runs no test of its own; it
keeps the machine awake for B's and P's runs by starting on AC power and
wrapping the wait in `caffeinate -s -i`
([machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)).
B's and P's sessions are the story's own paid runs, authorized by its
execution; no paid native-host test is run.

### 1. The Codex rerun starts blind on the historical patch inside its scratch remote
Type: Behavior
Status: done
Proof: slice 1 row above.

Behavior: the scratch construction under Current decisions exists and B is
launched → B's session accepts its start and delegates the effort plan's
slice 1, on recorded Codex defaults with its ordinary user context, and the real remote
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
carries, each beside A's, and states active time plus provider-specific usage/cost for both with the
method used and unavailable values explicit.

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

## Slice 1 observation — native launch refused before the session started

2026-11-16 13:11:57 UTC: the one authorized B launch returned exit 1:

> Workspace not trusted. Run `claude` in /Users/terryyin/open-dough-scratch/seed-391/b once and accept the trust prompt, then retry.

No native session ID was printed, and the B project directory contained no
`*.jsonl` transcript after the refusal. B therefore reached neither the
installed execution skill nor its first delegation. Model/effort and memory
loading inside a running session are unobserved; only the requested launch
arguments and copied memory are proved. The slice 1 probe's stop rule applies:
no trust setting was changed, no retry was launched, P was not started, and
the five guidance moments remain unexercised. Slices 2–5 were held at that stop; the Codex-first amendment above reopens
the slice 1 probe through a separate scratch clone.

Construction retained outside the repository:

- Workspace: `/Users/terryyin/open-dough-scratch/seed-391/b`.
- Bare origin: `/Users/terryyin/open-dough-scratch/seed-391/b-remote.git`.
- Historical base: `4b75c28885e49ace352561cad01907926e066fdd`.
- Patched start/terminal HEAD: `c629d0d938528e5ef0923b9ef041abb19b4c0751`.
  Both bare `main` and
  `claude/show-and-keep-the-effort-a-claude-code-launch-ru` name it.
- `b-construction.json`, `b-prompt.txt`, `guidance.patch`, `b-launch.json`
  and `b-awake-guard.json` under
  `/Users/terryyin/open-dough-scratch/seed-391/` retain exact inputs and
  receipts. No B transcript exists to retain.

Proof and limits:

- `git -C /Users/terryyin/open-dough-scratch/seed-391/b diff --stat 4b75c2888 HEAD`
  listed exactly eight installed guidance files, 74 insertions and 32
  deletions: `deliver-the-change.md`, `dough-post-change-refactor/SKILL.md`,
  `refactor-checks.md` and `executable-proof.md` in each installed root.
  `git status --short` was empty before launch. `git remote -v` listed only
  the local bare origin. Its history was fetched by the full historical
  commit, without tags, before applying the patch; no future story outcome
  or repair was supplied.
- The exact instruction in `b-prompt.txt` was reconstructed from A's first
  command record, with only the agreed workspace/revision replacements,
  removal of dashboard context and addition of the local-only stop line.
  Memory was copied to
  `/Users/terryyin/.claude/projects/-Users-terryyin-open-dough-scratch-seed-391-b/memory`
  before launch. A running session's reading of it could not be observed.
- Literal native form in B: `claude --bg --name 'Open Dough · Execution · Show the effort a launch runs with' --model opus --effort medium <exact b-prompt.txt content>`.
  Python supplied the prompt as one argument, with stdin closed and the
  dashboard's developer-shell environment cleanup; no permission or session
  flag was added. `b-launch.json` retains exit code and exact stderr.
- `git ls-remote origin refs/heads/main 'refs/heads/*show-and-keep-the-effort*'`
  in the real execution checkout after refusal showed only
  `aa0106a74d585a94527e119bc99612661c90bdf9` on `main`, matching the prelaunch
  observation, and no matching story ref. Nothing was published by B.
- AC power was confirmed immediately before launch; observed machine load
  was 4.63/4.73/7.19. Owned `caffeinate -s -i -t 14400` PID `60049` began
  at 13:11:57 UTC and its exact-identity shutdown was confirmed at
  13:12:19 UTC after refusal. No long test or paid native-host proof ran.

Slice 1 attempt used approximately three active minutes for construction,
launch and recording, excluding command time. A construction fetch first
refused the abbreviated commit name; supplying its resolved full SHA
completed construction before the single native launch. This was not a
second B launch. Scratch resources remain for the coordinator's recovery
decision; no test, product or guidance source in this repository changed.

Coordinator stop settlement: source freshness returned `unchanged` against
`origin/main` at `aa0106a74d585a94527e119bc99612661c90bdf9`; the named
effort-story evidence is pinned historical input, so concurrent trunk work
does not change this scratch probe. Inspected the native exit-1 receipt,
exact adjusted prompt, eight-file diff, clean scratch tree and local-only
origin. These accept the construction and refusal evidence, not B execution.
G1 retains that missing execution obligation. No slice is marked done and no
execution-complete record or recommendation is written.

The branch CI observer `/tmp/dough-ci-501/watch-kLDg1n` returned terminal
`stopped`, `pendingCi: unobserved`, zero unread events; PID `69942` exit was
confirmed. No new real-repository commit or publication occurred. The plan
and source-review edits remain uncommitted for recovery; the Taken entry,
execution worktree and scratch inputs remain intact. This was the initial
stop state; Terry's later Codex-first instruction authorizes the amended
probe above without a Claude trust change. P still follows B one at a time.


## Story obligations

### G1. Scratch launch refused before execution; Codex-first retry authorized
Reported: slice 1 — "The single native Claude launch returned exit 1: Workspace not trusted. No B session, transcript or first delegation exists; the slice 1 probe stopped before execution. Terry subsequently authorized Codex first; the amended probe owes execution in a separate clone."
Story clause: "One fresh Codex session executes"
Disposition: proved by slice 1: b-codex-terminal-proof.json; native thread 01a1e48a-0078-76a1-929a-c853646f3acc accepted the blind start, delegated implementation, and exited 0 at clean execution-complete commit 57f805ee2596619f80e007b9f2eff248cc5da112; no push and guard stopped. Protocol deviation is retained separately as G2.
Commitment: 1


### G2. B exceeded the no-retrospective protocol
Reported: slice 1 — "B performed a coordinator product retrospective at 14:38:18.047–14:40:14.840 UTC, although the trial source excludes it. The exact prompt stopped at the execution-complete record without disabling the skill's earlier retrospective. Only eight plan lines changed after the fourth slice commit; product/test observations are pinned before this extra review."
Story clause: "no wrap-up, retrospective or landing."
Disposition: receiving slice 5

## Slice 1 Codex observation — execution completed locally

The separate `~/open-dough-scratch/seed-391/b-codex` clone began clean at
`c629d0d938528e5ef0923b9ef041abb19b4c0751`, with only the eight installed
guidance edits versus `4b75c2888` and only its local bare origin. The exact
adapted instruction is `b-codex-prompt.txt`. One native launch used
`codex exec --json --output-last-message /Users/terryyin/open-dough-scratch/seed-391/b-codex-final.txt -`
with that file on stdin under a separately owned `caffeinate -s -i` guard,
no model/effort/trust override. Native thread
`01a1e48a-0078-76a1-929a-c853646f3acc` records `gpt-6.1-sol`, `xhigh`,
approval `never`, sandbox `danger-full-access`; first implementation
delegation returned `/root/slice_1` at 13:29:43.245 UTC.

Launch ran 13:26:51.431–14:41:15.440 UTC on AC, exit 0; awake guard PID
`80550` stopped. All four scratch slices and execution completion are local
commits; clean terminal HEAD `57f805ee2596619f80e007b9f2eff248cc5da112`.
The fixed product/test inventory cutoff is the fourth slice commit
`8b9005acc970c51503056e40aa66a668386b069b`. Afterwards only eight plan lines
changed. B performed an extra coordinator product retrospective at
14:38:18.047 UTC (result 14:40:14.840: no product correction); no separate
retrospective child, no wrap-up or landing, process review deferred. This
deviates from the requested no-retrospective boundary and stays separate
for time/cost analysis. Native logs and B’s temporary `/tmp` proof files
also sit outside the designated scratch root. No intervention was sent.

Detailed construction, launch/terminal, native-setting, nine child-session
and review-boundary receipts are retained under
`~/open-dough-scratch/seed-391/b-codex-*.json`; start with
`b-codex-terminal-proof.json`. Its native transcript path and exact review
boundary are recoverable there. Bare scratch refs remain at the initial
patch. Real origin had no effort-story ref before or after; its `main`
advanced from `7f94cb36f` to `d288b03f9` independently. B published nothing.
Approximately five active minutes of new construction/observation/recording
were used, excluding its running command; the earlier Claude probe used
about three. This evidence does not mark the outer slice done.

Acceptance: inspected exact prompt, initial diff/remotes, native metadata,
terminal receipt, clean scratch status and post-cutoff diff. Original blind
startup trigger produced the expected delegation and completed local record;
G1 is proved. G2 keeps the extra retrospective owned by the final evaluation,
including a separate time/cost window and explicit protocol qualification.
Native transcript and temporary proof locations are recorded as containment
limits; all product/test writes remain in the scratch clone. No extra paid
native-host test occurred. Source freshness was `unchanged` against
`d288b03f91096cef74c581fa1794f1f7cf3a748b`; the named effort-story evidence is
frozen historical input, so incoming product work does not alter this trial.
Refactor disposition: records-only. No product, test or skill source changes
are made by this story.
