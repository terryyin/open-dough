# Recognition: dough-adr-awareness

Status: evaluated public guidance — native discovery, installation, update,
delivery-to-use behavior, and coexistence verified in Codex, Cursor, and Claude Code

## Original clues

- Original guidance name: `adr-awareness`
- Original source-relative location: `.agents/skills/adr-awareness/SKILL.md`
- Guidance form: an on-demand skill, with a source-project automatic-application
  bridge for architecture-shaped work

These clues are provenance only. A project name, repository identity, exact ADR
directory, or exact filename scheme is not required for recognition.

## Purpose

Keep agent work consistent with an adopter's current Accepted ADRs while humans
retain authority over decisions, lifecycle transitions, supersession, and
contextual exceptions.

## Triggers

- Explicit mention of an ADR, architectural decision or constraint, ADR checks,
  conflict with a decision, or supersession.
- Work that crosses the adopter's declared architecture areas or may reverse or
  bypass a current Accepted ADR.
- Directed cleanup after a human has decided an ADR lifecycle change.
- Proposal drafting only when the human explicitly asks for draft help.

## Distinguishing behavior

- Explicitly loads the adopter's ADR index or catalog and classifies current
  records using adopter-declared authoritative status fields.
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
  directed mechanical hygiene and uses an adopter template for proposal drafting
  only when that drafting was requested.
- Reports missing stores, empty current sets, and unavailable adopter context
  or human decisions needed for the current request without claiming completion.
- Ends successful explicit invocations with `## ADR CHECK COMPLETE`.

## Adopter-provided context

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
- Native discovery and any automatic-application adapters required by Codex,
  Cursor, and Claude Code.

## Differences that rule out replacement

Guidance is not an equivalent substitute if it silently ignores conflicts,
treats filenames as the sole status authority, fails to follow supersession,
cannot cite the constraining record, applies Proposed or historical ADRs as
current, invents exceptions, lets the agent approve lifecycle changes, requires
one project's ADR layout or decisions, or claims completion despite unresolved
status or context needed for the current request.

An on-demand skill is also not a proven replacement for source guidance whose
automatic application is material unless the target host supplies and verifies
an equivalent native application mechanism.

## Assessment before replacement

Use the installed `dough-adr-awareness/SKILL.md`, this recognition record from
the same native skill root, and the installed updater's numeric `VERSION` record.
Do not substitute an untagged checkout, another host's installation, or a prompt
that supplies a migration procedure.

When a developer asks only whether this guidance could replace a local ADR
practice:

1. Identify at most one local ADR practice by behavior. Treat the original clues
   above as leads, not eligibility requirements, and inspect the local source
   before deciding whether it is equivalent.
2. Compare its purpose, triggers, decision-selection and citation behavior,
   conflict and supersession handling, and human-owned lifecycle and exception
   authority against the distinguishing behavior and exclusion boundary above.
   Explain covered behavior and name any uncovered policy that blocks a safe
   replacement. Classify representative local records from their adopter-owned
   authoritative status fields: when the index and record agree, a filename
   mismatch is hygiene rather than a policy gap; explicitly report Proposed
   records as non-binding. A real disagreement between authoritative sources
   remains a blocker.
3. Search the adopter for actual repository-relative callers and discovery
   links, including references inside mixed instruction or ADR documents and
   symlinks. Inspect every existing native guidance root, including
   `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/`; enumerate
   symlinks separately because text-reference searches do not reveal them.
   Name the affected paths rather than proposing a generic rename.
4. Explain which adopter context must remain reachable: the ADR store and
   index, authoritative statuses and supersession convention, architecture-work
   triggers, human decision and exception trail, workflow precedence, and each
   affected host's native automatic-application or discovery bridge.
5. Report installation state separately from replacement state. A current
   installed version can still have optional local cleanup pending, and native
   readiness in Codex, Cursor, and Claude Code remains pending until it is
   observed in each affected integration. Label local replacement and cleanup
   as pending in every assessment-only result, including when the installed
   version record is current.

Assessment is read-only. Do not call the installer, edit the installed payload
or version record, transfer context, repair callers, or remove local guidance.
Permission to assess, install, update, or force reinstall is not permission to
perform cleanup.

## Retain adopter context before cleanup

After equivalence is established and the developer has authorized replacement,
prepare the adopter context before repairing callers or removing the original.
Reuse authorization already present; do not ask for it again. This preparation
does not itself perform caller repair or cleanup.

1. Reinspect the original and the adopter's existing architecture guidance.
   Use that local architecture guidance as the home for required facts that are
   available only from the original. Preserve only adopter context needed by the
   shared skill; do not copy its behavioral workflow into a second local source
   or merge an additional local policy.
2. Retain the adopter's exact definition of architecture-shaped work. When the
   original names `Cross-cutting stack, persistence, API contracts, auth,
   packaging/monorepo layout, shared conventions across
   backend/frontend/cli/mcp/e2e`, keep all of those trigger areas reachable
   rather than replacing them with a generic architecture label.
3. Retain the adopter's human-owned exception trail exactly. When the original
   permits a `PR/commit message or note pointing at the ADR and the exception`,
   preserve those choices without inventing another approval, exception, or
   precedence rule.
4. Keep the adopter's existing references to its ADR store, index, lifecycle,
   supersession convention, and optional proposal template. Do not rewrite ADR
   decisions, status values, index entries, history, or the human-owned process
   while retaining context.
5. Verify the retained facts are reachable through the local architecture
   guidance while the original and every caller or discovery link remain
   unchanged. Report context preparation separately from cleanup and keep the
   replacement pending until a later authorized step has a usable replacement
   for every affected native integration.
6. Verify every original-only value individually. Missing even one required
   trigger area or exception-trail choice blocks a preparation-complete claim;
   keep the original and callers intact and name the missing value.
7. Report the exact retained values, the one architecture-guidance path changed,
   the inspected source/tag/commit/version, and caller cleanup and original
   removal as pending. Do not create a migration state file.

## Switch callers and remove the redundant original

Continue an already-authorized replacement only after the retained context is
verified and every affected native integration has a usable shared replacement.
Reuse the existing authorization; do not ask for it again.

1. Reinspect the assessment's explicit caller and discovery-link paths and use
   them as a required checklist. If that inventory is unavailable, rederive it
   before editing with repository-wide searches that include hidden and ignored
   paths plus separate symlink enumeration. Follow references from local
   architecture guidance into mixed ADR documents and other normally unindexed
   paths; a broad search with those paths excluded is not a complete inventory.
   If the set has drifted, or any affected integration still depends on the
   shared original, keep the original available and report the focused readiness
   gap.
2. Repair the complete assessed caller set in one coherent change. Point each
   caller at `dough-adr-awareness` in the running tool's native skill root,
   preserving unrelated instructions inside mixed files. Do not redirect other
   tools to the running tool's installed copy.
3. Verify every checklist path individually after repair: each textual caller
   resolves to the installed shared skill and every retained context value
   remains reachable through local architecture guidance. Remove obsolete
   discovery links to the original only when their affected integrations have
   usable replacements.
4. Search the assessed roots again, including hidden and ignored paths, for
   textual and symlink references to the original. Only when the search and
   every checklist entry are clear, remove the redundant original skill and its
   now-empty directory. Do not remove ADR records, indexes, templates, decisions,
   unrelated guidance, or another tool's installation.
5. Report the inspected source/tag/commit/version, the exact caller/link paths
   repaired or removed, the original path removed, and the complete changed-path
   set. Keep installation state separate from cleanup state; a current-version
   cleanup must not rewrite the installed payload or `VERSION` record.

## Evaluation status

Controlled native Codex comparisons established equivalence with the original
for current Accepted selection, supersession traversal, material citation,
filename/status mismatch reporting, conflict stopping, and human-owned exception
handling. A separate native Codex run in an unrelated adopter established that
the candidate uses adopter-supplied ADR paths and lifecycle conventions without
imposing its source project's layout or identity.

Codex, Cursor, and Claude Code each discovered the canonical internal extractor
from `.agents/skills/` and produced a reusable candidate plus recognition record
without modifying the supplied source. No Cursor or Claude-specific extractor
adapter was required.

Each platform installed this record and the same behavioral skill alongside the
public updater in its native skill root. Independent native update-to-fresh-use
proofs verified default-branch source identity, exact platform-local payloads,
coexistence with unrelated guidance and other-platform copies, adopter-relative
authority discovery, conflict stopping for human precedence, and no adopter
changes during explicit ADR assessment.
