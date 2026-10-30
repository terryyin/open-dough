---
id: SEED-182
status: active
planted: 2026-10-30
planted_during: Terry's request to standardize test optimization findings
trigger_when: An optimization pass records remaining candidates or accepts necessary slow-test cost
scope: a standard project record for test optimization candidates and accepted costs
---

# SEED-182: Standardize Test Optimization Candidates

## Why This Matters

For Terry and agents optimizing project tests, findings currently live wherever
an earlier pass happened to leave them: an active plan or a project-specific
timing document. There is no standard record for pending candidates or accepted
slow-test costs. Useful decisions can be hard to find after plans are removed
or another pass starts.

Terry selected one story: establish the standard project record and the
guidance that uses it. This seed queues that outcome; it is not an executable
plan.

## Selected Stories

<a id="standardize-test-optimization-candidates"></a>

### Standardize Test Optimization Candidates under the planning folder

**Identity:** SEED-182#standardize-test-optimization-candidates
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/414-standardize-test-optimization-candidates/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"81aa6718e62764cdf3972286c647a3c42936f4411431b78ce55d7dcba08d208c","plan":"c3d7bbb67d553c6550470132b9c1a062b4afb16ca4d3ef302309d0d6356c7f4b"}}
```

**Goal:** A developer or agent running test optimization, resolving its
recorded findings, or closing a story that touched them finds, writes, and
interprets every finding in one standard project record. Accepted slow-test
costs and transferred obligations survive plan cleanup, so a later pass
consults earlier decisions instead of rediscovering them from a spent plan or
a conversation.

**Scope:**

Required behavior:

- The record is the project's `.planning/TEST-OPTIMIZATION-CANDIDATES.md`,
  headed exactly `# Test Optimization Candidates`. One reference in the
  optimization skill defines its format and lifecycle; the optimization pass,
  `--resolve`, and story wrap-up link to that definition instead of restating
  it.
- The record is a problem list with a discharge summary, not a history log. It
  always carries these sections, in order:
  - `## Latest pass` — the most recent pass only, replaced by the next one:
    command and scope, revision, comparable before/after wall time and
    executed case counts when available, outcome stated as measured gain, no
    demonstrated gain, or incomplete measurement, measurement limits, and
    evidence links. Raw profiles stay outside the record.
  - `## Pending candidates` — proposed changes not yet implemented or
    decided, including those awaiting a named human decision.
  - `## Accepted necessary costs` — cost judged inherent to unique protected
    behavior. Acceptance is a decision record only: it filters, skips, or
    excludes nothing, and normal verification and CI keep running the test.
  - `## Profile-only exclusions` — exclusions actually applied through the
    project's existing mechanism, naming that mechanism and its scope.
  - `## Transferred obligations` — candidates whose work now lives in a named
    replacement story or plan. The entry stays as a pointer until that work
    closes; it never claims the replacement was implemented.
- Each finding is a `###` entry whose heading is a short kebab-case slug,
  unique in the record and kept unchanged when the entry moves between
  sections. Its labeled fields cover test locations and scope, observed cost
  with measurement conditions, unique protection, alternatives attempted,
  disposition and rationale, date, needed human decision (when one is
  pending), and links to evidence or follow-up work.
- An empty section holds exactly `None.` A record with every finding section
  at `None.` is an explicit empty record.
- A missing record means no pass has recorded findings in this project.
  `--resolve` reports that without creating the file. A pass that records a
  summary or finding creates the record from the defined format; it needs no
  pre-existing file. A record that cannot be read or does not match the format
  stops the write and is reported; it is never overwritten or guessed at.
- Every pass that ends with findings — default or profile-only — writes its
  latest-pass summary and its candidates to the record, not only to its plan.
  Later passes and `--resolve` read the record first, preserve recorded
  decisions, and move an accepted cost back to pending only with new evidence.
- `--resolve` moves each resolved entry to its disposition section (accepted
  cost, applied exclusion, or transferred obligation) or keeps it pending with
  its human decision.
- Wrap-up, before deleting a spent plan, moves any optimization finding that
  exists only in that plan into the record. When the closing story or plan is
  the receiver of a transferred obligation, wrap-up removes that entry once
  its work is done, or returns any unfinished part to pending candidates.

Deferred promises:

- Automatic expiry or periodic re-review of accepted costs.
- A history of earlier passes beyond Git history.
- A script that validates or rewrites the record.

**Explicit exclusion (Terry, 2026-10-30):** Do not inspect, rewrite, relocate,
or automatically migrate the existing findings or file structures in maintained
projects as part of this story or its update rollout. Terry will separately ask
agents to perform a one-time migration after updating. No legacy-location
discovery or migration compatibility layer is required by this story.

**Safe stopping point:** The file and guidance are useful on their own. This
story does not implement the recorded optimization candidates or introduce
a new test-runner exclusion mechanism.

**Key examples:**

1. *New pass, no record.* A project has no
   `.planning/TEST-OPTIMIZATION-CANDIDATES.md`. A profile-only pass finds one
   slow journey family it cannot yet change → the pass creates the record with
   its latest-pass summary, the finding under `## Pending candidates` with all
   labeled fields, and `None.` in the other finding sections.
2. *Resolve to accepted cost.* That pending entry protects a unique
   multi-step journey and no cheaper proof exists. `--resolve` runs → the
   entry, same slug, moves to `## Accepted necessary costs` with rationale and
   date; the test still runs in normal verification and CI; with no project
   exclusion mechanism, nothing is added under `## Profile-only exclusions`.
3. *Resolve to replacement plan, then clean up.* A pending viewport-matrix
   entry has cheaper replacement proof. `--resolve` writes the obligation into
   a replacement plan → the entry moves to `## Transferred obligations`
   linking that plan. The original optimization plan is later deleted by
   wrap-up; a new pass still finds the transferred entry. When the replacement
   story is wrapped up with its work done, the entry is removed.
4. *Later pass consults decisions.* A new default pass profiles the same
   journey → it reads the accepted-cost entry and does not re-propose the same
   change without new evidence; its summary replaces `## Latest pass`.
5. *Empty, missing, unreadable.* After every finding is resolved away, all
   finding sections read `None.` → `--resolve` reports an empty record. With
   no file, it reports that no findings have been recorded. With a file whose
   heading or sections do not match the format, it stops and reports the
   mismatch without editing.

**Architecture:** The record format and lifecycle have one owner: a reference
under `src/skills/dough-test-optimization/references/`. The optimization
skill, its `--resolve` reference, and story wrap-up link to it, keeping one
behavioral source across skills. The installed payload is an explicit file list
in `install.sh` (mirrored by `tests/update-adds-new-payload-skill.sh`), so a
new reference file joins both lists. Guidance addresses the agent in its own
project under ADR 0006 and names the record by its project path. Placing the
record under `.planning/` matches existing Open Dough defaults
(`.planning/PRODUCT-BACKLOG.md`, `.planning/open-dough.json`); the installer
does not create the record.

## Ordering and Boundaries

Terry requested this as the first queued story and subsequently abandoned the
separate dashboard review story. Leave currently Taken work in place. No
implementation, release, project update, client migration, or execution claim
is authorized by this backlog edit. Refinement settled the record syntax in
the story above. Effort bands are unassigned because the project has no
S/M/L calibration. The main uncertainty is keeping the record simple while
reliably readable.

Follow [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
when authoring the shared runtime guidance: address the agent in its established
project and keep one authoritative behavioral source. No ADR exception is
proposed.

## Breadcrumbs

- Terry's 2026-10-30 request in this conversation: standardize the planning
  file and format, exclude automatic migrations, keep only this first story,
  abandon the dashboard review story, and land the result.
- [Current optimization guidance](../../src/skills/dough-test-optimization/SKILL.md).
- [Current candidate resolution](../../src/skills/dough-test-optimization/references/resolving-candidates.md).
- [Existing project-specific findings and accepted costs](../../docs/maintainer/dashboard-test-timings.md#resolved-2026-10-30-resolve).
