# Check a reported gap against the paths the story guides

**Identity:** SEED-132#check-gap-dispositions-through-guided-paths
**Source:** [selected story](../../seeds/SEED-132-acceptance-follows-reachable-behavior.md#check-gap-dispositions-through-guided-paths)

## Goal and scope

A developer receives the promised story behavior when a return reports a
limitation: acceptance checks the relevant paths before closing it as `no user
cost` or `proved`. A reachable contradiction or missing observation stays with
an explicit owner; a justified harmless limitation closes with proportional
inspection. Preserve independently accepted proof and human ownership of scope.

Implement one common judgment rule for the entry, continuation, failure/recovery
and handoff paths relevant to a reported state. Do not turn those categories
into mandatory entries for every slice. Preserve obligation IDs, original
reported text and provenance, existing dispositions, genuine exclusions and
changed-promise authority. Update ODF-223 with the response and its evaluated
limits during delivery; implementation does not itself resolve the finding.

Historical integration/worktree repairs, indirect consumer-proof selection
(the sibling story), general graph discovery, a new obligation schema, native
host integration machinery, and a release are not delivery commitments.

## Existing solutions and current decisions

PFE places this responsibility in
[story-obligations.md](../../../src/skills/dough-execute-plan/references/story-obligations.md),
reached from [Accept proof](../../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof).
That reference already owns gap identity, story clauses, dispositions and
receiving/interim ownership. Strengthen its judgment before closure and link
from acceptance where needed; keep one authoritative procedure. The selected
story, not a narrowed plan or a return's stated cause, supplies the promise.

The [record checker](../../../src/skills/dough-execute-plan/scripts/story-obligations.mjs)
and [reader](../../../src/skills/dough-execute-plan/scripts/story-obligation-reader.mjs)
validate grammar, quotes and ownership. They cannot infer arbitrary projects'
reachable behavior. Reuse them unchanged unless implementation discovers a
concrete compatibility need. No new mandatory field, per-path entry or second
acceptance record is needed: use the existing disposition reason/proof location
and ordinary acceptance evidence for the inspected path and result.

[Executable proof](../../../src/skills/dough-story-refinement/references/executable-proof.md)
already owns sufficient observations and evidence reuse;
[delegation](../../../src/skills/dough-execute-plan/references/delegation.md)
passes open obligations; completion and replanning already check or transfer
them. Use those boundaries rather than copying their rules. The older
`tests/support/delivery-evidence-gaps-native-*` helpers assess readiness/requeue
proof omissions, not these guided-path decisions; their passing results would
not prove this story. Do not broaden that harness solely to manufacture a pass.

Follow [AGENTS.md](../../../AGENTS.md)'s representative behavior review and
source ownership. Author runtime changes only under `src/skills/`; installed
managed copies remain untouched. Relevant Accepted decisions are
[ADR 0003 — Release lifecycle and versioning](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0005 — Cross-tool validation through native acceptance stories](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
and [ADR 0006 — Write skills for executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Use direct project-relative instructions and one shared behavior across hosts.
The ADR index agrees with their in-file status. The existing
[North Star](../../NORTH-STAR.md) adds no new gap-disposition responsibility;
no architectural decision, exception or new topic is needed.

## Decisive premises and preparation observations

Observed on 2026-10-12 in
`/Users/terryyin/git/open-dough/.worktrees/check-a-reported-gap-against-the-paths-the-story`,
base `a54368f58f0f4cdd9f267db80a45f82e700132ac`, Node v24.21.0. Ran the documented
`node scripts/setup-native.mjs npm`, `browser` and `check` stages successfully;
the check launched and closed Chromium 153.0.8010.12. This is local test setup,
not native Codex/Cursor/Claude behavior evidence.

1. **The current structural check cannot settle the disposition.** An owned
   temporary fixture held a selected story clause, one planned slice, and a G1
   report that capture is absent when trunk already contains the tip. With the
   same story/report, invoked the consuming CLI literally as
   `node src/skills/dough-execute-plan/scripts/story-obligations.mjs check --plan <owned-temp>/PLAN.md --slice 1`.
   Results:

   | Disposition supplied | Observed result |
   | --- | --- |
   | `no user cost "The developer can review the story after accepted integration": only other means can produce this state` | Exit 0, `ok: true`, `entryCount: 1`, with no path evidence supplied |
   | `proved by slice 1: missing-proof.mjs` | Exit 0, `ok: true`, despite the named file being absent |
   | `return` | Exit 1, `open-obligation`, G1 owned by slice 1 |

   The story text was `The developer can review the story after accepted
   integration.`; its normalized clause omitted the final period. The source
   was `[story](story.md#selected)`, with the selected anchor in that sibling
   file. The report was `Capture is absent when trunk already contains the
   tip.` These inputs reproduce the observation without any product edit.
   The temporary fixture was deleted before this plan was written. This
   observes the checker's intended boundary, not a checker defect or a fresh
   reproduction of the historical product failures.
2. **Existing format/boundary proof runs here.**
   `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/story-obligations-guidance.test.mjs src/skills/dough-execute-plan/scripts/story-obligations.test.mjs`
   exited 0 with empty output. Inspected setup/assertions in the guidance test
   exercise reading, listing, rejection of open obligations, and closure via a
   supplied proof location. They do not execute an agent's semantic judgment;
   do not claim them as the behavioral proof for the new rule.
3. **The reported failures have retained acceptance checkpoints.** Read the
   original G5 in plan 292 at `1d2de5da4b38eb379caa25da45e9254c42949795`, G9 in
   plan 296 at `0ff0e2421c6260ef25d584323d62b86c51758f3b`, and G3 in plan 295 at
   `1417faf986a208084aa0a774ed3dd27f917bbb05` using
   `git show <revision>:.planning/slice-plans/<plan-directory>/PLAN.md`.
   [ODF-223](../../../docs/maintainer/finding-names.md#odf-223) retains the exact
   paths, returns, post-acceptance observations and provenance. The decisions
   respectively closed absent capture as costless, ruled out two authors from
   start alone, and called the whole merge gap proved from the initial guard.
   These are retained historical results, not newly run failures of today's
   repaired products. The approach depends on improving their acceptance
   judgment, not on those old product defects still existing.

No native host, paid service or live destructive operation is required to
settle the planned guidance location and local proof route. Native behavioral
coverage is not inferred from the observations above.

## Outside-in proof ownership

All rows belong to slice 1. Use the selected story's four examples as the
representative behavior review. Before evaluating a historical case, recover
its original story clause, return, relevant guidance and accepted proof from
the catalog's revisions. Preserve the checkpoint and any existing later owner;
do not substitute a fresh slice with missing happy-path proof. Keep expected
dispositions in the review criteria, not an agent-use prompt if a native run is
chosen. Record whether evidence is recovered, a constructed control, a current
walkthrough or a fresh native observation.

| Promise | Observable acceptance result |
| --- | --- |
| Hand-resolved integration is considered even when the return says “other means” | Follow the original conflict instruction through hand resolution and accepted push to capture/review. Name the contradictory promise and return it or retain its valid open owner; do not close it from happy-path proof. |
| Handoff states are not limited to what one start creates | Follow requeue and another agent's Take while the prior worktree survives. Compare with the actual card-agent requirement, and keep the false ambiguity open. A fresh-start-only explanation fails this review. |
| `proved` covers the guided continuation | Trace the foreign-merge refusal, guided commit and rerun to the preserved-work result. A passing first guard cannot close the later loss; return the contradiction or name the missing terminal observation and owner. |
| Harmless gaps close proportionately | Use the story's constructed diagnostic-order control. Inspect the relevant paths to establish that order neither reaches the user nor chooses/mutates work; accept the concrete costless reason. Record the inspection and any new commands, and reject a blanket rerun or unrelated obligations as added cost. |
| Identity, ownership and valid evidence survive | Each bad decision retains its G ID, original quote and provenance, with an appropriate existing disposition. A valid receiving/interim owner stays attached; genuine story exclusion/authorized change stays authoritative. Unknown evidence keeps only the dependent promise open. Sufficient current proof closes it without another approval. |
| The response is evaluated honestly | Compare each reviewed decision with ODF-223's retained unsupported decisions. Record useful outcomes and additional work, implementation SHA, release only when known, and remaining behavioral/native evidence limits in ODF-223. Keep it unresolved unless later evidence supports resolution. |

These observations evaluate what following the changed instruction requires.
A wording assertion, checker success, entry count or self-reported understanding
alone cannot pass the behavior review. If the trace depends on an uncertain
runtime fact, use the smallest safe isolated observation or leave that example
unproved; do not close it with new reasoning of the same unsupported kind.

## Ordered slices

### 1. Acceptance closes a reported gap only when its relevant paths support closure
Type: Behavior
Status: planned
Proof: the mapped representative walkthroughs, preserved record/boundary checks,
and ODF-223's response evaluation.

Behavior: given a return proposing `no user cost` or `proved`, acceptance checks
the selected story promise against relevant producing and consuming paths.
A reachable contradiction or unobserved promised result retains an explicit
owner; a demonstrated harmless limit or sufficiently proved behavior closes
without unrelated work or repetition of accepted observations.

Change the existing obligation judgment in place and keep its acceptance
entry link clear. Read the relevant paths far enough to see the result, using
existing proof and a missing observation only when needed. Include the
three historical failure mechanisms and benign control in the same review;
these are boundaries of one rule, not case-specific handlers. Align only
actually affected reference links and documented examples. Record the
response/evaluation in the finding catalog with the delivery commit once known.

Run the two observed checks above through `scripts/test.sh` to preserve the
executable record example and acceptance wiring. Add or change a deterministic
check only for a changed executable contract or meaningful maintained example;
avoid new tests that merely pin instruction phrases. If runtime links change,
run `PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/payload-declaration-links.sh`.
Ordinary commit hooks remain required. The repository's guidance, not the CI
job list alone, supplies these local checks; no dashboard-wide test run is
justified for this guidance change.

Walk one representative invocation from discovery through required project
context to the useful acceptance decision under AGENTS.md, and then assess the
remaining examples above. This conventional guidance change introduces no host
discovery or integration mechanism. Apply ADR 0005 when judging native evidence:
reuse only applicable observations and make no all-host success claim from this
review. Any native requirement found unresolved must remain explicit in linked
acceptance work before affected release; it is not silently marked passed.

Safe stop: one shared judgment rule, its useful behavior review and response
evaluation land together. No intermediate weaker rule or deferred cleanup
slice. Boundedness is one coherent acceptance outcome and proof loop, including
verification and cleanup; no numeric slice target or hard limit was supplied.

## Review and execution gates

Slice-plan refinement was not needed: the examples exercise one common rule,
all final promises have an owner and an observable review result, and no
additional structure or independent outcome is hidden in the slice. No remaining
slice-specific concern was identified. Future walkthrough results and native
use are not claimed by this preparation.

Authorized execution uses the installed workflow's independent post-change
refactor, focused proof, commit and delivery gates. Planning does not Take the
story, implement the guidance, alter the sibling, or resolve ODF-223. This
preparation changes only records; verify links, the recorder result and
whitespace before landing.
