---
id: SEED-005
status: dormant
planted: 2026-09-06
planted_during: Retrospective feedback idea capture
trigger_when: Designing retrospective skills or cross-project feedback for Open Dough adopters
scope: unknown
---

# SEED-005: Dear Do retrospective feedback mailbox

## Why This Matters

Open Dough can improve from problems observed in the projects that actually use
it, but those observations currently risk staying inside each client project.
A durable, version-aware feedback trail would let maintainers see repeated
failures, recognize regressions, and learn when guidance has become unnecessary.

## Core Idea

When a project with Open Dough installed runs a retrospective skill, the skill
should append a letter to a repository-local mailbox in that project's
`.planning/` directory. The suggested mailbox name is **Dear Do**, treating each
entry as a letter from the adopting project back to Open Dough.

Each retrospective letter should preserve at least:

- the finding or problem;
- the occurrence and enough context to recognize it again; and
- the Open Dough version in use when it occurred.

The Open Dough repository could maintain a list of participating client
projects and listen to their Dear Do mailboxes. This creates a feedback channel
without requiring Open Dough to address every report immediately.

## Tracking Loop

Open Dough may respond to a reported pattern by suggesting a stable code name
for the client project's issue title. That code name can connect occurrences
across projects and over time so maintainers can track:

- how often the problem occurs and in which versions;
- whether and when it was addressed;
- whether the same problem reappears after a fix; and
- whether a change reduces the problem across client projects.

The historical record can become a long-term regression corpus. It should make
an already-fixed failure recognizable if it returns instead of treating every
occurrence as a new, unrelated retrospective observation.

## Instruction Removal Experiments

The same feedback loop could support deliberate simplification. Open Dough could
remove or relax selected instructions, then use subsequent Dear Do letters and
their version history to assess whether the removal was safe. A lack of known
regressions over an appropriate observation period could provide evidence that
an instruction is no longer needed; a matching recurrence would argue for
restoring or replacing it.

## Design Questions for Later

- Exact path and format for the Dear Do mailbox, including whether it is one
  append-only file such as `.planning/DEAR-DO.md` or a directory of letters.
- How client projects opt in, how Open Dough discovers them, and whether
  listening is pull-based, scheduled, or explicitly invoked.
- What information may safely leave a client repository and how sensitive
  project context is redacted before aggregation.
- Who assigns code names, how reports are matched without collapsing distinct
  problems, and how fixed and regressed states are represented.
- How version ranges, local modifications, and update history affect attribution.
- What evidence and observation window are sufficient before declaring an
  instruction safe to remove.
- How native discovery, retrospective invocation, mailbox writing, installation,
  updating, and coexistence are verified in Codex, Cursor, and Claude Code from
  one shared behavioral source with minimal platform adaptation.

## Breadcrumbs

- `.planning/seeds/SEED-002-trunk-based-multi-agent-collaboration.md` contains a
  separate committed-mailbox concept for agents coordinating within a shared
  repository. Its mailbox mechanics may be reusable, but Dear Do has a different
  boundary and purpose: retrospective feedback from adopter repositories to the
  Open Dough project.
- `docs/adrs/0002-software-development-lifecycle-principles.md` treats rapid
  regression discovery as a reason to keep changes inexpensive; Dear Do could
  extend that feedback principle across Open Dough versions and adopters.

## Notes

This is a general product and workflow idea, deliberately captured without user
story decomposition. It should be refined only when Open Dough is ready to
design retrospective skills or a concrete cross-project feedback mechanism.
