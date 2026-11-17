# Accepted slice proof

### Slice 1

`native-check-expectations.sh` and the counterexample guard passed via
`node .agents/skills/dough-execute-plan/scripts/slice-clock.mjs run --log /tmp/seed396-s1-focused.log --exit-file /tmp/seed396-s1-focused.exit -- env PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/evaluation/tests/native-harness/native-check-expectations.sh Distribution/evaluation/tests/native-harness/native-assessor-counterexample-guard.sh`.
Inspected scratch cleanup (exit 0/7, read-only contents), real substitute-host
entry (status 0/9, both streams), silent passing words and failed child checks
that stop before trailing output, including completed-versus-timeout evidence.
Consumer trace: only the new own check currently sources the helper; unrelated
`prep_native_check_support_dir` match excluded. No production behavior changes.

### Slice 2

Timeout retains every fact (nonzero follows 124; no assessment pass follows exact not-run).
`slice-clock.mjs run --log /tmp/seed396-s2-<label>.log --exit-file /tmp/seed396-s2-<label>.exit -- env PATH=/opt/homebrew/bin:$PATH python3 /tmp/seed396-s2-retry-fault.py`
with `before-fault` and `final-fault` rejects the same extra native_run_owned after timeout (two launches). Exact production bytes restored.
Final proof: `slice-clock.mjs run --log /tmp/seed396-s2-final-restored.log --exit-file /tmp/seed396-s2-final-restored.exit -- env PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/evaluation/tests/native-harness/native-run-timeout.sh Distribution/evaluation/tests/native-harness/native-check-expectations.sh Distribution/evaluation/tests/native-harness/native-assessor-counterexample-guard.sh` exit 0.
Shared value/process words and owned-process cleanup are observed by self-check and timeout, their only runtime consumers. Consumer dispositions: `/tmp/seed396-s2-consumer-trace.md`.

### Slice 3

Retention preserves all artifact, field, stream, host/version, refusal/listing, repeated-attempt and prompt facts. Direct named-result calls keep nested expectations under errexit.
`slice-clock.mjs run --log /tmp/seed396-s3-<label>.log --exit-file /tmp/seed396-s3-<label>.exit -- env PATH=/opt/homebrew/bin:$PATH python3 /tmp/seed396-s3-events-fault.py` before/after rewrite fails on nonempty events; exact production bytes restored.
`slice-clock.mjs run --log /tmp/seed396-s3-final-restored.log --exit-file /tmp/seed396-s3-final-restored.exit -- env PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/evaluation/tests/native-harness/native-result-retention.sh Distribution/evaluation/tests/native-harness/native-assessor-counterexample-guard.sh` passed.
Consumer trace `/tmp/seed396-s3-consumer-trace.md`: changed check only; helper unchanged. Removal sibling plan 680 has no delivered product change and explicitly preserves compatible rewrites/race protection.

### Slice 4

Runner failures retains every fact for missing/nonzero/denied hosts and cleanup evidence. Direct named-result calls preserve failure propagation; exact nonzero statuses and failed/not-run fields imply previous negative alternatives.
`slice-clock.mjs run --log /tmp/seed396-s4-<label>.log --exit-file /tmp/seed396-s4-<label>.exit -- env PATH=/opt/homebrew/bin:$PATH python3 /tmp/seed396-s4-completed-fault.py` before/after rewrite rejects failed→completed; exact source restored.
`slice-clock.mjs run --log /tmp/seed396-s4-final-restored.log --exit-file /tmp/seed396-s4-final-restored.exit -- env PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/evaluation/tests/native-harness/native-runner-failures.sh Distribution/evaluation/tests/native-harness/native-assessor-counterexample-guard.sh` passed.
Consumer trace `/tmp/seed396-s4-consumer-trace.md`: private check only; cleanup producer unchanged. Corrected premise enumeration to include its existing cleanup call.

### Slice 5

Stream completeness preserves every classification, retention and scenario fact; direct named-result calls keep assertions outside process substitution.
`slice-clock.mjs run --log /tmp/seed396-s5-<label>.log --exit-file /tmp/seed396-s5-<label>.exit -- env PATH=/opt/homebrew/bin:$PATH python3 /tmp/seed396-s5-complete-fault.py` before/after rewrite rejects truncated→complete reader fault; exact source restored.
`slice-clock.mjs run --log /tmp/seed396-s5-final-restored.log --exit-file /tmp/seed396-s5-final-restored.exit -- env PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/evaluation/tests/native-harness/native-stream-completeness.sh Distribution/evaluation/tests/native-harness/native-assessor-counterexample-guard.sh` passed. Trace `/tmp/seed396-s5-consumer-trace.md`: private check only.

### Slice 6

Both checks preserve current entries and every fact; all six adopt vocabulary without private EXIT cleanup or handwritten failure blocks.
`slice-clock.mjs run --log /tmp/seed396-s6-<label>.log --exit-file /tmp/seed396-s6-<label>.exit -- env PATH=/opt/homebrew/bin:$PATH python3 /tmp/seed396-s6-fault.py <watchdog|workspace>` before/after rejects explicit live watchdog and output relocated under deleted workspace; exact PID cleanup/source restoration.
`slice-clock.mjs run --log /tmp/seed396-s6-final-restored.log --exit-file /tmp/seed396-s6-final-restored.exit -- env PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/evaluation/tests/native-harness/native-run-watchdog-cleanup.sh Distribution/evaluation/tests/native-harness/native-run-workspace-isolation.sh Distribution/evaluation/tests/native-harness/native-assessor-counterexample-guard.sh` passed.
Source-shape consumer `native-stream-replay.sh` also passed via runner, `/tmp/seed396-s6-stream-guard-consumer.log`. Trace `/tmp/seed396-s6-consumer-trace.md`.

### Slice 7

Both guides inspected against all five rules and P01–09, including supervision/two-case catalog examples, controlled-proof limits, actual nine-word API and timeout evidence. Family src reuse addresses implementation. New-check walkthroughs follow the intended entries.
`slice-clock.mjs run --log /tmp/seed396-s7-focused.log --exit-file /tmp/seed396-s7-focused.exit -- env PATH=/opt/homebrew/bin:$PATH bash scripts/test.sh Distribution/evaluation/tests/native-harness/native-check-expectations.sh Distribution/evaluation/tests/native-harness/native-assessor-counterexample-guard.sh` passed.
`slice-clock.mjs run --log /tmp/seed396-s7-links.log --exit-file /tmp/seed396-s7-links.exit -- python3 /tmp/seed396-s7-links.py` resolved all27 local links/anchors. Trace `/tmp/seed396-s7-consumer-trace.md`: incoming guide links valid, no runtime prose consumer. Agent noted these independent proof commands overlapped before both terminal receipts were collected; both subsequently exit0 and mutable inputs did not overlap.
