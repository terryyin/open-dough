---
id: SEED-334
status: active
planted: 2026-11-13
trigger_when: selected from the product backlog
scope: story
---

# SEED-334 — Product-wide end-to-end tests


<a id="retire-dashboard-integrated-ui-test"></a>

### Move Intent CI checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#retire-dashboard-integrated-ui-test
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/633-retire-dashboard-integrated-ui-test/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d0aaedaaa3aa9651885b21812fc132feb47b1049f31f0c4aac5bd822d4abec37","plan":"ab4670a68f8b18000d020e3e5f3bbe31b1fcd4840007c7b460036df3b328a196"}}
```

#### Goal

A dashboard maintainer runs CI status, timing, proof, comparison and
optimization-candidate regression checks at their owning boundaries, with
every distinct assertion preserved outside Dashboard Integrated UI Test.
This reduces the remaining mixed test tier while keeping Intent's CI evidence
trustworthy; no speed improvement is claimed without measurement.

#### Scope

- Convert the 35 remaining Intent CI specs: `intent-ci-status-*`,
  `intent-ci-wall-time-history*`, `intent-scope-*`, `intent-ci-proof*`,
  `intent-ci-comparison-*`, `intent-summary-*` and
  `intent-test-optimization-candidates*`.
- Put HTTP refusal, request accounting, acquisition and storage assertions at
  the Backend boundary; controlled service answers and actual rendering or
  interaction at Frontend; representative real-server workflows in E2E.
  Split mixed cases by their assertions, including negative effects. Preserve
  each distinct regression, not merely test names or case counts.
- Convert `intent-ci-status-read-boundary.spec.ts` directly to Backend,
  preserving malformed branch/revision/kept refusals, fresh unread and kept-none
  answers, and the exact additional GitHub-call assertions without a browser.
  The omitted-attempt refusal in `intent-ci-proof.spec.ts` also belongs there.
- Before deleting a migrated case, account for its assertions in named
  maintained homes. A representative changed proof boundary must catch the
  same scratch break before and after conversion, then pass restored.
- Keep shared helpers, current runner support and historical proof usable.
  Remove only converted specs and their interim duration-list entries.

**Scope limits.** Intent source/review/revision and navigation conversion and
retirement are owned by the two stories below. No new tier, product behavior,
speed or shard-count target, tagged-install proof or E2E renaming.

#### Key examples

1. A malformed CI-status branch, pinned revision or kept form is requested
   directly from the real Backend boundary → HTTP 400 and no extra GitHub
   request. Fresh unread and kept-none still return their previous answers.
2. A CI proof case mixes table layout with ZIP acquisition and an HTTP refusal
   → Frontend observes actual presentation from controlled service answers;
   Backend/E2E retains real parsing/acquisition/refusal and request counts.
3. A comparison navigates scopes or an optimization candidate opens Purpose
   → the maintained homes still observe values, gaps, source pinning, keyboard
   behavior and reading position. Converted interim specs and timing rows go;
   all remaining Intent and navigation cases still run in the interim group.

**Plan:** [Intent CI conversion](../slice-plans/633-retire-dashboard-integrated-ui-test/PLAN.md)

#### Story boundary and ordering

On 2026-11-15 preparation resplit the former Intent/navigation/retirement
outcome, retaining this identity and plan 633 on the first useful outcome.
The original eight-batch plan had 20-spec batches and understated new Frontend
answer-family preparation; the preceding execution at `bfd4e7815` found that
one new family costs most of a 15-active-minute slice. The original scope is
fully mapped to this story and the next two, without dropping assertions.
The recomputed 35/37/41-file inventory replaces the provisional batch counts.
CI conversion comes first for Intent proof feedback and answer-family learning;
reading/review conversion follows for Purpose and review protection; navigation
and retirement closes the tier. Each conversion outcome remains useful if
later work is deferred. Simply moving everything into E2E preserves mixed
checks but does not resolve their misplaced proof; keeping the interim tier
leaves the selected problem intact. No general project S/M/L bands are defined
(as also recorded in SEED-353); sizing uses inspected batches and the maintained
15-active-minute slice budget rather than invented bands.

<a id="move-intent-reading-and-review-checks"></a>

### Move Intent reading and review checks out of Dashboard Integrated UI Test

**Identity:** SEED-334#move-intent-reading-and-review-checks
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/647-move-intent-reading-and-review-checks/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"91030d8a520b94f16feb26edd9b4079872dfba10198f1b3ece6340817a07846d","plan":"bd155420804aaa8bfae03b27323324685549c96199cc30129b926f5f5b73625c"}}
```

#### Goal

A dashboard maintainer keeps Intent's story/Done review, source/Purpose and
reading-recovery regressions at their owning Frontend, Backend and E2E
boundaries. Every distinct assertion remains useful while navigation still
runs in Dashboard Integrated UI Test. The gain is clearer proof ownership;
no speed improvement is claimed without measurement.

#### Scope

- Convert the 37 remaining non-CI Intent specs mapped in plan 647, including
  `intent-ci-done-glance` and `intent-ci-done-reference-lifecycle`. Their Done
  reading promises belong here even though their filenames contain CI.
- Put controlled service answers with actual rendering, keyboard, focus,
  source/case selection and reading position at Frontend. Keep real source
  judgment, historical/live review selection, HTTP refusals, acquisition,
  GitHub request counts and SSE connections at Backend or representative E2E
  boundaries. Split mixed cases by their assertions, including negative effects.
- Preserve selected-story changes/gaps, coverage, appearance and Review return;
  Done historical versus live/captured review modes and project refresh;
  revision notices, held/failed/latest updates and stale-answer exclusion;
  nested source/Gherkin/Java/Purpose reading; activation, reuse and recovery.
- Before removing each original case, account for every distinct assertion in
  named maintained cases, including applicable existing proof. Observe the same
  representative scratch break failing before and after a changed proof
  boundary, with restored passes. A move or an equal case count alone is not
  preservation evidence.
- Remove only converted specs and their interim duration rows. Keep shared
  support and remaining runner consumers usable. After this and the CI
  conversion both land, no product spec remains in `dashboard/tests/intent/`.

**Scope limits.** Navigation conversion and runner retirement belong to the
next story; Intent CI conversion remains in plan 633. No product behavior
change, new tier, E2E rename, tagged-install proof, timing or shard target.
Conversion can start independently; reuse CI answer families when delivered
rather than creating parallel ones. Shared support alone is no start dependency.

#### Key examples

1. With a Taken story selected, browse a location and nested folders, open a
   changed test, then open and close Review by keyboard → Summary and Purpose
   show the same changes; browsing asks for no text, the diff is read once
   without published text, and closing restores the reading and header focus.
2. With Done historical Intent open, select another Done story or ordinary
   live Review while its answer is held → the old story/mode's source and
   captured run do not leak; the correct historical/live answer is selected
   for real, then the browser renders it. Project refresh preserves the Done
   file, endpoints, Purpose/Proof choice and reading place.
3. With a source case selected, a newer revision arrives → one notice retains
   the shown revision. Show latest, a held/failed locations or file answer,
   Retry, and switching projects retain the correct focus, source revision,
   target line and reading place without showing another project's late answer.
4. Open nested Gherkin or Java source or a recorded case, then revisit Intent
   or change its file column → exact text, line numbers, highlighting/fallback,
   selection, keyboard reachability and reading position stay protected.
   Hidden/unreachable reads recover only at their existing retry conditions;
   malformed settings stay distinct from unconfigured settings.

**Plan:** [Intent reading/review conversion](../slice-plans/647-move-intent-reading-and-review-checks/PLAN.md)

**Provenance.** Split from SEED-334#retire-dashboard-integrated-ui-test;
the pre-split source/plan is recoverable at
`f03e959480b2a04a7194b072cf71aa9da55ee1a9`. The provisional five batches
are realigned after refinement, preserving their original scope.

<a id="move-navigation-checks-and-retire-integrated-ui-test"></a>

### Move navigation checks out and retire Dashboard Integrated UI Test

**Identity:** SEED-334#move-navigation-checks-and-retire-integrated-ui-test
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected","assessment":"not-ready","reasons":["Awaiting story refinement and realignment of provisional plan 648."],"basis":{"document":"9280aac9f17802babf39236f42c83ee8ff1a1b1e59eee244fdfb510c3427f8b8"}}
```

- **For / why.** A maintainer keeps board/frame/selection/reference protection
  in maintained homes and runs only E2E, Frontend and Backend browser groups.
- **Evaluation.** All 41 navigation specs retain every distinct assertion at
  its real boundary. Once all interim product specs have other homes, retire
  the current Intent location, npm command, config, CI producer/shards,
  duration lists and live tooling/placement references. Shared support still
  works; old integrated proof is readable at its original revision without
  current-proof claims, fabricated comparisons or dead source links.
- **Scope.** Original provisional slices 5–8. Keep
  `integratedStateCompletion` unchanged. Update the roster or its hard-coded
  callers whichever order the roster story lands. No new tier, product change,
  speed/shard target, E2E naming or tagged-install proof.
- **Value / stopping point.** Converted navigation batches keep their value;
  this story completes only when the empty group is retired.
- **Prerequisites.** Navigation conversion can start independently. Retirement
  waits for both Intent conversion outcomes on trunk and no remaining interim
  product cases; shared code alone creates no start-blocking dependency.
- **Plan:** [Provisional navigation and retirement](../slice-plans/648-move-navigation-checks-and-retire-integrated-ui-test/PLAN.md),
  awaiting story refinement before plan refinement or execution.
- **Provenance.** Split from SEED-334#retire-dashboard-integrated-ui-test;
  original scope and historical-evidence promises are preserved here.

<a id="observe-tagged-install-and-read-e2e-proof"></a>

### Observe a tagged installed workflow and read E2E proof in Intent

**Identity:** SEED-334#observe-tagged-install-and-read-e2e-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why.** A developer sees a representative workflow run released
  Open Dough commands in an installed project, and reads **E2E Test** proof in
  Intent under its own name without false continuity from the retired
  `dashboard/tests` evidence.
- **Evaluation.** An isolated project with Open Dough installed from published
  `v0.3.97` (tag, resolved revision and installed version recorded) starts
  story preparation from the dashboard under `npm run test:e2e`, and the
  installed command publishes the assignment to its bare origin; a missing or
  unverifiable pinned release fails clearly without branch fallback. Each E2E
  journey names its real integrations and simulated boundaries. Project
  Intent, Purpose, Proof, story CI comparison and history name the **E2E
  Test** entry, open registering-helper sources, keep old `dashboard/tests`
  evidence readable at its revision, and show absent or changed scopes
  without fabricated numeric comparisons or dead links.
- **Inputs.** Scope 3, 4, 7 and 8 and Key examples 1 and 5 of
  SEED-334#run-and-observe-product-wide-end-to-end-tests, and plan slices 5
  and 6 with their premises and the accepted tagged prerequisite proof in its
  preparation assessment, recoverable at commit
  `d21a0ebc5ee0426f9898d10725c9e7765f49bc8e` from
  `.planning/seeds/SEED-334-product-wide-end-to-end-tests.md` and
  `.planning/slice-plans/608-product-wide-end-to-end-tests/PLAN.md`.
- **Boundary.** No new release, native agent acceptance or speed work.
- **Value / learning.** Completes the product-wide E2E goal's installed and
  Intent-reading promises on the runners SEED-334 delivered.
- **Safe stopping point.** The tagged journey alone, or the Intent naming and
  history alone, is complete on its own.

<a id="keep-one-browser-test-group-roster"></a>

### Keep one browser test group roster and current placement guidance

**Identity:** SEED-334#keep-one-browser-test-group-roster
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/617-keep-one-browser-test-group-roster/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"336ccf3ea5faf948d4e9fd9f8c23622341080fdf457b55e6503fd07ad10e44a2","plan":"52f1257a33e40e7007d41363e4da8ecdf55252473b4ca9c27cc5f3f074ea84e6"}}
```

#### Goal

A maintainer who adds, removes or reads the browser test groups delivered by
SEED-334#run-and-observe-product-wide-end-to-end-tests (recoverable at
`125c45649fa587c78ed7445deff35db87604489d`)
changes the group set in one place, finds helpers named for the groups they
run, has each CI producer's setup bounds guarded on their own, and reads
placement guidance that matches the independent groups.

#### Scope

Bounded retrospective correction of that execution's residue. Give the set of
browser test groups one authoritative home that proof-subprocess isolation,
the repeat helper, the container diagnostic and their tests derive from, with
a consistency check against `ci.yml` and `package.json`. Name the repeat
helper, the container option and shared selection helpers for browser test
groups rather than the dashboard. Check each workflow's Node, npm and browser
acquisition bounds separately. Correct the umbrella and placement wording in
`dashboard/tests/README.md`. Preserve every group's selection, settings,
outputs, shards, CI proof and the interim group; historical records keep their
recorded names. No new group, removal of the interim group, runner, CI job or
speed claim.

**Plan:** [Keep one browser test group roster](../slice-plans/617-keep-one-browser-test-group-roster/PLAN.md)
