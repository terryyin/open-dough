---
id: SEED-105
status: active
planted: 2026-10-05
planted_during: Terry's request for optional process retrospectives on Dough Land and Story Wrap Up
trigger_when: A developer wants to learn from how a Dough Land or Story Wrap Up run went
scope: unestimated
---

# SEED-105: Optional process retrospective for Dough Land and Story Wrap Up

## Why This Matters

Process review learns from how an agent worked, but today only the execution
retrospective offers it. Dough Land and Story Wrap Up also do substantial,
rule-driven work: reconciling and publishing trunk, retiring worktrees,
assimilating product knowledge, and handling follow-ups. Waste, churn, missing
stops, or unusable instructions in those runs go unrecorded. An opt-in process
retrospective lets a developer capture that learning in the same retrospective
findings without slowing ordinary runs.

## Story

<a id="land-and-wrap-up-process-retrospective"></a>

### Optional process retrospective for Dough Land and Story Wrap Up

**Identity:** SEED-105#land-and-wrap-up-process-retrospective
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/250-land-and-wrap-up-process-retrospective/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ff405a852a731eadc8cae95c23eaea8c05c027203ddc6eb73d2ae13a3fd68387","plan":"08bc32a0219e1e65914723ca631798060f60fbc488c2fdeda71a9955d125d0eb"}}
```

**Goal:** A developer who invokes Dough Land or Story Wrap Up with
`--process-retrospective` gets a process review of that run whose supported
findings are published in the same retrospective findings (`DearDough.md`) as
the execution retrospective's process review, so learning from landing and
closing work is kept without slowing ordinary runs.

**Scope:**

- Dough Land and Story Wrap Up each accept `--process-retrospective` on their
  own invocation. Without it, neither runs a process review nor reads the
  process log for one, as today. The flag is the only switch: the project's
  `skipProcessRetrospective` setting keeps governing the execution
  retrospective alone, so a project that enables it there still lands and
  wraps up without a process review (Terry's request: off by default, turned
  on by the flag).
- With the flag, review the run's own process from its real record, as the
  [execution retrospective's process review](../../src/skills/dough-execution-retrospective/SKILL.md#review-process-only-from-a-real-record)
  does, and record supported findings through the same
  [process-finding recording](../../src/skills/dough-execution-retrospective/references/process-finding-recording.md)
  into the same `DearDough.md`, written in the run's own checkout: the landing
  checkout, or the wrap-up's execution checkout.
- **Dough Land** reviews once its publication is accepted, so the review covers
  resolving the checkout and target, committing, reconciliation, and
  publication. Recorded findings are committed and published from the same
  checkout through Dough Land's ordinary commit and publish steps before the
  default-checkout refresh and worktree retirement.
- **Story Wrap Up** reviews after spent history is deleted and before the final
  closure commit, so the review covers context resolution, knowledge
  assimilation, follow-up and product-decision handling, recovery, and cleanup.
  Recorded findings are part of that final closure commit and reach trunk with
  the wrap-up's own closure publication in every mode.
- The review and its recording never undo or block the run: unavailable
  history, an unresolved log location, a refused write, or a findings
  publication that stops leaves the already accepted landing accepted and lets
  the wrap-up close, and is reported as attention with the next action. A
  stopped findings publication keeps the worktree, as any unpublished work
  does.
- The final response names recorded finding IDs, or why the review was
  unavailable or findings were not recorded; a review with no supported
  findings adds nothing to it. Dashboard completion reporting stays the final
  operation, after the review and any findings publication have settled, and
  carries that response as its attention message.
- Reuse the existing process review and recording rather than adding a second
  copy of either.
- Describe the flag where each skill describes its invocation.

Deferred, not rejected:

- Reviewing the steps after the review point: Dough Land's refresh and
  retirement, Story Wrap Up's final publication, integration, and retirement,
  and dashboard reporting in both. Their failures already surface through
  completion attention.
- Offering the flag from the dashboard or passing it through another skill's
  keep, one-shot, or auto-land path; a developer adds it to the skill's own
  invocation.

**Key examples:**

- `/dough-land` alone lands as today and runs no process review, also in a
  project whose `open-dough.json` sets `skipProcessRetrospective: false`.
- `/dough-land --process-retrospective` on an owned worktree: the reviewed
  change is accepted on trunk; the review then finds repeated trunk
  reconciliation attempts caused by an unclear rule and records a finding in
  the worktree's `DearDough.md`; that edit is committed and published to the
  same target; the default checkout is refreshed to the tip holding it; the
  worktree is retired; the final response names the finding's ID.
- The same landing where another writer changed `DearDough.md` meanwhile and
  the findings publication stops on the conflict: the reviewed change stays
  accepted, the worktree and its findings commit stay, and the response
  reports the unpublished findings and the rerun that continues from there.
- `/dough-story-wrap-up --process-retrospective`: after cleanup, the review
  records a supported finding about the wrap-up's process; the final closure
  commit contains the `DearDough.md` edit together with the cleanup, and trunk
  holds both once closure publication is accepted.
- A flagged run with no supported findings leaves `DearDough.md` unchanged,
  makes no extra commit or publication, and completes as quietly as an
  unflagged run.
- A flagged run whose history is unavailable reports the process review
  unavailable and still completes the land or wrap-up.

**Architecture:**

- The process review and its recording stay owned by the execution
  retrospective skill; Dough Land and Story Wrap Up link to those two sections
  and add only when to run them and how their writes are published. This keeps
  one shared behavioral source and wording for the agent working in its own
  project, as
  [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  requires.
- The execution retrospective never commits or publishes; its invoking
  workflow does. Each caller here is that workflow and publishes the log edit
  on a path it already owns: Dough Land's rerun rule already continues from
  uncommitted changes through commit and publish, and Story Wrap Up already
  commits owned process-log edits as closure changes. No new publication
  sequence, script result, or observer obligation is added.
- The review sits at the last point where the log still travels with the run's
  own publication, like writing up the technical log before handing the
  aircraft over. For Dough Land the publication is the work under review, so
  the write-up needs one further small publication; for Story Wrap Up the
  final closure commit carries it. The comparison stops there: unlike a log
  entry, that further publication can itself conflict or be refused, and it is
  not reviewed in turn.
- An occurrence's execution identity follows the existing recording rule: the
  work identity the run serves when its context names one, otherwise the
  landing's accepted revision on its target as the stable execution-record
  reference.
- [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md) applies
  to proof: deterministic checks cover the guidance and payload, and any
  native-host observation of a flagged run is a separate, manually run
  acceptance.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dough Land](../../src/skills/dough-land/SKILL.md).
- [Story Wrap Up](../../src/skills/dough-story-wrap-up/SKILL.md).
- [Execution retrospective](../../src/skills/dough-execution-retrospective/SKILL.md).
- [Learn across execution retrospectives](SEED-010-learn-from-execution-retrospectives.md).
- Terry's 2026-10-05 request: land and wrap-up should have their optional
  process retrospective as well, off by default and turned on by
  `--process-retrospective`, putting the process review result into the same
  retrospective findings as the execution retrospective.
