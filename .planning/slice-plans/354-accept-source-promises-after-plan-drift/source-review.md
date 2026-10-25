# Source review — SEED-010#accept-source-promises-after-plan-drift

Launch: fresh general-purpose reviewer (no fork/resume/inheritance), execution of plan 354,
candidate e099f7db. Input: the story section's Goal, Scope (required behavior, Preserved,
Rejection constraint, Deferred promises, Boundary assumptions) and Key examples, verbatim
from `.planning/seeds/SEED-010-learn-from-execution-retrospectives.md` (lines 257–372 at
e099f7db). Instruction: use only these inputs, read no files, change nothing; number every
commitment and each item of a compound commitment; preserve alternatives; derive promises,
not slice ownership or acceptance. No plan, return, product or proof supplied.

## Returned commitments (as returned)

### Goal
- S1 — developer receives the promised behavior or an explicit human decision before the slice is delivered, instead of a correction story after the retrospective.
- S2 — acceptance disposes of each commitment the independent source-only reviewer returned, so a plan decision cannot stand in for the source.
- S3 — the comparison is retained where the existing delivery gate can refuse an incomplete one.

### Retained numbered reviewer return
- S4 — return retained per execution. S4a — numbered form, each commitment addressable. S4b — each item of a listed compound commitment addressable (4a's six filters). S4c — at a location the plan names.
- S5 — reusing an unchanged source's return across slices stays allowed.
- S6 — a story amendment requires a fresh review.

### Disposition at acceptance
- S7 — at each slice's acceptance, before delivery, every returned commitment has exactly one recorded disposition. S7a — observed at this slice with product or proof location. S7b — receiving a named later slice. S7c — excluded by a quoted story exclusion or explicit human amendment.
- S8 — none of these is a disposition: S8a plan Current decision; S8b slice text; S8c proof-table row; S8d implementer statement; S8e owner-decision label.
- S9 — a narrowed or omitted commitment surfaces as a mismatch. S9a — returned to the slice when its output already owes the promise. S9b — stopped for human judgment when the plan's decision claims a domain reason the story does not record.

### Delivery gate
- S10 — the existing story-obligations delivery gate refuses the slice: S10a while a returned commitment lacks a disposition; S10b while its disposition cites a plan statement.
- S11 — a receiving allocation must be observed or excluded at the named slice, so a false later-slice allocation is caught there, before completion.
- S12 — existing refusals keep their meaning: S12a unquoted exclusion; S12b dangling receiving slice.
- S13 — the reviewer return and the plan's existing obligation and acceptance records are the only stores. S13a no second promise registry. S13b no semantic completeness checker.

### Legitimate ownership preserved
- S14 — S14a a commitment whose output does not exist yet is received by the later slice; S14b a quoted story exclusion or explicit human amendment settles it; S14c sufficient recorded proof is reused, not rerun for process.

### Controlled replays
- S15 — replayed as controlled fixtures with matching actor knowledge: S15a the recorded plan 412 mismatch; S15b a legitimate human amendment.
- S16 — fixture inputs: S16a the story; S16b the narrowed plan; S16c the implementer return; S16d a product whose excluded list lacks the two reasons; S16e green narrowed tests.
- S17 — neither reviewer nor coordinator is told what is missing.
- S18 — credential-free discriminators and assessor counterexamples run first.
- S19 — developer-run native rounds follow.
- S20 — S20a the correction catches the plan 412 mismatch replay; S20b it proceeds on the amendment replay.

### Completion record at ODF-139
- S21 — S21a the assessment; S21b the actual response revision; S21c the containing release (pending unless evidenced); S21d accepted replays per host with limits; S21e acceptance burden observed (records written, rounds added); S21f first ordinary-use criterion (first eligible acceptance after adoption whose plan's Current decisions or proof rows narrow a returned commitment); S21g no effectiveness claim.

### Preserved
- S22 — 0.3.67 source-only review: S22a fresh reviewer; S22b source and human amendments only.
- S23 — 0.3.58 obligations record: S23a quote checks; S23b delegation gate; S23c delivery gate; S23d completion gate.
- S24 — planning's proof-ownership mapping. S25 — the human-judgment stop. S26 — slice sizing.

### Rejection constraint
- X1 — the gate refuses a disposition that cites a plan statement for a returned commitment (planning: a plan does not decide story scope; acceptance: source and human amendments outrank plan and return).

### Deferred promises
- X2 planning-side Current-decisions vs Scope check; X3 reviewer reading product code; X4 repairing historical products; X5 release or cross-project rollout; X6 general compliance or rate claim from the replays.

### Boundary assumptions
- A1 numbered return is the unit of comparison; A2 coordinator still judges applicability and observation; A3 controlled replay establishes the seam under current host CLIs, not a rate; A4 native rounds are paid and developer-run; A5 next bounded response at ODF-139 after the 0.3.67 review.

### Key examples
- K1 recorded mismatch: K1a inputs (six reasons in Scope; Current decisions keep held/ordered in history; slice 4 return adds two reasons, says held/ordered untouched; five-dimension product; narrowed tests pass; reviewer returned 4a with six items); K1b held/ordered items have no observation and no story exclusion at slice 4; K1c gate refuses until each is observed, received, or excluded with a quote; K1d coordinator returns the two reasons to the slice or stops for the human; K1e other items and key example 3 keep accepted proof.
- K2 legitimate amendment: K2a same inputs plus the owner's amendment deferring "already held" and "already ordered" to the later history story; K2b the two items are excluded with that quoted amendment and the slice is delivered; K2c no work invented.
- K3 later owner: K3a "receiving slice 7" at slice 1, gate accepts slice 1; K3b at slice 7 observed or returned.
- K4 plan statement: K4a disposition "excluded: plan Current decisions keep held and ordered in history"; K4b gate refuses, naming the commitment and that a plan decision is neither a story exclusion nor a human amendment.
- K5 reused proof: K5a slice 2 observation with boundary unchanged by slice 4 is kept; no rerun requested.
- K6 baseline: K6a narrowed replay run once on the observed host under current guidance; K6b reproduces acceptance of the plan-scoped result, or K6c records non-reproduction, which stops the dependent remedy and reassesses the plan.
- K7 completion record: K7a assessment; K7b response revision; K7c replay outcomes per host with limits; K7d measured added records and rounds; K7e release state; K7f first-use criterion; K7g no effectiveness claim.

Reviewer note: K6 appears only as a key example, with no separate Scope clause.

## Fresh review after the 2026-10-25 human amendment

Launch: fresh general-purpose reviewer, no inheritance; input = the amended
story section's Goal, Scope (with the Cursor amendment) and Key examples from
`.planning/seeds/SEED-010-learn-from-execution-retrospectives.md`; same
instructions as above. The return renumbers the same commitments (G1–G3,
S1a–S6g, P1–P5, R1, D1–D5, B1–B4, K1–K7) and adds:

- H1a — "Cursor follow-through is a known limit of this structural response"
- H1b — "On Cursor the narrowed replay is recorded with its outcome"
- H1c — "the correction is not required to catch it there" (qualifies S5g, "The correction catches the former")
- H1d — "ODF-139 records the limit"

No other commitment changed, so earlier slices' accepted comparisons stand.
