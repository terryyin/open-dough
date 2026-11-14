# Native comparison cases

`Distribution/tests/native-comparison.sh` runs versioned examples from real
work in fresh native Codex sessions: one journey of a case, or a matched
pair of a baseline and a candidate Open Dough payload judged outcome first.
It is maintainer tooling; nothing here is installed in a client project.
Paid sessions run only when a human asks for them: `npm test`, CI and the
command's default mode never start a real host. Put Bash 5 first on PATH
(`PATH=/opt/homebrew/bin:$PATH` on macOS) for every command below.

Each case lives in `Distribution/tests/native-comparison/<case>/`: `case.md`
(origin, extraction, selection traits, measured durations and kept
comparisons), the neutral `task.txt` (and `wake.txt` for later turns), the
fixture and observer `case.bash`, and the separate assessor `assess.bash`,
which never reaches the agent's workspace.

## Select a case

```sh
Distribution/tests/native-comparison.sh --list
Distribution/tests/native-comparison.sh --list --where hosts=codex --where workflow=blocked
Distribution/tests/native-comparison.sh --list --where prerequisites=nix
```

`--list` prints each case's traits from its `case.md` Selection section:
workflow, hosts, prerequisites, decisions-and-proof and duration. Each
`--where TRAIT=TEXT` keeps the cases whose trait contains TEXT, ignoring case.

| Case | What it exercises | Preparation and run, as measured on 2026-11-14 |
| --- | --- | --- |
| `paused-supplier` | hold a blocked slice through a diagnostic pass, an unchanged wake and an early publication, then continue once with proof | under 2 s; four turns of about 20 min per arm |
| `doughnut-title-precedence` | calibrate a real project's maintained proof against a plausible fault | about 1–1.6 min and 4.5 GB per arm, with Nix, network and an arm-owned MySQL; one turn of 10–15 min |

Those are single observations at host load 4–16, not cost estimates; each
`case.md` keeps its own measurements.

## Supported conditions

Both cases are qualified natively on Codex only, observed with
`codex-cli 0.169.0`, `gpt-6.1-sol` and effort `xhigh`. Claude Code and
Cursor remain unqualified until their own native observations are
obtained: the runner drives only `codex` today and refuses `--native claude`
or `--native cursor` rather than run them. That is the current delivery,
not a rule; a case or host added later is qualified by its own observations.

The runner starts `codex exec --ignore-user-config` (later turns `codex exec
resume` in the same thread) with sandbox `danger-full-access` and no
approval prompts, inside the harness's macOS `sandbox-exec` profile, which
lets the session write only its arm, the temporary root and Codex's own
runtime (`Distribution/tests/support/native-codex.sh`). Known constraints:

- `--ignore-user-config` drops your configured model, so `--model` and
  `--effort` decide both arms; the defaults are `gpt-6.1-sol` and `xhigh`.
- A logged-in Codex CLI must be first on PATH as the runtime's symlink; a
  copied or substitute `codex` runs outside the sandbox and its record says
  `host-route: substitute`, which is never native evidence.
- Nix ignores a `TMPDIR` under macOS's per-user `/var/folders` and falls
  back to `/tmp`, which the sandbox denies, so arms that run Nix need
  `TMPDIR` elsewhere (the Doughnut case refuses otherwise). Arm paths never
  contain `native-comparison`, which would name the harness to the agent.
- The Doughnut case starts its own MySQL server per arm and denies TCP ports
  3309 and 6380, where a developer's live servers listen; a deliberate
  unix-socket connection to a live server is not denied. The sandbox also
  admits the JVM attach handshake files Mockito's self-attach writes under
  `/var/folders`.

## Run a journey or a pair

One journey of a case, with this checkout's working tree as the payload
(arms live under `TMPDIR`, which must exist):

```sh
mkdir -p "$HOME/tmp/native-comparison"
PATH=/opt/homebrew/bin:$PATH TMPDIR=$HOME/tmp/native-comparison \
  Distribution/tests/native-comparison.sh --native codex --case paused-supplier \
  --model gpt-6.1-sol --effort xhigh --results-dir "$HOME/tmp/native-comparison-results"
```

A pair freezes two commits of `--payload-repo` (default this checkout) and
declares the factor under test, its intended gain and the quality criteria
before either arm starts, as [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)
asks: say what varies, what result would be worth keeping and which outcome
and proof must hold before effort counts.

```sh
PATH=/opt/homebrew/bin:$PATH TMPDIR=$HOME/tmp/native-comparison \
  Distribution/tests/native-comparison.sh --native codex --case paused-supplier \
  --baseline v0.3.98 --candidate "$(git rev-parse HEAD)" \
  --factor 'Open Dough payload only: release v0.3.98 versus this commit' \
  --gain 'the same outcome and decisive proof with fewer commands and empty-wake work' \
  --quality 'the case assessor passes both arms before effort is compared; tokens are unavailable' \
  --model gpt-6.1-sol --effort xhigh --arms concurrent \
  --results-dir "$HOME/tmp/native-comparison-results"
```

`--arms concurrent` (the default) halves the wall time but runs both arms
on one host at once: their seconds include each other's load, and a Doughnut
pair needs about 9 GB at once. `--arms sequential` keeps one arm's load off
the other at twice the wall time. `--deadline SECONDS` bounds each turn
(default 2400); a turn past it stops its arm.

The command prints the pair's record and `result-path:`, and exits 0 with an
outcome (`preserved`, `improved`, `regressed`, `neither-passed`) or 1 when
the pair is `incomplete` or `not-comparable`.

## Refused requests

Before freezing a payload or materializing a case, the command refuses, with
exit 2, every `error:` it finds and a `refused:` line: a host other than
`codex`, an unknown case, missing Git, jq, Node or `codex`, a case's own
missing prerequisite (`case_preflight`, such as Nix or an arm under
`/var/folders`) and a payload revision that names no commit. A pair then
refuses a case or harness file this checkout has not committed, and any mode
stops at once under a Bash older than 5. Nothing is retained for a refused
request; fix what it names and run it again.

## Read a record

A pair record names its case basis revision, each frozen payload (commit,
tree and requested label), the requested and applied settings, host, load,
machine and power, each arm's attempt, thread and workers, its outcome from
the case assessor, where it stopped and the proof files retained with it.
Then:

- `evidence:` says whether both arms ran the Codex runtime in the harness
  sandbox. A record whose evidence is not native proves the runner,
  observer and judge only.
- `verdict:` judges outcome first: an arm that missed a decision or proof
  never becomes equivalent through lower effort, and unmatched or unknown
  conditions make the pair `not-comparable`.
- `effort-*` lines follow the verdict and never change it. An incomplete or
  not comparable pair computes no effort difference, and an arm that
  stopped is marked `partial`: its counts cover only the turns observed.
- `unknown:` names each turn an arm did not observe and each arm whose
  applied settings and workers stay unknown without a readable session
  record. Nothing unknown is counted as zero.
- `recovery:` follows an incomplete or not comparable verdict. The runner
  never retries or resumes a stopped turn: a session that stopped may still
  have changed its arm, so read that arm's attempt (`events-turn-*.jsonl`,
  `stderr.log`, `final-state.txt`) before relying on any of it. For a
  comparison, resolve the cause and run a fresh pair from the same frozen
  commits; the stopped record stays as observed.

## Keep a comparison and refresh a case

To keep a native pair, copy its `record` to the case's `comparisons/`
under the pair attempt's name (`<attempt id>.txt`, as
`20261114T045440-40bf.txt`) and summarize it under the case's Comparisons
section; commit both. Never edit a kept record afterwards, and never keep a
record from a substitute host (`Distribution/tests/native-comparison-incomplete.sh`
rejects one). `case.md` and `comparisons/` are outside the case's identity,
so kept records and measurements do not change the basis.

Refresh a case by editing its task, setup, events or assessment and
committing the change before the next pair: a pair refuses an uncommitted
case or harness file, and its record then names the commit that holds the
new basis. Changing a hash-bound harness file (the runner, retention, pair,
observer, judge, basis, supervision or stream files a record lists) changes
every later basis too. Rerun a paid pair after a refresh only when an
agent-facing input (task, wake, overlays, events or setup) changed, and only
when a human asks.

```sh
PATH=/opt/homebrew/bin:$PATH Distribution/tests/native-comparison.sh \
  --recover Distribution/tests/native-comparison/paused-supplier/comparisons/20261114T045440-40bf.txt
```

`--recover` finds the commit whose files match the record's hashes,
wherever they have moved, states what a rerun would meet now (payload
commits, labels and the `codex` on PATH) as `rerun-limit:` lines, and prints
the record unchanged. It never reruns, and it does not recheck the project
basis or its services. An edited record, or one whose inputs no commit holds,
is not recovered.

## Retain and remove evidence

During assessment keep the raw evidence: each attempt under
`--results-dir` holds the streams, responses, observations, final project
state, case evidence and copies of the Codex session records. Those session
records carry account identities and stay on the maintainer's machine. Arm
projects (up to 4.5 GB each for Doughnut) live in the command's work
directory under `TMPDIR` and are removed when the command ends.

Once a pair is assessed and anything worth keeping is in the case's
`comparisons/` record, `case.md` or a finding, the raw attempts are spent:
remove the whole `--results-dir` (or the attempts it holds) at story wrap-up,
as [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) asks.
Keep tracked: each case directory, its kept comparison records byte for
byte, and the Git history that holds earlier bases (`--recover` reads it).
Without `--results-dir` the attempts go to a fresh `mktemp -d` directory,
which the command prints as `result-path:`.

## Measurement limits

- Tokens and cost are unavailable: each record says so and points at the
  raw usage in the retained streams and session records, which the
  [effort comparison story](../../.planning/seeds/SEED-345-session-token-efficiency.md#compare-agent-effort-on-comparable-runs)
  owns accounting for.
- One pair of stochastic sessions is one observation. It supports its
  comparison under its recorded conditions, not a general saving, a
  repeatable cost or a cause the factor alone explains.
- Wall-clock seconds include host load and service latency; compare each
  arm's recorded load.
- Workers come from the session records; recoveries and interventions count
  what the runner did (it never retries a turn, and Codex runs without
  approval prompts), not a human's work around the command.

## Credential-free checks

`npm test` runs the default mode (the catalog), each case's own proof
(`native-comparison-<case>.sh`), substitute pairs and the pair judge's
rejected cases (`native-comparison-pairs.sh`), refusals and incomplete pairs
(`native-comparison-incomplete.sh`) and refresh and recovery
(`native-comparison-refresh.sh`). Substitute hosts prove the runner,
observer, assessors and judge; they never stand in for native behavior.

The review of ADR 0005's A/B guidance against these cases' observations is
in [the native comparison review](../../docs/maintainer/native-comparison-adr-0005-review.md).
