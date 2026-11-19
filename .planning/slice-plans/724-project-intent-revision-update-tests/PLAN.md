# Prove how Project Intent applies a newer revision

**Identity:** SEED-413#renovate-remaining-dashboard-frontend-unit-tests
**Source:** [Prove how Project Intent applies a newer revision](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-remaining-dashboard-frontend-unit-tests)
**Source review:** [Independent source review](source-review.md)

## Goal and scope

Give a developer changing Project Intent direct Chromium proof of applying a
published revision to an open reading. Replace these five built-app cases.
Each row names the old case by its starting line at `0e9d6c1ad`.

| Built-app spec in `dashboard/frontend-tests/intent/` | Existing case | Slice |
| --- | --- | --- |
| `intent-revision-notice.spec.ts:53` | Latest of two offers, held answer, same reading place | 1 |
| `intent-revision-notice.spec.ts:177` | Selected file deleted | 2 |
| `intent-revision-update-outcomes.spec.ts:46` | Failed locations and failed file text, each with Retry | 3 |
| `intent-revision-settings-update.spec.ts:27` | Unreadable settings keep the reading and Retry | 4 |
| `intent-revision-update-boundaries.spec.ts:45` | Malformed settings replace the reading and take focus | 5 |

The other four cases selected by `intent/intent-revision` and both
Optimization Candidates revision cases still have supported, independent
proof in their current specs. The
[later frontend story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#renovate-later-dashboard-frontend-unit-test-families)
owns their migration, the wider suite, final runner retirement and the full
two-worker timing target. This family needs no new E2E case.

## Approach and proof boundaries

- Mount production `IntentPerspective`, with its existing
  `IntentPageProviders`, `StorySelectionProvider` and `IntentReadRecovery`.
  This is the smallest current view that receives observed `PublishedWork`,
  owns the call to `useShownIntentLocations`, and renders both the notice and
  the browser it focuses. A notice-only mount cannot prove the read and
  selection transitions. Give the view the next published snapshot directly.
  Keep the real kept reading, retry, memoized locations, cached source and
  rendered UI.
- Substitute only the local authenticated read service at the browser fetch
  boundary. Use the existing endpoint constant and actual request fields to
  select an answer. Supply typed `IntentLocationsAnswer`, published file
  data, and minimal unchanged CI judgment and history from the shared
  contracts and builders. Answer only the scoped service operations and
  expose unexpected calls to the case. Reject the fetch for a network
  failure so production supplies the error wording. Exercise the real
  parsing, cache and retry behavior. Hold answers with per-case promises and
  resolve them in React `act`. Wait on rendered changes. A minimal response
  exposing `ok` and `json()` sufficed in the probe.
- Expose the existing `PublishedSourceBuilder`, `PublishedWorkBuilder`,
  `IntentLocationBuilder`, CI judgment and empty history builders from
  `Distribution/tests/support/pageMakeMe.mjs` where missing. Reuse accessors
  already published by the Project CI history work if they are present at
  execution. The current family can use the builder definitions already on
  trunk. Keep case-owned request capture and controls beside the cases.
- Target `intent/intent-revision-apply.mounted.spec.ts` for the mounted cases
  with literal case titles, in the existing frontend group. Use Chromium's
  actual pane dimensions and focus. Give the mount the layout constraint of an
  available viewport at the original desktop size and keep production styles.
  Keep the companion built-app case in each partly migrated file, removing
  newly unused imports and callbacks. `frontendIntentRevisionJourney.ts`
  still serves those cases and `intent-home-activation.spec.ts`.
  `frontendIntentRevisionAnswers.ts` also serves catalog, Candidates and read
  reuse. Confirm remaining consumers before any deletion.

This follows both topics in the [Architectural North Star](../../NORTH-STAR.md).
The revision named by a read and the last accepted reading keep their own
meaning through the service, client cache and view. Measure speed alongside
readable inputs and preserved behavior.
[ADR 0002 — Software development lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
[ADR 0008 — Project dashboard domain and architecture](../../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
[ADR 0010 — Definition of improvement](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Decisive premises

Observed on 2026-11-19 at `0e9d6c1ad`, in the preparation worktree with
Node 24.21.0 and Vitest 5.1.0. The temporary
`dashboard/frontend-tests/intent/shown-revision-probe.mounted.spec.ts` used
the real providers and perspective, browser MakeMe exports of existing
builders, and the authenticated-fetch substitute above. Temporary edits
were reverted.

| Consuming operation | Observation and limits |
| --- | --- |
| Apply the newest revision while keeping the reading (slice 1) | `npm run test:dashboard:frontend -- intent/shown-revision-probe --workers=2`. After rendering A, B and C, one polite notice named A, selection held focus, and only A was read. Clicking Show latest with C held displayed Updating and A's source. Settling C showed its source with file focus, the same 100 px pane offset, and exactly C's locations and file reads. |
| Apply a revision without the selected file (slice 2) | Same run. C listed a different file. Show latest produced the missing-path explanation at C, focused the reading pane and requested C's locations alone. |
| Use the two retries (slices 3–4) | Same run. A rejected fetch produced the locations failure, kept A's reading across a remount with one A locations read, and allowed Retry. C's file read failed independently and kept A's text until the second Retry supplied C's text. A typed unreadable settings answer also kept A and showed the settings failure until Retry applied C. The remount was a probe of the reading owner and gives no proof of dashboard navigation controls. |
| Focus the malformed-settings explanation (slice 5) | Same run. Resolving the held C locations read to a malformed settings answer after Show latest rendered the invalid JSON explanation and focused its tab panel. |
| Route and sensitivity of the proof (all slices) | The family-shaped scratch spec listed five literal titles under `mounted-chromium` with the same command plus `--list --reporter=line`. `npm run typecheck:dashboard` passed with the probe and temporary MakeMe exports. Removing the production Show latest callback invocation made all five fail on their expected update signals, including the missing Updating cue, unreadable settings and missing-file results. After restoration all five passed and the strict group proof recorded five passes in 2.07 s. The probes establish the usable boundary and do not measure the delivered migration. |
| Compare the preserved cases (slices 1 and 5) | At the same revision, `caffeinate -s -i /usr/bin/time -p npm run test:dashboard:frontend -- intent/intent-revision --workers=2` with `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD` set to a fresh output path produced nine first-attempt passes in 7.72 s elapsed on AC power. The five moved cases took 1,431, 935, 1,595, 1,232 and 900 ms respectively, 6.093 s summed. Wall time covers all nine. Execution captures its own comparable pre-change run before migrating the first case. |
| Pre-change baseline for the comparison (finish) | Execution, 2026-11-19 at `9a78cd913`, AC power, load average 2.6–3.1. Same command and fresh proof record: nine first-attempt passes, 11.40 s elapsed. The five moved cases took 1,629, 838, 1,662, 1,200 and 949 ms in plan-table order, 6.278 s summed. |

## Ordered slices

### 1. Apply the latest offer and stay at the same reading place

Type: Behavior
Status: done

Behavior: A reader selects a long feature, scrolls, and two published
revisions arrive. One polite notice names the shown revision and preserves
focus. **Show latest** starts just the latest read, keeps the old source and
selection while held, then shows the changed source and returns focus to
the selected file at the same scroll offset.

Proof: Capture the baseline before editing. Use a scrollable source, the
actual tree and notice, and a held locations answer. Keep the original
read sequence, status, one-button, expansion, selected, focus and scroll
assertions at their observed transitions. Compare against independent
text and revisions. Move the first notice case only. This slice establishes
the MakeMe inputs and direct mount that the succeeding cases use.

Accepted proof: `intent-revision-apply.mounted.spec.ts` passed in the
`intent/intent-revision` group with the other eight cases, with the
wall-time-history and story-notes mounted consumers, and with the dashboard
typecheck. Learning for slices 2–5: extend the case-owned
`intent-revision-read-service.mounted.ts` (answers, holds, failures) and
`intent-revision-reading.mounted.ts` (mount, locators, settled actions).
Render, click and release through `actSettled` so React logs no act warnings.
The published-reading MakeMe accessors now have one home,
`publishedReadingMakeMe.mjs`, shared by `makeMe.mjs` and `pageMakeMe.mjs`.

### 2. Explain a selected path that the new revision deleted

Type: Behavior
Status: done

Behavior: When **Show latest** applies locations that still list a different
file but omit the selected path, Purpose explains the missing path at the
new revision. Focus lands in the reading pane and no other file is selected.

Proof: Migrate the deleted-path notice case. Observe the exact path and
revision, the visible surviving file, no source region or pressed file,
the pane's focus, and only the locations request at the new revision.
Keep the Development → Intent notice case in its original file.

Accepted proof: the deleted-path case passed in the `intent/intent-revision`
group with the typecheck. Learning: the read service substitute now clears
the production answer memo and file cache through `forgetAnswers()` and
`forgetCachedFiles()` at its start, so each case begins with empty
browser-session caches. `clearAllTransientFailures()` is the existing seam if
the retry cases leave failure state behind.

### 3. Retry locations and source at the revision each read owns

Type: Behavior
Status: done

Behavior: A failed locations update keeps the old reading navigable and
offers **Retry**. After Retry accepts the new locations, a distinct failed
selected-file read retains the old text and offers a source Retry. That
second Retry supplies the new text and clears its failure.

Proof: Migrate the first update-outcomes case. Fail the selected locations
request, then switch to the alternate file and back in the kept tree.
Assert exact error and retry wording, revision, focus and expanded/selected
state. On locations Retry hold the new file read, observe the browser's
new revision and cleared notice, then fail the file read. Assert retained
text and its distinct failure, apply its Retry and check recovery. Preserve
the original ordered locations/file request sequence. The latter
Development → Intent case remains in the built app.

Accepted proof: the update-outcomes case passed in the `intent/intent-revision`
group (three mounted cases took 1,856, 1,001 and 2,066 ms) with the typecheck.
Learning: `holdRead("<what>@<revision>")` holds the next read of that name and
returns `release` and `fail`; `fail` rejects the fetch. The read service also
clears transient failures at start. Slice 4 will take the mounted spec past 250
lines: split it by outcome, applying the latest (slices 1–2) against failed or
unreadable updates and their Retry (slices 3–5), keeping the shared modules.

### 4. Keep the current reading when settings cannot be read

Type: Behavior
Status: done

Behavior: An unreadable settings answer at the offered revision leaves
the old reading and selection in place with a settings-specific failure
and **Retry**. A readable answer to Retry advances that same reading.

Proof: Replace the settings-update spec. Supply the typed unreadable answer
and then new locations. Assert the settings-specific wording, absence of a
replacement settings panel, old revision/text/selection, and new revision
and source with the notice cleared after Retry.

Accepted proof: the unreadable-settings case passed in the new
`intent-revision-update-failures.mounted.spec.ts`, which also holds slice 3's
case, with the MakeMe consumer group and the typecheck. The applying cases stay
in `intent-revision-apply.mounted.spec.ts`. Learning: `holdRead(...)` also
offers `answerLocations(answer)`, and `makeMe.anIntentLocationsAnswer` builds
readable, `withUnreadableSettings()` and `withMalformedSettings()` answers.
Three built-app specs still write that answer by hand
(`intent-read-recovery`, `intent-gherkin-settings-problems`,
`intent-revision-update-boundaries`); the later frontend families own them.

### 5. Focus the explanation when the latest settings are malformed

Type: Behavior
Status: planned

Behavior: Applying the latest revision with malformed settings displays
its explanation as the active reading and focuses that tab panel.

Proof: Use the typed malformed settings answer. Assert the invalid JSON
text, tab-panel focus and new browser revision. Replace only the first
boundaries case. The project-switch case stays in the built app.

Finish the family by observing the group discovery and strict proof described
below. Confirm the five old cases are accounted for and the four remaining
built-app cases still pass. Compare summed case durations of the five before
and after, with command elapsed and selection reported separately. Confirm
the moved cases use no app build, route mini-server or frontend page object.

## Local gates and delivery

- Use `npm run test:dashboard:frontend -- intent/intent-revision --workers=2`
  at the slice boundaries, and add `--list --reporter=line` to check
  selection. For the final two-worker comparison, use comparable warmed
  workspaces and load, a fresh `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`
  path and `/usr/bin/time -p`. Record summed attempt time by case from
  that record, the requested selection, elapsed time, and observed load
  and power. Count only the corresponding five cases for the improvement.
- Run `npm run typecheck:dashboard` for the typed seam and
  `npm run test:dashboard:frontend -- stories/story-notes --workers=2`
  for consumers of changes to the page MakeMe entry. Run any other
  reached consumers found by the trace. Apply the installed
  [MakeMe](../../../.agents/skills/dough-makeme/SKILL.md) and
  [page-object selection](../../../.agents/skills/dough-page-objects/SKILL.md)
  to the actual spec paths. The selected frontend entry enables MakeMe
  and opts out of page objects. Keep the default test timeout.
- Follow the [shared failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
  For long runs on a fully awake Mac on AC use `caffeinate -s -i`.
  On battery plug in or keep the lid open under `caffeinate -i` and inspect
  the sleep log afterward. [Local test resources](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos).
- Keep replacement and retirement together through the installed post-change
  refactor, commit and CI gates. Preserve other consumers of built-app
  support. There is no full-suite local gate for this family's changes.

## Plan review

Slice-plan refinement was unnecessary. Five independently observable reader
outcomes fit the bounded slices. The first establishes the direct proof
entry with a case that uses it. The other four vary the service result through
that entry, with no separate product rule for their arrangements. The review
found no remaining slice-specific concern.
