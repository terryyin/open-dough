# Reject malformed custom CI revisions before classification

## Source and provenance

Bounded correction from the execution retrospective for
[SEED-011 Story 1](../../seeds/SEED-011-customize-project-ci-watcher.md#customize-project-ci-watcher).
The reviewed execution begins at implementation commit `c748b9d`, completes its
candidate payload at `08d8eb2`, and releases it as `v0.3.21` at `1996670`.
Status: planned. This retrospective authorizes planning only, not execution.

## Goal and scope

A project whose custom CI command returns malformed revision text receives one
bounded observation-unavailable result instead of a CI failure or coverage claim
for an invalid revision identity. Preserve every valid adapter behavior released
in `v0.3.21`, including opaque run/attempt identities, case-insensitive full Git
SHAs, exact-revision coverage, diagnostic retry, GitHub default behavior, and
asynchronous host delivery.

The current defect is at the custom provider translation boundary:
`normalizeAttempt` accepts any string for `sha`. A read-only process-boundary
probe returned `not-a-full-sha` as `headSha`, then produced `CI_FAILURE` with that
same value. The published contract requires `FULL_PUSHED_COMMIT_SHA`, and the
story requires invalid adapter results to remain observation limitations.

Exclude new providers, protocol versioning, abbreviated SHA support, URL/time
normalization, CI dispatch, configuration migration, and changes to GitHub run
acquisition. Those concerns are neither required to prevent malformed revision
classification nor established by this finding.

## Existing solution and decisions

- Keep validation in `ci-command-adapter.mjs`, where project response fields are
  already translated into the shared run/attempt model. Do not add validation to
  host bridges, coverage storage, or repair guidance.
- Reuse the observer's existing three-consecutive-error policy and bounded
  `CI_MONITOR_UNAVAILABLE` event. A malformed attempt is an acquisition error,
  not a code failure and not a new error category.
- Follow ADR 0002's one coherent domain model and ADR 0006's executing-project
  perspective. No Accepted ADR conflict or new architectural decision exists.
- The near-future Story Branch Mode direction is unaffected; this correction
  strengthens the existing execution feedback lifecycle without changing its
  transitions.

## Ordered slices

### 1. Reject an invalid checked revision at the adapter boundary

Type: Behavior
Status: planned

Behavior: Given a configured custom adapter whose discovery response otherwise
looks like a failed attempt but whose `sha` is not a full 40-character
hexadecimal Git revision, observation retries through the existing bounded error
policy and emits one `CI_MONITOR_UNAVAILABLE`. It emits no `CI_FAILURE`, does not
update exact-revision coverage, and does not fall back to GitHub. A valid
uppercase or lowercase full SHA continues through normal pending, success,
failure, incomplete, and diagnostic behavior.

Proof: Extend the real executable-adapter cases in
`ci-command-adapter-unavailable.test.mjs` with malformed revision text and assert
three discovery attempts, one bounded unavailable event, no failure event, and
zero `gh` calls through the public watcher boundary. Retain the existing command
adapter, exact-revision coverage, bounded diagnostic, cancellation, and GitHub
regression suites. Inspect the setup and event assertions, not only exit status.

Stopping point / sizing: One validation rule and one outside-in error-path proof.
No separate Structure slice or protocol redesign is justified.

## Proof ownership

| Correction promise | Owning proof |
| --- | --- |
| Malformed SHA cannot become CI failure or coverage | Slice 1 public watcher/process case |
| Existing bounded unavailable policy and no fallback | Slice 1 event count, reason bound, retry count, and `gh` assertions |
| Valid custom and GitHub behavior remains intact | Existing adapter, coverage, diagnostic, cancellation, and GitHub regression suites |

## Planning concerns

No remaining slice-specific concern was identified. The established adapter
normalization boundary and observer error policy directly own the correction.

