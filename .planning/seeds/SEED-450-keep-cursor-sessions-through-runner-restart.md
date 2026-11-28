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
Cursor wraps it onto the composer arrow line, then ask whether runner identity
should exclude dashboard modules the runner does not execute.

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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A production dashboard redeploy that does not change Cursor-runner
behavior leaves the accepting runner and its held sessions running, so
revival continue is not required for those deploys.

**Scope to refine.** Dashboard process start already uses start-if-absent and
does not stop the runner. New Cursor work replaces an answering runner whose
build digest differs. Recover of one unheld session uses that same
current-runner keep path, so a digest mismatch on Recover would hang up
siblings. In source mode that digest currently covers the runner entry and
every relative module it reaches, including type-only imports: 546 files, 513
of them outside `dashboard/server/hosts/cursor/`. Decide whether intended
behavior is violated, then bound which files prove the runner current.

**Starting evidence.** `runnerProcess.ts` leaves an accepting runner across
dashboard close. `runnerCurrent.ts` replaces on digest mismatch before exec,
keep, or resume-attach. `computeRunnerBuildId` hashes the source closure.
Production preview runs the TypeScript entry, so source mode applies. The
2026-11-28 pause was not this replace: two sibling Cursor sessions on the
same machine kept running without a continue instruction.

## Ordering and Scope Reduction

Submit the wrapped continue first: it unpauses a Recover or revival that
still leaves a wrapped draft, including this single-session resume. The
runner-identity story is a later replace risk and is first in the backlog.
Drop that second story if the digest is already limited to executed runner
code.

## Open Decisions

Whether a digest of executed runner code, a narrower import graph, or an
explicit non-replace across dashboard process restarts is the intended
current-build rule.

## When to Surface

A revived Cursor session shows unsent continue text, or dashboard deploys
restart the runner when Cursor-runner files did not change.

## Breadcrumbs

Screenshot from the 2026-11-28 report. Same-machine sibling sessions that
stayed running. Done stories
SEED-297#submit-revived-cursor-continuation and
SEED-242#revive-cursor-sessions-when-the-runner-restarts.
