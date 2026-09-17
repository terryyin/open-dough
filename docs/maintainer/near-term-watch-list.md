# Near-term watch list

Internal Open Dough findings with released responses and no recorded post-fix
recurrence of the same mechanism in the evidence assessed on 2026-09-17.
These identities moved from [finding names](finding-names.md); their codes remain
allocated. Preserve their evidence and former source mappings when matching new
feedback. Related symptoms alone do not establish recurrence of these identities.

The harvested executions extend through Open Dough 0.3.23. Absence of a recorded
recurrence does not establish effectiveness or a known number of successful uses.
Older occurrences with unknown execution releases remain explicitly qualified
in finding names. Released responses without verified relevant use remain active
there rather than starting a watch from tag or file age alone.

On the owner's instruction, matching entries were removed from current source
DearDough logs where present; source locators below describe historical reports.
The catalog evidence is retained here. ODF-011 was already absent from Doughnut's
current log. Newly watched entries were removed from Pygardon and Doughnut as
applicable; Open Dough's current log contains none of the watched identities.

## ODF-011 — Pre-satisfied test seams hide provisioning-order defects

- **Meaning:** Boundary tests that inject an already-satisfied provisioning precondition can bypass the side effect that establishes it and conceal incorrect production call ordering until live integration proof.
- **Source mappings:** Doughnut Project / DD-005
- **References:** Doughnut Project `DearDough.md`, DD-005; release `0.3.12`; `be7234f7f2`; pre-fix `47df168656`; fix `b0dad96aaa`; `scripts/e2e-runner.test.mjs`.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** Clarified that fixture-supplied allocation does not prove
  product-owned provisioning, while preserving narrower useful proof.
  Guidance change: `e710426`. Story 20 and its review are recoverable through
  `34ba340:.planning/quick/039-match-success-claims-to-proof/PLAN.md`.
- **Released in:** 0.3.14 (`e710426`; first containing tag `v0.3.14`).
- **Watch start:** 2026-09-13, release 0.3.16, Doughnut plan 115 at
  `2be6138738`; its proof planning exercised the released ownership guidance.
- **Review after:** 2026-09-20.
- **Last assessed:** 2026-09-17; Open Dough, Pygardon, and Doughnut current logs
  checked. ODF-045 is a related caller-purpose proof gap, not recurrence of the
  pre-satisfied provisioning mechanism. The seven-day window has not elapsed.

### Occurrences

- Execution: `SEED-015 Story 8 / quick-105-runner-owned-e2e-lifecycle / be7234f7f2`
  - Source: Doughnut Project / DD-005; canonical `DearDough.md` occurrence
  - Tool: Cursor
  - Open Dough release: 0.3.12
  - Evidence: Boundary tests injected a pre-resolved runtime target or used the
    primary checkout, while production resolved an isolated checkout target
    before starting the lifetime that provisions it. Live proof failed on the
    missing allocation; pre-fix tests had no fresh-provisioning-path case, and
    `b0dad96aaa` added that coverage and corrected the order.
  - Observed effect: Live proof failed once, required a defect fix and cache
    cleanup after a crashed build, and passed only after rerun; the boundary
    suite had remained green because its seam elided provisioning.

## ODF-014 — Local failure proof was accepted as public completion proof

- **Meaning:** A bounded inner failure-policy test does not establish terminal completion at the public caller when additional waits and joins remain outside the tested bound.
- **Source mappings:** Pygardon / DD-003
- **References:** Pygardon `DearDough.md`, DD-003; release `0.3.6`, snapshot `f5fd66e60`; local proof `b6d24ac22`; later public-path proof `2e06e144f`; distinct from ODF-011's seam-elided provisioning issue.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** Clarified that an inner operation finishing does not prove
  public caller completion, and that missing proof leaves the promise incomplete.
  Guidance change: `e710426`. Story 20 and its review are recoverable through
  `34ba340:.planning/quick/039-match-success-claims-to-proof/PLAN.md`.
- **Released in:** 0.3.14 (`e710426`; first containing tag `v0.3.14`).
- **Watch start:** 2026-09-13, release 0.3.14, Pygardon plan 119 at
  `f70a3b976`; its public job-status proof exercised caller-completion evidence.
- **Review after:** 2026-09-20.
- **Last assessed:** 2026-09-17; all three current logs checked. No same
  inner-operation-versus-public-caller recurrence is recorded, but the
  seven-day window has not elapsed.

### Occurrences

- Execution: `.planning/quick/109-green-linux-arm64-release-check/PLAN.md at 488dc39e0`
  - Source: Pygardon / DD-003; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.6; tracked execution snapshot `f5fd66e60`
  - Evidence: `b6d24ac22` bounded a synthetic remaining-PID wait, while
    `CiCommand.force_stop` and helper/public waits still joined output readers
    outside that bound. The status response described unbounded cleanup as
    fixed. Later `2e06e144f` proved public stop/run settlement for the
    demonstrated signal-dispatch stall.
  - Observed effect: The focused deadline test passed while the plan still
    recorded a live public force-stop thread under the combined ARM64 control.
  - Inference: The original claim extrapolated beyond its proof. The later
    public-path evidence is intentionally narrower and does not certify every
    retained-child-pipe cleanup failure.

## ODF-017 — Certified installations omit required skill references

- **Meaning:** A manually maintained release manifest can omit a file required by an installed skill while the updater still certifies the incomplete installation as current.
- **Source mappings:** Pygardon / DD-006
- **References:** Pygardon `DearDough.md`, DD-006; modified revision `995bcbed2`, base `0.3.9`; Open Dough tag `v0.3.9` at `26cbba94f`; distinct from ODF-005's installed-versus-unreleased authority conflict.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** Clarified that success claims cover observed behavior, so
  version metadata alone does not certify a usable invocation. This guidance
  response is distinct from the missing-reference repair shipped in `v0.3.11`.
  Guidance change: `e710426`. Story 20 and its review are recoverable through
  `34ba340:.planning/quick/039-match-success-claims-to-proof/PLAN.md`.
- **Released in:** 0.3.11 for the missing-reference repair (`4053954`); 0.3.14 for the proof-claim guidance (`e710426`). Verified by first containing tags `v0.3.11` and `v0.3.14`.
- **Watch start:** 2026-09-12, release 0.3.13, Pygardon plan 113 retrospective
  recorded at `f12fcc91`; successful bounded process logging establishes use of
  the repaired retrospective dependency after 0.3.11.
- **Review after:** 2026-09-19.
- **Last assessed:** 2026-09-17; all three current logs checked. Later
  retrospective records demonstrate continued use without this missing-file
  mechanism, but the seven-day window has not elapsed.

### Occurrences

- Execution: `.planning/quick/111-ibkr-companion-session-proof/PLAN.md at 2bc034868`
  - Source: Pygardon / DD-006; canonical `DearDough.md` occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: modified; revision `995bcbed2`; base 0.3.9
  - Evidence: `dough-execution-retrospective/SKILL.md` required
    `references/bounded-process-log.md`; tag `v0.3.9` contained that file but
    its `install.sh` omitted it from `managed_files`, and an ordinary update
    reported both local skill roots current without restoring it.
  - Observed effect: The retrospective could identify findings but could not
    perform its required bounded write until the release copy was restored
    explicitly in both roots.
  - Inference: Following intra-skill references in release completeness checks,
    or generating the manifest from the shipped tree, would prevent this
    false-current state more reliably than a hand-maintained list.

## ODF-007 — Implementation agents fail to await their own background verification

- **Meaning:** An implementation agent that ends its turn before its own background test completes leaves the required pass/fail result unreported and shifts verification back to the coordinator.
- **Source mappings:** Doughnut Project / DD-001
- **References:** Doughnut Project historical `DearDough.md`, DD-001; releases 0.3.8 and 0.3.13; executions `5ed11cd8e0` and `a6fcddacad`; response `c8d2fd0`.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** Delegated verification is owned through its terminal result,
  with an explicit incomplete stop otherwise. Story 22 and plan recoverable at
  `ce417d2:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and
  `ce417d2:.planning/quick/048-complete-delegated-handoffs/PLAN.md`.
- **Released in:** 0.3.18 (`c8d2fd0`; first containing tag `v0.3.18`).
- **Watch start:** 2026-09-16, release 0.3.22, Doughnut plan 129 at
  `473550c16e`; repeated implementation/refactor delegation completed with no
  recorded premature wait return.
- **Review after:** 2026-09-23.
- **Last assessed:** 2026-09-17; all three current logs checked. Relevant use is
  only one day old.

### Occurrences

- Execution: `SEED-017 Story 1 / quick-099-receive-compatible-accepted-history / 5ed11cd8e0`
  - Timestamp: unknown
  - Source: Doughnut Project / DD-001; first historical occurrence
  - Tool: Claude Code
  - Open Dough release: 0.3.8
  - Evidence: The slice 4 agent twice returned while its Vitest run was still
    in progress; the coordinator ran the test directly and obtained 95/95 pass.
  - Observed effect: Two extra coordinator round-trips before wrap-up.

- Execution: `SEED-018 story 3 / quick/108-publish-notebook-edits-faster / a6fcddacad`
  - Timestamp: unknown
  - Source: Doughnut Project / ODF-007; second historical occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.13
  - Evidence: Implementation and refactor agents returned three times with
    “waiting” reports before later returning actual test results.
  - Observed effect: Three extra coordinator round-trips.

## ODF-028 — Preservation proof omits the physical predecessor store

- **Meaning:** A preservation claim names a logical profile but omits physical source/destination and predecessor identity, allowing continuity inside a new store to be reported as migration from an older store.
- **Source mappings:** Pygardon / DD-027
- **References:** Pygardon historical `DearDough.md`, DD-027; `d09f0a6ae`; response `0dbff99`.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** Proof ownership now identifies installation, physical store,
  and predecessor relationship, distinguishing same-store continuity from
  transfer. Story 21 and plan recoverable at
  `818a4f1:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and
  `818a4f1:.planning/quick/047-cover-actual-user-outcome/PLAN.md`.
- **Released in:** 0.3.18 (`0dbff99`; first containing tag `v0.3.18`).
- **Watch start:** 2026-09-16, release 0.3.23, Pygardon production-database
  transfer plan 142 at `9152848a8`; the story exercised physical predecessor
  and destination transfer proof.
- **Review after:** 2026-09-23.
- **Last assessed:** 2026-09-17; all three current logs checked. Relevant use is
  one day old; no same preservation-identity recurrence is recorded.

### Occurrences

- Execution: `.planning/quick/112-automatic-tag-release-update/PLAN.md @ d09f0a6ae`
  - Timestamp: unknown
  - Source: Pygardon / DD-027; historical canonical occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.14
  - Evidence: Proof showed continuity inside the new `pygardon-data` volume but
    the report called it production preservation without identifying the intact
    native store containing roughly 22 GB.
  - Observed effect: Missing native-to-Docker migration surfaced only at final
    owner feedback.

## ODF-036 — Completed delegated work leaves stale background watches

- **Meaning:** A delegated agent returns complete results but leaves per-command watches that later notify the coordinator with stale, already-reported timeouts.
- **Source mappings:** Doughnut Project / DD-019
- **References:** Doughnut Project historical `DearDough.md`, DD-019; `691e7be961`; response `bad3aae`.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** Delegation bounds owned watch lifetime to the verification
  obligation and accounts for unread evidence before retirement. Story 22 and
  plan recoverable at `ce417d2:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md`
  and `ce417d2:.planning/quick/048-complete-delegated-handoffs/PLAN.md`.
- **Released in:** 0.3.18 (`bad3aae`; first containing tag `v0.3.18`).
- **Watch start:** 2026-09-16, release 0.3.22, Doughnut plan 129 at
  `473550c16e`; repeated delegated proof/refactor work recorded no stale
  post-completion notifications.
- **Review after:** 2026-09-23.
- **Last assessed:** 2026-09-17; all three current logs checked. Relevant use is
  one day old.

### Occurrences

- Execution: `SEED-018 story 5 / quick/112-publish-additions-with-simpler-title-check / 691e7be961`
  - Timestamp: unknown
  - Source: Doughnut Project / DD-019; historical canonical occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.14
  - Evidence: Seven benchmark watches fired stale timeout notifications after
    the agent had returned their complete results.
  - Observed effect: Seven extra coordinator turns interleaved with unrelated
    refactor work.

## ODF-041 — Required pre-change baseline is deferred until final acceptance

- **Meaning:** Implementation starts before a plan-mandated full-suite baseline and environment record, leaving final comparison dependent on reconstructing the original state later.
- **Source mappings:** Pygardon / DD-042
- **References:** Pygardon historical `DearDough.md`, DD-042; `b1c3b5c83`; response `b383f63`.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** A pre-change observation is now an explicit prerequisite to the
  dependent change, with comparable retained evidence allowed and missing proof
  stopping only the affected path. Story 21 and plan recoverable at
  `818a4f1:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and
  `818a4f1:.planning/quick/047-cover-actual-user-outcome/PLAN.md`.
- **Released in:** 0.3.18 (`b383f63`; first containing tag `v0.3.18`).
- **Watch start:** 2026-09-14, release 0.3.18, Pygardon plan 132 at
  `c4efd7b5c`; its required full baseline ran before implementation, with the
  environment failure diagnosed and corrected first.
- **Review after:** 2026-09-21.
- **Last assessed:** 2026-09-17; all three current logs checked. No same late
  baseline recurrence is recorded; only three days have elapsed.

### Occurrences

- Execution: `.planning/quick/127-fast-service-and-packaged-tests/PLAN.md @ b1c3b5c83`
  - Timestamp: unknown
  - Source: Pygardon / DD-042; historical canonical occurrence
  - Tool: Claude Code
  - Model: claude-sonnet-5
  - Open Dough release: 0.3.16
  - Evidence: The required full baseline was absent until final acceptance,
    when the original checkout happened to remain at the pre-slice revision.
  - Observed effect: Before/after proof depended on late reconstruction.

## ODF-043 — Proof serialization mismatches require report-only retries

- **Meaning:** Completed delegated work returns sufficient proof in a noncanonical schema, causing retries solely to reformat the handoff.
- **Source mappings:** Doughnut Project / DD-038
- **References:** Doughnut Project historical `DearDough.md`, DD-038; `2be6138738`; response `a04e5a8`.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** The proof block is an example representation; proof acceptance
  now accepts equivalent complete substance and still blocks missing evidence.
  Story 22 and plan recoverable at
  `ce417d2:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md` and
  `ce417d2:.planning/quick/048-complete-delegated-handoffs/PLAN.md`.
- **Released in:** 0.3.18 (`a04e5a8`; first containing tag `v0.3.18`).
- **Watch start:** 2026-09-16, release 0.3.22, Doughnut plan 129 at
  `473550c16e`; repeated delegated handoffs recorded no format-only retry.
- **Review after:** 2026-09-23.
- **Last assessed:** 2026-09-17; all three current logs checked. Relevant use is
  one day old.

### Occurrences

- Execution: `SEED-009 story 29 / quick/115-web-note-trash-and-undo / 2be6138738`
  - Timestamp: unknown
  - Source: Doughnut Project / DD-038; historical canonical occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.16
  - Evidence: Slices 6 and 7 required three report-only follow-ups for custom or
    near-matching proof schemas despite unchanged substantive results.
  - Observed effect: Three coordinator-agent round-trips added no evidence.

## ODF-045 — Dominant query purpose hides incompatible production callers

- **Meaning:** Consumer analysis assigns a shared query its dominant storage purpose instead of classifying each production caller, leaving an incompatible caller uncovered.
- **Source mappings:** Doughnut Project / DD-040
- **References:** Doughnut Project historical `DearDough.md`, DD-040; `2be6138738`; response `a13ccab`.

- **Status:** Near-term watch; released response, no recorded post-fix recurrence of this mechanism; effectiveness unverified.
- **Response:** Proof ownership now inspects affected production call sites and
  derives obligations per incompatible caller purpose. Story 21 and plan
  recoverable at `818a4f1:.planning/seeds/SEED-004-extract-and-adopt-project-guidance.md`
  and `818a4f1:.planning/quick/047-cover-actual-user-outcome/PLAN.md`.
- **Released in:** 0.3.18 (`a13ccab`; first containing tag `v0.3.18`).
- **Watch start:** 2026-09-16, release 0.3.22, Doughnut plan 129 at
  `473550c16e`; its consumer assessment explicitly separated web, Git, note,
  folder, and reference-rewrite caller purposes.
- **Review after:** 2026-09-23.
- **Last assessed:** 2026-09-17; all three current logs checked. Relevant use is
  one day old and no same dominant-purpose omission is recorded.

### Occurrences

- Execution: `SEED-009 story 29 / quick/115-web-note-trash-and-undo / 2be6138738`
  - Timestamp: unknown
  - Source: Doughnut Project / DD-040; historical canonical occurrence
  - Tool: Codex
  - Model: GPT-5
  - Open Dough release: 0.3.16
  - Evidence: Consumer analysis classified a shared query for Git retention but
    missed `LearningSessionService.record`, which graded trashed notes.
  - Observed effect: All planned suites passed and a correction plan was needed.
