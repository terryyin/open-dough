# Keep the source-review record consistent through its lifecycle

**Identity:** SEED-010#source-review-record-lifecycle
**Source:** [Correction story](../../seeds/SEED-010-learn-from-execution-retrospectives.md#source-review-record-lifecycle)
**Provenance:** retrospective of SEED-010#accept-source-promises-after-plan-drift
(plan 354), reviewed commits `d9b6b835`, `795a01a7`, `4fd5aac5` on
`claude/accept-original-source-promises-when-a-plan-narr`;
original story and plan 354 recoverable at before-cleanup commit `cc9a69c4bb87b12df67f90cdc82a3f888dc90fc8`
(`.planning/seeds/SEED-010-learn-from-execution-retrospectives.md#accept-source-promises-after-plan-drift`,
`.planning/slice-plans/354-accept-source-promises-after-plan-drift/PLAN.md`).

## Goal and scope

A coordinator using the linked source-review record gets one consistent rule
for when to link, allocate and observe commitments, and a gate that refuses a
skipped or mislinked record, so the comparison plan 354 delivered cannot be
bypassed by omission or blocked before its first acceptance.

Included: the findings below. Excluded: a semantic completeness checker or
second promise registry (the original story's exclusions stand); migrating
legacy plans; any change to Cursor follow-through (the original story's human
amendment records it as a limit); release or rollout.

## Current findings (verified at `4fd5aac5`)

1. **Omission bypasses the gate.** `readLinkedSourceReview`
   (`story-obligation-source-review.mjs`) returns `linked: false` without a
   `**Source review:**` line, and `story-obligations-source-review.test.mjs`
   "plans without a linked return keep obligation-only results" asserts a pass
   even with `source-review.md` beside the plan. `planning.md` element 7 says
   acceptance "may add" the link while `wrap-up.md` requires it for planned
   execution. A near-miss label (`**Source Review:**`) silently disables it.
2. **Allocation timing contradicts the gate.** `story-obligations.md` says to
   allocate "at the first acceptance", but `commitmentProblems` refuses
   `unallocated-commitment` on every `list` and `check`, so a review linked at
   execution start, or a replacement after an amendment, blocks the next
   delegation.
3. **No route for whole-story or done-slice rows.** Every native round's first
   check refused rows owned by `story`; the Claude amended-corrected round was
   withheld by unobserved rows allocated to done slices. The guidance never says
   which slice owns a whole-story commitment or that done-slice rows cite their
   earlier recorded proof (the original story's reuse promise).
4. **Drift evidence identity omits the gate.** `delivery-evidence-native-evidence.sh`
   hashes only fixtures and `story-obligations.md` for `drift`, and
   `delivery_evidence_capture_installed_inputs` captures `delegation.md`,
   `wrap-up.md` and `executable-proof.md`, not the three story-obligation
   scripts or `story-obligations.md` the rounds exercised.
5. **Documented refusal differs from code.** `unallocated-commitment` is
   documented as "no existing slice and no obligation"; the code also refuses a
   dangling `slice N` beside a valid obligation.
6. **`Commitment:` is unchecked against the rows.** A row may point to `G1`
   while `G1`'s `Commitment:` names other ids or is absent; refusals then name
   the wrong commitments or none, weakening "the gate refuses, naming the
   commitment". The `Link` bullet reads as mandatory though the field is optional.
7. **Test gaps and overlap.** No tests for `duplicate-commitment`, a malformed
   `Commitment:` field, a missing separator row or a duplicate `## Commitments`;
   the plan-quote and receiving-at-its-slice cases are duplicated between
   `story-obligations-drift-replay.test.mjs` and
   `story-obligations-source-review.test.mjs`.

## Preserved promises and constraints

From the original story: the reviewer return and the plan's obligation and
acceptance records are the only stores; no semantic completeness checker;
existing refusals keep their meaning; plans without a source review keep
today's results unless they hold the exact sibling `source-review.md` or a
near-miss link label; legitimate ownership (receiving, quoted exclusion,
human amendment, reused proof) stays settled; the human-judgment stop.

## Outside-in proof ownership

| Finding | Owner | Observable result |
| --- | --- | --- |
| 1 | 1 | CLI refuses an unlinked sibling `source-review.md` and a near-miss label (`unlinked-source-review`); a plan with neither keeps its exact prior result; `planning.md` states the link as required for planned execution |
| 2, 5 | 1 | Guidance says allocate when the return is retained or replaced, before the next `list`/`check`; the documented `unallocated-commitment` text matches a CLI case with a dangling slice beside an obligation |
| 3 | 1 | Guidance names the owner of a whole-story commitment (the slice that completes it, usually the last) and the done-slice observation (`observed:` its earlier recorded proof); a CLI case passes for both shapes |
| 6 | 1 | Refusal `commitments` come from the rows pointing to the entry; a present `Commitment:` that disagrees with those rows is refused; the `Link` wording marks the field optional |
| 7 | 1 | Added cases for the four untested refusals; the duplicated generic cases are folded into the plan 412 replay versions with no lost observation |
| 4 | 2 | `tests/native-evidence-identity.sh` and `tests/delivery-evidence-native-routing.sh` show the drift identity and captured installed inputs include the three scripts and `story-obligations.md` |

Each slice runs `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/story-obligations*.test.mjs src/skills/dough-execute-plan/scripts/*guidance*.test.mjs tests/payload-declaration-links.sh tests/delivery-evidence-drift.sh tests/native-evidence-identity.sh tests/native-stream-replay.sh`, the consumer-trace record for changed contracts, and the dough-land planned-completion consumers when the CLI result changes. No paid native round is required: the correction changes record structure and its credential-free checks.

## Ordered slices

### 1. The source-review record has one lifecycle rule and the gate refuses its omission
Type: Behavior
Status: done
Proof: focused `story-obligations*.test.mjs` cases for findings 1, 2, 3, 5, 6 and 7 through the CLI; guidance tests keep their pinned navigation; `tests/payload-declaration-links.sh` green.

Behavior: Given a planned execution's plan, when the coordinator retains,
links, allocates, observes and later replaces the source review, the guidance
in `wrap-up.md`, `story-obligations.md`, `delegation.md` and `planning.md`
states one timing rule and owner rule, and `story-obligations.mjs` refuses an
unlinked sibling `source-review.md` or near-miss label, names commitments from
the rows that point to a refused entry, and refuses a `Commitment:` field that
disagrees with them. Edit `src/skills/` only.

Accepted proof: source-only review return retained in
[review-return.md](review-return.md) (C1–C34). Compared per commitment:
C4/C5/C9/C10/C32 → `story-obligations-source-review-record.test.mjs` "an
unlinked source review beside the plan or a near-miss label is refused" and
"plans with neither … keep obligation-only results" (other named tests stay in
`story-obligations-source-review.test.mjs`, except record-form cases also in
the `-record` file); C1/C11 → `planning.md` element 7 and
`wrap-up.md` both require the link once acceptance retains it; C2/C7/C12–C14 →
`story-obligations.md` Allocate bullet, `wrap-up.md`, `delegation.md` (allocate
at retention or replacement before the next `list`/`check`; gate unchanged so
C31 holds); C20 → documented `unallocated-commitment` text and "a row naming a
slice the plan lacks is unallocated even beside a valid obligation"; C3/C15–C17
→ guidance owner rules and "a whole-story commitment belongs to its completing
slice; a done slice's row cites its earlier proof"; C21–C23 → new
`mismatched-commitment` refusal, "refusals name the rows that point to the
entry, and a present Commitment field must match them", optional `Link` wording;
C24–C27 → "each returned id has one row, one table header and one Commitments
section" and "a malformed Commitment field is refused"; C28/C33a → the two
generic source-review tests folded into the drift-replay traceability test,
which now also checks `proved by slice 7` at slice 7 and completion. C18/C19
remain with slice 2. Commands: the slice proof command above plus consumers
`bash scripts/test.sh` over `execution-increment-fresh*.test.mjs`,
`dough-land{,-guidance,-completion}.test.mjs`,
`tests/delivery-evidence-{amended,terminal}.sh`, all exit 0. Consumer trace
terms `unlinked-source-review`, `unallocated-commitment`,
`mismatched-commitment`, `readLinkedSourceReview`, `Source review`,
`commitmentProblems`; replayed native-stream fixtures and installed copies
excluded. Learning: plain `Source review: [..](..)` was previously accepted as
a link and is now a near-miss refusal; no source, test or fixture used it.

### 2. Drift evidence identity covers the gate it exercises
Type: Behavior
Status: done
Proof: `tests/native-evidence-identity.sh`, `tests/delivery-evidence-native-routing.sh`, `tests/delivery-evidence-drift.sh` green with the added identity lines and captured inputs; existing families' identities unchanged.

Behavior: Given the `drift` delivery-evidence case, when a native round is
retained, its evidence identity and `installed-inputs.sha256` include
`story-obligations.mjs`, `story-obligation-reader.mjs`,
`story-obligation-source-review.mjs` and `story-obligations.md`, so a later
change to the gate marks the retained drift evidence stale. Tests only.

Accepted proof: C18/C19 → `tests/support/delivery-evidence-native-evidence.sh`
drift identity adds the `story-obligations.mjs` import closure (the three gate
scripts and their imports; `story-obligations.md` was already listed), and
`delivery_evidence_capture_installed_inputs host drift` adds the three scripts
and `story-obligations.md`. Observed by `tests/native-evidence-identity.sh`
`drift_gate_inputs` (drift lists them, other families except `amended`'s
existing closure list none, each input change moves the drift hash) and
`tests/delivery-evidence-native-routing.sh` (captured path diff for
claude/codex × original/drift, then `shasum -c`); a reverted scratch copy fails
both. Commands: the slice proof plus `tests/delivery-evidence-{amended,original,release,terminal}.sh`
and `tests/proof-scheduling-native.sh` through `scripts/test.sh`, exit 0.
Learning: every family's identity hash value changes because the edited
harness files are themselves hashed, so recorded native-stream replay
identities are stale for all families; replay does not check freshness, and no
paid evidence was regenerated.

## Current decisions

- Refuse only the exact sibling `source-review.md` without a link and a
  case-insensitive `Source review` label that is not the exact form; any other
  plan keeps its prior result. Plan 354's own unlinked `source-review.md` is
  spent history removed at its wrap-up.
- Keep `Commitment:` optional; when present it must equal the set of rows
  pointing to the entry.
- Guidance edits in `src/skills/dough-execute-plan/` and
  `src/skills/dough-story-refinement/references/planning.md`; installed copies
  are not hand-synchronized (AGENTS.md).

## Plan concern review

Slice-plan refinement was not needed: slice 1 owns one record contract across
its script and guidance, and slice 2 is an independent harness postcondition.
This review identified no remaining slice-specific concern.
