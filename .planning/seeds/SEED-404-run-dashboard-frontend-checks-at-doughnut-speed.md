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

<a id="hold-and-settle-mounted-frontend-cases-by-one-rule"></a>

### Hold and settle mounted frontend cases by one rule

**Identity:** SEED-404#hold-and-settle-mounted-frontend-cases-by-one-rule
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/711-hold-and-settle-mounted-frontend-cases/PLAN.md"}
```

Correction from the execution retrospective of
the story-notes story (`7df4ade39b5f415c379f12615957ec779f6d93a5:.planning/seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md`, section `run-the-remaining-dashboard-frontend-checks-at-doughnut-speed`),
2026-11-19.

**Goal.** A developer writing a mounted frontend case can rely on the mounted
support's held answers, settling and remounting to behave as its isolation case
and README say, so a held answer cannot leak into the next case and an
unsettled page fails by name instead of being read outside act.

**Scope.** Test support under `dashboard/test-support/mounted-dashboard/`, its
isolation spec and the mounted support section of
`dashboard/frontend-tests/README.md`. The story-notes cases keep every
observation; product code is unchanged. [Plan](../slice-plans/711-hold-and-settle-mounted-frontend-cases/PLAN.md)

<a id="run-the-story-notes-checks-in-a-third-of-their-time"></a>

### Run the story-notes checks in a third of their time

**Identity:** SEED-404#run-the-story-notes-checks-in-a-third-of-their-time
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

Split on 2026-11-19 from the story-notes story, whose matched comparison
measured 0.83 of the baseline instead of a third.

**Goal.** A developer running the story-notes specs gets their answer in at
most a third of the 2026-11-19 matched baseline at the usual two-worker local
budget, with every original product assertion kept, and later mounted
families inherit the cheaper settling.

**Scope.** In a 10.8 s run of `npm run test:dashboard:frontend --
stories/story-notes`, runner start took 1.2 s, the Playwright phase 2.7 s
(startup and the attached-terminal case) and the mounted phase 6.6 s; mounted
cases took 0.5–1.5 s each, against about 0.15 s for the phone-board cases,
and import about 0.3 worker-s per file. Most mounted time goes to
`actSettled` in `dashboard/test-support/mounted-dashboard/mountedActInput.ts`,
which waits for frames and tasks inside act after every input so no update
escapes act. Make settling cheaper without bringing back React's "not wrapped
in act" warnings or the reopened Story notes dialog that skipped `showModal`.
Take the Playwright phase out of the command by answering the attached
terminal's socket in the mounted board through the engine-free
`TerminalApplication` rule, or record why the case stays with its cost.
Compare in matched alternating runs against `e8e01643a`, as the story-notes
story did. Deferred: the other families and the whole-group minute.

**Key examples.**

- The edit case's keyboard save still shows the saved text, returns focus to
  Edit and records the same change request, in a fraction of today's 1.0 s.
- A run of the mounted story-notes specs prints no "not wrapped in act" line,
  and reopening Story notes after a project read still opens the dialog.
- Story notes opens beside an attached terminal on the mounted board, and the
  terminal stays connected and shows output printed while notes was open.
- Before: 10.4 and 13.5 s for the baseline revision in matched runs on
  2026-11-19. After, in a matched session, the command takes a third of its
  baseline or less.

<a id="run-the-other-frontend-families-at-the-mounted-boundary"></a>

### Run the other frontend families at the mounted boundary

**Identity:** SEED-404#run-the-other-frontend-families-at-the-mounted-boundary
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-404#run-the-other-frontend-families-at-the-mounted-boundary","dependencies":[{"supplier":{"identity":"SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed","href":"seeds/SEED-404-run-dashboard-frontend-checks-at-doughnut-speed.md#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed"},"implementation":"The mounted fixture that renders the production app with prepared service answers for ordinary built-app families, and the measured per-file cost of a real family.","rationale":"Each later family is split and sized from that measured cost and mounts through that fixture; starting one earlier would build a competing fixture and size it from a scratch probe.","condition":"The story-notes specs run at the mounted boundary on trunk and the seed records its measured per-file cost.","state":"waiting"}]}
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
table, starting with the other `stories/` specs. Decide then whether the test
data should become importable in the browser, and whether one minute needs
fewer larger spec files or shared file isolation. Retain representative end-to-end coverage for actual
navigation, native interactions the product depends on, and service
integration, and account for the cost and destination of any case moved
elsewhere. For example, opening, reloading and traversing an encoded story URL
must exercise real browser history, and comparison retry should still disable
the button while its read is held and recover the Landed endpoints.
[Story URL journeys](../../dashboard/frontend-tests/navigation/story-url-destination.spec.ts)
and [comparison retry](../../dashboard/frontend-tests/intent/intent-ci-comparison-mounted-retry.spec.ts)
