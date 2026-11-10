# Insert common prompts in the dashboard terminal

**Identity:** SEED-298#insert-common-prompts-in-the-dashboard-terminal
**Source:** [Refined story](../../seeds/SEED-298-insert-common-prompts-in-the-dashboard-terminal.md#insert-common-prompts-in-the-dashboard-terminal)
**Source review:** [Independent source commitments](source-review.md)
**Preparation:** owned workspace
`/Users/terryyin/git/open-dough/.worktrees/insert-common-prompts-in-the-dashboard-terminal`,
branch `cursor/insert-common-prompts-in-the-dashboard-terminal`, starting
revision `334460b73e52dc2dd235b22f75b8154c380b703b`. This plan authorizes no
execution.

## Goal and scope

A developer replying in the Side panel terminal can open **Prompts** in the
former Dictate session-actions slot, insert the literal replies `OK` or
`as recommended` without Enter, or start the existing terminal dictation flow
from that menu, then edit and send deliberately. While recording, **Stop
recording** replaces **Prompts**; when recording ends, **Prompts** returns.
Desktop and mobile headers share the control. Preset offers use the same
attachment acceptance and recovery naming as other terminal inserts.

Out of scope: custom prompt libraries, more presets, auto-send, contextual
replies, new keyboard shortcuts for presets, dictation transcription or OpenAI
setup changes, and phone key-toolbar / Compose redesign.

## Architecture and reuse

PFE: the responsibility is “offer short canned terminal replies and Dictate
from one header session action.” Existing owners: `useTerminalDictation`
(Dictate / Stop recording control and transcript recovery),
`useAttachedTerminal.insertText` / `attachedTerminal.insert` (local offer, no
Enter, focus), session-actions header in `Terminal.tsx`, and
[Terminal input](../../../dashboard/AGENT-LAUNCH-TERMINAL-INPUT.md). Reuse and
change that header control owner so **Prompts** wraps the two presets plus the
existing dictation start; do not add a second insert path, wire message, or
repository-backed prompt catalog. Fixed phrases stay panel-local UI strings.

Follow [ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0001 — Ubiquitous language](../../../docs/adrs/0001-ubiquitous-language-accepted.md)
for Side panel / session-actions naming. No Accepted conflict; index and
in-file status agree. No new North Star topic: ordinary panel chrome within
existing terminal contracts.

Common rule: one header slot; menu chooses insert-or-dictate; inserts never
submit; recording owns the same slot as today.

## Outside-in proof ownership

| Final promise | Owning slice and observable proof |
| --- | --- |
| **Prompts** replaces Dictate in session actions; menu offers `OK`, `as recommended`, Dictate | 1: dashboard Playwright journey opens **Prompts**, sees the three choices |
| Choosing a preset inserts that text with no Enter; focus allows edit then Enter | 1: traffic/assert input shows the phrase without a submit line until Enter; existing typed text preserved as insert already does |
| Dictate from the menu starts recording; Stop recording replaces Prompts; Prompts returns | 1: updated voice journey through menu → record → stop; existing recovery/lifecycle still pass |
| Unavailable attachment refuses preset insert and names recovery | 1: ended or connecting panel; choose `OK`; no insert; status names Reconnect, Open again, or still connecting |
| Product docs describe Prompts and the shared insert rule | 1: `AGENT-LAUNCH-TERMINAL-INPUT.md` matches the shipped control |

## Decisive premises

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| `insert(text)` offers via `terminal.input` with focus and no Enter | Slice 1 preset offer | Read `dashboard/src/attachedTerminal.ts` insert at `334460b73e52dc2dd235b22f75b8154c380b703b` (lines offering `terminal.input(text)` then `terminal.focus()`) | Settled: no trailing Enter in the offer |
| Dictate / Stop recording is the replaceable session-actions control from `useTerminalDictation` | Slice 1 Prompts slot | Read `useTerminalDictation.tsx` and `Terminal.tsx` session-actions at that revision | Settled: one `control` node in the header |
| Current voice proof opens Dictate by accessible name on that header button | Slice 1 voice path update | Scratch renamed the product label to `Dictate SCRATCH` at that revision, then listed remaining `Dictate into terminal` selectors in `terminalVoicePage.ts`, `session-terminal-voice*.spec.ts`, and `agent-terminal-cursor-page.spec.ts`; reverted the scratch | Settled: those helpers/specs must open Dictate through **Prompts** (or equivalent) in the same slice; unpaid focused voice run remains the discrimination proof after the change |

## Ordered slices

### 1. Reply with common prompts or dictate from the terminal header
Type: Behavior  
Status: done

Proof: Focused dashboard Playwright covering preset insert without Enter, Dictate via Prompts with Stop recording slot swap, unavailable-attachment recovery for a preset, and updated existing voice/cursor terminal specs that currently click Dictate directly; update `AGENT-LAUNCH-TERMINAL-INPUT.md`. Run the touched terminal voice and related terminal specs through the dashboard Playwright project (named path selection, not a mandatory full suite).

Behavior: Side panel terminal open → developer opens **Prompts** in the former Dictate slot → choosing `OK` or `as recommended` inserts that literal text without Enter and leaves focus for edit/Enter; choosing **Dictate into terminal** starts the existing dictation flow with **Stop recording** in that slot until recording ends; when the attachment cannot accept input, a preset is not inserted and status names the panel's recovery.

## Current decisions

- Keep deliberate Enter for presets (same rule as dictation and composer Insert).
- Fixed catalog of two phrases only; no durable prompt store.
- Prefer extending the dictation header control owner over a parallel insert feature.

## Plan concern assessment

Slice-plan refinement was not needed: one cohesive Behavior owns the header
replacement, presets, Dictate entry, and proof-consumer updates under one
insert rule. This review found no remaining slice-specific concern. No
human-owned scope or ADR decision is pending.

## Execution notes

- No numeric slice target or hard limit is supplied; judge boundedness by one
  proof loop and the Behavior gate above.
- Local gates: focused dashboard terminal/voice specs named in slice 1 proof,
  ordinary commit hooks; no mandatory full-suite run for this panel change.
  For long runs start fully awake: on AC use `caffeinate -s -i`; on battery
  plug in or keep the lid open under `caffeinate -i` and inspect sleep logs
  per [machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
- The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
  applies as written to every delegation and repair handoff. Shared `makeMe`
  arranges automated domain data where applicable; no sleeps, `test.slow()`, or
  suite/hook timeout overrides. Execution owns applicable local and published
  CI repairs.


## Execution resume

- Established execution: story-branch; workspace `/Users/terryyin/git/open-dough/.worktrees/insert-common-prompts-in-the-dashboard-terminal`; branch `codex/insert-common-prompts-in-the-dashboard-terminal`; reused established owned worktree. Agent YeongSheng-chan; publisher `dashboard-territory.local-open-dough`.
- Authorized remote/trunk: `origin` / `main`; story increments publish to the execution branch. Starting revision `5ec7ad11c80893a0a7b7156ce4c8f0dcdcb52744`; accepted claim and published base `3d3c17e2a155f7a3b5a504b70ab908fe053395ef`, confirmed on remote main and execution branch. Claim CI: unobserved.
- Setup: locked `npm ci` completed in this checkout with unchanged lockfile; `npm run typecheck:dashboard` passed. Check-only pre-commit hook runs selective staged lint and dashboard typecheck; selective formatter is `npx prettier --write <changed files>`.
- Replanning: preserve existing planned authority; no explicit no-replan instruction. No numeric slice budget supplied.
- CI: GitHub Actions `terryyin/open-dough`, verified selector `ci.yml`, display name `CI`. Story-branch observer coordinator `codex-seed298`, directory `/tmp/dough-ci-501/watch-NWidVz`, PID 18508, session 6874, yielded cell `g1068:12`, bound to this checkout and execution branch.
- Reorganization before editing: `dashboard/src/Terminal.tsx` is 255 lines. Extract the cohesive attachment recovery state (attempt, ending/refusal, shown recovery and attach-again) into a terminal recovery hook. Keep Terminal's public API and attachment, paste, dictation and reconnect behavior; callers remain the keyed Terminal. Slice 1 owns the extraction and existing terminal recovery/voice/browser proof. This is within the terminal UI subsystem.
- Proof decision: local macOS host on AC, 48 GiB RAM with 59% free; load averages 38/26/18 and no competing active Playwright test run observed. Use named terminal/voice specs at one worker under `caffeinate -s -i`, owned by implementation; avoid full suite. Reconsider concurrency or sequencing if contention or failures invalidate the basis. Setup/typecheck completes before browser proof.


## Slice 1 accepted proof

- Source freshness: unchanged at pinned trunk `2d7d7e3d86c00cabb407efa18b68b42609475ae2`, base `3d3c17e2a155f7a3b5a504b70ab908fe053395ef`; no named coordination siblings. Source-review P01–P43 inspected and observed; qualifications and six journeys agree with implementation. No uncovered promises or story obligations.
- Passed, terminal exit 0: `caffeinate -s -i npm run test:dashboard -- --project=chromium --workers=1 dashboard/tests/terminals dashboard/frontend-tests/terminal-prompts-recovery.spec.ts`. This selects all terminal browser specs plus held-connection/refusal frontend checks, not the full dashboard suite.
- Setup and observations: `session-terminal-prompts.spec.ts` uses launched sessions on desktop/phone, asserts exact menu items, literal input, typed prefix, focus, no Enter/native line before edit and manual Enter, ended/Open again and no replay. `terminal-prompts-recovery.spec.ts` uses MakeMe machine/session facts and external socket substitutes for connecting/refused acceptance, named recovery and new deliberate choice. Voice keyboard/phone journeys and helper observe menu close, recording control swap, stopped tracks and restored Prompts. Existing recovery/lifecycle specs observe pending Insert/Discard and close/switch/late-callback cancellation. Shared attachment input and other terminal input paths retain deliberate Enter.
- Earlier seven-file focused run failed one recovery test: the new menu availability inspection moved focus before its existing focus assertion. Moved that inspection after the deliberate edit/Enter path; corrected recovery-only command and final directory selection passed. Original failure evidence: `dashboard/test-results/2026-11-10T10-52-55.118Z-72790/`. No passing rerun was used as a substitute for the test correction.
- Consumer trace: base `3d3c17e2a155f7a3b5a504b70ab908fe053395ef`, supplied terms `Dictate into terminal`, `Prompts`, `useTerminalDictation`, `terminalVoicePage`, `Alt+F10`. Traces and dispositions retained at `/tmp/seed298-consumer-trace.md` and `/tmp/seed298-consumer-trace-full.md`. Affected voice/helper, cursor header, ended/pending readiness and terminal UI consumers passed. PageFrame and Side panel controls/title retain API, observed through close/switch/reopen, heading and phone-layout assertions; linked docs retain destinations. Generic prompt vocabulary, historical records/durations and unchanged backend contracts do not consume the header change. No consumer proof gap.
- Delivered recovery seam: `Terminal.tsx` reduced from 255 to 218 lines, recovery hook owns attempt/ending/refusal/status/action and stable recovery callback; attachment and control public APIs unchanged. `git diff --check` passed. No generation trigger applies.

- Independent refactor `/root/refactor`: none — already clean; no edits/tests needed, accepted proof unchanged, whitespace check passed, `## REFACTOR COMPLETE` received. Freshness rechecked unchanged before delivery at the same pinned trunk; no named siblings.

- Guarded delivery initially stopped before commit: generated Status hard-break whitespace, then hook-required explicit braces on void callbacks. Repaired those mechanical forms within the independently accepted TerminalPrompts paths/trace; no changed behavior, setup or assertion invalidates accepted proof. Already-traced refactor disposition retains `/root/refactor` acceptance. Freshness unchanged on retry against trunk `673002452f18b7fc7a9427f7a6db662b63c8b0b7`; no sibling hold.


## Retrospective

Completed review in the supplied execution checkout against the original ready seed/plan and attributable implementation `0e258a2f7441b8a253f54860f0b9e56ed56a984d`; Take `3d3c17e2a` is provenance, nearby trunk work is excluded. Goal, six journeys, constraints, code, docs, source commitments and focused proof agree. ADR 0008/0001 boundaries remain intact; fixed phrases are local presentation and shared attachment input remains authoritative. No product defect, design dispute or refactoring residue found. Tests were added alongside implementation; no pre-change failing test for presets was retained. The real browser desktop/phone journeys justify integration proof; connecting/refused details use frontend transport substitutes. Existing terminal suite preserves other insert/lifecycle promises; no supported test consolidation or correction plan is needed. Implementation CI at the accepted story-branch SHA remains pending until the coordinator completion receipt.

Process review used this conversation and actual agent/tool results (enabled by `skipProcessRetrospective: false`). Supported status-writer/whitespace-gate mismatch recorded as DD-487 in DearDough.md, ordinary candidate 653 physical lines, no pruning. Hook lint repairs were mechanical and source review/refactor evidence remains applicable. Planning unchanged; no follow-up correction exists.

## Execution complete

Product advice: no change. This bounded terminal usability improvement fulfills the selected story without changing workflow authority. Current near-future intent/proof direction and unrelated backlog priorities need no change; broader prompt libraries and auto-send remain deferred by the source.
