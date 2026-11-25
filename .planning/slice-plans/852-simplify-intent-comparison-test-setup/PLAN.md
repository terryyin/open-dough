# Simplify Intent comparison test setup

**Identity:** SEED-443#simplify-intent-comparison-test-setup

**Source:** [Simplify Intent comparison test setup](../../seeds/SEED-443-simplify-intent-comparison-test-setup.md#simplify-intent-comparison-test-setup)

## Goal and scope

Mounted Intent comparison specs show only the comparison they prove. Story A
and Done story mounts start docked, and cases drop the `browseFiles` and
`showFiles` steps that only reached the tree. Comparison assertions, the
390 px group default, and every narrow or Files drawer case stay. End-to-end
specs and product code are out of scope.

## Current decisions

- Give [`mountStoryIntent`](../../../dashboard/frontend-tests/intent/intent-story-perspective.tsx)
  the same 1280×800 default that [`mountIntentCiPage`](../../../dashboard/frontend-tests/intent/intent-ci-page-mount.ts)
  already uses. Story A and Done story comparisons then mount docked. The
  comparison follow-up spec still passes 390 px explicitly. Remove the
  conditional viewport spread in
  [`intent-story-compare-stories.ts`](../../../dashboard/frontend-tests/intent/intent-story-compare-stories.ts),
  which passes its caller's choice or nothing.
- Specs on `mountIntentCiPage` fixtures (story changes, Done reading,
  summary comparison, reading place) already mount docked, so their
  explicit Files steps do nothing. Drop those steps in the same pass.
- Keep `goHome`, `expandFolderPath`, `openDetails` and `browseFiles` adapting
  to placement in [`intent-story-compare-page.ts`](../../../dashboard/frontend-tests/intent/intent-story-compare-page.ts).
  Narrow callers still use them: scope glance at portrait, Home activation
  at 390 px, comparison follow-up at 390 px, and the narrow iterations of
  comparison summary, CI cues and dark appearance. Docked cases call these
  steps for the action they name.
- Leave every case that sets a narrow width or asserts the drawer
  unchanged. [`intent-files-drawer.spec.ts`](../../../dashboard/frontend-tests/intent/intent-files-drawer.spec.ts)
  keeps proving selection, outside-click and native outside-tap dismissal.
- Follow [act as soon as the page allows](../../NORTH-STAR.md#act-as-soon-as-the-page-allows)
  and the [page-object convention](../../../.agents/skills/dough-page-objects/SKILL.md).
  Add no new test-support helper.

## Decisive premises

| Consuming operation | Observation and remaining check |
| --- | --- |
| Docked mounts reach the tree, Home and details without Files steps, and every comparison assertion still passes. | At `893c3042a`, a scratch edit in this workspace mounted Story A and Done comparisons at 1280×800. It removed 53 explicit `browseFiles`/`showFiles` steps from the 20 specs below. Then it ran `npm run test:dashboard:frontend --` (Node 24.21.0, mounted Chromium) on those specs, every importer of `intent-story-compare-stories.ts` and `intent-story-landed-run-stories.ts`, `intent-files-drawer.spec.ts`, and `intent-story-views-narrow.spec.ts`. All 34 files passed in 58.2 s. The scratch passed the viewport from `intent-story-compare-stories.ts`, not from `mountStoryIntent`. The slice moves the default down a layer. The same value reaches `mountComponent` for the same callers. The only other caller already passes its own width, so the outcome does not change. The scratch edit was reverted. |

## Ordered slices

### 1. Comparison specs start with Files docked

Type: Structure
Status: planned
Estimate: 10–15 active minutes.

Change: Default `mountStoryIntent` to 1280×800 and simplify its Story A and
Done story callers. Remove the explicit Files steps from these Intent specs:
story-compare `fixed`, `done`, `evidence`, `gaps`, `reading`, and
`selected-counts`. Do the same in `story-outside-locations`,
`story-result-browser`, `story-changes-only`, `story-changes-gaps`, and
`story-changes-no-locations`. Then do `story-tree`, `story-file-notes`,
`read-reuse-story`, `done-source-selection`, and `done-project-refresh`.
Finish with `summary-story-comparison-sort`, `summary-story-comparison-gaps`,
`reading-place`, and `story-outside-proof`. Read each removed line's context.
Remove a comment or variable that only existed for the removed step, and
update the comment in `intent-story-compare-stories.ts` to match.
This is a direct test-readability cleanup and enables no further Behavior.

Proof: Run the focused set from the premise row through
`env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES npm run --silent test:dashboard:frontend -- <files>`.
It must include the 20 edited specs, every importer of the changed mount
helpers, `intent-story-comparison-follow-up.spec.ts`,
`intent-files-drawer.spec.ts`, and `intent-story-views-narrow.spec.ts`.
All must pass with no assertion removed. `git diff` shows only Files-step
removals and the mount default.

Local gate: the focused set above. The change touches only frontend Vitest
specs and their shared mount, so hosted CI's Dashboard frontend group owns
the full suite after publication. Apply the shared
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
to failures and to all repair handoffs.

## Concern evidence

Refinement was not needed. The single slice repeats one mechanical edit,
and the premise observation already rehearsed it. This review found no
remaining slice-specific concern.
