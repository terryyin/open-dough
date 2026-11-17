# Execution observations

## Slice 1 observation — native launch refused before the session started

2026-11-16 13:11:57 UTC: the one authorized B launch returned exit 1:

> Workspace not trusted. Run `claude` in /Users/terryyin/open-dough-scratch/seed-391/b once and accept the trust prompt, then retry.

No native session ID was printed, and the B project directory contained no
`*.jsonl` transcript after the refusal. B therefore reached neither the
installed execution skill nor its first delegation. Model/effort and memory
loading inside a running session are unobserved; only the requested launch
arguments and copied memory are proved. The slice 1 probe's stop rule applies:
no trust setting was changed, no retry was launched, P was not started, and
the five guidance moments remain unexercised. Slices 2–5 were held at that stop; the [Codex-first amendment](execution-context.md#current-decisions) reopens
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
probe in [the plan](PLAN.md#ordered-slices) without a Claude trust change. P still follows B one at a time.

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


## Slice 3 observation — frozen test changes inventoried

[The case and assertion inventory](test-inventory.md) records source-review
obligations 8–13 at A `4b75c2888..eda73008b` and B
`c629d0d9..8b9005acc`, before B’s later plan-only review. A changes 29 specs
and two assertion-support files; B changes 15 specs and five support files.
The table separates incidental consumers, mixed planned effort surfaces and
direct effort/display proof, classifies final value updates/narrowing, and
traces B’s semantic command reader to actual recorded argv. Newly introduced
assertion forms and case-dependent branches have explicit units and limits;
no guidance recommendation is made here. The CI pause preserved the frozen
inputs; later CI repairs do not enter either range. No test, lint, format,
refactor, commit or product/test/guidance edit was made for this observation.

Acceptance: compared the original source promises with the frozen table,
reader implementation, explicit high fixture and max/absent-effort case bodies.
Units distinguish specs/support, sites/runtime variants and existing values/new
assertion shapes. Every outside-subject file/case and supported absence is
recorded; ids 8–13 accepted. Refactor disposition: records-only.

## Slice 4 observation — first refactor and measurement evidence

[Refactor and metrics](refactor-and-metrics.md) quotes accessible A/B returns,
completion learnings and A’s brief, with common orchestration proxies and
provider-specific usage/cost limits (ids 14–16). B’s persisted first brief
is encrypted; its actual count/remedy wording remains unobserved pending
a readable source. G2 and recommendations remain with slice 6.
