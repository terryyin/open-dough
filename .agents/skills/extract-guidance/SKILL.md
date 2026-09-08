---
name: extract-guidance
description: Turn one supplied project skill or rule into a source-selectable, reusable dough- candidate and recognition record without changing the source. Use when an Open Dough maintainer asks to extract, generalize, or make a project practice reusable.
---

# Extract reusable project guidance

Follow the shared skill-authoring guideline in [`AGENTS.md`](../../../AGENTS.md)
for naming, frontmatter, layout, references, and behavior review. Work on exactly
one source skill or rule per invocation. This skill is internal to Open Dough;
do not add it or its support files to the public installer payload.

1. Capture the supplied source path before reading it. If no source was
   supplied, ask for one and stop. Write output under
   `src/skills/<dough-name>/` in the current Open Dough checkout. Never use the
   source directory as the output directory.

2. Read the complete source file. Identify whether it is an on-demand skill or
   a rule, including the rule's scope and application conditions. Inspect only
   directly referenced context needed to understand its behavior. Do not scan
   or extract the whole source project. Before writing, record a checksum of
   every source file inspected so the unchanged-source claim can be checked.

3. Separate reusable behavior from source-project assumptions:

   - preserve the purpose, trigger, decisive workflow, expected output,
     safeguards, negative boundaries, and human decision ownership;
   - turn required project locations, naming schemes, technologies, and local
     conventions into explicit adopter-provided context;
   - omit source-project decisions, secrets, credentials, personal data, and
     irrelevant local-machine paths;
   - do not invent a broader framework or extract sibling guidance.

   For a rule, note when automatic or `alwaysApply` application would not be
   preserved by an on-demand public skill. That delivery gap needs manual
   follow-up; do not silently present the result as an equivalent substitute.

   If required context is unavailable, or a rule's automatic application cannot
   be preserved without further design, stop without writing under `src/skills/`.
   Briefly explain what is missing or unusual and what manual follow-up is
   needed. Do not invent ASSESSMENT.md, draft-candidate staging under
   `.planning/extracted-guidance/`, or other displaced intermediate workflows.

4. Name the public skill `dough-<source-name>`, normalizing the source name to
   lowercase kebab-case and avoiding a second `dough-` prefix, consistent with
   `AGENTS.md`. Write directly to `src/skills/<dough-name>/`:

   - `SKILL.md`, with valid `name` and `description` frontmatter, explicit
     triggers, the preserved workflow and boundaries, and the adopter context
     it needs; and
   - `RECOGNITION.md`, using the headings below. Keep recognition concise and
     descriptive for maintainers; the installer does not ship it. Do not add
     matching, replacement, or migration automation.

   ```markdown
   # Recognition: <skill name>

   Status: ready for maintainer review

   ## Original clues
   ## Purpose
   ## Triggers
   ## Distinguishing behavior
   ## Adopter-provided context
   ## Differences that rule out replacement
   ## Validation needed
   ```

   Original clues may include the original name and a repository-relative path,
   but not an absolute local-machine path. Project identity is optional
   provenance and must never be a recognition requirement. `Validation needed`
   must name the representative behavior review still required under
   `AGENTS.md` (invocation context, required adopter context, and useful
   outcome) before treating the skill as ready to release.

5. Recompute the inspected-source checksums and compare them with step 2. Report
   the `src/skills/<dough-name>/` paths, the generalized assumptions, and the
   unchanged-source result. Walk one representative use per `AGENTS.md` behavior
   review when the extraction itself is the demonstration. Do not claim a
   successful extraction when checksums changed. Publication, client delivery,
   and particular project extractions remain separate work.
