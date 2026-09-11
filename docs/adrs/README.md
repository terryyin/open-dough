# Architectural Decision Records (ADRs)

Open Dough records durable architectural choices here so contributors and AI
agents can understand the decisions and their reasoning. Humans propose,
discuss, and approve decisions; agents read, cite, and help maintain the records.

## When to write an ADR

Use an ADR for a cross-cutting choice, a decision that is hard to reverse, or a
question likely to recur. Keep delivery plans and local implementation details
separate from these long-lived decisions.

## Advice process

Anyone may make a decision after seeking advice from affected people and others
who want to contribute. Consultation is required; consensus, a committee vote,
and a separate architect approval are not. The human decision maker owns the
outcome and communicates it.

1. Create `NNNN-short-title.md` using the next sequential four-digit number.
   Start with a title, Status `Proposed`, Date, Decision makers, and Consulted,
   followed by Context, Decision, and Consequences sections. Add Pros, Cons,
   Prerequisites / Assumptions, or Related sections when useful.
2. Announce the draft and invite advice from affected or interested people.
3. Discuss significant questions and make trade-offs explicit.
4. The human decision maker accepts or rejects the proposal. Update its Status
   and rename it to `NNNN-short-title-accepted.md` or
   `NNNN-short-title-rejected.md`.
5. Communicate the outcome and update the index below.
6. To replace an accepted decision, write a new ADR, mark the old one
   `Superseded by ADR-NNNN` with a link, and update the index. Preserve the old
   record and its filename as history.

## Status and agent use

| Status | Meaning |
| --- | --- |
| Proposed | Draft for advice; not binding |
| Accepted | Current recommendation for contributors and agents |
| Rejected | Declined proposal retained with its reasoning |
| Superseded | Historical decision replaced by a linked newer ADR |

Only humans authorize acceptance, rejection, or supersession. Agents may draft
text when requested and perform maintenance on a human's behalf.

For architectural work, agents read this index and relevant Accepted ADRs,
follow and cite those decisions, and surface conflicts. Follow supersession
links to the current decision; an old `-accepted.md` filename does not override
a Superseded status. Proposed and Rejected records are not current guidance.

Accepted ADRs are recommendations that allow context-sensitive judgment.
Deviations require an explicit human-owned exception with a recorded reason,
or a superseding ADR. Agents must not silently override a decision.

## Index

| ADR | Status | Title |
| --- | --- | --- |
| [0000](./0000-use-adrs-accepted.md) | Accepted | Use Architectural Decision Records (ADRs) |
| [0001](./0001-ubiquitous-language-accepted.md) | Accepted | Ubiquitous language |
| [0002](./0002-software-development-lifecycle-principles-accepted.md) | Accepted | Software development lifecycle principles |
| [0003](./0003-tagged-release-versioning-accepted.md) | Accepted | Release lifecycle and versioning |
| [0004](./0004-client-installation-and-update-accepted.md) | Accepted | Client installation and update |
| [0005](./0005-cross-tool-validation-accepted.md) | Accepted | Cross-tool validation through native acceptance stories |
| [0006](./0006-write-skills-for-executing-agents-accepted.md) | Accepted | Write skills for executing agents |
