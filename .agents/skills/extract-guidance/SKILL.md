---
name: extract-guidance
description: Turn one supplied project skill or rule into a source-selectable, reusable dough- candidate and recognition record without changing the source. Use when an Open Dough maintainer asks to extract, generalize, or make a project practice reusable.
---

# Extract reusable project guidance

Work on exactly one source skill or rule per invocation. This skill is internal
to Open Dough; do not add it or its support files to the public installer
payload.

1. Capture the supplied source path before reading it. If no source was
   supplied, ask for one and stop. Accept a caller-supplied output directory;
   otherwise use
   `.planning/extracted-guidance/<dough-candidate-name>/` in the current Open
   Dough checkout. Never use the source directory as the output directory.

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

   For a rule, compare its application conditions with the proposed public
   delivery before drafting anything. A manually invoked or on-demand skill
   does not preserve an automatic or `alwaysApply` rule. Record that as a
   distinct delivery gap even when missing required context independently
   blocks extraction.

   If required context is unavailable, or a rule's automatic application
   cannot be preserved by the proposed delivery, stop candidate creation. In
   the requested output directory, write only `ASSESSMENT.md` with the source
   type and scope, reusable behavior, required context, every unresolved gap,
   and what would be needed to resume. Do not create `SKILL.md` or
   `RECOGNITION.md`, even as drafts. Label the outcome
   `suitability unresolved — no candidate produced`; do not present or place it
   as installable public guidance.

4. Name a skill candidate `dough-<source-name>`, normalizing the source name to
   lowercase kebab-case and avoiding a second `dough-` prefix. Write a
   self-contained candidate directory containing:

   - `SKILL.md`, with valid `name` and `description` frontmatter, explicit
     triggers, the preserved workflow and boundaries, and the adopter context
     it needs; and
   - `RECOGNITION.md`, using the headings below. Keep recognition descriptive;
     do not add matching, replacement, or migration automation.

   ```markdown
   # Recognition: <candidate name>

   Status: draft — unverified substitute

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
   must name the behavioral comparison still required before distribution.

5. Recompute the inspected-source checksums and compare them with step 2. For a
   completed candidate draft, report the candidate directory, the generalized
   assumptions, and the unchanged-source result, labeled
   `draft — unverified substitute`. For an unresolved assessment, report the
   assessment path, both the missing-context and delivery gaps when applicable,
   and the unchanged-source result, labeled
   `suitability unresolved — no candidate produced`. Do not move either result
   into `src/`, describe it as suitable, or claim successful extraction when
   checksums changed or an unresolved gap remains.
