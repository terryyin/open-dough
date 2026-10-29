# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `.planning/slice-plans/374-consumer-handoff-trial/ASSESSOR-BRIEF.md` | changed path |
| `ASSESSOR-BRIEF.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/ASSESSOR-BRIEF.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A-RESULT.md` | changed path |
| `CALIBRATION-A-RESULT.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A-RESULT.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A.md` | changed path |
| `CALIBRATION-A.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B-RESULT.md` | changed path |
| `CALIBRATION-B-RESULT.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B-RESULT.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B.md` | changed path |
| `CALIBRATION-B.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-COMMON.md` | changed path |
| `CALIBRATION-COMMON.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-COMMON.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-RECEIPT.md` | changed path |
| `CALIBRATION-RECEIPT.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-RECEIPT.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-TRACE.md` | changed path |
| `CALIBRATION-TRACE.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-TRACE.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/PACKET-RULES.md` | changed path |
| `PACKET-RULES.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/PACKET-RULES.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF-V1.md` | changed path |
| `REVIEWER-BRIEF-V1.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF-V1.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF.md` | changed path |
| `REVIEWER-BRIEF.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/TRIAL-LEDGER.md` | changed path |
| `TRIAL-LEDGER.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/TRIAL-LEDGER.md` |

## Scope

Whole checkout at `9f5bf344ec08`, including uncommitted and untracked files: 4104 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `.planning/slice-plans/374-consumer-handoff-trial/ASSESSOR-BRIEF.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A-RESULT.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B-RESULT.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-COMMON.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-RECEIPT.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-TRACE.md`, `.planning/slice-plans/374-consumer-handoff-trial/PACKET-RULES.md`, `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF-V1.md`, `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF.md`, `.planning/slice-plans/374-consumer-handoff-trial/TRIAL-LEDGER.md`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

none found

### Test

none found

### Test support or stand-in

none found

### Journey or feature

none found

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/slice-plans/374-consumer-handoff-trial/PLAN.md` | `TRIAL-LEDGER.md` | 226: `[Trial ledger](TRIAL-LEDGER.md) owns screenings, calibration, timing and remaining budget.` | reused: inspected PLAN navigation link to this ledger; record identity and target exist, coordinator owns readiness/completion proof |

## Scope, inspection and provenance

This final owned-path pass uses the normal installed consumer-trace.mjs with
--checkout plus one --path for each of the twelve owned artifact names below.
The checkout source base reported by the script is claim
9f5bf344ec08f6160886c4e2f9a14e015f771bf9. No narrow population replaces the initial
whole-change observation: /tmp/consumer-handoff-calibration-trace.md retains the
initial seven-file --base pass (64 lines, no located consumers). A later --base
pass at /tmp/consumer-handoff-calibration-trace-final.md includes parent-owned
PLAN/source-review changes and 426 lines of generic matches; it is unreconciled,
not a completed exclusion table. Coordinator owns that broader changed-file scope.

Owned paths: PACKET-RULES.md, REVIEWER-BRIEF.md, REVIEWER-BRIEF-V1.md,
ASSESSOR-BRIEF.md, CALIBRATION-COMMON.md, CALIBRATION-A.md, CALIBRATION-B.md,
TRIAL-LEDGER.md, CALIBRATION-TRACE.md, CALIBRATION-A-RESULT.md,
CALIBRATION-B-RESULT.md, CALIBRATION-RECEIPT.md (all beside this record).
Their mutual references were manually inspected: A/B use identical common data;
brief v1 remains frozen; assessor stays hidden; outputs/receipts retain provenance.
No runtime or published guidance effect, no new application tests warranted.
The single located PLAN link is navigation, with its actual role above. No
per-path automated category labels or historical semantic-review claim is made.

## Additive final documentary-effect trace

The first trace above is preserved. This later invocation includes all twelve
trial-material files after outputs and corrected scoring were added; its three
consumers were inspected individually. PLAN/source-review are execution metadata,
whose links and record grammar were checked, not changes to generic plan schemas
or runtime guidance. CASE-TEMPLATE was already landed and unchanged.

The exploratory whole-increment `--base` scan is separately retained, unchanged,
at `/tmp/consumer-handoff-calibration-trace-final.md`, SHA-256 `e28b7b3446257374bb35e381ab4bb83d65e04b2baacc0f0e43316c8f1f4d423d`.
It includes generic PLAN.md/source-review.md lexical mentions across unrelated
records and runtime parsers. Their semantic coverage was not inspected; no claim
of their exclusion or complete semantic review follows from that diagnostic. It
is not a prospective case population or the accepted changed-contract trace.
No generic plan/reader contract changed in this documentary increment.

Final command: installed `consumer-trace.mjs --checkout <owned checkout>` with
one `--path` for each of the twelve trial-material files below; exit 0.

# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `.planning/slice-plans/374-consumer-handoff-trial/ASSESSOR-BRIEF.md` | changed path |
| `ASSESSOR-BRIEF.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/ASSESSOR-BRIEF.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A-RESULT.md` | changed path |
| `CALIBRATION-A-RESULT.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A-RESULT.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A.md` | changed path |
| `CALIBRATION-A.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B-RESULT.md` | changed path |
| `CALIBRATION-B-RESULT.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B-RESULT.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B.md` | changed path |
| `CALIBRATION-B.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-COMMON.md` | changed path |
| `CALIBRATION-COMMON.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-COMMON.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-RECEIPT.md` | changed path |
| `CALIBRATION-RECEIPT.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-RECEIPT.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-SCORING.md` | changed path |
| `CALIBRATION-SCORING.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-SCORING.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/PACKET-RULES.md` | changed path |
| `PACKET-RULES.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/PACKET-RULES.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF-V1.md` | changed path |
| `REVIEWER-BRIEF-V1.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF-V1.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF.md` | changed path |
| `REVIEWER-BRIEF.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF.md` |
| `.planning/slice-plans/374-consumer-handoff-trial/TRIAL-LEDGER.md` | changed path |
| `TRIAL-LEDGER.md` | basename of `.planning/slice-plans/374-consumer-handoff-trial/TRIAL-LEDGER.md` |

## Scope

Whole checkout at `9f5bf344ec08`, including uncommitted and untracked files: 4105 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `.planning/slice-plans/374-consumer-handoff-trial/ASSESSOR-BRIEF.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A-RESULT.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B-RESULT.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-COMMON.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-RECEIPT.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-SCORING.md`, `.planning/slice-plans/374-consumer-handoff-trial/PACKET-RULES.md`, `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF-V1.md`, `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF.md`, `.planning/slice-plans/374-consumer-handoff-trial/TRIAL-LEDGER.md`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

none found

### Test

none found

### Test support or stand-in

none found

### Journey or feature

none found

### Guidance reader

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-TRACE.md` | `.planning/slice-plans/374-consumer-handoff-trial/ASSESSOR-BRIEF.md`, `ASSESSOR-BRIEF.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A-RESULT.md`, `CALIBRATION-A-RESULT.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-A.md`, `CALIBRATION-A.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B-RESULT.md`, `CALIBRATION-B-RESULT.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-B.md`, `CALIBRATION-B.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-COMMON.md`, `CALIBRATION-COMMON.md`, `.planning/slice-plans/374-consumer-handoff-trial/CALIBRATION-RECEIPT.md`, `CALIBRATION-RECEIPT.md`, `.planning/slice-plans/374-consumer-handoff-trial/PACKET-RULES.md`, `PACKET-RULES.md`, `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF-V1.md`, `REVIEWER-BRIEF-V1.md`, `.planning/slice-plans/374-consumer-handoff-trial/REVIEWER-BRIEF.md`, `REVIEWER-BRIEF.md`, `.planning/slice-plans/374-consumer-handoff-trial/TRIAL-LEDGER.md`, `TRIAL-LEDGER.md` | 7: `` \| `.planning/slice-plans/374-consumer-handoff-trial/ASSESSOR-BRIEF.md` \| changed path \| `` |reused: inspected retained original trace and this additive record; records search provenance only, and original fixture/probe bytes stay unchanged |
| `.planning/slice-plans/374-consumer-handoff-trial/PLAN.md` | `CALIBRATION-SCORING.md`, `REVIEWER-BRIEF.md`, `TRIAL-LEDGER.md` | 226: `[Trial ledger](TRIAL-LEDGER.md) owns screenings, calibration, timing and remaining budget.` |run: inspected ledger navigation and G1 proof references; actual story-obligations check --slice 1 accepts this plan and source-review record |
| `.planning/slice-plans/374-consumer-handoff-trial/source-review.md` | `CALIBRATION-RECEIPT.md`, `CALIBRATION-SCORING.md` | 23: `\| 7 \| Qualification: Use the existing ODF-150 assessment for scoring calibration only; it supplies no trial outcomes. \| slice 1 \|observed: CALIBRATION-RECEIPT.…` |run: inspected slice-1 observations against original reports and CALIBRATION-SCORING; actual story-obligations check --slice 1 validates their linkage |
