# SEED-120: Keep every revision ready for a ten-minute release

<a id="story-release-progress"></a>

### Expose release progress and preserve terminal startup failures

**Identity:** SEED-120#story-release-progress
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/360-release-progress-and-terminal-failures/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"69bf54ceb2fcec7d1a6b1079648e50c4ddfbf948971fab085b3b2f108d0801b4","plan":"749941221b3cd9123b749d56ede8caa86e0fcf0e99b5993e7f7438ea6d0cf637"}}
```

**Goal:** The owner, watching a release on this machine or Tiger or returning
to one after the coordinating chat or process ended, sees which stage the
activation is in, how long it has taken and what it is activating, and when a
candidate dies during startup learns that within the readiness wait, with its
original cause, instead of a silent 600-second poll followed by a reconstructed
explanation. This observation contract is what the later one-action release and
failed-candidate recovery stories consume.

**Scope:**

- **Durable operation record.** Every activation performed by
  `deployment.deploy`, `deployment.recover` and `deployment.automatic_deploy`
  writes one progress record per operation in the installation directory,
  beside `deployment-record.json`, updated by the helper performing each stage
  so it survives the coordinating process ending. It carries the exact image
  reference, image ID, revision and version being activated; UTC timestamps for
  operation start (the request), host-lease wait start and grant, preparation
  reservation grant or deferral, drain complete, replacement complete, API
  ready, recovery start and end, and completion; the current phase; the
  outcome; and, for a failure, its stage, terminal kind and sanitized cause.
  The existing stage names, `deployment-record.json` and the one-line
  `automatic-deployment.log` entry keep their meaning.
- **Live stage lines.** Stage lines reach the operator's terminal and the
  automatic-deployment LaunchAgent log as each stage completes, not after the
  helper exits. The coordinator takes a helper's outcome from the operation
  record, not by matching buffered output.
- **Terminal startup failures.** While waiting for readiness, each poll also
  inspects the replaced container's state. A candidate that has exited, been
  OOM-killed, or restarted since replacement is terminal: waiting stops at that
  poll, the failure names stage `readiness`, the terminal kind (exit code,
  OOM-killed, restart count) and a sanitized excerpt of the candidate's own
  container logs as the original cause, and the record keeps the same. A
  running container that has not restarted and is not yet ready is healthy slow
  startup and keeps waiting within the existing 600-second bound. Sanitization
  follows the diagnostic-excerpt rules CI logs already use: secret-bearing
  lines dropped with an omission notice, bounded size.
- **Status without the application API.** `deployment.installation_status`
  reports from the container inspect and the operation record, so a stopped,
  exited, starting or looping application still yields a status object: image
  reference, image ID, revision and version; container state (running, exited
  with code, OOM-killed, restart count); the current or last operation's
  phase, stage timestamps, elapsed time since its start, outcome and cause; the
  engine capacity measured before its most recent stage (free and reserved
  bytes); and API readiness as a status code only. The status object carries
  no response body, settings or other application configuration. The release
  skill's one status read still decides readiness from image ID, revision,
  version and API 200 together.
- **Inexpensive polling.** A status read performs no build, check, preparation
  request, migration, cleanup or database read, and readiness polling is one
  status read per interval. Deployment reads the production settings file,
  environment and databases no more than today, which is not at all.

**Key examples:**

| Before and trigger | Required result |
| --- | --- |
| A new release tag; automatic deployment activates it and the candidate becomes ready after an ordinary startup | Each stage line appears in the LaunchAgent log as that stage completes; the operation record holds request, lease, reservation, drain, replace, API-ready and completion timestamps with the exact image/revision/version; the log line and `deployment-record.json` read as today |
| The coordinating process ends (chat closed, agent killed) while the helper is between `replace` and `readiness` | The helper finishes or fails on its own and the record shows its real phase and outcome; a later status read reports it without the coordinator |
| The candidate exits with a non-zero code during startup, for example a missing provisioning input | Readiness waiting stops at the next poll after the exit, far inside 600 s; the failure reads `deployment failed at stage readiness after Ns: candidate exited with code 1` followed by the sanitized log excerpt; the record keeps stage, kind and cause; automatic recovery runs as today |
| The candidate is OOM-killed and the `unless-stopped` policy restarts it | Terminal at the poll that sees the restart; the cause names OOM-killed and the restart count; no blind wait for the full budget |
| A healthy legacy adoption keeps the API unavailable for 355 s with the container running and never restarted | Waiting continues; status during it shows phase `readiness`, the elapsed seconds and the running container; API-ready is recorded when it answers |
| A status read while the application is stopped, or while a failed candidate is restart-looping | One status object with container state and the last operation's phase, outcome and cause; exit code and `installation not found` remain only for an installation directory with neither container nor record |
| The candidate's logs contain a line carrying a token or password | The excerpt omits that line and says so; neither the record, the error nor the status object ever contains the settings body |
| The release skill's readiness verification after a healthy activation | The same single status read reports image ID, revision, version and API 200 together, with the operation's completion timestamp |

**Boundaries:** The qualified resource envelope (the memory, CPU and disk a
revision was qualified for) belongs to
[installation readiness](#story-installation-readiness); this status shows
the already measured engine capacity and the container's actual exit/OOM
facts and gains the envelope when that story records one. Recovery policy is
unchanged: automatic recovery after a terminal readiness failure runs today's
recover path, and a looping candidate that cannot grant a reservation still
fails recovery at `prepare` with the owner's manual stop, which
[failed-candidate recovery](#story-failed-candidate-recovery) redesigns; this
story makes that state immediate and visible. The request timestamp is the
coordinating command's start; dispatch latency before it belongs to
[one-action release](#story-one-action-release). No fleet action, web or
Textual UI, queue policy, attempt-retry classification or second job
scheduler. Release skill and installation docs are updated to the new output.

**Architecture and reuse:** Extend `deployment.stages`, `installation_status`,
`replacement.observe_readiness`, `automatic_deploy` and the installation-side
records rather than adding a parallel progress log or scheduler. Reuse the
existing container inspect (drain already reads exit code and restart count)
and the CI diagnostic-excerpt sanitizer. Follow Accepted
[ADR-0003](../../docs/adrs/0003-settings-environments-and-data-planes-accepted.md)
(host-owned replacement and recovery, matching ready identity, no production
settings leakage) and the inexpensive status-read boundary of
[ADR-0008](../../docs/adrs/0008-duckdb-status-access-accepted.md); the North
Star's Docker capacity topic keeps host release work outside the service owner
and on the shared host lease. No new ADR or North Star topic is needed.

**Effort hypothesis:** M, roughly two to four hours; confidence moderate. The
readiness and status helpers have focused tests with runner fakes, and the
host-Docker deploy suites prove the real container journey.
