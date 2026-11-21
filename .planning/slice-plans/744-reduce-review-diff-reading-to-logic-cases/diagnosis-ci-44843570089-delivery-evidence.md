# Diagnosis: Distribution Tests (1/3) run deadline on 66d2efa8

**Signature.** CI run 44843570089 attempt 1, job 136657683409 "Distribution
Tests (1/3)", step "Run Distribution Tests". The log reads `RUN DEADLINE:
exhausted absolute cutoff`, and the files still running were
`dough-execute-plan/one-shot-*`. No test assertion failed.

**Attribution.** 66d2efa8 is slice 2. It changes `dashboard/src/diffLineTokens.ts`
and a dashboard frontend spec, deletes a mounted spec, and edits planning
records. None of these touch `Distribution/`. Slice 1's run at f4e5da6e
(44841545526) passed the same shard: its test step took 166 s of the 320 s
budget. In this run the step hit the deadline after 311 s.

**Per-file times** (artifact `test-times-1`; 188 files in common):

| File | f4e5da6e (ok) | 66d2efa8 (fail) | 412b2d8f other branch, same window | fbce44f4 |
| --- | --- | --- | --- | --- |
| delivery-evidence-native-routing.sh | 10.4 | 148.2 | 18.9 | 19.1 |
| delivery-evidence-amended.sh | 11.4 | 147.0 | 19.3 | 20.6 |
| delivery-evidence-return-transport.sh | 29.4 | 133.6 | | |
| delivery-evidence-terminal.sh | 2.6 | 88.1 | 4.3 | 7.0 |
| delivery-evidence-drift.sh | 3.4 | 47.6 | | |
| delivery-evidence-original.sh | 1.9 | 29.3 | | |

Summed over the common files: 514 s ok against 1240 s fail. Almost all of the
difference is in `Distribution/evaluation/tests/delivery-evidence/`. Other files
are at most 4× slower.

**Round 1.** Started by the coordinator. See the round log below.

## Rounds

### Round 1 (CI repair agent)

Load at start: 12.7 (1-min), 14.8 (5-min).

- H1, remote/branch state: the delivery-evidence scripts wait on `gh`, a
  fetch, a poll loop or a timeout. Read: the six files, their fixture
  (`delivery-evidence-native-run.sh`), payload install
  (`delivery-evidence-native-payload.sh`) and `install.sh`. None calls `gh`,
  `curl`, `git fetch`, `ls-remote` or `sleep`, and none has a timeout. Git use
  is local only: `git init` in a temp directory, commits there, and `git
  archive` from the checkout when a payload revision is set. Ruled out.
- Planned batch: one local run of the six slow files plus the three
  untouched-in-the-table delivery-evidence files (stopping count 1).
  Hypothesis: locally at load ~13 they run near the ok CI times, which means
  the code at 66d2efa8 is not slow.
- Local batch result (`ci1-local-de`, exit 0; load 13.3 before, 15.1 after;
  4 job slots): return-transport 67.0 s, amended 51.4, native-routing 30.5,
  drift 10.8, terminal 9.5, original 6.5, release 5.1. That is 2–5× the ok CI
  times on a laptop at load ~14, the same ratio other files show under this
  load. Nothing exhausted a wait. 1 of 1 runs normal.
- Attribution: `git diff f4e5da6e 66d2efa8` touches no `Distribution/`,
  `scripts/`, `install.sh`, `package*.json` or `.github/` file. The
  delivery-evidence harness is byte-identical between the ok run and the
  failed run.
- CI history, `test-times-1` from the 14 most recent CI runs (main and four
  branches, 2026-11-20 18:37 to 2026-11-21 00:33). The three columns are
  amended, native-routing and terminal. In 13 runs they are 11–21 s, 10–19 s
  and 2.6–7 s. Only 44843570089 is out of range: 148, 147 and 88 s. The runs
  just before and after it on other branches (412b2d8f, 0d4666c3, fbce44f4,
  4707bf8a, 5af3c3a0) are normal.
- Shape of the slowdown: the runner starts files longest first, so the
  delivery-evidence files were the first ones in the job's 4 slots. All ten
  were slow (4.5–34×), and later `Distribution/tests/skills` files were
  ≤ 3.9×. Variation between runners is large anyway: the ok run's shard 2/3
  took 244 s (sum 966 s), and the same shard took 145 s (sum 570 s) in the
  failed run. The slowdown hit the start of one runner's job and touched
  every file there, whatever its content. That matches a degraded runner
  (CPU steal or disk throttling) and no wait in the code.
- Environments ruled out: local macOS at load ~14 (normal); other CI runners
  in the same 10-minute window (normal); the previous revision on this branch
  (normal; identical harness).
- Leading hypothesis: one degraded runner on job 136657683409, worst during
  the first ~150 s. Not a repository cause. The job log has no direct runner
  metrics (no per-file timestamps or CPU and I/O counters), so this evidence
  is inferential, not a direct infrastructure measurement.
- Next discriminating experiment: rerun only the failed job, at most once
  (stopping count 1). If delivery-evidence returns to the 10–21 s band, the
  runner hypothesis holds. If it is slow again at the same SHA, the cause
  follows the revision, and round 2 compares the checked-out tree of
  66d2efa8 with f4e5da6e under `install.sh`.
- Round count 1; cumulative active minutes 2.9 at the last clock reading.
  No repository change.

### CI rerun (coordinator)

The hypothesis is that one runner was slow for the job's first ~150 s, and
that the cause does not follow revision 66d2efa8. The experiment reruns only
failed job 136657683409, once, with a stopping count of 1. If the
delivery-evidence files come back inside their 13-run range (amended 11–21 s,
native-routing 10–19 s, terminal 2.6–7 s), the runner explanation holds. If
they are slow again at the same SHA, round 2 compares what `install.sh` sees in
the 66d2efa8 and f4e5da6e trees.

Result: attempt 2 of the same job at the same SHA passed. Its delivery-evidence
files ran amended 14.8 s, native-routing 13.2 s, terminal 4.3 s and
return-transport 38.5 s, all inside their range. The slowdown does not follow
the revision. Disposition: the first attempt's runner was slow, the diagnosis
stops after round 1 (3.6 cumulative minutes), and no repair commit is needed.
