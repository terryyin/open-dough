# Near-term watch list

Internal Open Dough findings with released responses and no recorded post-fix
recurrence of the same mechanism in the evidence assessed on 2026-09-14.
These identities moved from [finding names](finding-names.md); their codes remain
allocated. Preserve their evidence and former source mappings when matching new
feedback. Related symptoms alone do not establish recurrence of these identities.

The harvested executions extend through Open Dough 0.3.16. Absence of a recorded
recurrence does not establish effectiveness or a known number of successful uses.
Unknown-release cases (ODF-013 and ODF-023) remain in finding names. The 0.3.17
changes excluded as too early to judge are not watch-list entries.

On the owner's instruction, matching entries were removed from current source
DearDough logs where present; source locators below describe historical reports.
The catalog evidence is retained here. ODF-011 was already absent from Doughnut's
current log. Open Dough's own log contained none of these three identities.

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
