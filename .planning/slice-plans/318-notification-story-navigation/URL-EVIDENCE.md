# Story URL proof

Accepted for [Plan 318](PLAN.md), slice 2, on 2026-10-19.

The pre-implementation cold-open journey failed at the real preview because
the requested project's card rendered but did not receive focus. The published
fixture supplied membership only, not routing, focus or reveal.

## Final new journeys

```sh
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed140-slice2-proof.yrxwjB/story-navigation-complete.json npm run test:dashboard -- notification-story-navigation.spec.ts --workers=2
```

Terminal exit 0; 8 selected, completed, runner and strict status passed.
`dashboard/tests/notificationStoryJourney.ts` publishes two projects sharing
the same stable identity, with a renamed off-screen target and held external
reads. `dashboardTest.ts` supplies the real built preview/local read boundary
and fake external GitHub/agent hosts. The actual route and membership reader
resolve the target; `workCard` and `keepInView` establish focus and visibility.

Observations in `dashboard/tests/notification-story-navigation.spec.ts`:

- Cold URL: no early reveal, only named-project reads, exact encoded identity,
  target card focused/in viewport, Tab remains in the card. After user movement
  and expanding detail, a layout frame adds no automatic reveal calls.
- Reload/history: Taken target resolves after reload and Back/Forward; ordinary
  project selection clears the story parameter.
- Unknown project: requested URL/identity remains explicit, no unrelated card
  focus, useful project navigation.
- Absent story versus failed read: distinct status; explicit retry resolves the
  original target via reloading the retained URL through the existing reader.
- Leaving a held read: ordinary project choice remains selected after release,
  with no late reveal or story targeting.
- Hidden Taken column at 650px/reduced motion: identified card focused and in
  viewport, correct columns shown, recorded reveal uses `auto`.
- Roster: ordinary same-project roster navigation clears targeting; Back
  restores the encoded target and useful card focus.
- Settings: selected-project removal clears targeting before returning to the
  neighboring project's stories.

Every journey checks unchanged Claude launch/resume/attach and Codex
start/resume/turn logs through `expectNoHostActions`.

## Existing consumers

```sh
env -u NO_COLOR OPEN_DOUGH_DASHBOARD_PROOF_RECORD=/tmp/seed140-slice2-proof.yrxwjB/settings.json npm run test:dashboard -- system-settings.spec.ts system-settings-project-management.spec.ts --grep 'global settings|direct settings reload|failed row removal' --workers=2
```

Terminal exit 0; 3 selected, completed, strict status passed. Existing isolated
configuration/preview fixtures observe settings history/roster/focus, direct
settings reload and selected-neighbor removal, plus failed row removal/retry.

```sh
env -u NO_COLOR npm run test:dashboard -- notification-story-navigation.spec.ts project-selection.spec.ts agent-roster.spec.ts project-keyboard-navigation.spec.ts project-keyboard-navigation-focus.spec.ts project-keyboard-navigation-eligibility.spec.ts session-sidebar-navigation.spec.ts session-sidebar-navigation-cases.spec.ts --workers=2
```

This aggregate exited 1 solely on a new roster test's initially incorrect
accessible button name. Its 15 unchanged regression cases passed: project
selection 2, roster 2, keyboard navigation 3, keyboard focus 1, keyboard
eligibility 2, sidebar navigation 1 and sidebar cases 4. They observe ordinary
route normalization/history, project isolation, roster focus return, keyboard
switching and existing terminal-opening sidebar behavior, including hidden
columns/reduced motion/stale pending selections. Later changes only corrected
new-test setup/assertions; the final eight new journeys above passed on the
same implementation. The aggregate failure is not reported as a passing run.

The new-test corrections removed accidental setup expectations: a guessed
roster button label, full viewport intersection precision beyond 0.99, an
unnecessary expanded card taller than the viewport, and a URL assertion before
asynchronous project-removal confirmation finished. They did not weaken story
promises. Failure evidence is under
`dashboard/test-results/2026-10-19T09-25-49.369Z/` and the preceding proof records.

`npm run typecheck:dashboard` and `git diff --check` passed. Native emitted-URL
composition remains owned by slice 3; these tests do not prove native clicks.

## Refactor validation

The cohesive project action bar moved unchanged into `ProjectActions.tsx`.
The parent still owns story reveal at the same layout-effect boundary; accepted
route/membership/focus proof and its fixtures/assertions remain unchanged.

```sh
env -u NO_COLOR npm run test:dashboard -- agent-launch-ad-hoc.spec.ts direction-disclosure.spec.ts --grep 'sits at the end|offered while|offered after|starting with text|direction starts collapsed|opened direction reads|same-project refresh|changing projects' --workers=2
```

Terminal exit 0, 8 selected. Existing preview fixtures observe action-row
placement/visibility, offers during failed/loading reads, text submission,
direction expansion, refresh and project changes. The refactor's
`npm run typecheck:dashboard` and `git diff --check` also exited 0.

The coordinator repaired an unused fixture callback parameter by deriving the
same indices 0–11 from `Array(12).keys()`; published fixture content is unchanged.
`npm run format` then passed, including its lint and formatting validation.
