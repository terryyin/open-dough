# CI share 1 absolute-deadline failure

Identity SEED-396#replace-evaluation-shell-checks; checkout/branch are this established story workspace. Current published HEAD 226ed160d6937f92a4646a9decca6bbf1e257827.

Run 44077311815 attempt 1, failed registered SHA 1c5dd0a4b1bd42494f5fc3043e009f1f916a724c; Distribution Tests (1/3), job 134018561715. https://github.com/terryyin/open-dough/actions/runs/44077311815/job/134018561715

Diagnostic /tmp/seed396-ci-44077311815.json, complete raw job log /tmp/seed396-ci-share1-full.log. Only failure is run absolute cutoff: tests started 11:48:50.961Z after setup began 11:48:37Z; cutoff 11:53:57Z. Final two publication files got only9.3/6.2sec. No assertion failure in full job log. Later cancellation is proven supersession by published226ed160; it does not erase the earlier timeout.

Failed times /tmp/seed396-ci-times-failure/test-times-1/test-times.txt sum1217.4sec over281jobs. Successful main run44072090789 at a777de5c2b993764f201bd5c7b42e67e3d939bb3 timings /tmp/seed396-ci-times-main/: share1 sum889.9 (execution697.1 + installation192.8), share2 sum658.9, share3 sum618.2. These are summed per-file durations, not wall times. Main and failed share1 contain same281 paths. Story modifies only evaluation checks/guides plus records, not share1 implementation; attribution does not waive owned repair.

Leading hypothesis: share1 workload lacks deadline headroom; remove installation pattern from explicit share1 so catch-all share3 owns it. Main timing forecast: share1 697.1, share3 811.0, share2 unchanged658.9; every job still exactly once, no timeout or budget increase. One bounded candidate, verify real discovery/membership invariant and existing split runner check; final CI is required deadline evidence, no rerun-until-green.

No known other active repair owner. Writers quiescent, stash command returned clean record /var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/dough-ci-repair-stash-wUHzRM/record.json (oidnull); no stash to pop by hand.

Root owns local evaluation run session62277 at226ed160; delayed~16min by suite admission, then active progressing jobs. This proof observes evaluation code. Workflow-only routing repair does not change that local unfiltered evaluation selection. No heavy repair proof may overlap; only named split check/discovery reads. No temporary diagnostic product edits yet. First diagnosis round; clock records active time. Required failure policy: Distribution/src/skills/dough-execute-plan/references/failure-policy.md.

## Diagnosis round 1

Read complete failed job log: the only failing signals are the absolute cutoff and its two interrupted publication tests; setup used14sec, not the budget. Successful main run and failed run both have281 share1 files. Installation contributes192.8sec/main and300.7sec/failed. No assertion failures or new unrelated defects found; no temporary product edits.

Baseline actual discovery: `node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log /tmp/seed396-ci-before-discovery.log --exit-file /tmp/seed396-ci-before-discovery.exit -- env PATH=/opt/homebrew/bin:$PATH python3 /tmp/seed396-ci-discovery.py before`, exit0. This runs actual `scripts/test-jobs.sh` unsplit and for each of three shares and proves disjoint union. Snapshot /tmp/seed396-ci-discovery-before.json.

Workflow is the sole membership owner; runner-settings describes generic declaration/catch-all behavior and needs no change. Confirmed bounded repair: remove installation pattern from explicit share1, leaving it to catch-all share3. Deadline failure itself is pre-fix observed regression; after repair final CI must prove real completion. No local timing projection can claim that result. One candidate, one after-discovery experiment, one focused split runner check, then publish/final CI; stop and reassess any further failure rather than rerun to green.

Clock at baseline return: round1 cumulative/active1.4min,13.6remaining. Requested coordinator clock switch before implementation.

## Bounded repair

Coordinator paused diagnosis round1 at2.8 active/cumulative minutes and started separate slice clock `ci-share1-repair` with15min. One-line workflow removal implemented; no test or production implementation files changed. Workflow remains250lines, same as base. Runner settings already describe declaration-driven membership and need no update.

After-discovery command replaces `before` with `after` in the recorded clock-run command; exit0 at /tmp/seed396-ci-after-discovery.log/.exit. It compares actual snapshots: before281/75/298 jobs, after251/75/328; all654 scheduled exactly once. Exactly30 installation jobs move1→3; evaluation share and every other assignment unchanged.

`node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log /tmp/seed396-ci-split-focused.log --exit-file /tmp/seed396-ci-split-focused.exit -- env PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/tests/test-runner/test-runner-split.sh` passed exit0. This observes actual fixture execution under declaration changes, disjoint ownership and invalid-declaration rejection. No test edits or mirrored configuration assertions added.

Consumer trace /tmp/seed396-ci-share1-consumer-trace.md has every located consumer disposition. Same current declaration/selector is used by timing report; other workflow consumers use unchanged identities, triggers, browser declarations, deadlines or controlled fixtures. No further affected consumer left unowned. Historical forecast peak889.9→811.0 summed job seconds is a forecast only. Actual post-repair CI deadline completion remains root-owned and pending. This candidate has had one baseline discovery, one after-discovery and one focused split check, all exit0; no repeat batches and no CI dispatch by repair agent.

No temporary product edits, new unrelated defect, or failed local proof. Only pending observation is actual final CI. Root still owns the independent evaluation command and observer; no attempt to inspect/stop them here.
