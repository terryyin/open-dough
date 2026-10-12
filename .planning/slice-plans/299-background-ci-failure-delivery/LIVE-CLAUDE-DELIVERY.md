# Reduced live-Claude delivery proof

## Accepted implementation boundary

`ci-background-handoff.mjs` validates the original Claude owner, a live
interactive ancestor, live detached worker, installed asyncRewake hook and the
exact latest accepted/registered Claude Story Branch publication. It returns
pending immediately for a fixed ten-minute window and retains resources.
The async Stop waiter uses existing mailbox filesystem notifications plus a
one-second liveness fallback. A durable exclusive attempted-event claim precedes
native diagnostic feedback/exit2. Pending/success are quiet; closed session,
expiry and cancellation settle without feedback. Status retains uncertainty
without a native acknowledgment. Synchronous hooks do not duplicate enrollment.
Metadata is limited to Claude Story Branch; other hosts/closure keep the old wait.

Root inspected product handoff/session/state/waiter/hook, registration metadata,
existing change watcher, test construction and observing assertions. The local
bare remote actually accepts the SHA before the product registers it. Provider
input supplies pending/failure/success, never the resulting mailbox event or
handoff state. Fake Claude ancestry is explicitly process-test setup; real native
acceptance remains separate in [installed acceptance](CLAUDE-INSTALLED-ACCEPTANCE.md).

## Accepted commands and concrete observations

- `node --test src/skills/dough-execute-plan/scripts/ci-background-handoff.test.mjs src/skills/dough-execute-plan/scripts/ci-background-lifecycle.test.mjs`
  passed7/7 after independent refactoring. Handoff tests observe immediate
  pending before provider response, exact SHA, concurrent hook codes[0,2],
  foreign/child isolation, actual pending coverage held150ms with live waiter
  and empty output, then provider-success silence and enrollment refusal cases.
  Lifecycle tests observe actual host departure without filesystem notification
  (new fallback), exact stop/cancel, clock crossing the product-created deadline,
  no rearm, and broken native output remaining attempted/uncertain without retry.
- `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=4 bash scripts/test.sh src/skills/dough-execute-plan/scripts/ci-host-hook*.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-managed-delivery*.test.mjs src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs src/skills/dough-execute-plan/scripts/ci-deployment-layout.test.mjs src/skills/dough-execute-plan/scripts/ci-supported-host-contract.test.mjs tests/payload-declaration-links.sh`
  passed the reached existing hook, owner/recovery, publication, completion and
  deployed-layout consumers. Initial Trunk metadata assertion exposed an
  unnecessary schema change; restricting metadata to Claude Story Branch removed
  it, then the command passed. Refactoring left that metadata boundary unchanged.
- `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=4 bash scripts/test.sh tests/install-ci-host-hooks.sh tests/install-ci-background-hook.sh tests/install-public-payload.sh src/skills/dough-execute-plan/scripts/ci-host-hook*.test.mjs src/skills/dough-execute-plan/scripts/ci-fixture-lifecycle.test.mjs src/skills/dough-execute-plan/scripts/ci-deployment-layout.test.mjs src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs tests/payload-declaration-links.sh`
  passed after installer event-policy extraction and filesystem-wake edits.
  The installer starts from old synchronous-only registration, adds the new
  exact wrapper once, preserves policy/unrelated handlers, and refuses locally
  edited async settings before any write, including force. All wrappers are
  asserted, not merely the first handler.
- `PATH=/opt/homebrew/bin:$PATH OPEN_DOUGH_TEST_JOBS=4 bash scripts/test.sh src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs src/skills/dough-execute-plan/scripts/execution-completion-record-guidance.test.mjs src/skills/dough-execute-plan/scripts/story-obligations-guidance.test.mjs tests/payload-declaration-links.sh`
  passed after making finish guidance recognize the supported pending alternative.

## Independent refactor and preparation

Fresh refactor returned `## REFACTOR COMPLETE`. Session identity and handoff
state now have cohesive shared homes; the hook’s native output boundary and
asyncRewake settings remain unchanged, so real native proof is reused. Local
waiting changes and moved lifecycle proof were rerun as above. Installer event
policy extraction preserves the public mergeDocument operation and conflict
checks. No new subsystem framework, native turn or full-suite run.
All new modules are declared. Changed runtime/test modules stay within250 lines
at formatter output; existing installer declaration entrypoint retains its
preexisting size exception. One formatter finding in the new shell test was
fixed by observing its snapshot in a separate successful command; that real
installer test passed again. Formatting and hook checks remain coordinator-owned.
