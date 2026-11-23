# Slice 8 recorded launch details and whole selection checkpoint

The three focused browser cases and dashboard typecheck passed. The exact whole selection passed twice at **14.20 and 14.71 seconds**, including runner preparation. That leaves **6.20 and 6.71 seconds above the eight-second target**. The plan calls for a maintainer checkpoint here. The elapsed commitment remains open.

The sole owned tracked edit is `dashboard/frontend-tests/launches/launch-record-details.spec.ts` on `d45528326928e1cc02319ad82cefbbbe53bea0cd`. [Candidate patch](candidate.diff). The [shared failure policy](/Users/terryyin/git/open-dough/.worktrees/get-launch-unit-proof-in-about-eight-seconds/Distribution/src/skills/dough-execute-plan/references/failure-policy.md) applies to all proof and any repair handoff.

## Record wording, placement and disclosure

| Commitment | Observing assertion |
| --- | --- |
| 22 | “refinement entries show exactly the model and options that each launch requested” exercises all four independent option/model combinations on `SessionEntry`. The two Opus records show exact `Model: Opus (requested)` above the disclosure. The other two omit the model element. “execution and ad hoc entries show the requested model and disclose effort only when recorded” observes exact Opus on the execution entry, omission on the default execution entry and exact Sonnet on the named ad hoc entry. |
| 23 | “the Board lists each launch with its own story or in Taken, and the sidebar names its own requested model” opens the real PageFrame sidebar. Buttons are located by the exact story or ad hoc title. The explicit execution tooltip includes exact `Open Dough · Execution` and `Model: Opus (requested)` lines. The default execution tooltip includes the same workflow line and has no `Model:` line. The ad hoc tooltip includes exact `Open Dough · Ad hoc` and `Model: Sonnet (requested)`. The six open records have exactly six sidebar items. |
| 24 | The direct execution/ad hoc case opens each relevant entry's disclosure. The maximum-effort session ID and exact `Effort: max (requested)` become visible on that entry. The default session ID becomes visible and its entry contains no effort element. |
| 25 | The direct refinement case opens the disclosure and observes each exact visible session ID. Two records show `Options: --explore --borrow (requested)` and two omit options, independently of the recorded model. The first entry proves the session ID is hidden before native Enter and visible afterward, with the actual control reporting `aria-expanded=true`. The other entries exercise the same production control through direct browser activation. |

The Board case mounts the production `Board` under the existing typed `mountBoard` and its actual `PageFrame`. It checks one session per named story and exact workflow accessible names. It checks the rendered identity against the typed session for two different refinement stories and three execution stories, as well as the ad hoc entry specifically under Taken. The Recently done region exists and has zero articles. Two stories of the same workflow distinguish a story-key association from a workflow-key association. The refinement choices are independently varied in the direct record case because the production Board association uses the story identity and does not branch on model or options. Board session IDs use the rendered details text as an association cue. The direct cases keep the separate checks for disclosure and visibility.

Typed MakeMe records and `aMachineAnswer.observingOpen` supply only the machine's starting observation. The direct cases use the real `SessionEntry`, its real `SessionDetails` and `launchSubject`, a typed `SessionsOnPage` fixture and the required Projects context with an empty list for records without an assignment. They use the standard viewport. The Board uses the existing typed mount with the standard viewport dimensions and actual Board/Sidebar logic. The previous spec's two ConfiguredDashboard mounts are retired from this file. That shared test support remains in use by the navigation cases. Every changed operation is local to this spec. No production read, service substitute, private pipeline call, runner setting or shared helper was introduced. One native Enter remains. The other detail activations and Sidebar open only prepare the observations.

## Focused experiment

The earlier launch action profile measured four refinement keyboard calls at 456 ms and a Sidebar click at 522.5 ms in the execution case. It also measured the two execution disclosure keyboard calls at 115 ms. The candidate moved the label matrix onto direct typed entry mounts, reduced the full Board to one association and sidebar setup, and retained native input on the disclosure observation. Profile source is [the original action log](../launch-phases/run.log).

| Scoped comparison | Cases | Summed case bodies | Shell wall | One-minute host load |
| --- | ---: | ---: | ---: | --- |
| Accepted slice 7 HEAD | 2 | 722 ms | 2.62 s | 4.80 → 5.06 |
| First candidate with full Board roster and former frame mount | 3 | 647 ms | 6.18 s | 6.92 → 7.24 |
| Final candidate with typed Board mount | 3 | 184 ms | 2.22 s | 5.65 → 5.65 |

The first candidate paired poorly on elapsed time and duplicated all eight records in its composed view. The retained candidate uses six Board records and the existing typed `mountBoard`. Its first focused attempt discovered that the unused project builder required configuration. Passing the valid, empty configured-project list removes that redundant setup for the direct record cases. The final focused run passed. The two full-selection runs also passed these three cases, whose bodies totaled 117 and 138 ms compared with 535 and 621 ms for the starting two cases. The focused wall gain is 0.40 s. Case duration shows the larger reduction independently of startup variability.

The literal focused timed command was `/usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches/launch-record-details.spec.ts --workers=2`. The proof-path environment and exact argv are in [focused baseline run](focused-before.log.run.json), [initial candidate run](focused-candidate-first.log.run.json), [failed intermediate run](focused-candidate.log.run.json), and [passing focused run](focused-final.log.run.json). The [typecheck](typecheck.log.run.json) ran `npm run typecheck:dashboard` and exited 0. The direct TypeScript project includes dashboard frontend tests.

## Whole comparison

The timed selection was precisely:

```sh
/usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- dashboard/frontend-tests/launches --workers=2
```

[pair.sh](pair.sh) sets a unique `OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD`, enters the selected checkout, and executes the command through the installed slice clock. The receipt command records the coordinator checkout's HEAD even when the shell enters the detached baseline. The actual timed checkout, Git revision and pristine or dirty state are independently recorded in each host log. The detached baseline was clean at `9fe334ce9faba806b8417bc8be9ab4f60893534e`. The candidate was `d45528326928e1cc02319ad82cefbbbe53bea0cd` with the owned slice 8 spec. It includes slices 1–7 and the intervening default viewport and unrelated Distribution shard repairs. No timing flags or selection alterations were applied.

All runs used native arm64 macOS 26.6.2, 16 logical CPUs, AC power, Node 24.21.0, npm 11.19.0, Vitest 5.1.0, Playwright 1.65.0 and installed Chromium revision 1254. Both checkouts had the same package lock, installed dependency bytes and browser cache. The baseline used an APFS clone of installed dependencies in a new detached checkout. Its different pathname had no prior transforms keyed to that path, while the candidate was warm. The second and last pair reverses order and uses both warmed checkouts to test first-use and order effects. Outside host activity varied. There was no concurrent proof owned by this execution.

| Order | Side | Shell real | Vitest duration | Cases | Chromium / Chromium Desktop | 1-min load start → end |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| A, first | Starting | 22.93 s | 21.65 s | 71 | 62 / 9 | 5.52 → 6.47 |
| A, second | Candidate | 14.20 s | 13.49 s | 77 | 67 / 10 | 6.47 → 5.86 |
| B, first | Candidate | 14.71 s | 13.91 s | 77 | 67 / 10 | 5.92 → 7.06 |
| B, second | Starting | 21.00 s | 20.27 s | 71 | 62 / 9 | 7.06 → 7.58 |

Paired elapsed savings were **8.73 seconds (38.1%)** and **6.29 seconds (30.0%)**. The candidate's two runs both leave over six seconds to the target. The four runs selected 24 files apiece, passed at exit 0 and had identical within-version rosters. The [full roster](whole-roster.tsv) retains project, spec, line, exact title and case duration for each run. The [whole-case dispositions](whole-case-dispositions.tsv) map all 71 original titles into the 77 candidate paths and account for all destinations. Sixty exact title/project/file triples remain. Eleven titles were replaced or split. The waiting-notes reader split also has a retained composed origin. [Exact title diff](whole-roster-title-diff.txt).

Both browser projects are Vitest mounted Chromium. The desktop project continues to own the two original fine-pointer specs. The legacy frontend Playwright selection for launches is empty on both revisions. Separate [before](legacy-before-list.log.run.json) and [after](legacy-after-list.log.run.json) legacy listings exited successfully. The existing runner's [typed selection check](explicit-engine-selection.log) independently found 24 Vitest files and zero legacy files before and after. This story promoted zero cases to E2E. Previously existing release, install, native, backend and E2E checks keep their prior sources and runners. The creation-entry case “an unresolved creation names its stand-in host and displays the supplied inspection arguments” passed every run in the Chromium project.

| Evidence | Clock receipt | Runner proof | Host |
| --- | --- | --- | --- |
| Starting A | [run](whole-before-a.log.run.json) | [strict record](whole-before-a.json), [log](whole-before-a.log) | [host](whole-before-a.host) |
| Candidate A | [run](whole-after-a.log.run.json) | [strict record](whole-after-a.json), [log](whole-after-a.log) | [host](whole-after-a.host) |
| Candidate B | [run](whole-after-b.log.run.json) | [strict record](whole-after-b.json), [log](whole-after-b.log) | [host](whole-after-b.host) |
| Starting B | [run](whole-before-b.log.run.json) | [strict record](whole-before-b.json), [log](whole-before-b.log) | [host](whole-before-b.host) |

### Remaining elapsed cost

| Remaining case | Candidate A | Candidate B |
| --- | ---: | ---: |
| Desktop noted starts on hover, focus and in the dialog | 1.472 s | 1.222 s |
| Refused refinement choices clear on Cancel | 1.056 s | 1.287 s |
| Desktop narrow/zoomed Starts keyboard focus | 1.003 s | 0.766 s |
| Start session automatic landing at narrow/zoomed sizes | 0.951 s | 1.056 s |
| Dense refinement reachability at narrow/zoomed sizes | 0.902 s | 0.576 s |
| No Approach clears A, keeps C and submits only C | 0.863 s | 0.997 s |
| Held transcription and late reply after Cancel/Escape | 0.653 s | 0.851 s |

The complete timings are in the roster. No fresh action-level profiling was performed in this pair. Existing profiling and the sources identify native hover, focus and dialog actions for desktop discovery, refusal/cancel lifecycle, and real narrow/zoomed viewport transitions and geometry. Those are distinct maintained observations. Across the two candidate runs, the 77 case bodies summed to 22.536 and 22.852 seconds. Even with perfect two-worker packing and zero startup, those bodies correspond to 11.268 and 11.426 seconds. Reaching eight seconds at two workers would require at least 6.536 and 6.852 fewer aggregate case-seconds even before allowing for runner preparation and imbalance. The record-details file accounts for only 0.117 and 0.138 case-seconds in the candidate. Its remaining work cannot close the gap. The measured checkpoint invalidates the idea that another small removal of recorded-details setup could reach the agreed target. Further experiments require the maintainer's decision under slice 8.

## Consumer trace and remaining promises

[Raw discovery](consumer-trace.txt) and [consumer dispositions](consumer-dispositions.tsv) retain the literal search terms and the inspected purposes. The actual case reads the final `launchSubject` output through `SessionEntry`, `SessionDetails` and `SessionsSidebarSessionEntry`, and detects Board story association through the real column and story lookup. The changed controls and locators are private to this spec. The previous ConfiguredDashboard helper remains intact for its other consumers. Generic, historical and existing journey matches do not depend on this test-local arrangement.

The aggregate case roster and the timing table close slice-specific evidence for the comparison, exact engines, destinations, remaining slow cases and retained creation entry. Earlier slice reports retain the separately needed existing E2E and viewport compatibility evidence. The suite still misses commitment 82. No claim of achieved 7–8 second feedback or finished story is made.
