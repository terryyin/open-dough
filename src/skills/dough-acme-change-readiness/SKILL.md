---
name: dough-acme-change-readiness
description: Review a change proposal before implementation. Use when someone asks whether a change is ready to build, or when preparing a readiness brief for human approval.
---

# Review change readiness

1. Read the supplied change proposal. Do not implement it.
2. Identify the affected user, the intended outcome, the main failure risk, and
   a rollback signal.
3. Require a work-item reference that matches the adopter's declared convention
   (for example `TASK-NNN`). If it is missing, report that the intake convention
   is not satisfied rather than inventing an identifier.
4. Return a compact readiness brief with `User`, `Outcome`, `Risk`, `Rollback`,
   and `Missing context` headings.
5. Label the proposal `ready for human review` only when every heading has
   concrete content and the required work-item reference is present. The human
   maintainer owns the final approval and any exception.

## Required adopter context

- The work-item identifier convention used by the adopting project.
