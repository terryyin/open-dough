---
id: SEED-028
status: active
planted: 2026-09-24
planted_during: Product backlog capture requested by the maintainer
trigger_when: Authorized product work would start outside the product backlog
scope: unknown
---

# SEED-028: Make ad hoc work visible in the product backlog

## Why This Matters

Developers cannot coordinate product work they cannot see. Bug fixing and test
optimization can start from a direct request without appearing alongside queued
stories. The problem is the missing admission into shared work tracking, rather
than a distinct kind of execution or completion.

## Alternatives and Direction

For developers coordinating concurrent product work, independently accepted work
that currently bypasses the queue should become visible with ordinary story
ownership and closure, while an explicit `--one-shot` option keeps genuinely
trivial work proportionate.

Doing nothing retains the visibility gap. Manually assembling a seed, claim and
profile with existing tools is the strongest smaller alternative, but leaves
each entry workflow responsible for remembering and publishing a consistent
claim. A rule to "remember the backlog" alone does not establish that boundary.
Use shared admission and the ordinary lifecycle, with one explicit exception for
one-shot work. These alternatives are the decomposition's rationale, not claims
that a manual experiment has already been performed.

The first story tests whether minimal story admission makes real emergent work
visible without forcing a plan. The second tests whether the trivial-work
exception can remain cheap without hiding work that grows. Research and necessary
cross-layer changes belong within these outcomes, not in separate infrastructure,
dashboard or research stories.

## Story Decomposition

**One-shot native acceptance on Claude Code** is complete. Claude Code runs of
`publication/one-shot-result`, `publication/one-shot-queued` and
`publication/admission-investigation` passed with fresh proof against guidance
revision `5181d769` on 2026-09-27. Codex, Cursor and escalation remain pending,
so one-shot is not yet natively accepted for release under
[ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md).

<a id="native-one-shot-acceptance"></a>

### 4. Accept one-shot natively on Claude Code

**Identity:** SEED-028#native-one-shot-acceptance
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/135-native-one-shot-acceptance/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"d8819fa7bb52a8687e6c260b55385d2e59f9913934568558c770c9d666d6ac8d","plan":"5fbd2b799d381263e5b7215bdd2659f89d9e262b6deb06f68f14e1794ec60bd2"}}
```

**Goal:** A Claude Code agent asked for explicit one-shot work publishes only
its verified result, and completes a queued story in one commit.

**Why:** [ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)
requires native behavior evidence before release; the one-shot guidance has
mechanical proof only. The remaining risk is agent judgment the scripts do not
cover: selecting `--one-shot` only when asked, and composing a queued story's
closure into the result commit.

**Scope:**

- Two manual native cases in `tests/git-publication-native.sh`, named in plan
  112 (recoverable at
  `36e62435:.planning/slice-plans/112-one-shot-work/PLAN.md`):
  `publication/one-shot-result` and `publication/one-shot-queued`. Each has a
  fixture, a prompt that asks for one-shot work without naming the command or
  flag, observation of every push origin accepts, and an assessor.
- Credential-free assessor counterexamples for both cases in the harness's
  default mode, so a wrong assessment fails without a paid run.
- The "only when asked" half reuses the existing
  `publication/admission-investigation` case: the same kind of unlisted
  request without a one-shot request is admitted to Taken first. It needs no
  new case, only a Claude Code run under the current guidance.
- One paid Claude Code run of each of the three cases, with the developer's
  agreement, recorded with its results directory and verdict.
- A failure caused by the fixture or prompt is fixed there and rerun once. A
  failure caused by the installed guidance is fixed in the guidance within
  this story, because the goal needs it; that changes the guidance version, so
  every case is rerun on it.

**Key examples:**

- An unlisted small request ("add a line to `notes.txt`, as one-shot work")
  with a human edit in the integration checkout → origin trunk gains exactly
  one commit, the result, with no backlog, seed, plan or agent-profile change;
  the owned workspace is retired; the human edit is intact.
- The same kind of unlisted request with no one-shot request
  (`admission-investigation`) → the story is admitted to Taken on origin
  before the first substantive action, as before.
- Queued story A with its plan, and queued sibling B below it; the developer
  asks to complete A as one-shot work → origin trunk gains one commit holding
  A's result, A's removal from the backlog, and A's spent story section and
  plan; no push ever shows A under Taken; B stays queued in its place.
- Failing counterexamples: a second commit on trunk, any Taken entry or agent
  profile on origin, a surviving workspace, or a changed human edit each fail
  their case's assessor.

**Excludes:** Codex and Cursor, and escalation (stories 5 and 6); bug-fixing
and test-optimization entry routes; the ownership-changed race, interrupted
publication resume and carry conflict, which deterministic tests cover.

**Constraints:** Paid native runs are manually triggered only, once per case
per guidance version.

<a id="native-one-shot-escalation"></a>

### 5. Accept one-shot escalation natively on Claude Code

**Identity:** SEED-028#native-one-shot-escalation
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A Claude Code one-shot attempt that proves larger than one-shot
allows is admitted before further edits, keeps its edits, and continues without
an unnecessary approval stop (`publication/one-shot-escalation`).

**Feasibility first:** find a fixture where the agent discovers the growth
without the prompt supplying the expected answer; admitting up front is a
legitimate outcome, not a failure.

**Harness limits:** `tests/support/git-publication-native-one-shot.sh` (249
lines) and `tests/support/git-publication-native-assess.sh` (250) are at the
250-line limit, so an escalation case needs its own support file. The native
job measured 52.2 s on CI against `per-job-seconds=71`; if a further substitute
journey would breach that, move the one-shot substitute journeys into their own
test job.

<a id="native-one-shot-other-hosts"></a>

### 6. Accept one-shot natively on Codex and Cursor

**Identity:** SEED-028#native-one-shot-other-hosts
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Codex and Cursor agents pass the one-shot cases already accepted on
Claude Code; evidence from Claude Code does not transfer.

**Depends on:** Claude Code acceptance, now complete, and, for escalation,
[its feasibility](#native-one-shot-escalation). The result and queued cases
need no new fixture: run them with `--native codex` and `--native cursor`.
This story gates release of the one-shot guidance under ADR 0005.

## Breadcrumbs

- Maintainer capture on 2026-09-24; refinement decisions on 2026-09-26.
- [Product backlog](../PRODUCT-BACKLOG.md).
