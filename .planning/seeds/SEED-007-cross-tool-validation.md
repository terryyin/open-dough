---
id: SEED-007
status: dormant
planted: 2026-09-07
planted_during: Story 7 refinement follow-up on repeated native validation
trigger_when: Owner resumes this exploration in a separate conversation before returning to Quick 019
scope: unknown
---

# SEED-007: Cross-tool validation without repeated delay and permission stops

## Why This Matters

Open Dough guidance must work in Codex, Cursor, and Claude Code. During the
refinement of SEED-001 Story 7, the owner noticed many native verification
slices resembling checks repeatedly performed in earlier story executions.
Launching real agent sessions takes substantial time. Permission interruptions
can stop delegated work even after the owner has authorized the whole task.

The owner wants to understand what really needs live validation, what is already
automated, how earlier evidence can be reused, and whether CI can take on more
of the work without requiring model credentials. This is one exploration topic;
its outcome and implementation scope have not been chosen.

## Owner direction and conversation context

- First refine the current installation/update story conservatively; do not
  expand it beyond the near-term release and retained Donut adoption goal.
- Repeated Codex/Cursor/Claude checks are costly. Investigate automation and
  lessons from past executions rather than replaying everything in each story.
- Routine verification should not repeatedly ask for permission after execution
  has already been authorized, including delegated work.
- Clarify whether native tests run in CI, whether they need login/credentials,
  and how the sibling `../gsd-core` project handles similar testing.
- Latest correction: move this whole discussion out of Quick 019 into a new seed
  with context, exploration, and possibilities. **Do not split it into stories,
  create a slice plan, or implement it yet.** The owner will investigate it in
  another conversation first, then return to the installation/update plan.

The assistant had started adding runner stage selection, permission preflight,
durable result capture, and GSD findings to Quick 019. That was scope expansion.
Those additions have been moved here as exploration material, not decisions or
commitments. The smaller representative test selection can remain in the story
plan; it does not authorize a general validation-system project.

## What was observed in Open Dough

The inspected [CI workflow](../../.github/workflows/ci.yml) runs lint and
`npm test`. The [test runner](../../scripts/test.sh) invokes shell tests without
`--native`. Those paths test real installer/updater operations against disposable
fixtures and print pending native checks; green CI is not live-agent acceptance.

The native paths are already automated once launched. They create fixtures,
launch agent CLIs, capture responses/transcripts, assert installed state and
behavior, and clean up. They use command-line agents, not desktop UI automation:

- [Codex delivery-to-use](../../tests/dough-adr-awareness-codex-delivery-to-use.sh)
  and its [native runner](../../tests/support/native-codex.sh).
- [Cursor delivery-to-use](../../tests/dough-adr-awareness-cursor-delivery-to-use.sh).
- [Claude Code delivery-to-use](../../tests/dough-adr-awareness-claude-delivery-to-use.sh).
- [Installed ADR context checks](../../tests/dough-adr-awareness-context.sh).

Automation does not eliminate the model runtime cost. Some scripts combine
legacy refusal, bootstrap, update, and fresh use, so rerunning one failed part
can replay earlier work. Evidence retention differs: some successful runs remove
their temporary transcripts; the Claude transition wrapper preserves failure
evidence. No full timing study was performed, so these are opportunities to
investigate, not a measured ranking of bottlenecks.

The proposed Story 7 native refusal matrix was narrowed from five cases per host
to one representative edited-equal refusal per host (15 proposed cases to 3).
The shell tests still own the full helper-policy matrix. That is a planning
reduction, not a measured speedup or executed new proof.

## Permissions and authentication are separate

There are at least three boundaries:

| Boundary | Question |
| --- | --- |
| Outer executing host | May it launch this test process and access its required paths/network? |
| Child agent process | May it perform the authorized operations inside its disposable fixture? |
| Model/provider access | Is the process authenticated to an account/provider able to serve model requests? |

Existing wrappers use headless flags, sandbox settings, or explicit tool grants.
Some use broad permission-skip flags. These do not prove that the outer host will
allow the launch without a separate prompt. No transcript of the owner's earlier
permission stops was examined; the precise failing boundary remains unknown.

A fresh CI runner needs an authorized session, API key, or provider identity for
the model-backed conversations performed by Open Dough's current native tests.
Non-interactive execution does not make those model requests unauthenticated.
An existing local login may supply access without entering credentials every run.
Permission to execute a test is not authentication to its model provider.

Official documentation consulted on 2026-09-07:
[Codex authentication](https://learn.chatgpt.com/docs/auth),
[Cursor headless CLI](https://cursor.com/docs/cli/headless), and
[Claude Code authentication](https://code.claude.com/docs/en/authentication).
These distinguish existing login/provider access from API-key-based automation;
recheck supported methods when choosing an approach.

## Exploration of GSD Core

Read-only inspection of `../gsd-core` at
`0be5bf865a6ca8ca6cee5fa9344c35b19d8623ee` found:

| Mechanism | Evidence and what it proves |
| --- | --- |
| Real installation, without a model conversation | [Codex install smoke test](../../../gsd-core/tests/codex-inherit-smoke.test.cjs) runs the real GSD installer, then GSD's own validators over emitted TOML. It does not invoke Codex to follow guidance. |
| Generated artifact coverage | [Install-tree tests](../../../gsd-core/tests/golden-install-tree.test.cjs) compare actual emitted paths across supported runtimes; companion parity checks compare contents. These need no model credentials. |
| Process integration using a substitute executable | [Windows reviewer process test](../../../gsd-core/tests/review-lane-windows-spawn-resolution.test.cjs) stages a fake Codex executable and exercises GSD's real launch/output handling. It proves that integration boundary, not live model behavior. |
| Real native CLI validation without model requests | The dedicated `plugin-validate` job in [test.yml](../../../gsd-core/.github/workflows/test.yml) installs Claude Code and runs [plugin-manifest tests](../../../gsd-core/tests/plugin-manifest.test.cjs), including `claude plugin validate ... --strict`, in a temporary CLI home. The workflow provisions no model credential for that job. |
| Reduced repeated CI work | [Test-scope selection](../../../gsd-core/scripts/ci-test-scope.cjs) selects affected tests; the workflow shards larger suites and avoids repeating auxiliary suites on every shard. |

Some older comments in the plugin test still describe native validation as
local-only. The current workflow and later test sections explicitly provision
Claude CLI in CI; those were inspected rather than relying on the stale comments.

No model-backed agent-conversation CI job was found in the inspected workflows.
This is a statement about the checked source, not proof that every GSD test or
external automation has been audited. No GSD tests or live CI runs were executed.
GSD's use of a real CLI for structural validation must not be confused with a
model discovering, interpreting, and applying guidance.

## Possibilities to explore together

These are alternatives or compatible techniques, not ordered work or stories:

- Keep exhaustive logic/error variations in fast deterministic tests, with a
  small representative live check for each affected native integration.
- Reuse per-platform evidence when its covered behavior, installed entry point,
  adapters, supporting files, relevant fixture, and runtime remain applicable.
  Make invalidation explicit rather than treating every commit as a full reset.
- Use credential-free native format/configuration validators where an actual
  supported command fits Open Dough's artifacts. Do not assume all hosts have
  equivalent validators or introduce plugin packaging just to gain one.
- Keep model-backed tests in the existing authenticated local environment, or
  explore a deliberately provisioned trusted CI environment if its cost and
  benefit justify it. No CI credentials, secret copying, runner service, or
  global configuration changes have been authorized or implemented here.
- Allow affected-stage selection and reusable setup in existing native scripts,
  while keeping fresh sessions where installation changes require them. Capture
  results before cleanup so failures do not force unrelated cases to replay.
- Preserve compact evidence with case, host/runtime, tested revision, elapsed
  time, result, and transcript/snapshot references. Decide how much is sufficient
  before building an evidence store or automatic cache.
- Make authorized fixture tests unattended using supported bounded permissions,
  task-owned paths, and an upfront environment check. Avoid blanket unrestricted
  access. A genuine host restriction must fail clearly, not hang awaiting input,
  silently pass, or repeatedly restart the same approval request.
- Consider affected-test selection or isolated concurrent execution only if
  measured costs justify it; avoid importing GSD's large CI system wholesale.

## Open questions for the next conversation

- What evidence is necessary for native discovery, application, and semantic
  behavior, versus installation format or helper correctness?
- Which prior proofs remain valid, and what exactly should invalidate them?
- What caused the actual permission interruptions: outer launch policy, child
  operation permissions, authentication, or something else?
- Which supported credential-free validators apply to today's Open Dough
  artifacts? What coverage do they leave unproved?
- Where should the few model-backed checks run, and what existing authentication
  can they legitimately use without repetitive human intervention?
- Which improvement first removes the most observed time or interruption with
  the least new machinery?

## Boundaries and handoff

Keep this as one unsplit exploration until the owner chooses an outcome. No
stories, execution leaves, accepted architecture, new test platform, credential
provisioning, or implementation is established by this capture.

The repository's [acceptance guard](../../AGENTS.md) still requires independent
Codex, Cursor, and Claude Code evidence for affected discovery, invocation/use,
behavior, installation/updating, and coexistence. Reuse is allowed only where
the change does not invalidate the earlier proof. Missing native proof remains
pending. This capture neither changes that guard nor distributes it to clients.

Resume here in a separate conversation; after resolving the exploration, return
to [Quick 019](../quick/019-standalone-client-update/PLAN.md) and
[SEED-001 Story 7](SEED-001-install-and-update-open-dough.md#standalone-client-update).
The installation/update goal and product queue remain intact. Scope and effort
for this exploration are deliberately unknown until a direction is selected.
