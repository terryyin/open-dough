---
id: SEED-342
status: active
planted: 2026-11-13
planted_during: Terry asked how to make story references readable and precise when a seed contains several stories
trigger_when: selected from the product backlog
scope: story
---

# SEED-342 — Follow story references by title

<a id="follow-story-references-by-title"></a>

### Follow story references by title

**Identity:** SEED-342#follow-story-references-by-title
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

Developers reading a story, plan, or dashboard dependency can tell what another
story is about and reach that exact story in one click, even when several
stories share a seed or the referenced story has completed.

#### Scope to refine

- State the prose convention once in [Work item identity](../../src/skills/dough-product-backlog/references/identity.md#the-contract)
  and link to it from [Seed format](../../src/skills/dough-story-decomposition/references/seed-format.md)
  and the [executable plan format](../../src/skills/dough-story-refinement/references/planning.md#write-an-executable-plan).
  Use the story title and exact anchor. For a removed story section, link to the
  section at a retained revision. When the reference is to the whole seed, use
  the seed title. Resolve ambiguous references from evidence or flag them for
  clarification.
- Apply the convention to the still-relevant references in the audit below.
  Recheck current story ownership and destinations before editing. Coordinate
  any changes to Taken stories or their plans with their owners and respect
  the existing readiness review rules. Update older prose as it is touched.
- Show the supplier story title in the dashboard's **Dependencies** panel.
  Use the existing project and story identity to follow the link to an active
  or Recently done story. Where the title cannot be resolved, retain a usable
  reference using the recorded identity and preserve existing recovery behavior.
  Keep the backlog format and structured identities and dependency facts.

#### Key examples to refine

1. A reference to [Read CI history at a glance in story comparison and test Proof](SEED-331-read-ci-history-at-a-glance.md#read-ci-history-at-a-glance)
   displays that title and opens its section. Two references into the page-object
   seed distinguish review and Side panel work from session discovery and report
   work, and each opens its own section at the retained revision.
2. A reader follows **Spot completed stories that need review** from the live
   dashboard status seed and reaches the completed story section at a retained
   revision. A reference to the full live dashboard status seed opens the parent
   document under its title.
3. In **Dependencies**, two suppliers sharing a seed show their respective
   titles. Following each reaches its own story in the correct project. A
   completed supplier still opens its Recently done card. A title that cannot
   be read does not silently send the developer to a sibling story.

#### Audited references

- [Read only the history the dashboard needs](SEED-337-dashboard-history-reads.md#read-only-the-history-the-dashboard-needs)
  uses the seed number as the label for the CI history story. Its anchor is
  already precise.
- [Keep review cues current with SSE](SEED-336-live-dashboard-status.md#keep-review-cues-current-with-sse)
  links the seed number to a Done record. The
  [retained story section](https://github.com/terryyin/open-dough/blob/00295c11c7e28959be063196ae152921c51f2c6d/.planning/seeds/SEED-333-spot-completed-stories-that-need-review.md#spot-completed-stories-that-need-review)
  is recoverable.
- [Match touch review titles to what each viewport runs](SEED-321-match-touch-review-titles-to-viewport-coverage.md#match-touch-review-titles-to-viewport-coverage)
  and [its plan](../slice-plans/611-match-touch-review-titles-to-viewport-coverage/PLAN.md)
  refer to the touch-review speedup, default-timeout work, and the review and
  Side panel page-object story. [Short session tests](SEED-341-simplify-session-tests.md)
  and [Keep one-time browser test preparation out of case budgets](SEED-340-test-preparation-outside-case-budgets.md#keep-one-time-test-preparation-out-of-case-budgets)
  instead refer to the session discovery and report page-object story.
- [Answer fake GitHub reads without a process per call](SEED-332-answer-fake-gh-in-process.md#answer-fake-gh-reads-in-process)
  and [the repeat-check correction](SEED-324-landed-ci-repeat-checks-under-high-load.md#close-landed-ci-repeat-check-gaps)
  refer to the [completed high-load story](https://github.com/terryyin/open-dough/blob/854a1ae307abf6f3238daddf79bdf95d9b6e0e90/.planning/seeds/SEED-324-landed-ci-repeat-checks-under-high-load.md#pass-landed-ci-repeat-checks-under-high-load).
  [The correction plan](../slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md)
  also refers to two stories under the same seed, default GitHub Actions
  follow-up and custom rebuilds.
- [Hold landed CI follow-up observations under load](SEED-319-landed-ci-follow-up-observations-under-load.md#hold-landed-ci-follow-up-observations-under-load)
  refers to the mobile terminal story, the default-timeout work, and the
  repeat-check speedup.
- [Report why an Intent launch failed](SEED-292-report-launch-failure-causes.md#why-this-matters)
  refers to [See Doughnut test cases and test files in Intent](https://github.com/nerds-odd-e/doughnut/blob/59bfff83beee80ba7a6cdcf0cff5c3fe3b3ded77/.planning/seeds/SEED-112-publish-explicit-ci-test-counts.md#publish-explicit-ci-test-counts).
  [Native guidance acceptance](SEED-053-native-guidance-acceptance.md) and its
  companion cases use seed-number labels for retained story links.
- When touching [finding ODF-436](../../docs/maintainer/findings/ODF-436.md#occurrences),
  link the execution reference to [Publish Donut CI proof for Intent](https://github.com/nerds-odd-e/doughnut/blob/ce02725578f2eda870c83b341fdf5c818a818b14/.planning/seeds/SEED-102-publish-donut-ci-proof.md#publish-donut-ci-proof).
- [The dashboard dependency link](../../dashboard/src/StoryCardDependencies.tsx)
  renders the full identity as the label. [Dashboard navigation](../../docs/dashboard-navigation.md)
  describes where active and Recently done links take the reader.
