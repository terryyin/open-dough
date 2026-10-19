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
  Dependency records already carry supplier identity separately from `href`;
  use that identity plus the rendered project ID. Execution confirmed that the
  shared dependency writer requires backlog-relative supplier homes in the same
  project (`supplierOf` in `product-backlog-story-dependencies.mjs`). Pinned
  GitHub URLs are the dashboard's rendered output, not cross-project dependency
  input. Every current semantic reference carries identity; no URL-only surface
  exists. Preserve that contract, with no unused URL recognizer or new
  cross-project dependency meaning. A Git revision identifies source evidence,
  not another story. Do not infer identity from title, path or filename. An
  unresolvable reference gets the unavailable outcome.
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

[Preparation provenance and observations](proof/observations.md#preparation-observations) retain the pre-execution workspace, red observation, viewport mutation check and locked setup evidence.

## Outside-in proof ownership

| Final promise | Owner | Observable proof |
| --- | --- | --- |
| Dependency and other story references open/reveal the correct active block | 1 | New browser journey clicks and keyboard-activates references, asserts target detail, card focus and viewport, unchanged dashboard origin and no host launch/attach calls. Repeat activation keeps detail open. |
| Exact anchor and pinned URL resolve to the intended story | 1 | Two stories in one seed; relative recorded homes and their revision-pinned rendered links, including the supplied Pygardon URL shape; configured projects with matching identities cannot select the wrong project. Assert identity and visible block, not only href. |
| Own-source and non-story/revision-evidence links retain their destination | 1 and regression in 2 | Inspect the target and activate its own source link into a locally intercepted GitHub page; assert original pinned URL. Preserve evidence-link tests and unrelated web-link behavior. |
| Loading/failure/absence give honest feedback and recover | 1, extended in 2 | Hold/read-fail data on reachable project observation paths, recover it, and test a missing target. Assert no wrong-card reveal, accessible target-specific feedback, usable navigation and retry/re-activation. Leaving while pending prevents a later jump. |
| Existing Done stories, including beyond the shown prefix, are revealed | 2 | Published Done catalog with target beyond first ten, no associated session; click its reference and assert actual card, range, bounded reads, focus and viewport. No fixture may pre-expand the range. |
| Detail read gaps preserve the identified destination and absence does not load history | 2 | Failed Done detail still reveals its identified card with the existing gap. Missing/expired/unlisted target shows unavailable, without a fabricated block or history requests. |
| Keyboard, narrow-screen and reduced-motion navigation remain usable | 1 and 2 | Activate by keyboard and touch at a narrow viewport, assert useful focus/visible target; reduced motion uses the same destination without animation. Hidden columns are revealed through the existing owner. |

## Execution context

Established Story Branch execution on 2026-10-19 in this linked preparation workspace and branch; publisher `dashboard-territory.local-open-dough`, agent `philip-chan`. Starting revision `6066ed70201516589d1fd7a6907c6dd1af44fe77`; claim accepted on `origin/main` and first increment base `cdd71a2d67a41556575032fc18727715aee61216`. Increment target `origin/refs/heads/codex/open-referenced-stories-in-their-dashboard-block`. Optional integration/default checkout `/Users/terryyin/git/open-dough`; its changes are unowned. Ordinary in-scope replanning remains authorized; no numeric slice target/limit/exception is configured.

Setup reuse initially relied on exact preparation workspace, unchanged dependency metadata and passing typecheck. Browser startup then failed with Vite ENOENT, invalidating reuse: `npm ci --no-audit --no-fund` restored this checkout (terminal success), followed by passing typecheck and real browser command. Tracked pre-commit hook is check-only (staged lint and dashboard typecheck for scripts); formatter is `npm run format`, whose tools select applicable components.

Slice 1 accepted `fb09c6340722761096fa539c28e2a905d869e92a` on the increment target; this is slice 2's published base. CI source GitHub Actions, verified selector `ci.yml`, name `CI`. Startup claim's trunk CI is unobserved; increments observe their execution branch. Observer coordinator `story141-root`, directory `/tmp/dough-ci-501/watch-CbnTAT`, PID `47210`, yielded cell `8`, PTY session `77064`, runtime this checkout's `.agents/skills/dough-execute-plan`.

## Ordered slices

### 1. Follow story references to active dashboard blocks

Type: Behavior
Status: done
Proof: Add `dashboard/tests/story-reference-navigation.spec.ts` through the existing isolated published-origin/page fixture; extend dependency accessibility proof and run affected source-link, inspection and navigation consumers.

Behavior: Given a reference to a known active story, activating it reveals and
opens that story's block in the correct project's dashboard, with useful focus.
Repeat activation leaves it open. A missing or unreadable destination is
explained in place; no unrelated work or GitHub page is selected. The block's
own source link and revision evidence continue to open their pinned sources.

Begin with a failing browser journey based on the reproduced dependency click.
Carry explicit supplier identity and project ID through rendering, distinguish
semantic story references from source evidence, and navigate the rendered pinned
URL reference without a second identity grammar. Compose the page's selection, inspection,
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

Slice 1 safe stop leaves Done unavailable; G1 tracks its replacement by slice 2.

### 2. Reveal referenced Done blocks through the existing list

Type: Behavior
Status: done
Proof: Extend the story-reference browser journey with published Done records and the real progressive list; run affected Done-range and session-return suites.

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
complete rule. The delivered Done behavior remains accepted; the integration below completes the plan's existing reconciliation condition. Cover an already shown Done card and one beyond the initial
prefix, no sessions, delayed/failed details, and a user move while waiting.

Run `recently-done-stories.spec.ts` and the affected
`recently-done-progressive-*.spec.ts` scenarios, including navigation, refresh,
failed reads, reset and keyboard return from session/report/terminal paths.
Their session destinations remain their original purpose; story-link tests must
establish the new destination without manufacturing session records. Run the
slice 1 reference journey too because both destinations now share resolution.


Reconciliation (2026-10-19): `origin/main` at `5fe7d8a7844cda5aaf77e8d7d7e974057b433c14` includes plan 318's notification navigation, so the earlier no-other-implementation assumption no longer holds. The merge adapter accepted sibling closures, retained this Taken claim, and combined both published histories in integration merge `b05b42177fe70042b64f2beb1f9ec45e3102e96c`. Reconciliation publication retains previously accepted base `7de4a4d0ccbc665dd2fb461b8d4c9b6a93183eef`.

PFE reassessment: `dashboardDestination.ts` already owns the published project+identity target; `StoryDestination.tsx` independently resolves membership/reveals cards, overlapping this story's target/reveal knowledge. Share those meanings and the reveal responsibility. Preserve URL routing/notification feedback and transient-reference inspection/Done-range policies in their appropriate callers; neither workflow gains new promised behavior. No new architecture, input grammar or story scope is authorized. Reconcile the existing `ProjectActions` extraction once. This remains one navigation outcome/proof loop, with no numeric limit or sizing escalation.

Required combined proof: all six story-reference specs, `notification-story-navigation.spec.ts` and affected routing, project/keyboard, status, source, session/Done consumers discovered by the effect trace; `npm run typecheck:dashboard`. Preserve notification URL unknown/failed/absent feedback, browser history, focus and no launch/attach. Reuse already-accepted unaffected Done range/detail and session proof. Resume at shared target/reveal reconciliation, not by repeating delivered behavior.

## Execution complete

Product advice: keep the current backlog order. The selected navigation outcome is delivered; review found no bounded product correction or supported new feature hypothesis. Existing empirical-feedback response loops remain the near-future priority. [Retrospective evidence](proof/observations.md#execution-retrospective) records attribution, judged proof, process findings and the separate consumer timing limitation.

## Verification and review

Each slice owns its navigation outcome, focused proof and cleanup; owner changes stay with that behavior. No numeric slice limit is supplied; ordinary refactor and commit gates apply.

Run `npm run typecheck:dashboard` for typed source changes and focused
Playwright suites selected from the effect trace above. Establish each new
journey's failure without its claimed behavior before accepting green. Expand
checks only where shared consumers require them; a full repository suite is
not a blanket local requirement. Source/plan preparation itself is checked by
the recorder, Markdown/link review and `git diff --check`.

Preparation review found distinct proof loops and owners, no remaining concern or blocking dependency, and no need for separate refinement. Execution authority comes from the current instruction.


## Accepted proof and learning

[Accepted slice observations](proof/observations.md) retain the inspected boundaries, literal commands, red/green observations and independent refactors for both delivered increments. Reuse only unchanged boundaries after integration.

## Story obligations

### G1. Done destinations await the second slice
Reported: slice 1 — "Done references currently show unavailable; slice 2 owns revealing them."
Story clause: "Reveal existing Done blocks as well as active work; a block outside the currently shown range is still an existing destination."
Disposition: proved by slice 2: story-reference-done.spec.ts real published 35-story/no-session setup starts at ten; near3 and far27 reveal, exact prefix reads, focus/viewport, repeated activation/retained27, held/failed detail cards; story-reference-done-recovery.spec.ts proves catalog recovery and expired/unlisted absence with no fabricated cards or additional GitHub calls.

### G2. Existing semantic references carry identity
Reported: slice 1 — "No existing semantic caller supplies URL-only or cross-project dependency input."
Story clause: "Apply the rule to dependency links and inspect other dashboard locations that offer story links so they behave consistently."
Disposition: no user cost "Apply the rule to dependency links and inspect other dashboard locations that offer story links so they behave consistently.": inspected JSX link inventory reaches only supplier references carrying project ID and supplier identity. RecordedLink and revision evidence remain source links. Shared supplierOf rejects absolute/schemed homes. Navigating every existing rendered reference needs no new input contract or unused URL parser.

### G3. Loading proof uses a reachable read path
Reported: slice 1 — "Dependency disclosures are published after the canonical preparation batch completes."
Story clause: "Loading must not be reported as absence."
Disposition: proved by slice 1: story-reference-navigation.spec.ts missing/reading/failed destination journey clicks a real supplier, holds the actual retry backlog read, observes Reading without a target card, then failure without unavailable, and retry reveals newly published C; unreadable-detail journey independently reveals B with its existing gap.

### G4. Cancellation must preserve the reader's chosen action
Reported: slice 2 — "button gets focus but click misses, so latest stays27."
Story clause: "keeps navigation usable"
Disposition: proved by slice 2: story-reference-done-cancellation.spec.ts actual Show latest 10 and inspection actions run through pending cancellation; mouse down then data arrival cannot jump before mouse up opens the chosen inspection; native Tab leaves Dismiss for a non-body surviving control and retains its focus after held data arrives; unavailable/failed catalog healing also preserves later choices.

### G5. Catalog healing must re-evaluate absence
Reported: slice 2 — "old absent Done demand remaining settled when catalogue later heals"
Story clause: "Existing refresh/retry remains available"
Disposition: proved by slice 2: story-reference-done-recovery.spec.ts catalog-held loading, read failure and Retry follow the existing announced recovery time; after the catalog heals, the same range re-evaluates absence and far27 receives focus/viewport. Parameterized later-choice tests preserve that choice instead.

### G6. Reconcile the now-published notification navigation
Reported: slice 2 — "the parallel notification-navigation story has landed on main and added another story-target path"
Story clause: "Apply the rule to dependency links and inspect other dashboard locations that offer story links so they behave consistently."
Disposition: proved by slice 2: proof/observations.md final reconciliation acceptance traces supplier and URL callers through shared StoryDestination/activeStoryAt/pageEntries.revealStory; all 27 reference/notification journeys pass, preserving source links, URL history/status and reference inspection/Done-range policies.

### G7. Reveals must survive input and observation timing
Reported: slice 2 — "repeated far27 activation failed viewport"
Story clause: "brought into view"
Disposition: proved by slice 2: story-reference-scroll-completion.spec.ts observes native movement while far27 remains focused/offscreen, then actual late completion at source; red against spent sync/RAF, green with pending-only native completion tracking. Final27 retains repeatfar, paused catalog recovery and later same-seed touch; independent module-move proof rechecks reference, URL and session callers. Exact commands and separate unchanged-consumer timing disposition are in proof/observations.md.
