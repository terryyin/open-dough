# Use proportionate refactoring for small test edits

**Source:** [SEED-345#use-proportionate-refactoring-for-small-test-edits](../../seeds/SEED-345-session-token-efficiency.md#use-proportionate-refactoring-for-small-test-edits)

## Goal and scope

Delivery step 1 replaces its two special cases for skipping the fresh refactor
pass with one rule: skip it when the change edits only records, or only an
accepted refactor return's traced paths or the slice's subject specs and the
coordinator's acceptance read, with a product search for existing
representations of what the edit adds, finds no refactor-check candidate.
Otherwise, or when unsure, the fresh pass runs, given any candidate by name.
The edited guidance ends shorter in total than today and names fewer special
cases, without losing an existing condition. Whole-product focus is unchanged and not
in question. [ODF-141](../../../docs/maintainer/findings/ODF-141.md#evidence-2026-11-23-open-dough-dd-610)
records the baseline.

## Current decisions

- **Simplify, never add.** The change replaces the records-only and
  already-traced special cases in
  [deliver the change](../../../Distribution/src/skills/dough-execute-plan/references/deliver-the-change.md)
  step 1 with the one rule, and step 2 and the
  [post-change refactor](../../../Distribution/src/skills/dough-post-change-refactor/SKILL.md)
  discovery refer to "a retained disposition" instead of listing kinds. The two
  files end shorter in total than premise 1's baseline of 19,582 bytes. Records-only and
  already-traced deliveries behave exactly as before, and the next fresh pass
  still reviews every disposition's committed diff. If the rule cannot be
  stated clearly for an executing agent
  ([ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md))
  within that length, revert and record no change. A scratch draft of the
  merged step 1 measured about 50 bytes longer than today's two cases, while
  dropping the post-change refactor's listed kinds saves about 85, so the
  budget is tight but reachable.
- **The judgment rides on acceptance.** The coordinator already holds the
  accepted diff and consumer trace. The rule adds one product search and a
  retained disposition, and links the
  [refactor checks](../../../Distribution/src/skills/dough-post-change-refactor/references/refactor-checks.md)
  as the standard rather than restating them.
- **Keep or stop.** Keep the change only if it is shorter as above and the
  replay below prices eligible no-edit slices clearly below their retained
  fresh passes, catches every baseline finding and routes ineligible slices to
  the fresh pass. Otherwise revert and record no change. Either way, record the
  decision and its numbers in ODF-141, counting the replay's own cost under
  [ADR 0010](../../../docs/adrs/0010-definition-of-improvement-accepted.md).

## Decisive premises

1. **Baseline length.** At `c35d3a8b3`, `wc -c` reads 9,536 bytes for
   `deliver-the-change.md` and 10,046 for `dough-post-change-refactor/SKILL.md`.
   Step 1 names two special cases, and the post-change refactor discovery lists
   both by name. On 2026-11-23 at `089df69be`, the
   [read budget](../../../Distribution/tests/skills/dough-execute-plan/read-budget.test.mjs)
   row "Before delivery, or a validated increment or owned repair publication"
   read 28,998 of 30,000 bytes, so a shorter step 1 only adds headroom.
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

### 1. Skip the fresh pass on a clean own-spec change
Type: Behavior
Status: done

Merge step 1's special cases into the one rule and generalize step 2 and the
post-change refactor discovery. Apply the
[skill authoring behavior review](../../../.agents/skills/author-open-dough-skills/SKILL.md#behavior-review)
to both distributed skills. Estimate 30–45 active minutes, mostly replay.

**Proof.**

- `wc -c` on both edited files totals below premise 1's 19,582 bytes, and
  step 1 names one skip rule where it named two special cases.
- `bash scripts/test.sh Distribution/tests/skills/dough-execute-plan/read-budget.test.mjs`
  passes with the edited guidance.
- Replay, with the edited guidance, by the executing coordinator in its own
  context. For each case, check out the parent revision in a scratch
  worktree, apply the case's diff, and apply the rule as written.
  Count the added requests and tokens from this session's transcript.
  Price them at premise 2's median coordinator context, because this
  session's context differs from that of a mid-execution coordinator.
  - Plan 754 slices 2, 3, 5, 6 and the CI repair skip the fresh pass with no
    candidate. Each is priced below its retained pass.
  - Plan 754 slices 1, 4 and 7 keep the fresh pass from their paths alone.
  - The reconstructed plan 249 slice 1 diff runs the fresh pass with the
    existing `markAsDone` helper named.
  - A scratch edit to one plan 754 Done capture spec that inlines setup two
    sibling specs already repeat runs the fresh pass with the duplication
    named. Revert it after the observation.
  - A records-only change and an already-traced repair skip the pass as they
    do today.
- Record the length comparison, the replay's request counts, prices and
  outcomes, its own cost, and the keep-or-stop decision in ODF-141 under the
  2026-11-23 DD-610 evidence.

**Accepted proof.** Both files total 19,575 bytes and step 1 names one rule.
The read-budget test passes. The replay, recorded in ODF-141, skips slices 2,
3 and 5 and the CI repair for about $0.52 against $1.97 of retained passes. It
routes slices 1, 4 and 7, the plan 249 control (naming `markAsDone`) and the
scratch duplication (naming both siblings) to the fresh pass. Slice 6 also
goes to the fresh pass, naming a sibling spec that still inlines the attempt
chain `reportingFor` replaces. Decision: keep. The replay read each parent
revision through `git grep` and `git show` instead of scratch worktrees.

## Local gate and readiness

Only the read-budget test and the replay above run locally, under the
[failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md).
No long run is planned. If one becomes necessary, start it fully awake with
`caffeinate -s -i` on AC. On battery, plug in or keep the lid open under
`caffeinate -i` and inspect the sleep log afterward.
[Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)

One Behavior slice owns the guidance, its evaluation and the keep-or-stop
record. Slice-plan refinement is not needed, because the change rewrites one
existing step and the replay owns its proof. No remaining
slice concern was identified.

## Story obligations
