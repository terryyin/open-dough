# Diagnosis: backend-launch-load-polls

Round 1 (repair agent). Failure policy: Distribution/src/skills/dough-execute-plan/references/failure-policy.md.

## Signatures (evidence $EV/s1-backend-full.log, c1-*.log)
- A: `expect.poll(() => native.claudeLaunches()/creations, {timeout: 3_000}).toHaveLength(1)` received [] (agent-launch-duplicate.spec.ts:115, agent-launch-codex-duplicate.spec.ts:115).
- B: `Test timed out in 5000ms` (default testTimeout) in most other listed cases.
- C: `vi.waitFor(..., {timeout: 3_000})` (execution-checkout-start-stops:183, isolated-start-before-establishment:172).

## Attribution
Base d56cd6957 fails equally under load (10/13 at load ~20). Story changes do not touch launch code.

## Observations
- At low load (s1-dup-alone) the duplicate cases already take 2.1-4.4 s each (one 5.3 s timeout): the test bodies sit close to the 5 s default test timeout, so load only exposes it. Under load 20 they take 4.3-6.9 s.

## Hypothesis 1
Cause is per-test work (real git / child processes / fixed waits in the launch path) that costs seconds even unloaded; the bounded polls are symptoms. Experiment: profile one duplicate case's body to find where the ~2.5 s goes (no repeat batch).
- Probe (temporary spec zz-probe-launch-timing.spec.ts, load 8): accept returns in 26 ms; the fake claude launch arrives at 872 ms; of that, the `execution-start.mjs start` child (node + git work) takes ~620 ms, `claude --bg` ~240 ms. The 3 s poll and 5 s test budget cover the whole start script; nothing in the test waits on a fixed sleep. 16 cores.

## Batch 1 (stopping count 1 run, both duplicate specs, current load)
Hypothesis: at load <10 the duplicate specs pass with per-test times ~1-2.5 s; their failure is slowdown proportional to load, not a missed event.
Result (d1-dup.log, load 7->12, 16 cores, `npx vitest run` both duplicate specs): 3/13 failed (codex-duplicate:143 signature A; duplicate:189 and codex-duplicate:195 signature B). Signature reproduces at moderate load; hypothesis refuted that it needs load 20+.

## Batch 2 (instrumented probe, stopping count 1 file run of 3 launches beside codex-duplicate, load 15)
Hypothesis: the per-launch cost is the real start pipeline, and it scales with load.
Result (d1-probe4.log, d1-probe-out.txt): each launch 2.2-3.1 s to native dispatch: `execution-start.mjs draft` 0.35-0.7 s, `execution-start.mjs start` 1.4-2.1 s, `claude --bg` 0.2-0.4 s. Child trace of the start scripts (d1-probe5 / d1-child.txt, instrumented, partial): ~45 git processes per launch before commit, including three `git fetch origin` (one in draft, two in start) and two temporary `git worktree add`/`remove` pairs plus one `git worktree add -b`.

## Cause (confirmed by reproduction before any fix: d1-dup.log)
Every listed launch case drives the real start pipeline (2 node processes + ~50 git processes) once to three times inside the 5 s default test timeout; the 3 s polls wait for that same pipeline. At load ~15 on 16 cores one launch already costs 2-3 s, so two-launch cases exceed 5 s and one-launch cases exceed the 3 s poll. No missed event or fixed sleep is involved; a longer poll bound cannot fix signature B, which dominates (19 of 22 launch failures in s1-backend-full.log).

Separate signature (not covered): review-initial-sync.spec.ts:150/156/176/200 use vitest's default 1 s `expect.poll` on a real `git fetch` child settling (controlledFetch); story-review-offline-sync:80 and notifier-setup:79 are signature B (5 s timeout) with their own real git / helper work; not traced this round.

## Disposition: stop for human judgment (design)
Repair options:
1. Test boundary (recommended for gate/model/refusal specs whose subject is not the start pipeline: agent-launch-duplicate, agent-launch-codex-duplicate, agent-launch-model-boundary, agent-launch-codex-model-boundary, follow-up-file-admission, incomplete-reporting-settlement): run them against a held/instant start-script stand-in at the boundary where the server runs execution-start.mjs (dashboard/server/executionStartCommands.ts, adHocStoryAdmission.ts), and wait on the stand-in's arrival instead of a 3 s poll. Keeps the asserted gate behavior; removes ~50 git processes per launch.
2. Product cost (for specs whose subject is the real start: admitted-session-start, ad-hoc-existing-changes-start, execution-checkout-start-stops, isolated-start-*, preparation-continuation-refusal): cut redundant start work (three fetches, two throwaway worktrees per launch) and/or one real start per case. Also benefits users; does not by itself make 5 s safe at load 70.
Next discriminating experiment if continued: prototype option 1 in agent-launch-duplicate.spec.ts and rerun both duplicate specs 5x at load >=15 (stopping count 5).

## Round bookkeeping
Round 1, ~3 cumulative active minutes (clock). Temporary probe spec and spawn hook removed; no edits remain in the tree from this round besides this record.
