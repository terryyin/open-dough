# Share one control to turn syntax styling off or choose a palette

**Identity:** SEED-387#shared-syntax-styling-control
**Source:** [Share one control to turn syntax styling off or choose a palette](../../seeds/SEED-387-deferred-syntax-styling-follow-ups.md#shared-syntax-styling-control)

## Goal and scope

A developer turns syntax styling Off or leaves Default once in System settings;
Intent source reading and story-review file diffs share that appearance. The
story section owns the scope, deferred promises and key examples; this plan
adds none.

Assumptions: the preference is another machine-local System setting in the
terminal-theme family; both readers already share
`dashboard/src/useSourceHighlight.ts`, so Off gates there; Default keeps today's
GitHub high-contrast light/dark pair following system appearance; no new
runtime dependency; word emphasis is out of scope.

## Existing solution and direction

PFE result: reuse the terminal-theme System-settings pattern; change the
shared highlight lifecycle so both readers follow the choice. Evidence:

- Machine-local preset: `dashboard/server/terminalTheme.ts`,
  `dashboard/server/terminalThemeBoundary.ts` (wired in
  `dashboard/server/localBoundaries.ts`),
  `dashboard/src/terminalThemeSetting.ts`, `dashboard/src/terminalThemes.ts`,
  `dashboard/src/savedTerminalTheme.ts` (`SavedTerminalThemeProvider` in
  `dashboard/src/App.tsx`), `dashboard/src/TerminalThemeSettings.tsx` in
  `dashboard/src/SystemSettings.tsx` General. Proof owners:
  `dashboard/backend-tests/configuration/terminal-theme-boundary.spec.ts`,
  `dashboard/frontend-tests/configuration/system-settings-terminal-theme.spec.ts`,
  `e2e/configuration/system-settings-terminal-theme.spec.ts`.
- Shared source styling: `dashboard/src/sourceHighlight.ts` and
  `dashboard/src/useSourceHighlight.ts`, consumed by Intent
  (`dashboard/src/SourceLines.tsx`) and diffs
  (`dashboard/src/diffLineTokens.ts`). Token colours live in
  `dashboard/src/source-tokens.css`. No Off switch or palette choice exists
  today (`git grep` for syntax-styling preference terms finds none).

Direction: add a parallel Off|Default syntax-styling setting (same local-JSON
boundary shape, machine file under `machineDashboardPath`, page provider, and
System settings General control). Wire Off into `useSourceHighlight` so both
readers go plain together without a second path. Do not invent a second
highlighter or a diff-only control. Additional named palettes stay deferred.

No Accepted ADR is affected. No expected edit file is over the 250-line
cohesive-reorganization check.

## Current decisions

- Choice ids: `off` and `default` (Default label). Missing or absent file
  means `default`, matching terminal theme's missing-file default.
- Off skips tokenization in `useSourceHighlight` (returns plain as today when
  language is undefined or load fails); Default keeps current highlight
  behaviour and CSS.
- System settings General hosts the control beside Terminal theme; Intent and
  diff surfaces gain no control.

## Proof ownership

| Promise (story scope / example) | Owning slice and observable proof |
| --- | --- |
| System settings Off/Default choice; machine-local save; missing file is Default; Default leaves Intent and diffs styled as today | 1: new boundary and System-settings frontend coverage parallel to terminal theme; existing `dashboard/frontend-tests/review/story-review-diff-syntax-appearance.spec.ts` and Intent token reading stay green |
| Off makes Intent and an open (or newly opened) story-review diff plain together; Default restores; change restyles without navigation; reload keeps Off; appearance flip under Default still follows; `.txt` stays plain under both | 2: new frontend journey covering Intent + review under Off/Default (and appearance under Default); e2e or boundary+frontend persistence for reload; existing appearance/path specs stay green under Default |
| Maintained words | 2: `docs/dashboard-development-intent.md` and `dashboard/STORY-REVIEW-FILES.md` name the shared Off/Default control; module headers name the setting |

## Decisive premises

| Premise | Consuming operation | Observation and result |
| --- | --- | --- |
| Intent and diffs both consume `useSourceHighlight`; forcing it never to tokenize removes token spans in both readers | Slice 2 Off gate and proof | 2026-11-17, this workspace at `1672adc6f` with integration `node_modules` linked: scratch edit made `useSourceHighlight` return plain always; `caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list review/story-review-diff-syntax-appearance.spec.ts intent/intent-code-browse-java.spec.ts` → 3 failed: Intent keyword/string token visibility (`pageColours.ts:36` via `intent-code-browse-java.spec.ts:92`), diff `codeToken` visibility (`story-review-diff-syntax-appearance.spec.ts:92`), and a plain-text grammar-failure case timed out. Confirms both readers' token assertions discriminate through that hook. Scratch edit reverted. |
| Terminal-theme local-JSON boundary, System settings UI and proof helpers are the pattern to mirror for a second machine-local preset | Slice 1 structure and proof location | Read `terminalTheme*.ts(x)`, `localBoundaries.ts`, `system-settings-terminal-theme.spec.ts`, `terminal-theme-boundary.spec.ts`, and e2e terminal-theme specs: same shape (endpoint pair, machine file, provider, General section). |
| No unit runner covers `dashboard/src`; frontend Playwright with page-object helpers is the reader boundary | Slices 1–2 proof location | Same as sibling plan 663: review behaviour through mounted fixtures; Intent through frontend Intent specs. |

## Concerns

Slice-plan refinement was not needed: one Structure slice adds the unused
setting with Default preserving today's appearance; one Behavior slice makes
both readers follow it. This review found no remaining slice-specific concern.

## Ordered slices

Each slice targets 15 active minutes.

### 1. Machine-local Off/Default syntax styling setting in System settings
Type: Structure
Status: planned
Proof: new `dashboard/backend-tests/configuration/syntax-styling-boundary.spec.ts`
(parallel to `terminal-theme-boundary.spec.ts`: GET default, POST Off/Default,
malformed/refused); new or extended System-settings frontend coverage that the
General control shows Off and Default and keeps the saved choice after a refused
save pattern as terminal theme does where applicable; then
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npx playwright test --config dashboard/frontend.playwright.config.ts --reporter=list review/story-review-diff-syntax-appearance.spec.ts`
and the Intent token case used in the premise (or its owning Intent frontend
spec) stay green under Default; `npm run typecheck:dashboard`; `npm run lint`.

Internal change: add the setting modules and General UI beside Terminal theme
(endpoint pair, machine file, provider mounted in `App.tsx`, choice ids
`off`|`default`). No reader consumes the choice yet, so Intent and diffs stay
styled as today. Immediate next Behavior: both readers follow it.

- Before changing tests, apply MakeMe and page-object selection for the
  dashboard frontend/backend entries (AGENTS.md).

### 2. Intent and story-review diffs follow the shared Off/Default choice
Type: Behavior
Status: planned
Proof: new frontend spec(s) under `dashboard/frontend-tests/` that: with
Default, Intent and a story-review diff of styled code show tokens as today;
choose Off in System settings → both go plain without navigation; choose
Default → tokens return; under Default, light↔dark appearance still restyles
tokens; a `.txt` path stays plain under both. Persistence: e2e coverage
parallel to `e2e/configuration/system-settings-terminal-theme.spec.ts` that
saving Off writes the machine file and a reload keeps plain reading, or the
boundary write plus frontend read of that saved answer. Rerun the slice-1
Default consumer commands (appearance + Intent tokens). Update
`docs/dashboard-development-intent.md` and `dashboard/STORY-REVIEW-FILES.md`.
`npm run typecheck:dashboard`; `npm run lint`.

Behavior: a developer with Intent source and a story-review file diff open
(or about to open) → choosing Off in System settings makes both readers plain
together; choosing Default restores shared token colours; a reload keeps the
saved choice; system appearance under Default still follows without losing
place.

- Gate Off in `useSourceHighlight` from the saved preference so both consumers
  follow without a second path.
- Page-object helpers for the new settings control; MakeMe selection before
  test edits.

## Local gates and execution discipline

Apply the linked
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
as written. Run Playwright with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES` and
`--reporter=list`. Per [AGENTS.md](../../../AGENTS.md), keep default
timeouts, never use `test.slow()`, and apply MakeMe and page-object selection
before test edits. Focused new specs plus the Default appearance/Intent
consumers are the local gate; full suites run in hosted CI. The local-gate
sleep guard is
[machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos):
start fully awake; on AC wrap long or full runs in `caffeinate -s -i`.

## Learnings

None yet.
