# Plan without numbering or budget prompts

## Source and outcome

[SEED-004 Story 13](../../seeds/SEED-004-extract-and-adopt-project-guidance.md#plan-without-numbering-or-budget-prompts).
The human requested this narrow detour on 2026-09-10 after retrospective planning
stopped to ask about numeric budgets. Use the next available plan number and do
not repeat that question. Quick 033 follows the existing quick-plan sequence.

A developer with an understood story and established project planning location
receives a bounded slice plan without being asked for a plan number or missing
numeric timing policy. Existing active plans and explicit project limits remain
respected. Publish the corrected guidance in a new immutable release, then update
Open Dough through its recorded-source updater and verify fresh installed use.
The human explicitly added release and adoption to this plan on 2026-09-10.

## Scope and execution context

- Four Behavior slices; no preparation slice, allocator, new runner, or framework.
  No numeric budget is required for this plan under the human's latest direction.
  Judge cohesion and one outcome/proof loop per slice. Split on discovered
  independent work or uncertainty; do not invent a duration guarantee.
- Statuses: `planned`, `in-progress`, `done`. Maintain this plan in place; retain
  evidence and unresolved acceptance until it has an enduring home. Reduce spent
  plan/seed detail after completion under the existing planning lifecycle.
- Edit shared source under `src/skills/`. Never synchronize installed `.agents`
  or `.claude` copies by hand. Primary owner: `dough-slice-planning/SKILL.md` and
  its `RECOGNITION.md`. Slice 2 may minimally align the authoritative sizing
  section in `dough-story-decomposition/references/problem-decomposition.md` and
  contradictory requirement wording in `dough-slice-plan-refinement/SKILL.md`.
  Change the refinement skill only enough to inherit the optional-budget rule;
  no redesign of its assessment. Inspect the shared planning reference for
  contradictions; do not edit unrelated instructions.
- Preserve supplied limits and escalation rules when present. Missing numeric
  limits alone are not a low-confidence finding or reason to demand refinement.
  Genuinely missing story scope or ambiguous canonical planning location remains
  a useful missing-input boundary. Do not invent project roots.
- Exclude Story 11's planner-handoff/readiness redesign, retrospective work,
  automatic execution, global timing-policy changes, concurrency infrastructure,
  new host adapters, and unrelated feature promotion. Release publication and
  ordinary adoption are explicitly included. The highest local tag inspected
  during planning is v0.3.4; v0.3.5 is the proposed release version, not yet
  selected metadata. Follow the maintainer-owned version rule in ADR 0003 and
  recheck source tags before metadata changes; never reuse an existing tag.
- When execution is requested, follow the established execution workflow:
  independent post-change refactor, owned-file delivery, and applicable CI repair.
  Resolve that execution's checkout and publication destination then. Current request
  writes planning artifacts only; no implementation, commit, or push.
- Formatting inspection: `scripts/lint.mjs --fix` currently scans code across the
  repository and does not format Markdown. These Markdown-only changes need
  `git diff --check`; do not bulk-format unrelated files. Before delivery,
  reconcile any execution workflow expecting selective formatting with this
  observed command behavior rather than silently changing formatter policy.

## Architectural constraints

- [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md):
  existing declared guidance changes remain Proposed until reviewed/selected;
  release metadata and immutable tags are separate from release readiness.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): verify
  useful behavior, reuse valid integration evidence, and record affected behavior
  coverage for Codex, Cursor, and Claude Code. Missing native proof stays pending.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md):
  concise guidance for the executing project, one authoritative behavioral home,
  maintainer evidence in recognition records. No architecture exception needed.

## Ordered slices

### 1. Receive the next numbered plan without supplying a number
Type: Behavior
Status: done
Proof: One bounded planning walkthrough produces the correct plan path and
preserves existing plans without a numbering question.

Behavior: Given an understood story, an established quick-plan root with entries
through 032, and no active plan for that story, requesting a slice plan creates
033 with the existing padding and layout. A matching active plan is reused;
a number occupied before writing is skipped, never overwritten. Resolve the
number from the established sequence, using the highest allocated number rather
than filling old gaps. Do not build locking or reservation infrastructure.

Update the concise context-resolution instruction and recognition examples.
Use a small disposable planning fixture for the next-number, reuse, and occupied
number variants. Inspect created paths, existing file preservation, and response;
do not use exact prose matching as proof. Retain the genuinely unknown planning
root case: report missing context, without asking the human to choose a number.

Safe stop: Automatic numbering works; the existing budget behavior is separately
owned by Slice 2. Do not claim this completes the original reported interruption.

### 2. Receive a bounded plan without supplying a timing policy
Type: Behavior
Status: planned
Proof: One paired planning walkthrough returns a plan without budget questions
when no numeric policy exists, and respects an explicit policy when supplied.

Behavior: Given the same understood story and planning root but no numeric slice
target or hard limit, planning finishes using cohesive Behavior/Structure slices,
each with an observable outcome and owning proof. No invented time limits,
no numeric-policy clarification, and no missing-budget readiness blocker appear.
When project limits exist, use them and report actual slice-specific concerns.
Planning remains planning; no automatic implementation is authorized.

Remove the missing-budget stop from the entrypoint and align its readiness
conditions with the no-policy case. Update the shared sizing reference so loading
it cannot reinstate that stop. Make the minimal corresponding requirement change
in slice-plan refinement, retaining its other rules. Record changed assumptions
and proof in the existing recognition record; do not introduce a policy registry.

Reuse Slice 1's fixture with the policy absent and then explicitly supplied.
Review the generated slices and proof ownership, not just successful completion.
Include a combined no-number/no-budget case reproducing this conversation's
failure. Explicit policy should meaningfully constrain the example, not merely
be echoed in the report. Inspect directly linked instructions for contradictions.

Safe stop: Both interruption causes are removed; guidance remains outside a new
release until the pre-release gate below is satisfied and Slice 3 publishes it.

### 3. Receive the fix from a published immutable release
Type: Behavior
Status: planned
Proof: The recorded release source advertises the new annotated version tag;
its peeled commit contains matching VERSION/changelog and the corrected payload.

Behavior: Given Slices 1–2 and their pre-release proof pass, publish a new numeric
release through the existing release workflow. Verify the matching payload
lists in `install.sh` and `src/install/open-dough-release-version.sh`; the skill
and references are already declared, so no new skill promotion is needed.
Review all declared payload changes since the previous release: a release ships
that whole payload. Do not silently bundle unrelated unreviewed changes or
promote the Proposed retrospective. Use an isolated release branch if needed to
keep the release bounded while preserving other work.

Before release metadata, staging, commits, or tagging, run
`bash scripts/check-self-installation.sh` as required by release-version. A
failed baseline stops finalization; do not repair it by hand-synchronizing
installed guidance. Commit the reviewed source first. Follow release-version to
write VERSION and a concise dated CHANGELOG entry, commit only intended metadata,
and create an annotated immutable tag on the intended release commit. Preserve
all previous entries and tags. The version must be greater than the highest
numeric release available from the source, not merely greater than VERSION.

The release-version skill stops at a local tag; publication is a distinct,
explicitly included action in this slice. Push the intended release commit and
that exact tag to the verified source remote without force. Verify remote tag
and peeled commit with `git ls-remote --tags -- <source>`, and inspect the tagged
payload/version rather than treating push output alone as successful delivery.
Record version, commit, and source in this plan. No GitHub Release object or new
release automation is needed.

Safe stop: The fix is publicly available from the release source, but this
repository still needs Slice 4 to use it. Do not mark the story complete yet.

### 4. Use the released fix through the ordinary updater
Type: Behavior
Status: planned
Proof: Ordinary recorded-source update changes both native roots to the released
payload, passes the self-installation check, and fresh installed use produces a
numbered plan without a number or absent-budget question.

Behavior: Given Slice 3's release is available, capture this repository as the
target and follow the installed dough-update workflow with no supplied version
or URL override. Resolve its recorded SOURCE, pin and inspect the highest numeric
release, then invoke that snapshot's release helper. Do not use untagged source,
copy files manually, or force over changed managed guidance. If latest changed
since publication, inspect it and establish that it contains this fix rather
than silently claiming the intended release was adopted.

Verify updater SOURCE/VERSION in `.agents/skills/dough-update/` and
`.claude/skills/dough-update/`, the changed skills and references in both roots,
and preservation of unrelated settings/files. Run
`bash scripts/check-self-installation.sh` after update. Commit the updater-owned
installation/configuration changes through ordinary delivery, preserving other
working-tree work. Record the actual installed release and source commit.

Start a fresh native session that loads the updated installed guidance; the
current session may retain old skill instructions. Reuse the bounded combined
case from Slices 1–2 in a disposable planning target, with the installed skill
as its guidance and no numeric timing policy. Observe skill use, automatic next
number, a proof-owned plan, and absence of the obsolete questions. Do not ask the
session to implement its generated plan. This verifies installed use without
expanding into the parked retrospective story. Reuse pre-release host evidence
where valid; do not repeat the full case matrix merely for adoption.

Safe stop: Released guidance is installed and demonstrably usable here. Update
the owning seed to complete and retain decisive evidence; unrelated stories stay
unchanged.

## Proof ownership and pre-release gate

| Promise | Owner and observation |
| --- | --- |
| Next number, padding, reuse, collision preservation | Slice 1: paths and preserved fixture contents |
| Genuine unknown root remains a missing-input boundary | Slice 1: useful missing-context result, no invented path |
| No policy still yields a bounded, proof-owned plan | Slice 2: completed plan and no numeric-policy prompt |
| Explicit policy still applies; references do not contradict fallback | Slice 2: constrained example and linked-guidance review |
| Planning skill does not execute generated plans or change unrelated guidance | Slices 1–2: invocation/output and owned diff inspection |
| Release readiness | Slices 1–2: behavior results, payload checks, native coverage below |
| Immutable published release contains corrected payload | Slice 3: remote tag, peeled commit, metadata and payload |
| Ordinary adoption and fresh installed behavior | Slice 4: updater records, baseline check, observed plan |

Follow AGENTS.md's representative behavior review: invocation, required context,
and useful outcome. Preserve the candidate revision, inputs, observed results,
and limitations in the recognition record or a linked concise evidence record.
A manual walkthrough is content review, not native acceptance.

For affected requirements in both slices, inspect existing native delivery
records first. Reuse unchanged discovery/installation mechanisms with reasons.
New next-number and absent-budget behavior needs native evidence or genuinely
applicable existing behavioral evidence for each supported host. Use the combined
case to cover both changes; run additional cases only for an unresolved risk.
Prefer existing native interfaces and disposable projects. Do not build new
harnesses, run every variant on every tool, or treat self-report as sufficient.
If evidence is unavailable, report the exact pending requirement; the change is
not release-ready until covered. Recognition updates belong to their owning
slice, not a separate administrative slice.

Focused existing payload/reference regression check after final guidance edits:
`bash tests/story-payload-update.sh`. Also run `git diff --check` and inspect
relative runtime links. Payload declarations already include the planning skill
and shared references; do not add paths or alter the release version incidentally.
Do not add static phrase assertions for this prose repair or run full suites
repeatedly. Preserve passing proof unless later edits invalidate its boundary.

## Execution journal

- CI observer started 2026-09-10 before the first delivery push: Codex yielded
  cell `16`, terminal session `19079`, mailbox `/tmp/dough-ci-501/watch-LM7ebt`,
  worker PID `70915`; execution `terryyin/open-dough` on `main` using verified
  workflow `ci.yml` (`CI`) from this checkout. Reuse this observer across
  subsequent deliveries and stop the recorded mailbox before plan completion.
- Slice 1 completed 2026-09-10. Source guidance now reuses a matching active
  plan or allocates after the highest established padded entry, rechecking and
  skipping an occupied candidate without overwriting it. A disposable walkthrough
  observed 001–032 → 033, active-plan reuse, preserved late 033 → 034, and an
  unknown-root boundary. The candidate inputs, observations, and native-proof
  limitation are retained in `src/skills/dough-slice-planning/RECOGNITION.md`.
  `bash tests/story-payload-update.sh` and `git diff --check` passed. The
  post-change refactor review found no cohesive follow-up edits.

Pre-release completion: Slices 1–2 have decisive proof, applicable native
coverage/reuse and focused checks pass, and the reviewed payload is bounded.
Story completion additionally requires Slice 3 publication and Slice 4 ordinary
adoption plus fresh installed-use proof. Source edits, a local tag, or a successful
file update alone do not complete this story. Resume the parked retrospective
plan only when requested.

## Planning assessment

Four Behavior slices, each owning one outcome and proof journey; no intermediate
Structure slice is needed. Slices 1–2 are ready for direct execution under the
human's no-numeric-question direction, without a time guarantee. Slices 3–4 use
the existing release/update workflows; native coverage, maintainer version
selection, source-baseline health, and remote publication access are their
execution prerequisites, not claimed as proven by this plan.
