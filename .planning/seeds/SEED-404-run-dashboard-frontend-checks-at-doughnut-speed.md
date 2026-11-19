---
id: SEED-404
status: active
planted: 2026-11-18
planted_during: Terry asked to queue Dashboard Frontend Test at Doughnut's speed, using Doughnut's long-lived browser
trigger_when: selected from the backlog
scope: three stories
---

# SEED-404 — Dashboard Frontend Test runs at Doughnut's speed

A developer currently waits about 29 minutes for a local two-worker frontend
run at the story baseline. Doughnut reported 2,573 frontend cases in 65 seconds.
The seven phone-board journeys were the first delivery. On the same machine,
the old Playwright and mounted Vitest versions spent 23.4 s and 24.5 s in the
seven case bodies respectively. Native input acknowledgements and repeated
layout checks dominated both. Six Doughnut drag-rule cases took 1.5 ms in
Chromium, and three Doughnut phone layout journeys took 5.0 s total.

[CI run 44267762058, attempt 1](https://github.com/terryyin/open-dough/actions/runs/44267762058)
passed 692 cases across 291 files. The two parallel frontend test steps took
200 s and 197 s. The 1,427.141 s summed across cases measure a different cost.
At preparation revision `b6a759be6`, discovery again found 692 cases in 291 files.

| Files grouped by the fixture they use | Files | CI cases | Summed case-seconds |
| --- | ---: | ---: | ---: |
| Built-app fixture | 247 | 564 | 1,353.3 |
| Live comparison mount | 20 | 32 | 31.3 |
| Comparison markup renderer | 20 | 84 | 36.1 |
| Other | 4 | 12 | 6.5 |

### Refinement evidence, 2026-11-18

[CI run 44329675867, attempt 1](https://github.com/terryyin/open-dough/actions/runs/44329675867)
at `ade2447a1`, after the phone-board delivery, passed 715 cases in 296 files.
The two frontend test steps took 243 s and 203 s, and the cases summed to
1,582 s. The seven mounted phone-board cases summed to 1.05 s, about 0.15 s a
case. The other 708 cases average 2.2 s.

| Folder | Files | Cases | Summed case-seconds | Seconds per case |
| --- | ---: | ---: | ---: | ---: |
| `navigation/` | 45 | 111 | 358 | 3.2 |
| `intent/` | 72 | 126 | 336 | 2.7 |
| `sessions/` | 41 | 87 | 203 | 2.3 |
| top level | 45 | 101 | 188 | 1.9 |
| `launches/` | 26 | 77 | 163 | 2.1 |
| `review/` | 21 | 47 | 127 | 2.7 |
| `stories/` | 12 | 28 | 66 | 2.4 |
| `terminals/` | 5 | 23 | 50 | 2.2 |
| `configuration/` | 7 | 15 | 42 | 2.8 |

Local observations at this revision, two workers, on a 16-core machine at load
7 to 14, so compare them with each other and not with CI:

- `stories/` through Playwright: 28 cases in 39.6 s.
- `stories/` and `sessions/` with tracing: 115 cases in 1.7 min, 1.6 s a case.
  Native clicks took 138 ms each at 3.1 a case, about a quarter of the case.
  New page, opening the dashboard and hooks took about 300 ms a case, about a
  fifth. Assertions took 14 ms each at 17 a case. Startup alone is not the
  dominant cost: input delivery and assertion round trips cost more.
- Mounted Vitest: the two phone-board files run in 5.5 s as a whole command.
  With 20 scratch copies of the two-case file added, 22 files and 47 cases ran
  in 11.1 s, about 0.8 worker-seconds a file. Import was 47% of that and the
  cases 40%.

One minute at two workers is 120 worker-seconds, 0.17 s a case at today's
count. A case kept on the built-app fixture spends about 2 s of that budget.
Extrapolating the mounted probe to 296 files gives about two minutes, because
each small file pays its own import. Reaching one minute therefore needs
nearly every case at the mounted, direct-event boundary and a lower per-file
cost, through fewer larger files or shared file isolation. The per-file figure
comes from copies of one small spec; measure it on a real family before
relying on it.

Measured on the real family, 2026-11-19, at `e3398ed26`, two workers, load
5.1 to 6.0: the five mounted story-notes files (10 cases) ran in 5.0 to
6.6 s of Vitest time and 9.1 to 11.7 worker-seconds, about 1.8 to 2.3
worker-seconds a file. Import was 14 to 17%, about 0.3 worker-seconds a file;
the cases were 77 to 81%, 0.5 to 1.5 s each under `actSettled`. The
`stories/story-notes` command took 8.9 and 10.8 s against 13.5 and 10.4 s at
`e8e01643a` in alternating runs, with one built-app case and Playwright
startup still in it.

Mounted specs run in the browser, and the data the built-app specs arrange
runs in Node. Importing `makeMe.mjs` in a mounted spec failed on `node:fs`;
importing `frontendServiceState.ts` failed inside `@playwright/test`. Eight of
MakeMe's 110 modules and 117 of the service state's 403 import Node modules.
A mounted case therefore receives arranged data from a Node-side command, as
the phone-board cases do. On the mounted phone board, Vitest's role locators
with direct clicks opened Story notes and its composer and observed both in
82 ms.

The phone-board delivery wrote its own in-page page objects and service
answers, 581 lines for seven cases. The built-app specs use Playwright page
objects and route substitutes across Dashboard Test Support. Moving a family
duplicates the part of that surface the family uses unless both engines share
it.

### Architecture and alternatives

Playwright supplies Chromium to both test runners. The phone-board profile
supports choosing the cheapest faithful boundary for each behavior. Direct
event delivery exercises app-owned gesture handling. Real layout, actual
navigation, native hit testing and integrated services remain in the tests
that need those boundaries. Measure test bodies and command elapsed time
separately. [Doughnut configuration](https://github.com/nerds-odd-e/doughnut/blob/a23441f741486ea5bde7e892038ba33b408d78a4/frontend/vitest.config.ts),
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
and [ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)

<a id="run-the-story-notes-checks-in-a-third-of-their-time"></a>

### Run the Story Notes checks in half their time

**Identity:** SEED-404#run-the-story-notes-checks-in-a-third-of-their-time
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/713-run-the-story-notes-checks-in-a-third-of-their-time/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"607ab853a94d30357e882f741d5b22ec1a1cd24bc97b4b955e267e6b03459e41","plan":"ba92100958defe0e643185646a58bd83a40f188ec260f356f5de35511d75d1ab"}}
```

Split on 2026-11-19 from the story-notes story, whose matched comparison
measured 0.83 of the baseline instead of a third. Rescoped on 2026-11-19 to
the gain preparation reproduced: about half. Terry accepted that result and
moved further optimization to the
[100 ms follow-up](SEED-407-run-the-story-notes-checks-at-about-100-ms-per-case.md#run-the-story-notes-checks-at-about-100-ms-per-case).

**Goal.** A developer running the story-notes specs gets their answer in at
most half of the matched `e8e01643a` baseline at the usual two-worker local
budget, with every original product assertion kept, and later mounted
families inherit the cheaper settling.

**Scope.** Move the attached-terminal case from the built-app fixture onto
the mounted board, answering its socket through the existing
`installAttachedTerminalSubstitute` and `directedApplication`, so the command
runs all eleven cases in mounted Chromium without the Playwright phase.
Finish a dialog close on that dialog's native `close` event observed inside
`act`, and keep `actSettled`'s task and frame rounds where timer advances,
released reads and layout callbacks can still update the page. Keep the
hold-and-settle behaviors: the unreachable revision stream, held-answer
cleanup and `UnsettledPageError`. Compare in matched alternating runs
against `e8e01643a`. Deferred to the 100 ms follow-up: one third, a smaller
production mount for the edit cases, native config loading and dependency
preoptimization. Deferred to the rollout story: the other families and the
whole-group minute.

**Key examples.**

- The edit case's keyboard save still shows the saved text, returns focus to
  Edit and records the same change request.
- A run of the mounted story-notes specs prints no "not wrapped in act" line,
  and reopening Story notes after a project read still opens the dialog.
- Story notes opens beside an attached terminal on the mounted board, and the
  terminal stays connected and shows output printed while notes was open.
- Before: 10.12 and 10.49 s for the baseline revision in the low-load matched
  pairs on 2026-11-19. After, in a matched session at comparable load, each
  run takes at most half of its paired baseline, as the scratch combination's
  4.44 and 4.96 s did.

#### What the focused command can save

On 2026-11-19, preparation compared the original eleven cases at `e8e01643a`
with scratch variants of `f731dab6c`. Each A–B–B–A comparison timed
`npm run test:dashboard:frontend -- stories/story-notes` from invocation
through exit, with the default two workers, separate fresh processes, installed
dependencies and warmed caches on the same 16-core Mac, Node 24.21.0, on AC.
The proof records contain the same eleven passing case titles on both sides
of each pair below. The scratch edits were reverted and all eleven passed
again on the original preparation checkout.

| Scratch variant | Original → variant, seconds | Fraction of original | Natural load |
| --- | --- | --- | --- |
| Reuse the routed socket in the mount and await the dialog close event inside `act` | 10.12 → 4.44 and 10.49 → 4.96 | 0.44 and 0.47 | 6.4–7.1 |
| Same mechanism, cases grouped into two isolated files | 22.76 → 13.11 and 27.84 → 12.88 | 0.58 and 0.46 | 13.5–24.3 |
| Same mechanism, six files importing an app bundle built inside each invocation | 11.16 → 4.96 and 12.26 → 5.59 | 0.44 and 0.46 | 11.2–15.6 |
| Mounted socket and acknowledged close, with native config loading on Node 24.21 | 17.84 → 9.79 and 22.91 → 11.64 | 0.55 and 0.51 | 13.0–16.3 |
| Same native-loader candidate, with React, React DOM and the xterm dependencies explicitly preoptimized as in Doughnut | 30.88 → 14.95 and 24.54 → 12.04 | 0.48 and 0.49 | 21.6–24.5 |

Compare each variant with its paired original. The native-loader experiments
used Node's experimental type transform. All eight timed runs in those two
comparisons passed the same eleven titles with no act warning. Each comparison
ran under a different load. One separate original run failed at
`page.clock.pauseAt(new Date())` with “Cannot fast-forward to the past” and
supplied no timing comparison. CI run 44427115222, attempt 1 at `0ee137add`,
covered both frontend shards (723 cases, 306 files). Story notes ran on shard
2. CI records summed case durations. The timing promise applies to the local
command. [CI run](https://github.com/terryyin/open-dough/actions/runs/44427115222)

#### Architecture

The mounted Vitest command receives the provider's Playwright page in Node.
In the scratch case, the existing `installAttachedTerminalSubstitute` and
`directedApplication` drove the mounted production terminal. Opening notes
by keyboard, printing while open and closing preserved both lines of output,
the original connected screen, one attachment and focus on Notes. The
fixture can own the case's attachment while the product owns xterm and the
WebSocket client. [Terminal substitute](../../dashboard/test-support/support/frontendTerminalSubstitute.ts)
and [ADR 0008, Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)

The borrowed mechanism is a delivery acknowledgement. Closing a dialog
queues a native event. Its disappearance from a role query can precede
React's close handler, which clears the open state and restores focus.
Registering for that dialog's `close` before clicking and observing it
inside `act` made the next open reliable in the observed runs. That event
acknowledges only the close. Timer advances, released answers and layout
callbacks still need their own settling. Simply substituting task turns
for frames produced an act warning on a green run. Keeping frames for
mounts and project reads but skipping them for controls also reproduced
the missing dialog on the second open of the refresh case.
[Dialog](../../dashboard/src/StoryNotesDialog.tsx) and [control](../../dashboard/src/StoryNotesControl.tsx)

The first variant passed four consecutive family runs without an act warning.
Even then it needed another 1.06 and 1.46 seconds in the matched pairs to
meet one third. Skipping title discovery gave inconsistent results. A
faster case body, a terminal check left out of the selection, or a timing
starting after browser launch cannot establish the promised gain.
The hold-and-settle correction, delivered on 2026-11-19 at `2fdb91207`,
answers the revision stream as unreachable, abandons a held notes answer at
cleanup and fails a page still changing after 20 settle rounds with
`UnsettledPageError`. Its `actSettled` repeats task rounds while the page
changes and ends after a frame round that changes nothing. Any cheaper
settling keeps those three behaviors.
[Mounted dashboard support](../../dashboard/frontend-tests/README.md#mounted-dashboard-support)
and [ADR 0010, Definition of improvement](../../docs/adrs/0010-definition-of-improvement-accepted.md)

After that correction, at `62bc35557` on 2026-11-19, two A–B–B–A rounds
compared the original at `e8e01643a` with trunk under load 25 to 32. Trunk
took 25.1, 37.6, 26.8 and 14.5 s, the original 31.5 and 15.2 s in its
complete runs. Comparable pairs gave about 0.80 and 0.95. Two original runs
failed with “Cannot fast-forward to the past”. Trunk passed all eleven cases
in every run with no act warning. In its fastest run, Vitest took 8.3 s for
ten mounted cases, 30% import, and the built-app terminal case still ran.
The correction left the gap to one third open.

**Decision.** Accept half as this story's threshold. The mounted socket
and close-event combination reproduced 0.44 and 0.47 at low load. One third
and the experiments that might reach it moved to the
[100 ms follow-up](SEED-407-run-the-story-notes-checks-at-about-100-ms-per-case.md#run-the-story-notes-checks-at-about-100-ms-per-case),
which targets about 1.1 s for today's eleven cases.

<a id="run-the-other-frontend-families-at-the-mounted-boundary"></a>

### Run the other frontend families at the mounted boundary

**Identity:** SEED-404#run-the-other-frontend-families-at-the-mounted-boundary
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-404#run-the-other-frontend-families-at-the-mounted-boundary","dependencies":[{"supplier":{"identity":"SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed","href":"seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed"},"implementation":"The mounted fixture that renders the production app with prepared service answers for ordinary built-app families, and the measured per-file cost of a real family.","rationale":"Each later family is split and sized from that measured cost and mounts through that fixture; starting one earlier would build a competing fixture and size it from a scratch probe.","condition":"The story-notes specs run at the mounted boundary on trunk and the seed records its measured per-file cost.","state":"satisfied","resolution":{"revision":"7df4ade39b5f415c379f12615957ec779f6d93a5","path":".planning/seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed","summary":"Verified on main at 0ee137add: ten of the eleven story-notes cases run as stories/story-notes-*.mounted.spec.ts on the mounted support in dashboard/test-support/mounted-dashboard/ (mountAnsweredDashboard, Node arrangement commands, shared engine-free notes and review rules); the attached-terminal case stays on the built app for its live socket, recorded with its cost. The seed's refinement evidence records the real-spec per-file cost dated 2026-11-19 (import about 0.31-0.33 worker-s, whole file 1.8-2.3 worker-s). The fixture and the figure the condition names are both on trunk.\nCondition satisfied: The story-notes specs run at the mounted boundary on trunk and the seed records its measured per-file cost.\nAccepted integration: 0ee137addaa2393b17159f5bb455ed1dcbfd126e on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A developer running the complete frontend group gets its answer in
roughly a minute at the usual two-worker local budget, including setup, with
the original product assertions accounted for.

**Scope.** Split from the story-notes story on 2026-11-18. Now that the story-notes
specs have delivered the mounted fixture and its measured per-file cost, split
this story by family in the order of removable cost in the refinement evidence
table, starting with the other `stories/` specs. Each mounted case needs a literal title: the runner selects by the titles
Vitest reads without running the file, so a looped or `test.each` title
cannot be listed or selected. Decide then whether the test
data should become importable in the browser, and whether one minute needs
fewer larger spec files or shared file isolation. Retain representative end-to-end coverage for actual
navigation, native interactions the product depends on, and service
integration, and account for the cost and destination of any case moved
elsewhere. For example, opening, reloading and traversing an encoded story URL
must exercise real browser history, and comparison retry should still disable
the button while its read is held and recover the Landed endpoints.
[Story URL journeys](../../dashboard/frontend-tests/navigation/story-url-destination.spec.ts)
and [comparison retry](../../dashboard/frontend-tests/intent/intent-ci-comparison-mounted-retry.spec.ts)
