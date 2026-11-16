---
id: SEED-301
status: active
planted: 2026-11-11
planted_during: Terry requested a reminder to cap first-layer test cases at ten lines
trigger_when: Terry is ready to refine the test-case length rule and its tooling
scope: story
---

# SEED-301 — First-layer test case length

<a id="limit-first-layer-test-cases-to-ten-lines"></a>

### Limit first-layer test cases to ten lines

**Identity:** SEED-301#limit-first-layer-test-cases-to-ten-lines
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Refinement must define the test-case counting and enforcement details and settle the Nix, Python, and Lizard setup."],"basis":{"document":"873e4b47f32e727ebaa22bfae983bf7202be0e00fe5fe97f6babb11338965550"}}
```

#### Goal

Keep test intent easy for Open Dough developers to read by limiting each
first-layer test case body to 10 lines of code. Use the existing MakeMe test
data builders and page objects to keep setup and browser mechanics out of the
case body while keeping the scenario and its expected outcome visible.
[MakeMe](../../Distribution/tests/README.md#test-data-architecture) · [Page objects](../../dashboard/tests/fluent-side-panel-pilot.md#fluent-phases-in-the-side-panel-content-journeys)

#### Refinement reminder for Terry

Enforce the rule during refinement. Agree how Lizard will count lines of code
in individual test case bodies and verify that a 10-line case passes and an
11-line case is flagged.

Set up the tooling in dependency order. Use Nix to manage the development
environment, provide Python through that environment, then add Lizard for
line counting.

<a id="serve-frontend-dashboard-answers-through-makeme"></a>

### Serve frontend dashboard answers through MakeMe

**Identity:** SEED-301#serve-frontend-dashboard-answers-through-makeme
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/655-serve-frontend-dashboard-answers-through-makeme/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"79232af8186cfffd6e58d648954a06ac2408acd100052e08468c9e6a2f1d0157","plan":"c11f125bf27333c447a9b5963b1cdb9ae600664e8a8ecf85b8dbba76cab4c1ca"}}
```

**Goal:** Dashboard Frontend Tests state what the dashboard's machine
answers (observed launches, attempts, offers, creations) and the host status
through MakeMe steps and the `frontendServices` fixture they already hold,
instead of importing a `putFrontend…` or `observed…` helper for each.

**Scope:**

- In: the machine and host answers of `frontendServices`:
  `putFrontendMachine` (42 files), `putFrontendObservedLaunches`,
  `observedDone`, `observedOpen`, `putFrontendHostStatus` and
  `putFrontendThreeProjects`, with their specs and the support modules that
  wrap them. The observed state of a launch becomes a step of
  `makeMe.aMachineAnswer` (observing a launch done for review, done with its
  session unavailable, or open and working); the fixture answers what the
  case built (`frontendServices.answerMachine(answer)`, `.answerHostStatus`,
  `.listProjects`), as `comparisonServices.serve(story)` does for compared
  stories. Builders keep no runtime `dashboard/` import.
- Out: published project answers (Intent sources, Intent story, published
  backlog and stories, candidates, done records), which
  [Publish Intent projects through MakeMe](#publish-intent-projects-through-makeme)
  takes.

**Key examples:**

- The Recently done sidebar case arranges five launches with one call:
  `frontendServices.answerMachine(makeMe.aMachineAnswer.observingDone(newest,
  middle).observingUnavailable(oldestShown, unattached).observingOpen(stillOpen).please())`,
  and imports neither `putFrontendObservedLaunches`, `observedDone` nor
  `observedOpen`.
- A launch case that answers attempts keeps `makeMe.aMachineAnswer.answeringAttempts(…)`
  and hands it to `frontendServices.answerMachine`, importing no
  `putFrontendMachine`.
- An unread machine stays expressible: `frontendServices.answerMachine(undefined)`.
- Every changed spec keeps its scenario facts and expectations and passes.

<a id="publish-intent-projects-through-makeme"></a>

### Publish Intent projects through MakeMe

**Identity:** SEED-301#publish-intent-projects-through-makeme
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Intent frontend specs build their published projects (Open Dough,
Doughnut, Pygardon), settings, candidates records and source revisions
through MakeMe steps instead of importing many fixture constants and
`describedRevisions`/`intentSettingsText` separately, as
`intent-source-target-recovery.spec.ts`'s 53 import lines show.

**Scope:** `dashboard/tests/catalogProjectRecords.ts`,
`intentCodeBrowseFixtures.ts`, `intentCandidates*Fixtures.ts` and the Intent
frontend specs importing them, and the published-project answers of
`frontendServices` (`putFrontendIntentSources`, `putFrontendFolderSources`,
`putFrontendIntentStory`, `putFrontendPublished`, `putFrontendStories`,
`putFrontendCandidates`, `putFrontendDonePublication`,
`putFrontendDoneRecords`). Moving these into
`Distribution/tests/support` needs their runtime `dashboard/` imports
replaced by Distribution renderers first.
