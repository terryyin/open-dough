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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/613-follow-story-references-by-title/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"c811245962bb8ae0abefedbc8477d93ea5fc293301c6596617b13e00760534bb","plan":"bf9730a44c1478cee3cf539feb185187252e106ccf4577dbc62e17f683d3c3e0"}}
```

#### Goal

Developers reading a story, plan, or dashboard dependency can tell what another
story is about and reach that exact story in one click, even when several
stories share a seed or the referenced story has completed.

#### Scope

- **Guidance, kept short.** Extend contract item 3 of
  [Work item identity](../../src/skills/dough-product-backlog/references/identity.md#the-contract)
  ("The link is navigation, not identity") by about one sentence, addressed to
  the agent writing the reference under
  [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  label a story link with the story's title and point it at the story's anchor;
  label a whole-seed link with the seed's title; link a removed section at a
  revision that still has it; resolve an unclear target from evidence or flag
  it. Add no new section or paragraph. [Seed format](../../src/skills/dough-story-decomposition/references/seed-format.md)
  and the [executable plan format](../../src/skills/dough-story-refinement/references/planning.md#write-an-executable-plan)
  reach it through their existing Work item identity links, at most by
  retargeting a link they already have, not by restating the rule.
- **Audited references.** Apply the convention to the still-relevant references
  below. Recheck current story ownership and destinations before editing.
  Coordinate changes to Taken stories or their plans with their owners and
  respect the existing readiness review rules. Other older prose changes only
  when it is touched for another reason.
- **Dashboard Dependencies.** Label each supplier with its story title, read
  by the recorded identity from the project's active work or the supplier's
  done record, and
  keep following the link to that active or Recently done story. When no title
  is available, label it with the recorded identity; existing recovery
  behavior stays. Update [Dashboard navigation](../../docs/dashboard-navigation.md)
  only where it describes the label.
- **Scope limits.** The backlog format, structured identities, and the
  dependency record (supplier identity and href) stay as they are; no title is
  stored in dependency facts or the done catalog.

#### Key examples

1. A plan that mentions another story writes
   [Read CI history at a glance in story comparison and test Proof](SEED-331-read-ci-history-at-a-glance.md#read-ci-history-at-a-glance):
   the reader sees the title and lands on its section. Two references into the
   page-object seed distinguish review and Side panel work from session
   discovery and report work, and each opens its own section at the retained
   revision.
2. A reader follows **Spot completed stories that need review** from the live
   dashboard status seed and reaches the completed story section at a retained
   revision. A reference to the whole live dashboard status seed opens it under
   its seed title.
3. The guidance diff adds about one sentence to Work item identity and no new
   paragraph anywhere else; an agent reading only the contract item can write
   example 1's reference.
4. In **Dependencies**, two suppliers sharing a seed show their own titles, and
   each opens its own story in the correct project. A completed supplier opens
   its Recently done card. A supplier whose title is unavailable shows its
   identity and still opens that exact story, never a sibling.

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
