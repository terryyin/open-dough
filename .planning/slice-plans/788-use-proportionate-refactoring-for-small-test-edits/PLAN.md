# Use proportionate refactoring for small test edits

**Source:** [SEED-345#use-proportionate-refactoring-for-small-test-edits](../../seeds/SEED-345-session-token-efficiency.md#use-proportionate-refactoring-for-small-test-edits)

## Goal and scope

When a slice's change edits only the spec files the slice names as its subject,
plus planning records, the coordinator reviews it against the refactor checks
during its acceptance of the return instead of launching a fresh refactor agent.
The review keeps the fresh pass's whole-product reach and escalates any
candidate to the fresh pass before delivery, including a small edit that tips a
repeated pattern, a file's size or a test's boundary into needing structural
change. Shared test support, production code, configuration, documentation and
consumers outside the slice keep the fresh pass. The refactor checks, the fresh
pass and the records-only and already-traced dispositions stay as they are.
[ODF-141](../../../docs/maintainer/findings/ODF-141.md#evidence-2026-11-23-open-dough-dd-610)
records the baseline.

## Current decisions

- **Whole-product focus is the restriction's reason.**
  [ADR 0002 principle 2](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#2-whole-product-focus)
  gives each concept one representation and lets no story boundary limit a
  necessary solution. The focused review narrows how evidence is gathered, not
  which issues count. Any candidate goes to the fresh pass, which keeps its
  edits beyond the slice's files and its existing stops. The focused review
  edits nothing.
- **The review rides on acceptance.** One coordinator request at the plan 754
  median context costs about a sixth of a no-edit fresh pass. The review
  therefore reuses the acceptance diff read and the implementer's consumer
  trace, adds one product search for existing representations of what the
  edit introduces, and records its disposition. It reads
  [refactor checks](../../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md)
  at most once per execution.
- **Guidance home.** Step 1 of
  [deliver the change](../../../Distribution/src/skills/dough-execute-plan/references/deliver-the-change.md)
  owns refactor dispositions, so the focused-review disposition joins
  records-only and already-traced there. Step 2's marker requirement and the
  [post-change refactor](../../../Distribution/src/skills/dough-post-change-refactor/SKILL.md)
  discovery of supplied dispositions name the dispositions generally rather
  than listing two. The delivery boundary row has about 1,000 bytes of headroom
  (premise 1), so the added rule fits there or the step is compacted to fit.
  The shared budget stays unchanged.
- **Keep or stop.** Keep the guidance only if the replay below prices eligible
  no-edit slices clearly below their retained fresh passes, catches or
  escalates every baseline finding, and routes ineligible slices to the fresh
  pass. Otherwise revert the guidance and record no change. Either way, record
  the decision and its numbers in ODF-141. The next real execution with
  isolated test edits supplies the later keep-or-stop check the seed names.
- Follow [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  for executing-agent wording and
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md)
  for counting the replay's own cost against the result.

## Decisive premises

1. **Read budget.** On 2026-11-23 at `089df69be`, a scratch copy of
   [read-budget.test.mjs](../../../Distribution/tests/skills/dough-execute-plan/read-budget.test.mjs)
   in the job tmp directory, with absolute paths and `BUDGET_BYTES = 0`,
   printed each boundary row under Node 24.21.0. The row "Before delivery, or a
   validated increment or owned repair publication" read 28,998 bytes against
   the 30,000-byte budget. "Before accepting a return" read 15,770. The
   unmodified test passed. Any text added to `deliver-the-change.md` counts
   against both rows.
2. **Baseline cost.** The plan 754 coordinator session
   `c4b4c5bf-6c4c-466b-8329-490437de3ca0` and its subagents remain under
   `~/.claude/projects/-Users-terryyin-git-open-dough--worktrees-tie-done-capture-cases-to-the-real-branch-entry/`.
   Deduplicating assistant records by `message.id` and pricing Opus 5.5 at
   $4 input, $20 output, $0.20 cache read, $5 five-minute write and $8 one-hour
   write per million tokens gives the refactor passes below. Commit order
   matches pass start times.

   | Pass | Commit | Changed paths beyond records | Requests | List price | Eligible |
   | --- | --- | --- | --- | --- | --- |
   | Slice 1 | `41a73f63b` | 2 specs, `backend-tests/README.md` | 7 | $0.36 | no, documentation |
   | Slice 2 | `465efa3a8` | 1 spec | 12 | $0.41 | yes |
   | Slice 3 | `dc5ffe2f5` | 3 specs | 10 | $0.41 | yes |
   | Slice 4 | `c8bf873fd` | 4 specs, `support/doneCaptureCase.ts`, a server spec | 40 | $1.48 | no, support |
   | CI repair | `2827eb3e6` | 1 spec | 20 | $0.72 | yes |
   | Slice 5 | `e177bbaa4` | 1 spec | 12 | $0.43 | yes |
   | Slice 6 | `05fe57038` | 3 specs | 9 | $0.35 | yes |
   | Slice 7 | `b854edc8b` | 1 spec, deletes `support/capturedCommandFetch.ts` | 8 | $0.33 | no, support |

   Eligible passes total $2.32. In the slice window from 12:15 to 14:00 UTC,
   the coordinator's 98 requests had a median cached context of 204k tokens and
   a median cost of $0.065. The whole coordinator session cost $10.67.
3. **Escalation control.** At `ebb48d6ee~1`,
   `git grep -n "Mark as done" -- dashboard/tests/support/markDone.ts`
   finds `markAsDone` returning `scope.getByRole("button", { name: "Mark as done" })`
   at line 21. Commit `ebb48d6ee` shows the post-refactor spec. The
   implementer's version is reconstructed by restoring the removed local
   locator in place of each `markAsDone(card)` call and the original
   `markDone`-only import, as ODF-141 describes. The exact implementer text is
   the unverified remainder. The locator, its existing helper and the single
   changed spec are what the review must find, and they are all observed.

## Ordered slices

### 1. Review own-spec changes during acceptance
Type: Behavior
Status: planned

Add the focused-review disposition to delivery step 1 and generalize the
disposition wording in step 2 and in the post-change refactor's discovery.
Apply the [skill authoring behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review)
to both distributed skills. Estimate 30–45 active minutes, mostly replay.

**Proof.**

- `bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/read-budget.test.mjs`
  passes with the edited guidance.
- Replay, with the edited guidance, by the executing coordinator in its own
  context. For each case, check out the parent revision in a scratch
  worktree, apply the case's diff, and perform the focused review as written.
  Count the added requests and tokens from this session's transcript.
  Price them at premise 2's median coordinator context, because this
  session's context differs from that of a mid-execution coordinator.
  - Plan 754 slices 2, 3, 5, 6 and the CI repair are eligible and record the
    disposition with no candidate. Each is priced below its retained pass.
  - Plan 754 slices 1, 4 and 7 are classified ineligible from their paths
    alone and route to the fresh pass.
  - The reconstructed plan 249 slice 1 diff escalates on the existing
    `markAsDone` helper.
  - The tipping-point case is a scratch edit to one plan 754 Done capture spec
    that inlines setup that two sibling specs already repeat. It escalates as
    aggravated duplication. Revert it after the observation.
- Record the replay's request counts, prices and outcomes, the replay's own
  cost, and the keep-or-stop decision in ODF-141 under the 2026-11-23 small
  test edits section.

## Local gate and readiness

Only the read-budget test and the replay above run locally, under the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
No long run is planned. If one becomes necessary, start it fully awake with
`caffeinate -s -i` on AC. On battery, plug in or keep the lid open under
`caffeinate -i` and inspect the sleep log afterward.
[Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)

One Behavior slice owns the guidance, its evaluation and the keep-or-stop
record. Slice-plan refinement is not needed, because the change adds one
disposition to an existing step and the replay owns its proof. No remaining
slice concern was identified.

## Story obligations
