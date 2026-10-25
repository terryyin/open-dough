# Source-only review return (slice 1 acceptance)

Launch: fresh general-purpose agent, no conversation inheritance, told to use
only the supplied text, read no project files and change nothing. Input: the
correction story's Goal and Scope (SEED-010#source-review-record-lifecycle)
plus this plan's Goal and scope, Current findings, and Preserved promises and
constraints; no slicing, proof table, decisions, return or product.

## Goal and scope commitments

| Id | Individual commitment | Qualifications / examples |
|---|---|---|
| C1 | One consistent rule for **when to link** the record | F1: planning.md element 7 "may add" vs wrap-up.md requires |
| C2 | Same rule covers **when to allocate** commitments | F2 |
| C3 | Same rule covers **when to observe** commitments | F3 done-slice rows |
| C4 | The gate refuses a **skipped** record | F1 sibling `source-review.md` without link |
| C5 | The gate refuses a **mislinked** record | F1 `**Source Review:**` |
| C6 | The comparison cannot be bypassed by omission | F1 |
| C7 | The comparison is not blocked before its first acceptance | F2 |
| C8 | The correction plan records findings, preserved promises and proof | record location |

## Finding-derived commitments

| Id | Individual commitment | Qualifications / examples |
|---|---|---|
| C9 | Exact sibling `source-review.md` without a link no longer passes silently | bounded by C32 |
| C10 | A near-miss link label no longer silently disables the gate | `**Source Review:**` is one example, not the full set |
| C11 | `planning.md` and `wrap-up.md` state the same link requirement | which wording wins is open |
| C12 | Documented allocation timing and `unallocated-commitment` refusal agree | fix in guidance or gate is open; bounded by C31 |
| C13 | A review linked at execution start does not block the next delegation merely for unallocated commitments | before first acceptance |
| C14 | A replacement after an amendment does not block the next delegation merely for unallocated commitments | before first acceptance |
| C15 | Guidance names which slice owns a whole-story commitment | rows owned by `story` refused in every native round |
| C16 | Guidance says done-slice rows cite earlier recorded proof | reuse promise |
| C17 | Done-slice rows citing earlier proof are not withheld as unobserved | |
| C18 | `drift` evidence identity includes the three story-obligation scripts | already has fixtures and `story-obligations.md` |
| C19 | Installed-input capture covers the three scripts and `story-obligations.md` | |
| C20 | Documented `unallocated-commitment` matches code incl. dangling `slice N` beside a valid obligation | bounded by C31 |
| C21 | Gate checks an obligation's `Commitment:` against rows pointing to it (mismatch and absent) | |
| C22 | Refusals name the correct commitments | |
| C23 | `Link` bullet presents the field as optional | |
| C24–C27 | Tests for `duplicate-commitment`, malformed `Commitment:`, missing separator row, duplicate `## Commitments` | |
| C28 | Plan-quote and receiving-at-its-slice cases not duplicated; coverage kept | which file keeps them is open |

## Preserved promises

| Id | Commitment |
|---|---|
| C29 | No store beyond reviewer return and the plan's obligation and acceptance records |
| C30 | No semantic completeness checker |
| C31 | Existing refusals keep their meaning |
| C32 | Plans without a source review keep today's results, except exact sibling `source-review.md` or a near-miss label |
| C33a–d | Receiving, quoted-exclusion, human-amendment and reused-proof ownership stay settled |
| C34 | The human-judgment stop is preserved |

Exclusions: E1 semantic completeness checker; E2 second promise registry; E3
migrating legacy plans; E4 Cursor follow-through; E5 release or rollout; E6 any
new feature promise.
