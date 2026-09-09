# Actual Codex desktop bridge observations

These are contemporaneous observations of real `functions.exec` cells in the
maintainer task, not a replay. Runtime: native desktop tools with Node v24.5.0.
Installed launcher: `/private/tmp/dough-native-execution.6KjVjO/codex/.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs`.
Launch arguments: `stream --execution fixture/example main 60000`, PTY enabled,
controlled gh directory prepended to PATH.

## Initial adapter — cell 80

`notify` supplied CI_FAILURE for run 42, attempt 1, job 101 named
`acceptance-c94110c543d7d58d`. A separate cell's load of the running cell's saved
key returned undefined. The 60-second observation budget expired and emitted
CI_MONITOR_UNAVAILABLE; cell completed. Stored state became visible after
completion: directory watch-jZJxrU, PID 18376, terminal finished.
A separate bounded 15-second cell (85) wrote 456 and yielded; another cell read
undefined while it ran. This isolated the visibility issue from the CI runtime.

## Exposed receipt but competing terminal reads — cell 90

Initial yielded output: sessionId 86156, directory watch-WfcYt5, PID 32581.
The failure notification arrived. Ctrl-C through a second write_stdin returned
exit 0 and CI_OBSERVER_RESULT with stopped, pendingCi unobserved, recordedThrough
1, deliveredThrough 0, unread 1. The existing reader then failed with
`write_stdin failed: Unknown process id 86156`. This motivated mailbox stop.

## Sole reader and mailbox stop — cell 95

Initial yielded output: sessionId 20660, directory watch-k6z2Xf, PID 42767.
The independent native notification was:

```json
{"type":"CI_FAILURE","repo":"fixture/example","sha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","branch":"main","workflow":"ci.yml","runId":42,"attempt":1,"conclusion":null,"url":"https://github.com/fixture/example/actions/runs/42","failedJobs":[{"jobId":101,"name":"acceptance-c94110c543d7d58d","conclusion":"failure"}]}
```

A separate exec_command ran the installed launcher with
`stop /tmp/dough-ci-501/watch-k6z2Xf`. It exited 0. The existing reader completed;
one functions.wait returned:

```json
{"status":"finished","directory":"/tmp/dough-ci-501/watch-k6z2Xf","pid":42767,"terminal":{"status":"stopped","coverage":{"state":"ended","pendingCi":"unobserved"},"evidence":{"recordedThrough":1,"deliveredThrough":0,"unread":1}},"exitCode":0}
```

Separate `ps -p PID -o pid=` checks for 18376, 32581, and 42767 returned no PID.
Durable mailbox evidence is retained alongside this record. Native receipt of
a notification is not claimed as a durable hook acknowledgment; unread remains 1.
