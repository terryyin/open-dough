# Source review — SEED-180#optimize-dashboard-touch-viewport-tests

Launch: fresh general-purpose reviewer, source-only (no plan, product, proof, or conversation inheritance). Input: Goal, Scope, key examples, and scope limits from `.planning/seeds/SEED-180-optimize-dashboard-touch-viewport-tests.md#optimize-dashboard-touch-viewport-tests`. Human amendments: none.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Reduce redundancy and the number of test cases in the dashboard touch test family while preserving behavioral coverage and confidence. | slice 6 | |
| 2 | Each touch rule has one owner. | slice 6 | |
| 3 | Local feedback on touch behavior is shorter. | slice 6 | |
| 4 | Outcome (Terry, 2026-10-30): fewer cases and less repeated proof. | slice 6 | |
| 5 | Evidence that the reduction took effect is a shorter focused-family wall time — not a suite-wall promise. | slice 6 | |
| 6 | The family is the fourteen specs under `dashboard/tests/` that use `touchLaunchPage.ts`. | slice 2 | observed: `/tmp/seed-180-slice2-baseline/list.txt` Total: 36 tests in 14 files |
| 7a | Twelve of those specs loop the phone and tablet devices. | slice 3 | |
| 7b | Two of those specs select a phone. | slice 3 | |
| 8 | Run each journey on one device unless the other device reaches an asserted CSS branch or arrangement the first does not. | slice 3 | |
| 9 | The phone pair (390×844, 844×390) already crosses every width branch (400, 480, 640, 800 px) and the ≤480 px height branch. | slice 3 | |
| 10a | Tablet adds the side-by-side story review body at 768 portrait. | slice 3 | |
| 10b | Tablet adds the wide-and-tall landscape. | slice 3 | |
| 11 | One owner per pattern at the cheapest tier. | slice 5 | |
| 12 | Other journeys keep only their own delta. | slice 5 | |
| 13a.1 | A draft survives rotation and reduced height and can be edited there. | slice 5 | |
| 13a.2 | Cancel sends or writes nothing and focus returns. | slice 5 | |
| 13a.3 | A failed local write keeps the predecessor bytes and Retry resubmits the exact draft. | slice 5 | |
| 13a.4 | Touch reads settings groups and returns after rotation. | slice 5 | |
| 13a.5 | Coarse Session details read without hover. | slice 5 | |
| 13a.6 | Open a session by tap; Close detaches only. | slice 5 | |
| 13a.7 | Maximize/Restore keeps fit or reading position. | slice 5 | |
| 13a.8 | Rotation keeps a selection or reading place. | slice 5 | |
| 14 | A touch step that repeats a rule a non-touch journey or boundary test owns leaves the touch journey. | slice 5 | |
| 15 | The owner is cited in the plan's surviving-proof record. | slice 2 | observed: plan Removal/Surviving proof table reconciled; step-trim project write-failure citation → `system-settings-project-management.spec.ts` |
| 16 | Measure the focused family's wall time over three consecutive passes before and after under recorded load, with the retained hosted per-test share as context. | slice 6 | |
| 16-before | Before measurement: three consecutive focused passes under recorded load (36 cases). | slice 2 | observed: `/tmp/seed-180-slice2-baseline/pass{2,3,4}.json` walls 37.551/35.696/36.279 s; metas record load before/after; revision `bf6a6c6581bc9d9fc9c677376b8b9ddd166b65a3` |
| 17 | Run the ordinary `npm run test:dashboard` once after the change as a green check only, not as speedup evidence. | slice 6 | |
| 18a | Record case counts before and after in `docs/maintainer/dashboard-test-timings.md`. | slice 6 | |
| 18b | Record focused wall times in `docs/maintainer/dashboard-test-timings.md`. | slice 6 | |
| 18c | Record surviving proof in `docs/maintainer/dashboard-test-timings.md`. | slice 6 | |
| 18d | Record comparison limits in `docs/maintainer/dashboard-test-timings.md`. | slice 6 | |
| 19 | When the family's placement rule changes, state it in `dashboard/tests/README.md`. | slice 6 | |
| 20 | No product behavior changes. | slice 2 | observed: owned change is planning-only (`.planning/slice-plans/413-resolve-dashboard-touch-viewport-candidates/PLAN.md` and `source-review.md`) |
| 21a | No retries. | slice 2 | observed: contaminated pass1 not retried as baseline; three clean passes under `env -u NO_COLOR -u FORCE_COLOR` |
| 21b | No sleeps. | slice 2 | observed: no sleep/skip/focus markers added |
| 21c | No skips. | slice 2 | observed: no sleep/skip/focus markers added |
| 21d | No focus markers. | slice 2 | observed: no sleep/skip/focus markers added |
| 22 | Every unique touch protection stays. | slice 6 | |
| 22a.1 | Native touch input and terminal fitting at reduced height. | slice 6 | |
| 22a.2 | Touch scrollback and the identity-header scroll. | slice 6 | |
| 22a.3 | Rotation keeping a draft, selection, or reading position without a re-read. | slice 6 | |
| 22a.4 | The Done-row coarse disclosure. | slice 6 | |
| 22a.5 | The 430×932 band and the held progress answer in the start-session answer row. | slice 6 | |
| 22a.6 | A live terminal surviving a settings round trip with viewport changes (which may move into its non-touch owner as one step). | slice 4 | |
| 23 | Redundancy outside the touch family is a separate story. | slice 6 | |
| 24 | Suite-wall speedup claims are out of scope. | slice 6 | |
| E1 | Plain tablet repeat: `system-settings-look` tablet goes; phone + 420 px fit survive; same rule for other plain repeats. | slice 3 | |
| E2 | Branch-bearing device: `story-review-touch` tablet portrait stays unless equivalent touch proof is named. | slice 3 | |
| E3 | Pattern owner: settings write-failure owned by non-touch; touch keeps alert/rotation delta only. | slice 5 | |
| E4 | Already owned elsewhere: `story-review-mark-touch` folds into `story-review-touch`; file goes. | slice 4 | |
| E5 | Measured outcome: before 36 cases / three walls; after fewer cases with named survivors, wall not worse, suite green once → retain; unnamed survivor stays. | slice 6 | |
| E5-before | Before: 36 cases in the family, focused wall over three passes under recorded load. | slice 2 | observed: list 36/14; three green walls recorded under `/tmp/seed-180-slice2-baseline/` |
| E6 | Unique case stays: `recently-done-sessions-sidebar-touch` unchanged. | slice 3 | |
| Q-survive | Surviving proof for each removal is named before the removal. | slice 2 | observed: Removal/Surviving proof table confirmed; none struck at `bf6a6c6581bc9d9fc9c677376b8b9ddd166b65a3` |
