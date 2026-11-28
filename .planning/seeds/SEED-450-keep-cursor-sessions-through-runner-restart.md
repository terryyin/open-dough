---
id: SEED-450
status: active
planted: 2026-11-28
planted_during: Terry reported a Cursor session left paused with continue text in the composer and no Enter
trigger_when: A revived Cursor session still shows an unsent continue instruction, or dashboard deploys restart the runner
scope: epic
---

# SEED-450 — Keep Cursor sessions through runner restart

## Why This Matters

On 2026-11-28 a Cursor execution session for
SEED-413#github-request-lifetime-and-evidence-via-vitest sat at the composer
with the revival continue instruction already typed, including the reporting
command, and no Enter. The agent was paused until a person submitted it.
Recover and last-held revival are supposed to send that instruction, not
leave it as a draft.

The first reading was a Cursor runner restart. Same-machine evidence
contradicts that for this pause: two other Cursor sessions on that machine
kept running, needed no continue instruction, and were not revived. A runner
replace hangs up every client the runner holds, so those siblings would have
been interrupted. This session was therefore resumed alone — Recover of one
unheld unfinished session, or an equivalent keep with `cursorRecoveryContinuation`
— while the accepting runner stayed up.

A separate coupling remains: Recover and other new Cursor work still go
through the current-runner path, which replaces an answering runner whose
source-closure digest differs. That can still interrupt siblings on a later
dashboard deploy. It is not what paused this session.

## Alternatives and Decision

Leave the existing paste-chip and full-line composer-draft detectors as they
are, and treat runner replacement on any source-closure digest change as
intended current-build proof. That would keep both the unsent continue and
the later replace risk. Split the report: first submit the continue when
Cursor wraps it onto the composer arrow line. The runner-identity story then
counts modules the runner entry reaches through a value import, including a
dynamic import, and leaves out modules reached only through a type-only
import.

## Story Decomposition

<a id="submit-wrapped-revived-cursor-continuation"></a>

### Submit a wrapped revived Cursor continuation

**Identity:** SEED-450#submit-wrapped-revived-cursor-continuation
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** After Recover or last-held revival pastes the multiline continue
instruction, Cursor actually receives it: Enter is sent, the session is not
left paused with that text sitting in the composer.

**Scope.** The keep path's `LaunchInstruction` submit for a revived Cursor
continuation whose idle composer shows a wrapped tail of the pasted text
(arrow on a fragment such as `without opening another assignment.` plus the
reporting-command lines below), not only a paste chip or a composer line that
contains a 48-character head or 40-character tail of a full instruction line.
Out of scope: changing when the runner process is replaced; rewriting the
continue wording; Claude or Codex keep.

**Key examples.**

- Given revival pastes the recorded continue instruction, and Cursor shows
  `→ without opening another assignment.` as the composer line with the
  reporting command still in the draft below, Enter is sent once and first
  input stays confirmed.
- Given the same instruction appears as `[Pasted text #1 +N lines]`, Enter is
  still sent once, as today.
- Given a later paint is not that draft and not a paste chip, Enter is not
  sent.

**Evidence.** Screenshot of the paused session: composer `→ without opening
another assignment.` then `Reporting command: 'node'` and the dashboard
completion command. Existing coverage in
`dashboard/backend-tests/sessions/cursor-recovery-frame.spec.ts` uses a
composer line that still contains the full
"Continue from this worktree's committed and uncommitted state without
opening another assignment." sentence; that is not the wrapped-arrow shape
from the report. SEED-297 already shipped submit-on-composer-draft for the
unwrapped line. Same-machine follow-up: two other Cursor sessions on that
machine stayed running with no continue instruction, so this paste was a
single-session resume rather than last-held revival after a runner replace.

**Acceptance.** A regression for the wrapped-arrow draft fails on current
behavior, then passes after the smallest submit-path change. Related
`cursor-recovery-frame` cases still pass.

<a id="keep-runner-across-unrelated-dashboard-deploys"></a>

### Keep the Cursor runner across unrelated dashboard deploys

**Identity:** SEED-450#keep-runner-across-unrelated-dashboard-deploys
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/893-keep-runner-across-unrelated-dashboard-deploys/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"7518eebae8e48985e5f0b65e9693dbd115f2615791d8aab30d25cb6b7c10e1a0","plan":"ff5546040c006cbb8b4ca2a59c40c3edea8df59bd324bbe5d57ec82dbd06a119"}}
```

**Goal.** A production dashboard redeploy that does not change code the
accepting Cursor runner executes leaves that runner and its held sessions
running, so revival continue is not required. A redeploy that changes
executed runner code still replaces the runner before the next new Cursor
work, and last-held revival then runs as it does today.

**Scope.** Source-mode build identity counts the runner entry and every
module it reaches through a value import, including a dynamic `import()`.
A module reached only through a type-only import (`import type`,
`export type`, or a specifier list that is entirely `type`) does not count.
A module reached by any value path still counts when another import of it
is type-only. Changing an uncounted file leaves the accepting runner in
place, and the next new Cursor work reuses it. Changing a counted file
still replaces the runner before that work answers. Bundled mode stays a
digest of the bundled file alone. Dashboard process start stays
start-if-absent and does not stop the runner.

Out of scope: a digest limited to `dashboard/server/hosts/cursor/`, which
would miss shared modules the runner executes, including terminal
attachments and story notes. Stopping replacement when executed runner code
changes. Claude or Codex runners. The wrapped-continue submit. Helper
repair, and leaving a runner that does not answer the protocol.

**Key examples.**

- Given an accepting source runner, when a redeploy changes only
  `dashboard/server/agentLaunches.ts` (reached from runner code such as
  `recover.ts` by `import type`), the next new Cursor work reuses that
  runner and held sessions stay up.
- Given an accepting source runner, when a redeploy changes
  `dashboard/server/terminalAttachments.ts` (value-imported by
  `runnerMain.ts`), the next new Cursor work replaces the runner before
  that work answers, and last-held revival runs as today.
- Given an accepting source runner, when a redeploy changes
  `Distribution/src/skills/dough-execute-plan/scripts/ci-mailbox-cli.mjs`
  (reached by a dynamic import from the value-import closure), the next new
  Cursor work replaces the runner the same way.
- Given a bundled runner, changing a source file beside the bundle leaves
  the identity unchanged, and changing the bundle file changes it.
- Given `import { type Label, read } from "./shared.ts"`, changing that
  module changes the identity. Given only `import type`, changing the
  module leaves the identity unchanged.

## Ordering and Scope Reduction

Submit the wrapped continue first: it unpauses a Recover or revival that
still leaves a wrapped draft, including this single-session resume. The
runner-identity story follows it, using the value-import digest recorded on
that story. Stopping after the wrapped continue leaves type-only modules in
the source closure, so a later dashboard deploy can still replace the runner
when only one of those modules changed.

## Open Decisions

None. The current-build rule is the value-import digest on the
runner-identity story.

## When to Surface

A revived Cursor session shows unsent continue text, or a dashboard deploy
replaces the accepting Cursor runner when that redeploy did not change code
the runner executes.

## Breadcrumbs

Screenshot from the 2026-11-28 report. Same-machine sibling sessions that
stayed running. Done stories
SEED-297#submit-revived-cursor-continuation and
SEED-242#revive-cursor-sessions-when-the-runner-restarts.
