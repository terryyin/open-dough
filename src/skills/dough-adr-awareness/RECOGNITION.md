# Recognition: dough-adr-awareness

Status: evaluated public guidance — useful ADR behavior, installation, update,
and coexistence verified for Codex, Cursor, and Claude Code

## Original clues

- Original guidance name: `adr-awareness`
- Original source-relative location: `.agents/skills/adr-awareness/SKILL.md`
- Guidance form: an on-demand skill, with a source-project automatic-application
  bridge for architecture-shaped work

These clues are provenance only. A project name, repository identity, exact ADR
directory, or exact filename scheme is not required for recognition.

## Purpose

Keep agent work consistent with a client project's current Accepted ADRs while humans
retain authority over decisions, lifecycle transitions, supersession, and
contextual exceptions.

## Triggers

- Explicit mention of an ADR, architectural decision or constraint, ADR checks,
  conflict with a decision, or supersession.
- Work that crosses the client project's declared architecture areas or may reverse or
  bypass a current Accepted ADR.
- Directed cleanup after a human has decided an ADR lifecycle change.
- Proposal drafting only when the human explicitly asks for draft help.

## Distinguishing behavior

- Explicitly loads the client project's ADR index or catalog and classifies current
  records using the client project's authoritative status fields.
- Does not treat a filename convention as sole authority; it separates filename
  hygiene mismatches from unresolved authoritative metadata.
- Treats Proposed as non-binding and Rejected or Superseded as history, follows
  supersession links to the newest valid current record, and reports broken,
  cyclic, or ambiguous chains.
- Selects relevant records before reading full decisions, follows material
  constraints, and cites the identifier, title, and repository-relative path.
- Stops conflicting implementation and dependent executable planning, then asks
  a human to follow the ADR, own an update or supersession, or explicitly approve
  a contextual exception with a durable trail.
- Keeps all decision and terminal-status authority with humans. It performs only
  directed mechanical hygiene and uses a client project template for proposal drafting
  only when that drafting was requested.
- Reports missing stores, empty current sets, and unavailable client project context
  or human decisions needed for the current request without claiming completion.
- Ends successful explicit invocations with `## ADR CHECK COMPLETE`.

## Client project context

Resolve these values when needed for the current request; absent hypothetical
status disagreements or lifecycle changes do not require invented policies.

- Repository-relative ADR store and index or catalog.
- Authoritative status fields, filename conventions, inconsistency-resolution
  rule, current-record catalog, and supersession-link convention.
- Definition of architecture-shaped work and the scope of each decision.
- Durable exception-trail location and human-owned advice, approval,
  announcement, and status-change process.
- Precedence relative to local planning and delivery workflows.
- Proposal template only when proposal drafting is requested.

## Differences that rule out replacement

Guidance is not an equivalent substitute if it silently ignores conflicts,
treats filenames as the sole status authority, fails to follow supersession,
cannot cite the constraining record, applies Proposed or historical ADRs as
current, invents exceptions, lets the agent approve lifecycle changes, requires
one project's ADR layout or decisions, or claims completion despite unresolved
status or context needed for the current request.

An on-demand skill is also not a proven replacement for source guidance whose
automatic application is material unless the target host supplies an equivalent
native application mechanism.

## Adoption boundary

This record helps maintainers recognize the behavior and client project context; it is
not a reusable migration procedure. Assessing or replacing local guidance is
one-time project work. Public installation and update guidance must not inspect,
rewrite, repair callers for, or remove a client project's local practice.

## Evaluation status

Controlled native Codex comparisons established the distinguishing behavior
above and showed that the candidate uses ADR paths and lifecycle conventions
supplied by the client project without imposing its source project's layout or identity.

Codex, Cursor, and Claude Code each used the canonical internal extractor from
`.agents/skills/` and produced a reusable candidate plus recognition record
without modifying the supplied source. No Cursor or Claude-specific extractor
adapter was required.

Each platform installed this record and the same behavioral skill alongside the
public updater in its native skill root. Independent update-to-fresh-use proofs
verified exact platform-local payloads, coexistence, authority resolution within
the client project, conflict stopping for human precedence, and no client project changes
during explicit ADR checks.

Maintain further edits with the shared skill-authoring guideline in
[`AGENTS.md`](../../../AGENTS.md): review invocation context, required client project
context, and the conflict-handling outcome on a representative use.
