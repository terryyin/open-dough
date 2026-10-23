# Plan 350: Check completed work before allocating a new story identity

**Identity:** SEED-148#allocate-unused-story-identities

## Source

[Check completed work before allocating a new story identity](../../seeds/SEED-148-unused-story-identities.md#allocate-unused-story-identities)
in SEED-148, queued by Terry on 2026-10-23 after the Donut collision on
`SEED-075#story-1` recorded in that seed. Refined and planned in this
preparation on 2026-10-23.

## Goal and scope

A developer or agent creating a story chooses an identity no active or
completed work has used, from evidence that outlives seed cleanup, and the two
backlog operations that publish a new claim refuse an identity a done record
names. The story's Scope and key examples are authoritative.

**Included:** the allocation rule in the shared identity contract and its
references from seed creation, admitted-work story drafting, and the internal
triage skill's seed creation; one read-only `product-backlog.mjs` operation
reporting allocation evidence (active seeds, done records and catalog,
published trunk history of the seed and done directories, and a supplied
candidate's status); completed-identity refusals in `add` and the startup
admission; product-backlog skill and usage text for the operation and the
refusals.

**Exclusions:** changing `complete`'s replace-on-repeat behaviour; any
registry, lock, reservation, or state file; renumbering existing stories or
deciding between already published conflicting identities; checks on Take,
resume, Preparing assignment, or relocation; a release or installed-client
update (projects receive this through an ordinary release).

**Assumptions:** The change lives in `src/skills/dough-product-backlog/`,
`src/skills/dough-execute-plan/`, and `src/skills/dough-story-decomposition/`
(released payload) plus the internal
`.agents/skills/triage-retrospective-findings/SKILL.md`; installed copies under
`.agents/skills/` and `.claude/skills/` are not hand-synchronized (AGENTS.md).
Done records keep their 30-day window; published Git history is the durable
source beyond it.

## Existing solution (PFE)

- **Completed-work evidence** is already owned by the product-backlog scripts:
  `product-backlog-done-record.mjs` (file naming, `parseDoneRecordFile`,
  `isWithinDoneWindow`) and `product-backlog-done-catalog.mjs`
  (`catalogDoneRecords`, `parseDoneCatalog`, `doneCatalogMismatch`), with
  `doneDirectoryBeside(file)` in `product-backlog-git-done-catalog.mjs`
  locating `done/` beside a backlog. The admission path already imports that
  module (`history-preserving-candidate.mjs`). Reuse these readers; add no
  second parser of `done/`.
- **Identity gates**: `requireUnlistedWork`/`requireNamedHome` in
  `product-backlog-add.mjs` guard `add`; `readAdmissionSource` in
  `execution-admission-source.mjs` guards `--admit`, reading the backlog from
  fetched trunk through `show(repository, remoteRef, path)` and reusing
  `requireUnlistedHome`. The completed-identity check becomes one shared
  function beside the done-record readers, called from both gates, with the
  file source abstracted (working-tree directory for `add`; fetched trunk
  revision for admission) because admission must not trust the originating
  checkout's `done/`.
- **Git access** inside the backlog scripts: `git`, `gitLine`, `gitOutcome`,
  `repositoryRoot` in `product-backlog-git-repository.mjs`. History reading
  joins this module's consumers; no new Git wrapper.
- **Analogous allocation prose** exists for plan numbers in
  `dough-slice-planning/SKILL.md` ("number after the highest allocated
  entry"); the identity rule is written in `identity.md` once and referenced,
  per that file's "do not restate a competing allocation rule" contract.
- **Gap**: no reader of seed-directory or done-directory history, no
  allocation-evidence report, and no completed-identity refusal exist.

## Decisive premises

Observed 2026-10-23 in this workspace unless stated.

- **`add` accepts an identity a done record names.** In a scratch copy of
  `.planning/` (Git-initialised) with a recreated `seeds/SEED-147-scratch.md`
  carrying the done identity `SEED-147#running-cursor-session-reads-working`,
  `product-backlog.mjs add --identity … --position first` answered `Added …`
  and the entry appeared in the scratch backlog while
  `done/SEED-147_running-cursor-session-reads-working.json` existed. Settled:
  the gate has no completed-work check.
- **Startup admission accepts an identity a done record names.** A scratch
  `node --test` case (removed after observation) built on
  `createQueuedTrunk`, pushed `.planning/done/SEED-N_story-1.json` to the
  bare trunk, drafted a new `seeds/N.md` with story `SEED-N#story-1`, and ran
  the real startup CLI with `admitArgs`. Receipt:
  `{"status":"published","admitted":[".planning/seeds/N.md"]}`. Settled, in
  this checkout, matching the Donut incident (admission commit `33cd8e75`).
- **Published history exposes removed seed numbers.** In this checkout,
  `git log --diff-filter=A --name-only --format= -- .planning/seeds` lists 157
  seed additions; 141 seed numbers (002…147) appear in history but not in the
  active directory, while the done catalog covers 47 seed numbers (008…147)
  and the active directory holds 053, 118, 148. `git log --diff-filter=D … --
  .planning/done` lists no pruned record yet, so the done-history source is
  proved by the slice's fixture rather than by this repository.
- **Admission reads trunk, not the originating checkout, for published
  facts.** `readAdmissionSource` reads the backlog via `show(repository,
  remoteRef, backlogPath)`; the done directory must be read the same way
  (`git ls-tree`/`show` at `remoteRef`). Code trace in
  `execution-admission-source.mjs` lines 101–120; slice 3's test places the
  record only on trunk to discriminate.
- **Test harness.** Backlog CLI tests run through `bash scripts/test.sh
  <paths>` with Bash 5 first on PATH (`/opt/homebrew/bin/bash`); fixtures
  `tests/support/product-backlog-fixture.mjs` (`scratchProject`, `run`,
  `projectFile`) and `product-backlog-done-fixture.mjs` (`gitWorkspace`,
  `recordText`, `at`) exist and were used by the observations above.

## Outside-in proof

| Key example | Proof | Slice |
| --- | --- | --- |
| 1 Seed numbers hidden by cleanup | CLI test: active seeds end at 074, done records 075…084 → report names 84 as highest with `SEED-084…` record behind it, next free 085 | 1 |
| 4 Missing catalog | CLI test: records present, no `.catalog.json` → report lists the records read and names the catalog as unreadable/absent; agent guidance rebuilds with `catalog-done` | 1 |
| 3 Allocation older than retention | CLI test in a Git scratch project: `SEED-090-*.md` added and removed in history, done record pruned beyond 30 days → report names 90 from history with its commit; without history (plain directory) the report names history as unread | 2 |
| 2 Completed identity, via `add` | CLI test: done record for the candidate → `add` refuses naming identity, title, completion time; backlog unchanged | 3 |
| 2 Completed identity, via admission | Startup CLI test: record only on bare trunk → `source-refused` naming the record; nothing pushed, draft kept | 3 |
| 5 Resume and relocation retain identity | Existing `take`, `refresh`, resume, and Preparing tests stay green; no new check on those paths | 3 |
| Guidance routes allocation through the rule | Representative allocation exercise: a fresh subagent given only the changed skills and a scratch project (active 074, done 075…084, history 090) allocates 091 by running the operation, and its `add` of `SEED-075#story-1` is refused; plus AGENTS.md behavior review of `identity.md`, `seed-format.md`, `admit-accepted-work.md`, triage seed creation | 4 |

Focused proof runs through `bash scripts/test.sh <paths>` (quiet-pass rule).
The full `npm test` runs once before publication because the shared backlog
fixtures and the startup CLI are loaded by distributed consumers.

## Ordered slices

### 1. The backlog script reports allocation evidence from active seeds and done records
Type: Behavior
Status: done
Proof: `tests/support/product-backlog-identity-evidence.test.mjs` (new),
examples 1 and 4; usage text lists the operation.

Behavior: a project has seed files and done records beside its backlog →
`product-backlog.mjs <evidence operation> [--identity <candidate>] [--file]`
runs → it prints, without writing, the highest seed number per source with
the file or record behind it, the next unused seed number implied, the
candidate's status (`unlisted`, `active` with its list, `completed` with
record title and time) when supplied, and each source it could not read
(absent catalog, unreadable record), never reporting a partial read as
complete.

Design: one `product-backlog-identity-evidence.mjs` composing the existing
seed-directory listing, `parseDoneRecordFile`/`catalogDoneRecords`, and the
backlog document; `read`-style operation registered in `product-backlog.mjs`
beside `read-state`. Name the operation during execution (`identity-evidence`
is the working name); keep it a reader.

Accepted (2026-10-23): operation `identity-evidence [--identity <id>]
[--seeds <path>] [--file <path>]` in
`product-backlog-identity-evidence.mjs` prints JSON `{highest, next, sources[],
gaps[], candidate?}`; sources `seed-directory` (front-matter `id:`, default
`seeds/` beside the backlog, absent → gap), `backlog`, `done-records`,
`done-catalog` (absent with records, unreadable, or mismatched → gap). Done
files come from `readDoneRecordFiles` extracted from `rebuildDoneCatalog`;
`install.sh` declares the new module. Proof: `PATH=/opt/homebrew/bin:$PATH
bash scripts/test.sh tests/support/product-backlog-identity-evidence.test.mjs`
(example 1: highest `SEED-084` record, next `SEED-085`, tree unchanged;
example 4: catalog `absent` and unreadable record as gaps, records still read;
candidate completed/active/unlisted) plus all `product-backlog-*.test.mjs`,
payload/install shell tests, and lint. Source-review commitments C10–C13,
C21–C22, C27, C29 observed; history (C20, C12 history status) stays with
slice 2. Slice 4 guidance must mention `--seeds` for other seed layouts.

CI repair (run 39883782226): the new test file shifted the bytewise
round-robin split and put share 3 at 711.1 of 710 job-seconds with unchanged
per-job speed; `tests/longest-first` was refreshed by its documented
procedure (projected 612.9 / 588.6 / 593.8). Proof: runner split/budget
tests and lint; the pushed revision's CI is the verdict.

### 2. The evidence report covers allocations published history no longer shows
Type: Behavior
Status: planned
Proof: same test file, example 3: Git scratch project (`gitWorkspace`) where
`SEED-090-x.md` and `done/SEED-090_x.json` were committed and later removed →
report names 90 from history with the adding commit; a non-Git scratch
project → report names history as unread while other sources stand.

Behavior: seed or done files were added and later removed in published
history → the operation runs → history appears as a source with its highest
number and commit, read through `product-backlog-git-repository.mjs`
(`git log --diff-filter=A --name-only --format= -- <seed dir> <done dir>`),
and an unavailable repository or shallow history is named as unread.

### 3. `add` and startup admission refuse an identity a done record names
Type: Behavior
Status: planned
Proof: new case in `tests/support/product-backlog-add-identity.test.mjs`
(refusal text names identity, title, completion time; backlog bytes
unchanged) and new case in
`src/skills/dough-execute-plan/scripts/workspace-publication-admission-refusal.test.mjs`
(record pushed only to the bare trunk → `source-refused`, remote head
unchanged, draft kept). Existing take/refresh/resume tests stay green.

Behavior: a done record for the candidate identity exists beside the backlog
(working tree for `add`; fetched trunk for `--admit`) → the operation is
invoked for that identity → it refuses, naming the record's identity, title,
and completion time and that a different identity must be allocated, and
changes nothing.

Design: one shared `requireUncompletedIdentity(identity, doneSource)` beside
the done-record readers, where `doneSource` lists and reads record files from
a directory (`add`) or from a trunk revision (admission, via `show`). Both
gates call it before any write; no check is added to `take`, `refresh`,
`record-state`, or the preparation start.

### 4. Guidance routes new identities through the rule and the evidence operation
Type: Behavior
Status: planned
Proof: representative allocation exercise and behavior review as mapped
above; `grep` shows no second allocation rule outside `identity.md`.

Behavior: an agent creates a seed, drafts an admitted or correction story, or
creates a canonical seed for a triaged finding → it reads the contract's new
"Allocate a new identity" section via the reference from `seed-format.md`,
`admit-accepted-work.md`, or the triage skill → it runs the evidence
operation instead of reading filenames, chooses a number above every
observed source and an anchor whose full identity no source records, treats
an unreadable source as unresolved (rebuilding a missing catalog with
`catalog-done`), and learns from the product-backlog skill and usage text
what the refusals mean and that resume and relocation allocate nothing.

## Current decisions

- Evidence is read, never reserved: no lock, registry, or next-number file.
  The agent chooses; the canonical home records.
- Refusals consult done records only (within the retention window). History
  informs allocation through the evidence report; it does not gate `add` or
  admission, keeping the gates deterministic and Git-free for `add`.
- Admission reads `done/` at the fetched trunk revision, consistent with how
  it reads the backlog; the originating checkout's `done/` is not trusted.
- Operation and function names are working names; execution keeps them
  capability-named and consistent with the skill text.

## Concern evidence

Refinement not needed: four slices, one proof loop each, each tied to a key
example; preparatory structure (shared done-record check, source
abstraction) sits inside the slice whose Behavior needs it. No remaining
slice-specific concern identified.
