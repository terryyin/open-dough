---
id: SEED-255
status: active
planted: 2026-11-07
scope: story
---

# Before-and-after CI proof in Intent

## Story

<a id="compare-before-and-after-ci-proof"></a>

### Compare before-and-after CI proof in Intent

**Identity:** SEED-255#compare-before-and-after-ci-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/493-compare-before-and-after-ci-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"15b004fea6430b0c22cca3c27fae3614e041849565c9b6026f124f4a0a2e25c1","plan":"868d792161c0bd74716b4469073dd32814515e10b38acec652fa12b3bae44a27"}}
```

**Beneficiary:** A developer reviewing how a selected story changed test
counts and execution time.

**Goal:** With a done or Taken story selected, a developer can scan the
overall CI change on the Intent homepage, then find which test entries and
files account for the observed differences from cues in the entry table and
the location tree, and read every cued difference as text. This serves
judging whether a story, such as a test optimization, changed CI proof as
intended, while differences stay observations between named builds, not
attributed to the story.

**Scope:**

- **Active comparison.** Compare Baseline with Landed when the landed build
  has a proof summary, otherwise with Branch (the provisional tip for a Taken
  story, Story Branch or Trunk Mode). The homepage names the active
  comparison and both builds with their revision, run, attempt and whether
  each is exact or an ancestor, as the endpoint rows do today. The overall
  summary, entry table cues, tree cues and percentages all use this one
  comparison. The table keeps each endpoint's own measurements.
- **Overall summary** above the entry table: Baseline and active values and
  signed differences for the overall test count and the CI timing measure
  the comparison uses. The count sums the entries' counted results and keeps
  units apart (tests and checks are never added together). It says
  "partial" with the reason when an entry or part is missing at either build
  and gives no difference when neither build has a usable total.
- **Readable deltas.** Each before value, after value and difference reads
  as separate text, such as `12 → 10 tests (−2)` and `12 s → 8 s (−4 s,
  −33%)`, replacing run-together text such as `1,098 → 1,098 0 tests` and
  `13 min 27 s +8 min 28 s`. A duration difference adds a percentage only
  when the baseline is a measured non-zero duration. A measured zero, a
  missing measurement and partial proof stay distinct in words and cues.
- **Change cues**, with one meaning everywhere: the overall summary, each
  entry row, each location header whose entry has a comparison, and each
  file row in the location tree.
  - Count: a border, green for fewer, red for more, none when unchanged.
    Any count change shows; it is strong when the change is at least 50%
    of the baseline count.
  - Duration: a background tint, green for faster, red for slower. No tint
    when the change is under 10% of the baseline duration or under 1 s,
    since unchanged entries already move up to about 10% between single
    builds and second-long files move 100–300 ms (14–21%). It is strong at
    50% or more. A measured zero baseline gives no percentage and at most
    the light tint. No tint without a comparable measured duration at both
    builds.
  - An added or removed file or entry, a gap endpoint, or partial timing at
    either build takes no cue on that measure; its text explains why.
- **Text equivalents.** Every cued difference is visible as text in the
  overall summary and the entry table, and in a file's **Proof** and its
  folder's or location's summary row. Each cued tree row and location
  header also carries the same words in its accessible name. No meaning is
  only in color or only on hover.
- **Selection and focus.** A selected file or location and the keyboard
  focus stay recognizable, and distinct from both cues, whether one, both or
  neither cue applies. A distinct selection outline beside an inset count
  edge and a duration fill is the starting point; it replaces any selection
  background that would hide the tint.
- **Required restriction:** no cues and no comparison wording without a
  selected story with a comparison. Cues compare observed builds only,
  because [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
  separates observed proof results from expected behavior.

**Deferred promises:**

- A control to switch the active comparison between Branch and Landed.
- Cues on folder rows in the tree; folders keep their summary rows.
- A ranked list of the largest contributors.
- Which build or timing measure each endpoint supplies stays with its own
  stories: ancestor proof for skipped builds is
  [SEED-254](SEED-254-use-ancestor-ci-proof-for-skipped-builds.md#use-ancestor-ci-proof-for-skipped-builds),
  and timing without runner waits is
  [SEED-256](SEED-256-compare-ci-time-without-runner-waits.md#compare-ci-time-without-runner-waits).
  This story shows whatever build and overall timing measure the comparison
  supplies. Until SEED-256 lands, that measure is CI wall time.

**Key examples:**

- A done story's landed build has proof. An entry drops from 12 to 10 tests
  and its time from 8 s to 12 s. The summary names Baseline and Landed. The
  entry row and its location header show a light green border (a 17%
  change), a strong red tint (a 50% change), and `12 → 10 tests (−2)` with
  `8 s → 12 s (+4 s, +50%)`. The cues stay visible and the selection
  remains distinct when the location is selected or focused.
- A done story's landed build was cancelled and the branch build has proof.
  The summary says the comparison is Baseline with Branch and why Landed is
  not used. The cues follow Branch.
- A file keeps 6 tests and runs 25% faster. Its tree row has no border and
  a light green tint. Its accessible name and its **Proof** say `6 tests
  (no change)` and `4 s → 3 s (−1 s, −25%)`.
- A file runs 7% slower with the same count. Its text shows the difference
  and it has no cue.
- A file has no duration at Baseline because its part had none. Its timing
  text says why no comparison is available, and it has no tint.
- Entries with 1,098 and 982 tests and one with 492 checks give an overall
  `2,080 tests and 492 checks`, never one mixed number.

**UI:** The homepage reads top-down: active comparison and its two builds,
the overall summary, then the entry table. The tree shows the same cues on
file rows and location headers, so a developer can find a cued file in the
tree and confirm its numbers in **Proof**. Location and folder summaries
show the cues on their child rows as the homepage table does.

**Architecture:** Classify each scope's count and duration change once,
from Intent's existing single evidence owner and comparison-endpoint read.
The classification gives direction, strength, or no-cue with a reason, and
the summary, table, tree, location headers and **Proof** all consume it.
The tree gains no CI read of its own. This keeps cue meanings consistent and
keeps the existing rule that drilling and selection ask CI nothing again.

Build on the [existing Intent proof views](../../docs/dashboard-development-intent.md),
whose homepage comparison already shows each endpoint's build and per-entry
signed differences without colors, percentages or an overall test count,
and on the
[Dashboard UX/UI North Star](../../docs/dashboard-ux-ui-north-star.md)
rule that text carries every status shown by color.
