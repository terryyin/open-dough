---
id: SEED-004
status: dormant
planted: 2026-09-06
planted_during: Parallel exploration of extracting existing project guidance
trigger_when: Replace repeated borrowing with released guidance after the Donut installation path works
scope: large
---

# SEED-004: Extract and adopt reusable project guidance

## Why This Matters

Extract useful practices from existing projects, improve the shared source where
needed, and replace the few known local copies once. Thereafter, clients update
Open Dough's released files. The next concrete extractions are story refinement
and story decomposition; both must produce useful work, not merely skill files.

## Decisions and Constraints

- The owner's 2026-09-07 direction is one-time adoption in Donut and roughly
  three or four other known projects. Handle each project's actual differences
  directly; do not build lasting matching, reconciliation, or recovery machinery.
- Resolve useful differences in Open Dough's shared source before release, or
  retain required project context in its existing home. Do not maintain patched
  installed skills. If a real requirement cannot be supported, preserve the
  original while that specific requirement is resolved.
- Keep recognition concise and descriptive in Open Dough: purpose, triggers,
  material behavioral differences, required context, and evidence references.
  One-time caller inventories and cleanup steps belong to the adoption work,
  not the shared recognition record or installed updater.
- Source candidates can be refined locally in Open Dough. The released client
  payload contains only ready guidance, with required supporting files installed
  for standalone use. Every added public skill updates with the whole payload.
- Follow [ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  for releases. The owner-directed installation contract is recorded in
  [Proposed ADR 0004](../../docs/adrs/0004-client-installation-and-update.md).
  Configuration remains speculative until a concrete need exists.
- One shared behavioral source must independently demonstrate native discovery,
  invocation or application, intended behavior, affected installation/updating,
  and coexistence in Codex, Cursor, and Claude Code. Missing evidence is pending.
- Story numbers preserve existing references, not priority. The
  [product backlog](../PRODUCT-BACKLOG.md) sets order. This review edits planning
  only; no source guidance, release, or client installation changes here.

## Completed work

<a id="generalize-project-guidance"></a>

### 1. Turn a supplied project practice into usable public guidance

- **Status:** Completed 2026-09-06. The
  [slice plan](../quick/007-generalize-project-guidance/PLAN.md) records all native
  extraction, equivalence, installation, update, fresh-use, and coexistence evidence.
- **For / why:** The Open Dough maintainer wants to share a proven practice
  without making every adopter inherit the source project's assumptions.
- **Evaluation:** Use the internal skill on a supplied item, inspect the public
  result, and demonstrate equivalent behavior in the source context and useful
  behavior in another project context.
- **Value / learning:** A reusable practice remains valuable even if migration
  automation is never built; tests whether generalization preserves effectiveness.
- **Effort hypothesis:** L (2–4 hours), low confidence; assumes one bounded
  supplied item and available native tool sessions. Reassess if its dependencies
  require a broader workflow rather than generalizing that workflow implicitly.
- **Depends on:** An accessible source skill or rule and enough project context
  to understand and evaluate it; no dependency on later migration stories.

#### Goal

As an Open Dough maintainer, use an internal skill to adapt a supplied project
skill or rule into public guidance that another project can use and that remains
an effective substitute in the original context.

#### Scope

- Inspect the supplied guidance and the context or supporting resources it needs.
  Produce a public equivalent with project-specific assumptions removed or
  resolved through the adopting project's own context. Handle one supplied item
  per request; whole-project mining and bulk extraction are excluded.
- Evaluate substitution against the original intended behavior. Resolve missing
  context or dependencies before reporting the result as a usable replacement;
  if a gap cannot be resolved, explain it and leave suitability pending.
- Retain identifying characteristics alongside the public result for subsequent
  matching in any project. Avoid carrying private or project-specific operational
  details into public instructions simply to preserve a fingerprint.
- Make the resulting guidance installable and natively usable in all three tools.
  This includes the distribution needed for the selected item, not a new catalog
  or publishing service. Existing release workflows remain separate.
- Demonstrate substitution in a controlled project context. Reconciliation or
  deletion of an adopting project's existing guidance belongs to later stories.

#### Key examples

| Pre-condition | Trigger | Observable result |
| --- | --- | --- |
| Doughnut's `adr-awareness` skill assumes `docs/adrs/` and local ADR conventions | Invoke the internal extraction skill | Produces `dough-adr-awareness` that uses each project's ADR location and conventions while preserving Accepted-decision handling, conflict reporting, and human decision ownership in Doughnut and another project. |
| A supplied rule depends on a project-specific check | Generalize and evaluate substitution | Preserves the requirement through suitable local context, or reports the unresolved gap instead of claiming that removing the check is equivalent. |
| Another project uses a different name and path for the same practice | Inspect the result's retained characteristics | Purpose and behavior provide recognition clues without requiring that project to be Donut or to share its paths. |

<a id="reconcile-guidance-on-install"></a>

### 4. Complete one authorized ADR-guidance replacement in Codex

- **Status:** Completed 2026-09-06 through slice 4a in
  [Plan 013](../quick/013-adopt-adr-awareness/PLAN.md). Native Codex
  assessment, context retention, caller repair, and redundant-original removal
  passed on a protected disposable Donut-derived target. Cursor, Claude Code,
  fresh-install, later-update, and live Donut outcomes were not claimed.
- **For / why:** The Open Dough maintainer needed the smallest usable proof that
  one recognized equivalent could be replaced safely after one authorization.
- **Evaluation:** Native Codex followed the installed tagged workflow, retained
  every required original-only value, repaired the explicit caller checklist,
  removed only the original, and preserved ADR records and unrelated guidance.
- **Value / learning:** The narrow success validates the replacement direction
  without requiring automatic handling of every platform and failure case.
- **Effort:** Completed. The former M-L scope was disproved by two execution
  overruns and split at the first coherent value boundary.

#### Goal

As an Open Dough maintainer, prove one already-installed, behaviorally
equivalent ADR-awareness practice can be assessed and replaced in native Codex
without losing required adopter context or unrelated project guidance.

#### Scope

- Includes a disposable exact tagged payload, read-only assessment, reuse of one
  cleanup authorization, context retention, exhaustive caller repair, and
  removal of the redundant original for the single Codex integration.
- Excludes fresh installation, release publication, real Donut mutation,
  post-cleanup use, Cursor and Claude Code adoption, automatic failure handling,
  and update preservation.
- The excluded work is decomposed in
  [SEED-006](SEED-006-extend-adr-guidance-adoption.md). Open Dough self-adoption
  remains in SEED-001.

#### Completion evidence

Plan 013 records `codex-cli 0.144.1`, controlled release `v0.1.0`, exact
caller/original-only changes, preserved payload and ADR state, focused checks,
and successful CI run `34036359908`. Missing native Cursor and Claude Code
evidence remains pending in follow-up stories.
## Remaining stories

<a id="extract-plan-execution-with-ci-monitor"></a>

### 5. Extract plan execution with its required CI support

- **Status:** Deferred; no execution plan. Trigger only when repeated borrowing
  or a selected real task needs execution through CI monitoring.
- **Goal:** Use a released execution skill and its required scripts to complete
  one real plan through CI results without consulting the original project.
- **Scope:** Inspect one supplied practice; extract only the behavior and local
  scripts needed for its complete flow. Resolve actual project context. Keep
  recognition in Open Dough and include supporting files in the client payload.
  Package distribution is not a prerequisite.
- **Acceptance:** The selected real plan reaches and correctly handles success,
  failed CI, and unavailable prerequisites. Verify native discovery/use, changed
  installation/update paths, and coexistence independently in all three tools.
- **Excluded:** A generic CI framework, monitoring service, package registry,
  automatic client migration, and extraction of unrelated lifecycle practices.

<a id="extract-story-refinement"></a>

### 6. Release story refinement and use it on a real backlog story

- **Status:** Revised 2026-09-07; unplanned. Follow Donut's adoption of the
  simplified installation. Do not delay an available meaningful Donut update.
- **Goal:** Replace repeated borrowing of Donut's story-refinement skill with
  released `dough-story-refinement`, and improve one actual Open Dough story.
- **Scope:** Inspect the supplied practice and necessary referenced context;
  refine the Open Dough source until it preserves useful behavior. Reuse shared
  ADR-awareness and existing project context. Keep recognition descriptive and
  source-only. Include required supporting guidance in the full client payload.
- **Acceptance:** In native Codex, Cursor, and Claude Code, independently prove
  discovery/invocation, source-context behavioral equivalence, installation/update,
  and coexistence. At least one real existing story gets a useful goal, bounded
  scope, examples, and next step in its existing home without reading Donut's
  checkout during use. A marker or generated skill file is insufficient.
- **Release and self-use:** Publish the verified improvement under ADR 0003 and
  adopt it in Open Dough using the ordinary updater. This provides a useful new
  release for Donut's update story if no earlier wanted improvement exists.
- **Excluded:** Executing the refined story, extracting sibling skills, broad
  configuration support, and rewriting local guidance in all other projects.
- **Dependencies:** Existing extraction capability, the supplied practice, and
  the simplified installation/update contract from SEED-001 Story 7.

<a id="extract-story-decomposition"></a>

### 7. Release story decomposition and use it on real product work

- **Status:** Revised 2026-09-07; unplanned. Follow the first complete Donut
  installation-to-update success and the story-refinement extraction.
- **Goal:** Use released `dough-story-decomposition` to split one existing
  oversized Open Dough problem into useful, ordered stories.
- **Scope:** Extract one supplied practice, resolve only its necessary context,
  and record results in the existing seed/backlog. If an oversized execution
  plan reveals an oversized story, reuse its valid work while splitting the
  story and plan only the first useful outcome. No fixed slice-count threshold
  or separate planning framework is required.
- **Acceptance:** Show source-context equivalence and independent native
  discovery, invocation/application, affected install/update, and coexistence
  in all three tools. Use the installed skill on a real problem without reading
  the source project. Its first story must be independently useful; later work
  remains unplanned until selected.
- **Release and self-use:** Publish only after the shared guidance is ready,
  then receive it through Open Dough's ordinary update flow. Keep recognition
  and evaluation material outside the client payload.
- **Excluded:** Decomposing every project backlog, executing the resulting work,
  lifecycle infrastructure, and automatic local-guidance reconciliation.

<a id="adopt-known-client-projects"></a>

### 8. Replace borrowed guidance once in the remaining known client projects

- **Status:** New, unplanned. Follow a working Donut adoption and meaningful
  update, then select one of the owner's roughly three or four other projects
  at a time. Their identities and paths must be supplied before client work.
- **Goal:** Replace a known project's borrowed practice with useful released
  Open Dough guidance, so future maintenance is an ordinary Open Dough update.
- **Scope per project:** Inspect its actual local guidance and callers. Resolve
  needed shared changes in Open Dough before release, retain required project
  context, install the complete inspected payload, repair that project's callers,
  and remove the redundant original only when all affected integrations work.
  Keep a concise outcome in existing project records. Do not add reusable
  migration code, a client registry, or new installed adoption state.
- **Acceptance per project:** Native discovery, invocation or automatic use as
  required, useful work, and coexistence pass in every affected tool. Verify a
  plain `dough-update` uses the remembered source, leaves reviewable changes or
  a truthful current result, and preserves the adopted context/callers. Release
  changes still require independent acceptance in all three supported tools.
- **Boundary:** Existing local differences are handled once with the owner;
  after adoption, installed guidance is not customized directly. Force can
  replace manual edits without reconciliation. Do not claim completion for
  unnamed projects or infer native results from another project.

## Evidence and ordering

Completed Stories 1 and 4 retain their recorded outcomes above. Stories 5–8
have no new native delivery evidence: Codex, Cursor, and Claude Code are each
pending. No file copying, source inspection, or successful result in another
application substitutes for the relevant native observation.

Donut's working client path takes priority. The next planning extraction can
supply the real improvement needed to finish that path's update observation;
do not create a version-only release or require unrelated extraction first.
Use the product backlog for the current order and triggers.

## Related

- [One-time Donut adoption and update](SEED-006-extend-adr-guidance-adoption.md)
- [Client installation and update delivery](SEED-001-install-and-update-open-dough.md#standalone-client-update)
- [Public and internal skill terminology](../../docs/adrs/0001-ubiquitous-language.md)
