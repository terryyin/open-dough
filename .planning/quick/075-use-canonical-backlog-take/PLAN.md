# Take planned work through the canonical backlog operation

Status: planned; not taken; no execution authorized by this plan.

## Source and outcome

Identity: `SEED-022#prevent-malformed-backlog-publication`

Source: [selected story](../../seeds/SEED-022-valid-backlog-writes.md#prevent-malformed-backlog-publication).
Terry asked to make the cause and purpose clear, keep the story narrow, refine
it, and write and refine a slice plan if no open question remained on
2026-09-22. This authorizes refinement and planning, not implementation.

Outcome: when an executing agent starts one queued feature story with a
resolved executable plan, it invokes the installed
`product-backlog.mjs take --identity ... --plan ...` operation. The writer, not
the agent, constructs and validates the Taken entry and its canonical
`([plan](...))` link. The affected runtime instruction is shorter than the
Open Dough `0.3.28` source and preserves the existing authority, workspace,
commit, and publication boundaries.

Cause: on 2026-09-21 and 2026-09-22, Doughnut agents read the installed
guidance and then used Python to construct a Taken entry as
`— plan: [...]`. The second recurrence already had Open Dough `0.3.28`.
Execute-plan currently points at a prose backlog workflow without naming the
owned take operation, while the direct-edit guard intentionally does not
intercept shell commands. The dashboard failure is the downstream symptom;
the ambiguous action boundary is the defect this story changes.

## Scope and current decisions

Required behavior:

1. An ordinary-language request to start a queued, planned feature story leads
   a fresh executing agent to call the installed `take` operation with the
   selected identity and plan path.
2. The resulting entry is moved once to the end of **Taken** with the canonical
   plan link and remains readable by the shared backlog reader.
3. That journey does not use Python, shell redirection, or a native file-edit
   tool to construct the backlog entry.
4. The affected take guidance has fewer lines than its `0.3.28` counterpart,
   with no new reminder or warning paragraph and no loss of the surrounding
   execution constraints.

The change is limited to the planned feature-story queue claim owned by
execute-plan. Planless quick work, bounded corrections, resume semantics,
other backlog verbs, parser acceptance, the dashboard, generic shell or Git
enforcement, installation mechanics, release/version work, and installed
managed-copy edits are excluded. Existing deterministic coverage continues to
own writer formatting, ambiguity, duplication, and refusal behavior.

Implementation changes runtime source under `src/skills/` only. It may shorten
both `dough-execute-plan`'s **Take queued work** section and
`dough-product-backlog`'s **Take queued work for execution** / direct-edit text
where removing duplication or the stale “scripts above” reference makes the
single action clearer. It does not add a second command wrapper, parser, hook,
or format description. The exact command remains defined by the existing CLI
usage and is invoked from the installed skill root so the same source serves
all hosts.

## Existing solutions and architecture

PFE found a complete format owner already in the product:

- `src/skills/dough-product-backlog/scripts/product-backlog.mjs take` accepts
  the canonical identity and plan path and delegates rendering and validation
  to the existing backlog modules.
- `tests/support/product-backlog-take.test.mjs` already proves the planned
  transition writes `([plan](...))`, appends in Taken, resumes without
  duplication, and refuses unresolved or ambiguous input.
- `tests/product-backlog-native.sh` and its installed-workflow helpers already
  provide fresh Claude Code, Codex, and Cursor sessions, transcript capture,
  and real candidate installation. Extend that harness with one bounded take
  journey instead of creating another native runner.
- The native direct-edit guard is not the owner of shell-mediated changes and
  stays unchanged. The dashboard and shared reader remain consumers of valid
  source, not repair mechanisms.

This follows Accepted
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
by correcting the repeated cause at its existing high-cohesion owner,
[ADR 0004](../../../docs/adrs/0004-shared-standalone-client-payload-accepted.md)
by changing shared source rather than host copies,
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) for
native-evidence reuse, and
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
by replacing indirect prose with one concise executing-agent action. No
Accepted ADR conflict or North Star change was identified.

## Proof strategy and execution gates

Add a `take` case to the existing native backlog harness. Its fixture contains
one queued story and an executable plan and installs the candidate payload. A
fresh Claude Code session receives an ordinary-language request to start that
plan, without a script name, command, Markdown syntax, or expected editing
method. Assert from both transcript and filesystem that it invoked the
installed `product-backlog.mjs take` operation with the identity and plan,
produced exactly one canonical Taken entry, and did not construct that entry
through Python, redirection, or native editing.

Claude Code owns fresh native evidence because both observed recurrences were
there. At execution, assess whether the unchanged shared installation and
skill-discovery path leaves the existing Codex and Cursor installed-workflow
evidence applicable under ADR 0005. Reuse it when applicable; if the change
invalidates a host-specific contract, that host's bounded take journey remains
pending rather than being inferred from file presence.

Focused execution commands are `bash tests/product-backlog.sh`, the new
`bash tests/product-backlog-native.sh --native claude --case take` journey,
`bash tests/install-all-tools.sh`, and `git diff --check`. Existing CI owns the
full test and lint suites. Before accepting the slice, compare the changed take
instruction line count with tag `v0.3.28` and perform the AGENTS.md behavior
review: invocation context, required inputs, and the representative native
outcome. Do not synchronize `.agents/skills/` or `.claude/skills/` by hand.

## Ordered slices

### 1. Planned execution claims the queue through the installed writer

Type: Behavior
Status: planned

Proof: extend the installed-workflow native harness with the take fixture and
fresh Claude Code journey described above. Keep
`product-backlog-take.test.mjs` green as the deterministic contract for exact
formatting and refusal behavior, and keep `install-all-tools.sh` green as the
shared-delivery check. Review the transcript for the installed `take` command
and absence of hand-built backlog writes; review the result with the shared
reader. Record the `v0.3.28` and candidate line counts for the affected take
guidance.

Behavior: a developer starts a queued story's resolved executable plan through
Open Dough → the agent resolves the existing execution authority and workspace
preconditions, invokes the installed backlog `take` operation with the story
identity and plan path, and continues the existing isolated claim commit and
publication workflow → the queue has one valid Taken claim whose syntax the
agent never had to reproduce. Replace redundant or indirect take prose only as
needed to make that operation the unambiguous action; finish with fewer
affected instruction lines than `0.3.28`.

Safe stopping point: the observed planned queue-to-Taken path has one existing
format owner and fresh native evidence, while every excluded backlog and
execution path is unchanged.

## Proof ownership

| Promise | Slice | Observation |
| --- | --- | --- |
| Fresh planned execution selects the installed take operation without a prompted command | 1 | Claude Code transcript from the native take journey |
| Taken entry has one canonical plan link and remains readable | 1 | fixture backlog plus existing deterministic take tests/shared reader |
| Agent does not construct the entry with Python, redirection, or native edit | 1 | native transcript and captured commands |
| Guidance becomes shorter without losing execution constraints | 1 | `0.3.28` comparison and AGENTS.md behavior review |
| Shared delivery remains valid | 1 | install-all-tools check and ADR 0005 host-evidence assessment |

## Learnings

None yet.
