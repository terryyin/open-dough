---
name: acme-change-readiness
description: Review an Acme change proposal before implementation. Use when someone asks whether an Acme change is ready to build.
---

# Review Acme change readiness

1. Read the supplied change proposal. Do not implement it.
2. Identify the affected user, the intended outcome, the main failure risk, and
   a rollback signal.
3. Require an `ACME-NNN` work-item reference. If it is missing, report that the
   Acme intake convention is not satisfied rather than inventing an identifier.
4. Return a compact readiness brief with `User`, `Outcome`, `Risk`, `Rollback`,
   and `Missing context` headings.
5. Label the proposal `ready for human review` only when every heading has
   concrete content and the Acme work-item reference is present. The human
   maintainer owns the final approval and any exception.
