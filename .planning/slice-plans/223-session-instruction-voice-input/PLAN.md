# Dictate startup instructions and review the text before launching

**Identity:** SEED-084#session-instruction-voice-input
**Source:** [refined story](../../seeds/SEED-084-session-instruction-voice-input.md#session-instruction-voice-input).
**Prepared:** 2026-10-03. Terry accepted the file-transcription API direction,
then added System settings and general OpenAI API-key configuration, restricted
the environment key to brief story experiments/tests, and requested the latest
suitable dictation model. He authorized refinement and updating this existing
plan. That preparation authorized neither implementation nor publication;
current execution authority is recorded below.

## Goal and boundaries

A developer records an instruction in the dashboard's startup dialog, explicitly
stops, reviews or edits its transcription in the existing field, then explicitly
starts the session with that text. Recording never starts an agent session.

Required behavior includes preserving and appending to existing text once,
blocking field edits and Start while dictation is pending, keeping Cancel
available, recovering by typing or explicitly retrying after failure, ending
capture on dismissal, ignoring results belonging to a closed dialog, and
preserving an over-length transcript for shortening before insertion.

The developer manages projects and general OpenAI access in one cohesive
**System settings** view. Move project add/remove there; preserve the selector,
URL/path validation, ordered configuration, removal confirmation and retention
of checkouts/session records/running sessions. Keep development/production
project lists separate. Settings stays reachable with no projects configured.

The OpenAI section saves, replaces and removes one machine-level API key, shared
by development and production and first consumed by dictation. Store it privately
on the local server; saved-key reads return configured status, never the secret.
A saved key survives restart; failure preserves its predecessor. Explicit Save
makes no paid validation request. No key means useful setup feedback while typed
startup stays available. A key configured here is general OpenAI access, not a
project, native-host, or dictation-only credential.

Terry's environment `OPENAI_API_KEY` is authorized only for brief experiments or
tests within this story. Do not copy it into settings or ship an environment
fallback. Ordinary dictation reads the settings credential. Automated checks use
synthetic keys and isolated machine storage, with real environment keys unset.

Use the latest supported completed-recording transcription model. The official
[file guide](https://developers.openai.com/api/docs/guides/speech-to-text) and
[model page](https://developers.openai.com/api/docs/models/gpt-transcribe), checked
on 2026-10-03, recommend `gpt-transcribe`; the official
[deprecations page](https://developers.openai.com/api/docs/deprecations) marks the
Whisper/GPT-4o transcription family for replacement. Recheck official guidance
when execution starts, select the latest suitable supported model and record its
actual ID in probe/proof. No automatic model discovery, user model chooser or
silent provider/model fallback is required.

The first representative voice proof uses existing Chromium coverage and an
English instruction containing project terms; neither becomes a product ban on
other browsers or languages. Follow the story's System settings UI design with
Projects and OpenAI sections, accessible controls, narrow-screen reflow and
predictable return/focus behavior.

Deferred: live voice conversation, partial transcripts, speech-end detection,
translation, offline processing, audio history/playback, file import, and provider
selection. Do not add their infrastructure. The existing 4,000-character field
limit remains authoritative; examples do not introduce another instruction limit.

## Linked execution context

[Planning direction, PFE, baseline premises and sizing](CONTEXT.md) retain the
prepared context. [Proof ownership, local gates and accepted observations](PROOF.md)
retain proof decisions. These are parts of this active plan, not a second ledger.

## Execution context

Execution authorized on 2026-10-03 by `$dough-execute-plan` with an established
start; reuse its published claim without a second Take. Identity:
`SEED-084#session-instruction-voice-input`; publisher:
`dashboard-territory.local-open-dough`; agent: `ziqing-chan`.

- Mode: story-branch. Owned, reused execution checkout:
  `/Users/terryyin/git/open-dough/.worktrees/dictate-additional-instructions-when-starting-a`.
- Execution branch: `codex/dictate-additional-instructions-when-starting-a`.
  Remote: `origin`; integration target: `main`; increments publish to the
  execution branch. No integration/default-checkout mutation is selected.
- Starting revision: `dbaec2c4efc7e0851cc7615920d078046b8f91da`.
  Accepted claim and initially published base/candidate:
  `6a866b4170cb743a92d286f02c0e6706d9001a80`. `git ls-remote` confirmed the
  execution branch holds that SHA; the owned checkout was clean at entry.
- Node 24.21.0 selected from
  `/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin`.
  Checkout-bound locked setup and applicable command passed:
  `env -u NODE_ENV -u NO_COLOR -u FORCE_COLOR -u OPENAI_API_KEY -u OPENAI_API_TOKEN PATH=/tmp/open-dough-release-node-0.3.55/node-v24.21.0-darwin-arm64/bin:$PATH node scripts/setup-native.mjs npm`
  and the same environment with `node scripts/setup-native.mjs check`.
  Chromium: 153.0.8010.12. Lockfile unchanged.
- No new overrun-replanning authority was supplied; preserve existing planning
  authority and stop for any story-scope decision. No numeric slice limit exists.
- Selective formatter: `npm run format`; check-only commit hook:
  `npm run --silent lint -- --staged`. The coordinator owns these commands.
- CI: GitHub Actions `ci.yml`, push-triggered for the execution branch; verified
  with `gh run list --repo terryyin/open-dough --workflow ci.yml --branch codex/dictate-additional-instructions-when-starting-a --event push --limit 1 --json workflowName`
  (exit 0, no existing branch run). Codex yielded observer armed from this
  execution checkout for the established claim continuation; ordinary managed
  delivery reuses it. Coordinator `ziqing-chan-root`, cell `23`, session `8725`,
  PID `30052`, mailbox `/tmp/dough-ci-501/watch-kqsjva`. The claim's trunk CI
  remains unobserved; do not register that trunk publication on this observer.
- First slice: one short actual microphone clip and one request; operator
  availability requested while the disposable probe is prepared. No audio or
  credential is persisted. Official file guide and model page rechecked at entry:
  selected model remains `gpt-transcribe`.

## Ordered slices

Full behavior, proof setup and safe stopping points are in
[the numbered slice contracts](SLICE-CONTRACTS.md). Execute these unchanged
contracts; summaries here preserve canonical progress, not narrower scope.

### 1. A representative spoken instruction becomes a usable transcript
Type: Behavior
Status: planned
One actual microphone clip, one `gpt-transcribe` request, useful editable draft.
Operator pending; no paid request/capture yet. Dependent voice work stays stopped.

### 2. Manage configured projects in System settings
Type: Behavior
Status: done
One global settings view; relocate existing project management and preserve
navigation, selection, validation, storage, running sessions and terminal context.
Implementation/refactor proof [accepted](PROOF.md#accepted-slice-2-proof);
formatter passed. This increment publishes the completed slice.

### 3. Configure general OpenAI access in System settings
Type: Behavior
Status: planned
Save/replace/remove one private machine credential, status-only reads, restart
and shared dev/preview visibility; no validation request or environment fallback.

### 4. Dictate, review, and start with the edited instructions
Type: Behavior
Status: planned
Shared dialog recording-to-review-to-explicit-Start journey, saved-key consumer,
bounded local/provider request and complete dismissal/late-result cleanup.

### 5. Unavailable dictation leaves the typed instruction usable
Type: Behavior
Status: planned
Actionable failure categories preserve the field/resources; typing and explicit
retry work, without automatic paid retries or secret disclosure.

### 6. Shorten an over-length transcript without losing either draft
Type: Behavior
Status: planned
Respect the shared 4,000-character boundary; retain complete overflow for
shortening/add/discard and prove the reviewed native text handoff.

## Current decisions

- System settings contains Projects and OpenAI, representing machine-local
  configuration directly. Existing project operations/storage remain one owner;
  only their entry/navigation move. Preserve valid selection, empty-state access,
  running-session context and keyboard/focus behavior.
- The general OpenAI key is configured through System settings and stored once
  privately on this machine, shared across dev and production. Project lists
  remain environment-specific. Dictation is the first consumer; no extra API
  consumer or general secrets/provider framework is built.
- Terry's environment key is authorized only for brief experiments/tests within
  this story. No environment fallback or automatic import ships. Settings save
  confirms persistence, not entitlement; provider access is exercised explicitly
  through dictation, with no automatic paid test/retry.
- File transcription uses the latest suitable documented model, currently
  `gpt-transcribe`. Recheck official model/deprecation guidance before the live
  probe and record the selected ID. A failed probe changes the dependent API
  approach before dictation implementation, not the story's goal.
- Recorded audio is transient; reviewed submitted text follows the existing
  launch record. Pending dictation blocks submission, closing invalidates it,
  and failure restores typing. One append/length rule serves all startup paths.
- Provider request/response sizes and waiting are bounded. Choose operational
  bounds using the probe and existing failure mechanics; provider limits do not
  silently introduce a new product duration restriction.
- Automated proof replaces external provider/native behavior, not configuration,
  persistence, recording, upload, field integration or launch handoff. The real
  probe owns only the external compatibility premise those seams cannot settle.

## Learnings

Slice 1: a disposable probe is ready at `http://127.0.0.1:43189`, using the
actual unchanged `LaunchDialog` in an isolated Vite mount. Start is disabled;
no native launcher is mounted. Harness `node_modules/.cache/voice-probe-084/`
and server session `24402` are owned temporary resources. Page and module HTTP
smokes passed; no recording or provider request has occurred. Actual microphone,
MIME/bytes, model access/decoding, latency and useful edited draft remain
unobserved pending operator participation. Do not mark this slice complete or
reuse synthetic speech as its proof. Slices 4–6 remain dependent on this gap;
proceed with independently supported settings slices 2–3 as the probe's stop
contract allows. Retain the probe for the operator, then stop its exact server
and remove its owned harness after accounting for any result.
