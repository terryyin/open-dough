---
id: SEED-022
status: active
planted: 2026-09-22
planted_during: Diagnosis of repeated Doughnut dashboard backlog read failures
trigger_when: Starting planned work can bypass the canonical backlog take operation
scope: small
---

# SEED-022: Use the canonical backlog writer when taking planned work

## Why This Matters

Developers need a Taken claim to remain readable by the shared backlog reader
and dashboard. On 2026-09-21 and again on 2026-09-22, a Doughnut execution agent
read the installed guidance but used Python to construct the Taken line itself.
It wrote the unsupported `— plan: [...]` form and published an unreadable
backlog. The second occurrence used Open Dough `0.3.28`, so updating did not
address the cause.

The cause is narrow: execute-plan tells the agent to follow the backlog workflow
but leaves it to translate prose into an edit, while the existing
`product-backlog.mjs take` operation already owns the format. The direct-edit
guard intentionally leaves shell commands alone, so it does not redirect this
path.

## Alternatives and Decision

Do not add another reminder or warning paragraph. The rules and skills are
already long, and more prose would dilute the required action. A new generic
shell or Git-hook enforcement mechanism is also outside this story: it would
expand the solution beyond the observed planned-work transition.

Reuse the existing `product-backlog.mjs take` operation. Replace redundant or
indirect take guidance with a shorter instruction that invokes that operation,
and prove that a fresh agent starting planned work follows it without being
given the command or backlog syntax in the prompt.

## Story Decomposition

<a id="prevent-malformed-backlog-publication"></a>

### 1. Take planned work through the canonical backlog operation

**Identity:** SEED-022#prevent-malformed-backlog-publication

**Status:** Refined and planned on 2026-09-22; not taken.

**Goal:** A developer starting an executable plan through Open Dough gets a
valid Taken claim because the executing agent invokes the installed backlog
take operation instead of constructing Markdown.

**Scope:**

- Cover the execute-plan transition of one queued feature story with an
  executable plan into **Taken**, including its plan link.
- Make the existing `product-backlog.mjs take --identity ... --plan ...`
  operation the explicit action at that boundary; the writer remains the sole
  owner of entry syntax and validation.
- Shorten the affected take guidance compared with the `0.3.28` source by
  removing duplicated, indirect, or stale wording. Do not satisfy this story by
  adding instructional lines.
- Preserve the existing execution authority, workspace, commit, and publication
  rules around the Taken claim.

**Excluded:** Changes to the backlog parser or dashboard; new shell, Git, or
host-hook enforcement; other backlog verbs; planless work and bounded
corrections; installation mechanics; and release/version work.

**Key examples:**

- Given a queued story and resolved plan, when a fresh agent starts that plan
  from an ordinary-language request, it runs the installed `take` operation and
  the resulting entry contains the canonical `([plan](...))` form.
- The same journey does not use Python, shell redirection, or a native file-edit
  tool to construct the backlog entry.
- The affected take instructions contain fewer lines than the `0.3.28` source
  while retaining the surrounding authorization and publication constraints.

**Evaluation:** Existing deterministic take-operation tests remain green. A
fresh native Claude Code journey—the host on which both recurrences were
observed—receives no script name, command, or Markdown syntax, and its
transcript plus resulting backlog prove that it selected the installed take
operation. Existing Codex and Cursor installed-workflow evidence is reused if
the unchanged shared delivery mechanism remains applicable; invalidated proof
stays pending under ADR 0005.

**Depends on:** The existing `product-backlog.mjs take` operation and the
execute-plan queue-claim workflow.

**Safe stopping point:** Planned-work claims use one existing format owner and
the relevant guidance is shorter; unrelated backlog and execution behavior is
unchanged.

## Ordering and Scope Reduction

This remains the first backlog story because the current failure hides every
published item from the dashboard. The story stops after the observed planned
queue-to-Taken path uses the existing writer; broader enforcement is not a
prerequisite.

## When to Surface

Now, before another agent-operated Taken transition can publish an unreadable
backlog.

## Breadcrumbs

- Doughnut `12702ca6049c` (2026-09-22) used Python to publish the unsupported
  plan-link form after Open Dough `0.3.28` was installed.
- Doughnut `9e75c98921da` (2026-09-21) used the same bypass; `168705555687`
  later repaired the entry to the canonical form.
- `product-backlog-take.mjs` already renders and validates the canonical entry.
- Accepted ADR 0002 requires a systematic response to a recurring cause; ADR
  0005 governs reusable native evidence; ADR 0006 requires one concise,
  authoritative runtime instruction.
