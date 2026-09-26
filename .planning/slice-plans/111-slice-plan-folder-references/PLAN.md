# Use the Slice Plans folder convention

## Source

- Story: [Name the slice-plan folder for its purpose](../../seeds/SEED-042-rename-slice-plan-folder-references.md#rename-slice-plan-folder-references).
- Identity: SEED-042#rename-slice-plan-folder-references
- Authority: planning and publication only; implementation requires a separate instruction.

## Goal and scope

Developers and agents create and reference plans at
`.planning/slice-plans/<plan>/PLAN.md`, using “Slice Plans” in display text.
Update maintained source guidance, templates, examples, relevant code and
fixtures together. Reuse current path resolution, story identity and lifecycle
behavior. Existing projects handle physical folder and local artifact-link
migration separately.

## Mandatory execution constraint: positive current terminology

**Completely rename the product references. Leave no naming-history or
negation residue in delivered code, comments, guidance or tests.**

- Write instructions, identifiers, comments and examples directly in terms of
  `slice-plans/` and “Slice Plans.”
- Make tests positively assert the expected new plan path, resolved content or
  link. Update the existing fixtures and assertions together.
- Do not add “formerly quick,” legacy-name explanations, historical rename
  notes, old-name warnings, absence assertions or old-name rejection tests.
- Do not turn this maintainer constraint into runtime prose such as “do not use
  quick.” The product should simply describe and exercise the current convention.
- Add no migration, alias, fallback or compatibility mechanism. Keep unrelated
  execution-mode terminology and actual existing project artifacts outside this
  reference change. Git already retains the change history.

This section is a direct maintainer constraint for the executing agent. It is
not a request for a persistent prohibited-word check or a negative test suite.

## Existing solution and architectural constraints

Change the existing naming references in place. The product-backlog reader and
dashboard already resolve supplied plan links; fixtures in
`tests/support/product-backlog-take.test.mjs`,
`tests/support/story-state.test.mjs` and
`dashboard/tests/source-navigation.spec.ts` exercise those paths. Existing
source guidance and test fixtures own the convention; no new path abstraction
or separate subsystem is warranted for this naming change.

Follow [AGENTS.md](../../../AGENTS.md)'s representative behavior review and
source-of-truth rule. Edit shared payload guidance under `src/skills/`; installed
managed copies update through the release workflow. Follow Accepted
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) for
source/release ownership and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
for direct runtime wording. This plan creates no release or tag. Existing
North Star topics require no change for this naming convention.

## Ordered slices

### 1. Create and reference plans using the Slice Plans convention
Type: Behavior
Status: planned
Proof: Representative guidance walkthrough plus existing path/link checks using
positive `slice-plans/` fixtures, as mapped below.

Behavior: Given current planning guidance and a project using the convention,
when an agent creates a plan and records its link, the plan is stored under
`.planning/slice-plans/` and existing consumers resolve and display that link.
Product prose and tests present only the current convention.

Work: Identify folder-name references across maintained source guidance,
templates, examples, runtime consumers and relevant tests. Apply the naming
change cohesively; update fixture setup and assertions together. Review every
remaining match in context to distinguish unrelated execution terminology and
existing project artifacts. That one-time maintainer review does not become a
permanent test or product warning. Retain generic path handling and perform
slice-local cleanup under the normal execution workflow before committing.

Proof ownership (all owned by this slice):

| Promise | Observation |
| --- | --- |
| Guidance creates and links the expected plan | Walk one representative planning use; verify invocation, required project context, created path and story link agree on `slice-plans/`. |
| Existing consumers resolve the plan | Run `node --test tests/support/product-backlog-take.test.mjs tests/support/story-state.test.mjs` after updating their naming fixtures; observe successful plan resolution and recorded links. |
| Displayed source links use the convention | Run `npm run test:dashboard -- dashboard/tests/source-navigation.spec.ts` with updated fixture paths; observe the expected plan URL and link text. |
| Delivered wording and tests express the positive contract | Review the final diff against the mandatory execution constraint; assert expected new paths in existing tests, with naming-history commentary and old-name rejection tests excluded. |

Run further existing focused checks only for additional changed consumers or
fixture owners. Run repository-required lint/verification under the execution
workflow. Tests listed above are prospective proof, not claimed results.

Safe stopping point: Guidance, examples and consumers agree on the convention,
and affected checks pass in the same delivered change.

## Boundary and sizing review

Retain one Behavior slice: guidance, fixture paths and assertions form one
cohesive naming outcome. Splitting by file type would create inconsistent
intermediate references without independent value. Existing path semantics are
reused, so no Structure slice is needed. No numeric time limit was supplied;
size includes focused verification and cleanup. If execution discovers a new
path semantic or an existing-project migration requirement, stop that expansion
and return the evidence for a scope decision.

Review result: no remaining slice-boundary concern identified. Planning does
not constitute implementation proof or execution authority.
