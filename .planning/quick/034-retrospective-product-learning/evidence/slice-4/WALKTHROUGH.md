# Slice 4 behavior walkthrough

Candidate: skill after authorized-maintenance allowance. Date: 2026-09-10.
Did not mutate the project's real `.planning/PRODUCT-BACKLOG.md`.

## Authorized journey

**Input.** Fixture `evidence/slice-4/authorized/` with established maintenance
authority. Learning: a smaller retry outcome serves the export direction;
forecast charts are unrelated; the format-doc story should mention the
null-date column; an active crash-follow-up plan exists.

**Applied** (following `dough-product-backlog`):
- Added understood story "Retry failed billing exports" (SEED-C) with
  beneficiary and evaluable outcome; placed first.
- Removed "Add forecast charts" from the queue; `seeds/SEED-A.md` remains.
- Updated SEED-B canonical scope to include the null invoice-date column.
- Direction text unchanged. Recently done crash story preserved. Active
  `plans/001-retry.md` was not cancelled.

Exact diffs vs the unauthorized starting copy are in that pair of fixture
trees (PRODUCT-BACKLOG.md and `seeds/SEED-B.md`). SEED-A is present in both.

## Unauthorized counterpart

**Input.** Same starting files in `evidence/slice-4/unauthorized/`,
recommendations-only authority.

**Result.** Concrete proposal only: same reorder/add/remove/detail changes
described, files left at the starting copy. No second permission ceremony.

## Disputed / conflicting priorities

**Input.** `evidence/slice-4/disputed/` plus two conflicting explicit orders
("charts first" vs "docs first").

**Result.** Unresolved. Files unchanged. No silent reorder.

## Destinations

Real project backlog and direction were not opened for write. No
implementation of the retry story.
