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

<a id="run-the-remaining-dashboard-frontend-checks-at-doughnut-speed"></a>

### Run the story-notes frontend checks at the mounted boundary

**Identity:** SEED-404#run-the-remaining-dashboard-frontend-checks-at-doughnut-speed
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/707-run-story-notes-checks-at-the-mounted-boundary/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"30c2f392949e4f12d73eb5eb00e96f8aceb369db71995b8a58d31031db35f74d","plan":"5a9ff4a4a4175bc6c9d8e24ea8a376cd137d2eb3bbafbe3ad01287940c747c57"}}
```

Terry narrowed this story on 2026-11-18 from the whole remaining group to one
family, starting in `stories/`. Planning then found that mounted specs cannot
import the Node-side test data, so this story takes the four story-notes
specs. The whole-group minute stays this seed's ambition, and
[the other families](#run-the-other-frontend-families-at-the-mounted-boundary)
carry the rest, including the other `stories/` specs.

**Goal.** A developer running the story-notes specs gets their answer in at
most a third of today's time at the usual two-worker local budget, with every
original product assertion accounted for. The seed gains the measured cost of
real specs at the mounted boundary, and later families gain the mounted
fixture these specs need.

**Scope.** Move the cases in `stories/story-notes.spec.ts`,
`story-notes-edit.spec.ts`, `story-notes-retained.spec.ts` and
`story-notes-unreadable.spec.ts` from the built-app fixture to mounted specs
that render the production app with prepared service answers and deliver input
directly, as the phone-board checks do. Each case keeps its observations. A
case stays on the built-app fixture, or moves to `e2e/`, only where its
behavior needs a real page load, native input or a live socket; record each
such case with its reason, destination and cost. Every case starts from a
fresh mount and default service answers.

Arranged data comes from the same state builders and MakeMe data the built-app
specs use, built in Node and handed to the mounted case. The notes service
answers by one rule in both engines. The notes page object keeps one
vocabulary of phases, cues and control names. Both file and `--grep` selection
continue to work through `npm run test:dashboard:frontend`.

Set the comparison before changing anything: the four specs' whole command,
and the whole-group command, at two workers in one session on the same
machine, with the load recorded. Keep the change when the four specs' command
takes at most a third of its matched baseline and the whole-group command is
no slower. Report the summed case time and the per-file import cost beside it,
and update the refinement evidence above with the per-file figure.

Deferred: the other `stories/` specs and families, the whole-group minute,
making the test data importable in the browser, merging spec files or sharing
file isolation, and rebalancing the CI shards.

**Key examples.**

- A saved line note is edited by keyboard and saved. The mounted case shows
  the saved text, the focus returning to Edit, and the same change request
  the built-app case recorded.
- A save is refused while a draft holds typed text. The draft and the
  original note remain and the failure is announced.
- Notes are unreadable for a project. Every card kind says so in place of a
  count, and a later project read does not restore a count.
- One case ends while a notes answer is still held. The next case in the same
  file opens the board with default answers and no late update.
- A Taken note survives a new launch and appears on Done. If a fresh mount
  reads the same app-owned state, the case moves; if the proof needs the
  browser's reload, it stays where a real page exists and is recorded with
  its reason. The attached-terminal case is judged the same way for its live
  socket.
- `npm run test:dashboard:frontend -- stories/ --grep 'unreadable'` selects
  the moved case.
- Before: the four specs' command took 22.1 s at load 21. After, in a matched
  session, the same command reports all accounted cases in a third of its
  matched baseline or less.

**Architecture.** The phone-board delivery kept its own in-page page objects
and service answers. These specs must not grow a parallel copy of Dashboard
Test Support. The notes service has one answering rule that the route
substitute and the mounted answers both use, and the notes page object names
its phases, cues and controls once. No Accepted decision conflicts.
[ADR 0010](../../docs/adrs/0010-definition-of-improvement-accepted.md)
requires the comparison basis above before the observed run.

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

**Scope.** Split from the story above on 2026-11-18. Once the story-notes
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
