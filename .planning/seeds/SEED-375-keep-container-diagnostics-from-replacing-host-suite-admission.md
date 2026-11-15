---
id: SEED-375
status: active
planted: 2026-11-15
planted_during: Project-local retrospective findings maintenance
trigger_when: selected from the product backlog
scope: story
---

# SEED-375 — Keep container diagnostics from replacing a live host test-suite owner

<a id="keep-container-diagnostics-from-replacing-host-suite-admission"></a>

### Keep container diagnostics from replacing a live host test-suite owner

**Identity:** SEED-375#keep-container-diagnostics-from-replacing-host-suite-admission

Open Dough contributors can run Linux CI diagnostics while another worktree
holds local full-suite admission without losing the host run's result.
[DD-432](../../docs/maintainer/project-test-findings.md#dd-432) records an
otherwise passing suite whose teardown exited 1 after its owner was replaced.
The retained ref matched a container PID and start time. The historical
command line is unknown. The current plain container path mounts the common
Git directory and can apply its own PID namespace to the host's owner record.

In a disposable repository, hold host admission while a pathless plain
container diagnostic encounters an owner it cannot see. The host owner retains
the ref and releases it successfully. The diagnostic returns the verdict
of its own checks once it runs. Verify that host full suites still serialize
and recover stale owners. Keep this story to the local
container/host admission boundary and established CI diagnostics.
