# Mark Recently done stories as reviewed

**Identity:** SEED-328#mark-recently-done-stories-as-reviewed
**Source:** [Mark Recently done stories as reviewed](../../seeds/SEED-328-review-recently-done-stories.md#mark-recently-done-stories-as-reviewed)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A developer scanning the Dashboard's **Recently done** column sees which
completed stories they have not yet reviewed and records or clears that
judgment from the story's card: an unreviewed card offers **Mark as
reviewed**; a reviewed card shows **Reviewed** and offers **Unreview**. The
state belongs to the story (project and identity), is kept on the machine
that serves the dashboard, and outlives reload, refresh and restart.

Excluded, as the story records: any published record or repository write for
the state; any change to the story review's **Mark reviewed** snapshot mark;
review state on standalone sessions, Recently done sessions rows, Backlog and
Taken cards, or Intent; hiding, reordering or counting reviewed cards; a
count or filter of unreviewed stories; marking from inside the story review;
showing when a story was reviewed; clearing the state on later work.

## Architecture and PFE

- **Gap, with reused parts.** No existing solution has this meaning. The
  snapshot mark (`dashboard/server/storyReviewMarks.ts`,
  `review-marks.json`) records one workspace tree and baseline for "Changes
  since the review"; it needs a readable workspace and is hidden for landed
  and published comparisons, and this machine holds 4 of them against 345
  done records. The review state is a new, separate concept and document. It
  must not be added to `review-marks.json` or derived from it.
- **Reuse the machine document discipline**: `readMachineJson` /
  `replaceMachineJson` (`dashboard/server/machineJsonStore.ts`) with a
  document of its own under `machineDashboardPath`, by project id then story
  identity, an entry meaning reviewed and no entry meaning unreviewed. A
  missing or unreadable document reads as every story unreviewed.
- **Reuse the local JSON endpoint boundary**
  (`dashboard/server/localJsonEndpoints.ts`, client
  `dashboard/src/localSettingRequest.ts`): one endpoint, GET for a configured
  project's reviewed identities and POST to set or clear one identity, as
  `ciFollowUpEndpoint` is mounted in
  `dashboard/server/projectConfigurationBoundary.ts`. It already verifies the
  page's own origin and answers uncached JSON. The request names the project
  and identity, never a path.
- **Reuse the per-project shared read** that `useCiFollowUps`
  (`dashboard/src/CiFollowUpViews.tsx:78`) gives every shown done card: one
  read per project, then the shared 15-second check. The new read
  additionally shows the page's own write at once, from the POST's answer.
- **ADR 0008** (Accepted) governs: the state is machine-local operational
  evidence, the dashboard stays an observer of published records, and the
  names Board, Column, Story card, Side panel and Selected story are used as
  defined. No ADR change, North Star topic, or new boundary is needed.
- **File sizes of expected edits** (limit 250): `DoneStoryCard.tsx` 152,
  `projectConfigurationBoundary.ts` 98, `STORY-CARDS.md` 34,
  `STORY-REVIEW-MARKS.md` 137, `recently-done.css` 64: room for the change.
  `RecentlyDone.tsx` is 242: if the per-project read is called there, as
  `useCiFollowUps` is, move `ListedEntry` (one listed entry: a session or a
  done card with its follow-ups) with `unreadWords` into its own module in
  slice 1; its only caller is `RecentlyDone`, and the done-card families
  below prove it preserved. `dashboard/README.md` (250) and
  `dashboard/AGENT-LAUNCH-HISTORY.md` (261, already over) are not edited: the
  card's review state is documented in `STORY-CARDS.md`, which describes card
  actions, with one distinguishing sentence in `STORY-REVIEW-MARKS.md`.
  The control and the client read live in new modules.

## Outside-in proof ownership

New specs `dashboard/tests/stories/recently-done-review-state.spec.ts` (keeping the state) and
`recently-done-review-state-offer.spec.ts` (which cards offer it, touch height),
arranging done records through `makeMe.aDoneRecord` as
`dashboard/tests/recentlyDoneRecords.ts` does, finding cards as
`recently-done-follow-up.spec.ts` does, and restarting as
`dashboard/tests/review/story-review-mark.spec.ts:89` does. Card lookups and
the kept-state reader go in a small support module beside the spec's
existing peers, following the project's page-object and MakeMe guidance.

| Promise (story example) | Slice | Observable proof |
| --- | --- | --- |
| Older story with no saved state and no local session offers **Mark as reviewed**, no **Reviewed** | 1 | Spec: card of a done record with no session and an absent store |
| Marking A shows **Reviewed** and **Unreview**; B still offers **Mark as reviewed**; both keep place, shown range and entry count | 1 | Spec: actions, column order and count before and after |
| State survives reload and dashboard restart | 1 | Spec: reload, then close and restart the server on the same HOME and port, reload |
| **Unreview** restores **Mark as reviewed**, also after reload | 1 | Spec |
| State is words, not color; **Reviewed** is a status, not a control | 1 | Spec: role and accessible-name locators only; no button named Reviewed |
| Keyboard stays on the card: focus on **Unreview** after marking, on **Mark as reviewed** after Unreview | 1 | Spec: `toBeFocused` after keyboard activation |
| Selected story and Side panel untouched | 1 | Spec: story C selected, mark A, C still highlighted, A not |
| Independent of the snapshot mark | 1 | Spec: pre-seeded `review-marks.json` entry for A (as `tests/support/storyReviewMark.ts` reads it) leaves A unreviewed; marking A leaves that file's content unchanged |
| Card with an unread record offers the action and keeps **Reviewed** once read | 1 | Spec: hold the record read as the progressive-loading specs do, mark, release |
| Nothing is written to the project repository | 1 | Spec: origin's trunk revision and the project checkout's status equal before and after |
| Request refusals: unconfigured project, malformed body, wrong method | 1 | Backend spec under `dashboard/backend-tests/` beside `review/story-review-mark-admission.spec.ts` |
| Touch input offers the 44px control height | 1 | Spec with a coarse-pointer context, as the existing touch specs measure, on both actions |
| Failed save keeps the last saved state and says the review state could not be saved | 2 | Spec: the store path made unwritable (for example a directory at the document's path) before the action; card still offers **Mark as reviewed** with the message in a `status`; after the path is restored the action succeeds |

## Ordered slices

### 1. Mark a done story reviewed and unreview it, kept per story on this machine
Type: Behavior
Status: done
Proof: the new spec's slice-1 checks and the backend refusal spec pass; the
done-card families command below stays green; typecheck passes.

Behavior: a done story card with no saved state → the developer uses **Mark
as reviewed** → the card shows the **Reviewed** status and offers
**Unreview** in the Story actions, with the keyboard on **Unreview**; other
cards, the card's place, sessions, other actions, the shown range, the entry
count, the Selected story and the Side panel are unchanged; the state is in
the machine document and shows again after reload and restart. **Unreview**
→ the entry is removed, the card offers **Mark as reviewed** with the
keyboard on it, and stays so after reload. The control is rendered from the
catalog identity, so an unread or failed record's card offers it too.

- Write the outside-in spec first, then the store, endpoint, shared read and
  card control it needs; keep them one cohesive change.
- **Mark as reviewed** and **Unreview** use an existing card-action class so
  touch height follows `--control-size`; **Unreview** is the quieter of the
  two. An unreviewed card shows no "unreviewed" badge.
- The change is announced once through a `status`, as card actions announce
  today (`SessionEntry.tsx:245`).
- Document the behavior in `dashboard/STORY-CARDS.md` and add the
  distinguishing sentence to `dashboard/STORY-REVIEW-MARKS.md`.

Accepted proof (slice 1): both new specs 6 passed; done-card families 41
passed; extra consumers (`story-reference-done`, `responsive-session-reconciliation`,
`project-configuration`, `agent-launch-recent-delete`, `compact-session-entry`,
`sessions/recently-done`) 53 passed; `dashboard/backend-tests/` 1311 passed,
1 skipped; backend `review/story-review-state-admission.spec.ts` 3 passed after
refactor; typecheck passed. Per-commitment observations are in
[source-review.md](source-review.md).

Learnings for slice 2: the store is `dashboard/server/storyReviewStates.ts`
(`~/.open-dough/dashboard/story-review-states.json`); the client hook
`useStoryReviewStates` (`dashboard/src/storyReviewStates.ts`) already rejects
`change` on a failed save, and `StoryReviewStateAction.tsx` currently swallows
that rejection. The control shows nothing until the first read answers. An
unreadable document is moved aside to `.unreadable` by the next save; a
failed-read record answer fails the whole first read batch, so failed and held
records need separate tests.

CI repair (run 43183230979 on `ecfaacce1`): the always-rendered, empty
visually-hidden status paragraph failed the layout "read whole" check
(`accessible-board-touch`, `published-facts-reading`) and, absolutely
positioned with no positioned ancestor, escaped the hidden column's clipping
and lengthened the Board (`board-height`). The status is now positioned inside
the action and holds a visually-hidden span only when it speaks. A
scroll-timing flake in `recently-done-progressive-state.spec.ts` was fixed by
waiting for `scrollend` (`watchBoardScroll`).

### 2. Say when the review state could not be saved
Type: Behavior
Status: planned
Proof: the new spec's failed-save check passes with slice 1's checks.

Behavior: the machine document cannot be written, or the dashboard cannot be
reached → the developer uses **Mark as reviewed** (or **Unreview**) → the
card keeps showing the last saved state and says "The review state could not
be saved." in its `status`, following the wording pattern of
`dashboard/src/pageSessions.ts:113-121`; using the action again once writing
works saves it and clears the message.

## Consumer trace and local gates

The changed rendered output is the done story card's Story actions group,
which every Recently done journey renders. Keep the consumer-trace record
from execution (`consumer-trace.mjs --base HEAD`, with `--term "Story
actions"` and `--term "Mark as reviewed"`), and give each listed consumer a
disposition.

```sh
npm run --silent test:dashboard -- --workers=4 --reporter=list dashboard/tests/stories/recently-done-review-state.spec.ts dashboard/tests/stories/recently-done-review-state-offer.spec.ts
npm run --silent test:dashboard -- --workers=4 --reporter=list dashboard/tests/stories/recently-done dashboard/tests/review/story-review-completed dashboard/tests/review/recently-done-one-shot-review dashboard/tests/navigation/story-card-selection dashboard/tests/review/story-review-mark.spec.ts
npm run --silent test:dashboard -- --reporter=list dashboard/backend-tests/
npm run typecheck:dashboard
```

When the harness sets `NO_COLOR` or `GIT_ALTERNATE_OBJECT_DIRECTORIES`,
prefix the dashboard commands with
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES`.

Run the whole local suite (`npm test`, Homebrew Bash first on `PATH`) once,
after slice 2 and before the final delivery, and not per slice: 132 dashboard
specs render Recently done cards, more than the families above select, so
the shared card's changed output reaches journeys the focused commands do not
run. Published CI failures remain owned.

**Local gate:** prepare the execution checkout with
`node scripts/setup-native.mjs npm`, `browser`, then `check`, and run the
commands above there. For the families run (about a minute) and the whole
suite on macOS, start fully awake and on AC and wrap the command in
`caffeinate -s -i`; on battery plug in or keep the lid open under
`caffeinate -i` and inspect sleep logs, following
[machine sleep on macOS](../../../tests/local-test-resources.md#machine-sleep-on-macos).
Never sleep, use `test.slow()`, or add suite, file, group, or hook timeout
overrides; keep the default timeout.

The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written and must accompany every delegation and repair handoff.

## Decisive premises and observations

Observed in this preparation's workspace at
`70021438bdc5069fa8c171d58b810e884e0ec050` on 2026-11-12, AC power, four
workers, load about 7 at start, after `setup-native` `npm`, `browser` and
`check`. The scratch edit was reverted afterwards.

| Premise | Consuming operation and observation | Result |
| --- | --- | --- |
| Adding an action to the done card's Story actions breaks no existing assertion in the done-card families | Scratch-added a `start-launch-button` named "Mark as reviewed" after `StoryReviewAction` in `DoneStoryCard.tsx`; ran the families command above under the `env -u` prefix and `caffeinate -s -i`. The run built the app from that checkout (no `dashboard/dist` existed; the run artifact is built per run) | Exit 0, 36 passed in 1.1 min across 18 spec files |
| A spec can restart the dashboard on the same per-test HOME and read machine documents kept before the restart | `story-review-mark.spec.ts:89` "after the dashboard restarts", in the same run | Passed, 8.6 s |
| The snapshot mark cannot stand in for the review state | `ls .planning/done \| wc -l` and the project entries of `~/.open-dough/dashboard/review-marks.json` on this machine | 345 done records; 3 marks for this project, 4 in all |
| The dashboard writes nothing to a project repository today | Search of `dashboard/server` for a Git push | None; the only match is a CI status read |

Unverified remainder, bounded by slice 1's own proof and the named
whole-suite run: the other Recently done journeys (sessions, launches,
navigation, intent families) were not run with the scratch action; the
coarse-pointer height of the new actions and the held-record arrangement are
first observed by the slice's spec.

## Current decisions and preparation review

- The review state is machine-local and separate from the snapshot mark, as
  the story's restriction and scope limit state; the labels are the story's:
  **Mark as reviewed**, **Reviewed**, **Unreview**.
- A new machine document, not a field in `review-marks.json`, launch records
  or done records.
- Other pages of the same server show a change at their next read (reload or
  the shared 15-second check); no push channel is added.
- No blocking dependency or trunk-only action was identified. Execution mode
  and implementation authority remain with the later execution instruction.
- Slice-plan refinement was not needed: two Behavior slices, each one
  outcome with one proof loop, exercising one model (an entry per reviewed
  story); no remaining slice-specific concern was identified.

## Story obligations

### G1. Deferred promises stay outside this story
Reported: slice 1 — "Sharing, an unreviewed count or filter, marking from the story review, review time and clearing on later work are not delivered."
Story clause: "Deferred promises (considered, not delivered here; nothing prevents them)"
Disposition: excluded "Deferred promises (considered, not delivered here; nothing prevents them)"
Commitment: 15, 16a, 16b, 17a, 17b, 18

### G2. Working through everything that needs review is larger than this story
Reported: slice 1 — "This story makes the judgment recordable and visible on each shown card only."
Story clause: "The broader ambition, working through everything that still needs review, is larger than this story"
Disposition: excluded "The broader ambition, working through everything that still needs review, is larger than this story"
Commitment: 4
