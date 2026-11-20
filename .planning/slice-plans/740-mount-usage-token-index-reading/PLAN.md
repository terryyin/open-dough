# Read the Usage Token index's selections and refreshes in mounted cases

**Identity:** SEED-413#mount-usage-token-index-reading
**Source:** [Read the Usage Token index's selections and refreshes in mounted cases](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#mount-usage-token-index-reading)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

Dashboard developers read what System settings → Usage shows for a
selection, a period and a Refresh as plain Vitest cases on mounted Chromium,
with each tool's Token index answer given as a typed reply. Six built-app
specs move: `system-settings-usage`, `-usage-period`, `-usage-estimate`,
`-usage-selection`, `-usage-checking` and `-usage-tool` in
`dashboard/frontend-tests/configuration/` (13 cases, 16.0 summed seconds in
CI run 44741808717).

The owner is `SystemSettingsUsage` in `dashboard/src/SystemSettingsUsage.tsx`.
It takes no inputs today and reaches two endpoints through `fetch`. Its typed
input becomes one usage source with two collaborators: a read of one cohort
and period under an abort signal that answers a `TokenIndexAnswer` or rejects
with the refusal's words, and a refresh that resolves or rejects with the
refusal's words. It needs no provider.

The five chart specs (`-average`, `-compare`, `-legend`, `-overflow`,
`-spacing`), the other Configuration specs and the four
`e2e/configuration/system-settings-usage*` journeys keep their present
engines, support and page objects.

## Key examples and proof

| Example | Observation and owner |
| --- | --- |
| A cohort's trend | With a Codex reply of ten eligible tasks and a 1,450 median, mounted Usage shows `10 tasks · Last 30 days`, ten points and the median. Partial and unpriced tasks explain a sparse trend, and a selected task's detail distinguishes repeated launches and unknown outcomes, with keyboard selection and focus return. Slice 2. |
| An empty cohort | Choosing Refinement with an empty reply reads `0 tasks · Last 30 days` and `No finished task matches in the last 30 days.` An unpriced-only period explains its counts and shows no old median. Slice 2. |
| An invalid period | Under New York time the first read asks from `2026-10-17T04:00:00.000Z` until `2026-11-16T05:00:00.000Z`. Each of `0`, `-1`, `1.5`, empty and `abc` reads invalid with its explanation, keeps the trend and reads nothing. `7` reads the new period, and a workflow change keeps it. Slice 2. |
| A failure belongs to its read | A rejected Claude Code read shows `Claude Code: Usage could not be read.` It leaves once that selection, or its period after a day round trip, is read again. Slice 3. |
| A late answer for a selection already left | A held Claude Code reply released after the reader hides Claude Code leaves Codex alone, with no problem. Slice 3. |
| The tool selection keeps what both tools offer | Adding Claude Code keeps a Codex-only model and offers both tools' models once. Hiding Codex resets that model and keeps the workflow and a shared effort. The Claude Code cohort names its left-out background work once. Slice 3. |
| Refresh keeps what is shown | While a Refresh is pending, and until its selection is read again, Usage keeps the trend, says `Checking for new usage…` and disables Refresh. A failed Refresh keeps the selected trend and check time beside the error. A Refresh that brings an explicit rate replaces the estimate and keeps another model's warning. Slice 4. |
| The page source keeps the refusal wording | The page's own source turns a refused read and a refused Refresh into `Usage could not be read.` and `Usage could not be refreshed.`, or the endpoint's own message. Slice 1. |
| The moved cases cost less | The focused command's elapsed time before and after, and each mounted case's time. Slice 5. |

## Decisions and existing owners

- Follow the
  [test support North Star](../../NORTH-STAR.md#make-production-code-directly-testable-instead-of-growing-test-support),
  [Which entry a case uses](../../../dashboard/frontend-tests/README.md#which-entry-a-case-uses)
  and the [improvement ADR](../../../docs/adrs/0010-definition-of-improvement-accepted.md).
  Mount through `mountComponent`. Render and act directly, with no `act`
  wrapping and no `IS_REACT_ACT_ENVIRONMENT`, and wait through
  `expect.element` and `expect.poll`.
- The usage source follows `storyNotesState(source)` in
  `dashboard/src/storyNotes.ts`: `useUsageAnswers` asks the source in place
  of `fetch`, and `SystemSettingsUsage` asks it for Refresh in place of
  `localSettingRequest`. `SystemSettings` passes the page's source, which
  alone knows `tokenIndexUrl`, `usageRefreshEndpoint` and `refusalMessage`.
  The hook keeps naming a failed read by its tool. Abort, the kept last
  answer, the reset of an unoffered model or effort and the checking rule
  stay where they are.
- Replies use the shared `TokenIndexAnswer` contract of
  `dashboard/src/usageTokenIndex.ts`, which `dashboard/server/tokenIndex.ts`
  answers. Build them with `aTokenIndexAnswer`, added to
  `Distribution/tests/support/pageMakeMe.mjs` from the Node-free
  `usageAnswerTestData.mjs`. `usageMakeMe.mjs` keeps offering it to Node
  cases beside its Node builders.
- A case that observes a pending read or Refresh holds its own deferred
  reply, and a case that counts or inspects reads records what its source was
  asked. Neither becomes a shared helper.
- One small page object beside the specs operates Usage: the filters, the
  days field, the tool choices, Refresh, the status and problem notes, the
  cohort note, the points and median, and a selected task's facts. The
  Playwright page objects under `dashboard/test-support/support/usage*Page.ts`
  and `systemSettingsUsagePage.ts` stay for the five chart specs and E2E.
- The page's day comes from a faked `Date`, and its time zone from CDP
  `Emulation.setTimezoneOverride`, cleared when the case ends.
- Before deleting a built-app case, list it with the mounted case that
  carries each of its assertions in the slice's delivery note. Remove a case
  without a mounted replacement only when an E2E journey proves the same
  thing, and name the journey.

## Decisive premises observed

Preparation base `815ccb9c7`, 2026-11-20, this owned worktree, AC power, Node
24.21.0, `npm ci`, one-minute load 12–14. Each observation ran a scratch spec
under `dashboard/frontend-tests/configuration/` through
`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:frontend -- <spec> --workers=2`
and the scratch spec was removed afterwards.

| Consuming operation | Observation and result | Limit and consequence |
| --- | --- | --- |
| `SystemSettingsUsage` mounts alone and draws a typed answer (slices 1 and 2) | Mounted through `mountComponent` with no provider and `fetch` stubbed to answer one `TokenIndexAnswer`. The **Token index trend** region was visible 57 ms after mount, with `10 tasks · Last 30 days`, `1,450`, `10-task rolling median` and the check time in its text. | The stub stands in for the source slice 1 adds. The same component and answer are consumed. |
| The Node-free answer builder loads in the page (slice 1) | Importing `makeMe` from `usageMakeMe.mjs` failed to load in the page. Importing `TokenIndexAnswerBuilder` from `usageAnswerTestData.mjs` loaded and built the answer above. | `pageMakeMe.mjs` (79 lines) gains the entry in slice 1. |
| A mounted case sets the local calendar day (slice 2) | With CDP `Emulation.setTimezoneOverride` at `America/New_York` and `Date` faked at `2026-11-15T18:00:00.000Z`, `recentUsagePeriod(30)` answered `from 2026-10-17T04:00:00.000Z` and `until 2026-11-16T05:00:00.000Z`, the bounds the built-app period case asserts. Passed in 11 ms. | Faking `Date` only. A case that needs timers to run keeps them real. |
| Retrying text assertions on the whole Usage region (slices 2–4) | `expect.element(region).toHaveTextContent(/1,450/)` did not succeed in 15 s although the region's `textContent` contained `1,450` and a locator for `10-task rolling median` inside it was visible at once. | Page-object readings name the element that holds the words (the median, the cohort note) and do not match the whole region. |
| The built-app cases are the baseline (slice 5) | CI run 44741808717 at `93235af49`: usage 3.8 s (3 cases), period 2.3 s (2), estimate 1.2 s (1), selection 3.5 s (3), checking 2.5 s (2), tool 2.7 s (2). | Hosted time. Slice 1 takes the local focused baseline at the execution base before any change. |

## Slices

### 1. Usage reads and refreshes through a typed source

Type: Structure
Status: done

Take the local focused baseline first: run the six built-app specs alone,
three times, and keep the elapsed times for slice 5. Then put the usage
source behind `useUsageAnswers` and Refresh, with the page's source supplied
by `SystemSettings`, and add `aTokenIndexAnswer` to `pageMakeMe.mjs`. This
enables slice 2's mounted cases. One mounted case of the page's source
proves the refusal wording for a refused read and a refused Refresh.

**Proof.** `npm run typecheck:dashboard`. All eleven built-app
`system-settings-usage*` specs and `system-settings-navigation.spec.ts` pass
unchanged, and the four `e2e/configuration/system-settings-usage*` journeys
pass. The refusal-wording case passes.

- **Retained baseline (`1817333330f5`, `--workers=2`, AC power):** 6 moving built-app specs (13 cases) warm command elapsed `39.25 s`, `45.13 s`, `39.75 s` (median `39.75 s`; runner summed `44.2 s`, `51.9 s`, `47.5 s`, median `47.5 s`; 1m load `35.16–40.97`).
- **Learnings for slices 2–4:** `UsageFilters.tsx` wraps `<select>` inside `<label>`, so target filter selects via `getByRole("combobox", { name: label, exact: true })`; observe passive `useEffect` cleanup effects (such as `AbortSignal.aborted`) through `expect.poll`.

### 2. A cohort and its period read from typed answers

Type: Behavior
Status: planned

Mount `SystemSettingsUsage` over a case-supplied source, with the Usage page
object beside the specs, for the three cases of `system-settings-usage`
and the two of `-usage-period`. Remove both built-app files.

**Proof.** The mounted specs pass with all five titles. One scratch break
that lets an invalid day count read again fails the period case and is
reverted.

### 3. Each selection shows only its own read

Type: Behavior
Status: planned

Mount the three cases of `-usage-selection` and the two of `-usage-tool`,
each holding or rejecting its own Claude Code reply. Remove both built-app
files.

**Proof.** The mounted specs pass. One scratch break that drops the abort
check after a settled read fails the late-answer case and is reverted. The
late-answer case waits one task after releasing the reply before it asserts
that nothing joined.

### 4. Refresh keeps the trend while it checks

Type: Behavior
Status: planned

Mount the two cases of `-usage-checking` and the case of `-usage-estimate`,
each holding or rejecting its own Refresh and its following read. Remove
both built-app files.

**Proof.** The mounted specs pass. One scratch break that ends checking when
Refresh resolves, before the reread settles, fails the checking case and is
reverted.

### 5. The moved cases leave their support and show their cost

Type: Behavior
Status: planned

Remove each `dashboard/test-support/` export left with no consumer after the
six files moved, keeping what the five chart specs and E2E use. Run the
mounted specs three times, interleaved with a rerun of the baseline revision
when load differs, and record elapsed time and time per mounted case in the
parent story's
[state section](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#frontend-group-state-after-seven-families),
with what the chart cases can reuse: the source, the page MakeMe entry and
the page object.

**Proof.** The recorded comparison, the support line count before and after,
and a list pairing every removed built-app title with its mounted case or
the E2E journey that owns it.

## Local gates and review

- Apply [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page objects](../../../.agents/skills/dough-page-objects/SKILL.md) to the
  new specs, and the
  [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
  to every failure. Keep default test timeouts and never use `test.slow()`.
  On AC power use `caffeinate -s -i` under
  [machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Focused frontend command:
  `npm run --silent test:dashboard:frontend -- configuration/system-settings-usage --workers=2`,
  prefixed with `env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.
  A selection mixing both engines runs only its Vitest specs, so run the
  built-app specs by file for their own result. The E2E journeys run through
  `npm run test:e2e -- configuration/system-settings-usage`.
- Run `npm run typecheck:dashboard` and `npm run lint` for each slice. Run
  the [consumer trace](../../../.agents/skills/dough-story-refinement/references/executable-proof.md#record-the-consumer-trace)
  over slice 1's source and each slice's removed support, and run every
  reached consumer. `pageMakeMe.mjs` is loaded by every mounted spec, so
  slice 1 also runs `stories/` and `sessions/sessions-sidebar` as its page
  consumers. The full frontend group runs in CI.
- Expected production edits touch `SystemSettingsUsage.tsx` (166 lines),
  `useUsageAnswers.ts` (107), `SystemSettings.tsx` (76) and one new source
  module. Split a mounted spec by outcome before it passes 250 lines.
- Slice-plan refinement was not needed: one owner, one preparation placed
  before the behavior it enables, and one proof loop per slice. No
  slice-specific concern remains.
