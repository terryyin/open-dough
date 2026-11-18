# Mount trial, 2026-11-18

Scratch observation at `901d7c3b9`: `startDashboardServer` routed every
boundary-mode start to an in-process mount of `localBoundaries` without
`dough-incident-record`, on the Cursor runner stand-in, with the server
environment applied to the worker for the mount's lifetime, one mounted
server at a time, and the project environment reset before each mount.
A start made while another mount was up in the same test stayed live.
Command: `npm run test:dashboard:backend -- --grep-invert '[Cc]ursor'`,
two workers, load average 13 to 15. 1,634 cases ran: 1,545 passed, 74
failed, 15 skipped. 900 starts mounted. The scratch edits are reverted.

## Cases that failed on the mount

Failed cases, spec under `dashboard/backend-tests/`, and the first error.
`agent-launch-codex-observation-wait` also failed on the live server in the
baseline run.

- 1 `configuration/project-add-validation.spec.ts`: Error: A dashboard server cannot use both project environments.
- 1 `intent/intent-ci-comparison-pending-proof.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality
- 1 `intent/intent-ci-comparison-receipt.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality
- 2 `intent/landed-ci-history-collection.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>
- 2 `intent/landed-ci-history-pending.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>
- 1 `intent/landed-ci-proof-adapter-units.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>
- 3 `intent/landed-ci-proof-collection.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>
- 1 `intent/landed-ci-scope-adapter-identity.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>
- 1 `intent/landed-ci-scope-adapter-shared-attempt.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>
- 1 `intent/landed-ci-scope-build-provenance.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>
- 1 `intent/landed-ci-scope-later-build.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>
- 2 `intent/landed-ci-scope-pending-proof.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>
- 1 `intent/landed-ci-scope-proof-adapter-recovery.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>
- 1 `intent/landed-ci-scope-proof-completion.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>
- 1 `intent/landed-ci-scope-retained-window.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>
- 1 `launches/agent-launch-acceptance-kept-first-cleanup.spec.ts`: see run
- 1 `launches/agent-launch-acceptance-kept-first.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality
- 1 `launches/agent-launch-acceptance.spec.ts`: Error: expect(received).toEqual(expected) // deep equality
- 1 `launches/agent-launch-change-wait.spec.ts`: Error: expect(received).toMatchObject(expected)
- 1 `launches/agent-launch-codex-lifetime.spec.ts`: Error: expect(received).toEqual(expected) // deep equality
- 1 `launches/agent-launch-cross-server-accept.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality
- 1 `launches/agent-launch-follow-up-story.spec.ts`: Error: expect(received).toContainEqual(expected) // deep equality
- 3 `launches/agent-launch-own-record-continuation-race.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality
- 2 `launches/agent-launch-start-resume.spec.ts`: Error: expect(received).toMatchObject(expected)
- 2 `launches/agent-launch-start-session-landing-admission.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path>; Error: Command failed: <path> <path> deliver --mode story-branch --tracking one-shot --workspace <path> --bran
- 1 `launches/agent-launch-start-session-landing-retained.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality
- 1 `launches/agent-launch-worker-handoff.spec.ts`: Error: expect(received).toMatchObject(expected)
- 2 `observation/authenticated-read-backoff.spec.ts`: Error: expect(received).toEqual(expected) // deep equality
- 1 `observation/authenticated-read-diagnostics-bounds.spec.ts`: Error: expect(received).toHaveLength(expected)
- 1 `observation/authenticated-read-diagnostics.spec.ts`: Error: expect(received).toEqual(expected) // deep equality
- 1 `observation/authenticated-read-incident-record-bounds.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality
- 2 `observation/authenticated-read-incident-record-lifecycle.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality; Error: expect(received).toEqual(expected) // deep equality
- 1 `observation/authenticated-read-incident-record-restart.spec.ts`: Error: expect(received).toMatchObject(expected)
- 1 `observation/authenticated-read-incident-record-stalls.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality
- 1 `observation/authenticated-read-incident-record.spec.ts`: Error: expect(received).toEqual(expected) // deep equality
- 2 `observation/authenticated-read-resumption.spec.ts`: Error: expect(received).toBeLessThanOrEqual(expected)
- 1 `observation/authenticated-read-retained-answers.spec.ts`: TypeError: expect(received).toHaveLength(expected)
- 1 `observation/authenticated-read-shared-failures.spec.ts`: Error: expect(received).toBeLessThan(expected)
- 1 `observation/authenticated-read-subprocess-lifecycle.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality
- 1 `observation/shared-request-owner.spec.ts`: Error: expect(received).toMatchObject(expected)
- 1 `review/one-shot-landing-capture-admission.spec.ts`: Error: Command failed: <path> --input-type=module -e import {publishExecutionIncrement} from "file://<path> im
- 1 `review/one-shot-landing-capture-binding.spec.ts`: Error: Command failed: <path> --input-type=module -e import { publishExecutionIncrement } from "file://<path> 
- 1 `review/one-shot-landing-capture-cli.spec.ts`: Error: Command failed: <path> <path> deliver --mode story-branch --tracking one-shot --branch codex/prepare-th
- 2 `review/one-shot-landing-capture.spec.ts`: Error: Command failed: <path> --input-type=module -e import {publishExecutionIncrement} from "file://<path> im
- 1 `review/one-shot-landing-recovery-binding.spec.ts`: Error: expect(received).toMatchObject(expected)
- 1 `review/one-shot-landing-recovery-deletion.spec.ts`: see run
- 1 `review/one-shot-landing-recovery-retention.spec.ts`: Error: Landing capture was not acknowledged: This dashboard accepted no such reporting launch.
- 1 `review/story-review-completed-capture-fallback.spec.ts`: Error: Command failed: <path> <path> deliver --mode story-branch --tracking one-shot --workspace <path> --bran
- 1 `review/story-review-one-shot-admission.spec.ts`: Error: Command failed: <path> <path> deliver --mode story-branch --tracking one-shot --workspace <path> --bran
- 1 `runtime/boundary-server.spec.ts`: Error: Command failed: ps -o command= -p 4194303
- 1 `sessions/agent-completion-early-recovery.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality
- 1 `sessions/agent-completion-quiet-closure.spec.ts`: Error: Expected a private machine HOME
- 1 `sessions/agent-completion-returned-closure.spec.ts`: Error: Unexpected Cursor protocol work on the runner stand-in: GET /sessions, GET /sessions, GET /sessions
- 1 `sessions/agent-completion-superseded.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality
- 2 `sessions/agent-launch-codex-observation-sharing.spec.ts`: Error: Unexpected Cursor protocol work on the runner stand-in: GET /sessions; Error: expect(received).toBe(expected) // Object.is equality
- 1 `sessions/agent-launch-codex-observation-status.spec.ts`: Error: expect(received).toContainEqual(expected) // deep equality
- 1 `sessions/agent-launch-codex-observation-wait.spec.ts`: Error: expect(received).toEqual(expected) // deep equality
- 1 `sessions/agent-launch-retention-scope.spec.ts`: Error: Unexpected Cursor protocol work on the runner stand-in: GET /sessions, GET /sessions
- 2 `sessions/session-instruction-voice-boundary.spec.ts`: Error: expect(received).toBe(expected) // Object.is equality; Error: expect(received).toEqual(expected) // deep equality

## Specs that ran a second server beside a mounted one

Starts that stayed live because the same test already held the mount.

- 5 `intent/landed-ci-history-lifecycle.spec.ts`
- 1 `launches/agent-launch-change-wait.spec.ts`
- 2 `launches/agent-launch-cross-server-accept.spec.ts`
- 1 `launches/agent-launch-follow-up-live.spec.ts`
- 1 `launches/agent-launch-records-replaced.spec.ts`
- 2 `launches/agent-launch-records.spec.ts`
- 1 `observation/authenticated-read-diagnostics.spec.ts`
- 5 `observation/authenticated-read-directed-wait.spec.ts`
- 1 `observation/authenticated-read-revision-check-failures.spec.ts`
- 1 `observation/private-http-stand-in-runner.spec.ts`
- 4 `observation/shared-request-owner.spec.ts`
- 1 `review/ad-hoc-session-commits-done.spec.ts`
- 2 `runtime/fake-gh-in-process-scopes.spec.ts`
- 1 `sessions/agent-launch-done-prompt.spec.ts`
