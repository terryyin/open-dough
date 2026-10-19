# Open referenced stories in their dashboard blocks

**Source:** [Selected story](../../seeds/SEED-141-dashboard-story-links.md#open-referenced-story-in-dashboard)
**Identity:** SEED-141#open-referenced-story-in-dashboard

## Goal and scope

A developer following a story reference stays in the dashboard and reaches the
referenced block, with its existing inspection open where available, useful
keyboard focus, and the block brought into view. Apply this to dependency links
and every other existing story-reference surface. Preserve a block's own source
link as GitHub navigation and preserve ordinary non-story and revision-evidence
links. Resolve the particular story, including different anchors in one seed,
and recognize the revision-pinned URLs already produced by the dashboard.

Terry accepted on 2026-10-19: include existing Done blocks, even beyond the
currently shown range; explain unavailable destinations in the dashboard.
Loading, failed reads, and a successfully read project without the story are
different observations. Reveal an identifiable block with its existing gap when
only its detail is unreadable. Leave refresh/retry and ordinary navigation usable.
Never substitute another project/story or silently fall back to GitHub.

Deferred: creating blocks for historical or unlisted stories, adding projects,
and turning arbitrary prose into linked Markdown. No Git-history reader, new
workflow record, or new story-state persistence is needed. Reuse existing source
links where offered; this story does not require inventing a deleted seed's URL.
Navigation neither starts agent work nor attaches a terminal.

## Current decisions and reuse

- One navigation target is a configured project plus a recorded story identity.
  Dependency records already carry supplier identity separately from `href`.
  Prefer that identity. For URL-only references, match repository, canonical
  path and anchor against the project's known story records; a Git revision
  identifies source evidence, not a different story. Do not derive stable
  identity from a title or filename: canonical homes can move without changing
  identity. An ambiguous/unresolvable reference gets the unavailable outcome.
- `sourceLink.ts` owns safe source URLs and relative-path resolution;
  `product-backlog-identity.mjs` owns the shared identity/link grammar. Extend
  suitable owners instead of introducing a parallel parser. Preserve original
  recorded text and pinned source URLs alongside the navigation meaning.
- PFE inventory: `DependenciesCard` renders supplier and revision-evidence
  links through the same small helper today. They have different meanings and
  must remain distinguishable. `RecordedLink` is used by `WorkSourceLinks` for
  the canonical source and associated/disputed plans, both in inspection and
  the startup fallback. Source/plan evidence does not become another-story
  navigation merely because its URL is on GitHub. A product-wide search for
  JSX anchors found these two link renderers; recheck consumers at execution
  and apply the rule to any newly present story-reference surface.
- `WorkStages` owns active inspection selection; extend it with an explicit
  open operation rather than toggling already-open detail closed on a repeated
  reference. `workFocus.ts` owns identity-based card lookup, hidden-column
  reveal, reduced motion and interruptible viewport retention. `pageEntries.ts`
  also identifies Done cards. Compose those responsibilities with page/project
  selection; retain startup protection rather than triggering disabled actions.
- `recentlyDoneRange` and `recentlyDoneView` own the shown prefix and pending
  destination. Their current destination is session-shaped; extend that owner
  to address a story directly, without inventing a session or a second paging
  mechanism. The existing published catalog determines eligible Done stories;
  navigation does not extend its retention window. A Done card needs no new
  inspection UI merely to be revealed.
- `sessionNavigation` demonstrates cross-project loading and reveal, but its
  caller also opens a terminal. Reuse the reveal responsibilities, not that
  complete action. A later user selection supersedes a pending reference;
  unread/failed project data must never resolve against the previous project.
- Plan 318's notification-navigation story touches routing and card reveal.
  Reconcile whichever implementation is published first into one shared target
  and reveal responsibility. It is not a blocking prerequisite and this story
  promises neither notification behavior nor a new reloadable URL contract.
- Follow [ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md),
  [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md),
  and [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md).
  The [Architectural North Star](../../NORTH-STAR.md#one-backlog-interpretation-separate-observation-and-presentation)
  separates published facts from transient navigation. Follow existing
  [dashboard navigation](../../../docs/dashboard-navigation.md) and
  [UX/UI direction](../../../docs/dashboard-ux-ui-north-star.md) for focus and
  motion. No new North Star topic or ADR exception is warranted. ADR 0008 is
  Proposed, not binding.

## Preparation observations

Observed on 2026-10-19 in
`/Users/terryyin/git/open-dough/.worktrees/open-referenced-stories-in-their-dashboard-block`
at `e93d3292c918cb44ac65820e787298f8a29790fd`, branch
`codex/open-referenced-stories-in-their-dashboard-block`. Publication target:
`origin/main`; optional integration checkout: `/Users/terryyin/git/open-dough`.
These identify preparation, not an execution claim. Plan 320 follows the
highest allocation 319 found in existing paths and Git history.

| Premise / consuming operation | Observation and limit |
| --- | --- |
| A real dependency click currently leaves the dashboard | A disposable `story-reference-observation.spec.ts` used `twoDependencies`, `publishCommittedOrigin`, and `openUntilRead`, opened A's dependency disclosure and clicked supplier B. The exact pinned GitHub blob route was fulfilled with a local sentinel page; assertions observed that URL and sentinel heading. No real GitHub page or credentials were needed. This reproduced the wrong destination, not the new behavior. |
| The existing proof route exercises published dependencies, own-source inspection, Done cards and reveal | `env -u NO_COLOR npm run test:dashboard -- story-reference-observation.spec.ts story-dependencies.spec.ts story-dependencies-touch.spec.ts session-sidebar-navigation.spec.ts recently-done-stories.spec.ts --workers=2` passed. Existing dependency accessibility proof explicitly expects the GitHub supplier href and needs alignment; its revision-evidence and own-source expectations remain valid. |
| Existing reveal proof detects loss of viewport movement | Temporarily removed only `element.scrollIntoView(...)` from `keepInView` and ran `env -u NO_COLOR npm run test:dashboard -- session-sidebar-navigation.spec.ts --workers=1`. It failed at line 109 with destination viewport ratio 0. Restored the exact source bytes and removed the disposable reproduction spec. |
| Current session journeys can extend Done's range and preserve focus through delayed reads | After restoration, `env -u NO_COLOR npm run test:dashboard -- session-sidebar-navigation.spec.ts recently-done-progressive-navigation.spec.ts --workers=2` passed. The progressive scenarios reach entry 27, hold preceding detail, and observe the requested reads, focus and viewport. This proves the existing session-shaped mechanism; direct story destinations remain new behavior owned by slice 2. |

The first test attempt stopped before tests because this workspace had no local
`node_modules` directory for the test bundle. `npm ci --no-audit --no-fund`
installed the locked dependencies, after which the commands above passed.
No scratch product/test change remains. New reference handling, URL matching,
and story-shaped Done destinations require discriminating new proof during
execution; none is claimed already implemented or passing.

## Outside-in proof ownership

| Final promise | Owner | Observable proof |
| --- | --- | --- |
| Dependency and other story references open/reveal the correct active block | 1 | New browser journey clicks and keyboard-activates references, asserts target detail, card focus and viewport, unchanged dashboard origin and no host launch/attach calls. Repeat activation keeps detail open. |
| Exact anchor and pinned URL resolve to the intended story | 1 | Two stories in one seed; relative and revision-pinned forms, including the supplied Pygardon URL shape; configured projects with matching identities cannot select the wrong project. Assert identity and visible block, not only href. |
| Own-source and non-story/revision-evidence links retain their destination | 1 and regression in 2 | Inspect the target and activate its own source link into a locally intercepted GitHub page; assert original pinned URL. Preserve evidence-link tests and unrelated web-link behavior. |
| Loading/failure/absence give honest feedback and recover | 1, extended in 2 | Hold destination data, fail then recover it, and test a missing target. Assert no wrong-card reveal, accessible target-specific feedback, usable navigation and retry/re-activation. Leaving while pending prevents a later jump. |
| Existing Done stories, including beyond the shown prefix, are revealed | 2 | Published Done catalog with target beyond first ten, no associated session; click its reference and assert actual card, range, bounded reads, focus and viewport. No fixture may pre-expand the range. |
| Detail read gaps preserve the identified destination and absence does not load history | 2 | Failed Done detail still reveals its identified card with the existing gap. Missing/expired/unlisted target shows unavailable, without a fabricated block or history requests. |
| Keyboard, narrow-screen and reduced-motion navigation remain usable | 1 and 2 | Activate by keyboard and touch at a narrow viewport, assert useful focus/visible target; reduced motion uses the same destination without animation. Hidden columns are revealed through the existing owner. |

## Ordered slices

### 1. Follow story references to active dashboard blocks

Type: Behavior
Status: planned
Proof: Add `dashboard/tests/story-reference-navigation.spec.ts` through the
existing isolated published-origin/page fixture; extend dependency accessibility
proof and run the affected source-link, inspection and navigation consumers.

Behavior: Given a reference to a known active story, activating it reveals and
opens that story's block in the correct project's dashboard, with useful focus.
Repeat activation leaves it open. A missing or unreadable destination is
explained in place; no unrelated work or GitHub page is selected. The block's
own source link and revision evidence continue to open their pinned sources.

Begin with a failing browser journey based on the reproduced dependency click.
Carry explicit supplier identity through rendering, distinguish semantic story
references from source evidence, and support matching pinned URL references
without a second identity grammar. Compose the page's selection, inspection,
and reveal owners. Cover same-seed anchors, the supplied URL shape, project
qualification, loading/recovery, repeated activation and cancellation by user
navigation. Preserve source evidence under startup protection. Update maintained
navigation documentation to describe the delivered rule.

Existing tests needing review include `storyDependencyAccessible.ts`,
`story-dependencies.spec.ts`, `story-dependencies-touch.spec.ts`,
`authenticated-project-overview.spec.ts`, `accessible-overview-keyboard.spec.ts`,
`project-keyboard-navigation-focus.spec.ts`, `project-selection.spec.ts`, and
`session-sidebar-navigation.spec.ts`. Follow the actual effect into aggregate
card text, roles, focus and existing source links; do not weaken unrelated proof.
Keep implementation, focused tests and cleanup in this one behavior slice.

Safe stopping point: active destinations work; Done destinations still receive
the unavailable explanation. This is interim behavior replaced by slice 2,
not completion of the story's Done promise.

### 2. Reveal referenced Done blocks through the existing list

Type: Behavior
Status: planned
Proof: Extend the story-reference browser journey with published Done records
and the real progressive list; run affected Done-range and session-return suites.

Behavior: Given a reference to an eligible published Done story, activating it
reveals the existing Done block, extending the shown range through that story
when needed, without requiring a session. A block with unreadable detail keeps
its identity and gap. An absent/expired/unlisted target stays an explicit
unavailable destination, with ordinary dashboard navigation and recovery intact.

Extend the current destination/range model for story and session destinations
coherently; preserve the existing list ordering, read policy, retained longer
range and cancellation on the developer's own move. Reuse the same reference
resolution and reveal rule from slice 1. Do not add a separate Done loader,
historical seed reader, retention policy, or second navigation implementation.
Finish the source inventory and maintained navigation description for the
complete rule. Cover an already shown Done card and one beyond the initial
prefix, no sessions, delayed/failed details, and a user move while waiting.

Run `recently-done-stories.spec.ts` and the affected
`recently-done-progressive-*.spec.ts` scenarios, including navigation, refresh,
failed reads, reset and keyboard return from session/report/terminal paths.
Their session destinations remain their original purpose; story-link tests must
establish the new destination without manufacturing session records. Run the
slice 1 reference journey too because both destinations now share resolution.

## Verification and review

Each slice owns one externally observable navigation outcome, its focused proof
and cleanup. No separate preparatory Structure slice is needed: changes to
existing owners belong with the behavior they enable. No numeric slice limit
is supplied. Execution uses its ordinary post-change refactor and commit gates.

Run `npm run typecheck:dashboard` for typed source changes and focused
Playwright suites selected from the effect trace above. Establish each new
journey's failure without its claimed behavior before accepting green. Expand
checks only where shared consumers require them; a full repository suite is
not a blanket local requirement. Source/plan preparation itself is checked by
the recorder, Markdown/link review and `git diff --check`.

Construction review found no remaining slice-specific concern: both slices
extend one story-target rule, active and Done destinations have distinct proof
loops, and every final promise has an owner. Separate slice-plan refinement is
not needed. No human question or blocking story dependency remains. This plan
grants no execution authority and records no execution completion.
