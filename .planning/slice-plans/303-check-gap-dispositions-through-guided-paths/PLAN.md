# Check a reported gap against the paths the story guides

**Identity:** SEED-132#check-gap-dispositions-through-guided-paths
**Source:** [selected story](../../seeds/SEED-132-acceptance-follows-reachable-behavior.md#check-gap-dispositions-through-guided-paths)

## Goal, scope and decisions

Before closing a reported gap as `no user cost` or `proved`, check the selected
story's promise against the relevant producing and consuming entry, continuation,
failure/recovery and handoff paths. Keep contradictions or missing observations
owned; close demonstrated harmless limits proportionately. Preserve gap IDs,
original text/provenance, valid receiving/interim owners, genuine exclusions,
developer-authorized changed promises and independently accepted proof. Neither
a narrower plan nor the return's stated cause defines the whole promise.

Implement one common judgment rule, without mandatory path inventories,
per-path records, a new obligation schema or a second acceptance record. Update
ODF-223's response and evaluated limits; delivery alone does not resolve it.
Historical integration/worktree repairs, the sibling's indirect-consumer proof,
general graph discovery, native integration machinery and a release are outside
this delivery. No North Star topic, ADR decision or exception is needed.

PFE selects [story-obligations.md](../../../src/skills/dough-execute-plan/references/story-obligations.md),
reached from [Accept proof](../../../src/skills/dough-execute-plan/references/wrap-up.md#accept-proof),
as the authoritative judgment/ownership procedure. Use its existing disposition
reason/proof location and ordinary acceptance evidence. Keep the
[checker](../../../src/skills/dough-execute-plan/scripts/story-obligations.mjs) and
[reader](../../../src/skills/dough-execute-plan/scripts/story-obligation-reader.mjs)
unchanged unless a concrete compatibility need appears: they validate grammar,
quotes and ownership, not arbitrary projects' reachable behavior.
[Executable proof](../../../src/skills/dough-story-refinement/references/executable-proof.md)
owns evidence sufficiency/reuse; delegation, completion and replanning already
carry obligations. The older `tests/support/delivery-evidence-gaps-native-*`
readiness/requeue harness cannot prove these decisions; do not broaden it for a pass.

Follow [AGENTS.md](../../../AGENTS.md): edit runtime guidance only in `src/skills/`,
keep installed copies untouched, and review discovery, required project context
and a useful outcome. Relevant Accepted decisions (index/in-file statuses agree):
[ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md),
[ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md).
Use one shared source and direct project-relative instructions across hosts.

## Preparation observations

On 2026-10-12 in this execution checkout, base
`a54368f58f0f4cdd9f267db80a45f82e700132ac`, Node v24.21.0, documented
`node scripts/setup-native.mjs npm`, `browser`, `check` succeeded; the check
launched/closed Chromium 153.0.8010.12. This is local setup, not native host proof.

An owned temporary fixture used `[story](story.md#selected)`, story
`The developer can review the story after accepted integration.`, its normalized
clause without the period, one slice, and G1 report
`Capture is absent when trunk already contains the tip.` Ran literally
`node src/skills/dough-execute-plan/scripts/story-obligations.mjs check --plan <owned-temp>/PLAN.md --slice 1`:

| Disposition | Observed result |
| --- | --- |
| `no user cost "The developer can review the story after accepted integration": only other means can produce this state` | Exit 0, `ok: true`, `entryCount: 1`, no path evidence |
| `proved by slice 1: missing-proof.mjs` | Exit 0, `ok: true`, named file absent |
| `return` | Exit 1, `open-obligation`, G1 owned by slice 1 |

The fixture was deleted before planning. This establishes the checker's intended
boundary, not a checker defect or a fresh historical product failure. The focused
record/wiring command below also passed (exit 0, empty output) during preparation;
its read/list/open-refusal/supplied-proof assertions do not observe semantic judgment.
The historical checkpoints below were recovered with `git show <revision>:<path>`.
No native host, paid service or destructive live action was needed for this proof route.

## Proof ownership

Slice 1 owns every row. Recover each original story, return, guidance, accepted
proof and existing later owner; preserve the actual checkpoint rather than
constructing a fresh slice missing happy-path proof. If choosing a native run,
keep expected decisions in review criteria, outside its agent prompt. Label
recovered evidence, constructed controls, current walkthroughs and fresh native
observations accurately. Unknown runtime facts need the smallest safe observation
or remain unproved; wording, entry counts, checker success and self-report cannot pass.

| Promise | Required acceptance observation |
| --- | --- |
| Hand-resolved integration | Follow conflict guidance through resolution, accepted push and review; return missing capture or preserve its valid open owner |
| Handoff beyond one start | Follow requeue/another Take while the old worktree survives; compare with the card-agent requirement and retain false ambiguity as open |
| Guided continuation | Follow foreign-merge guard, commit and rerun; initial preservation alone cannot prove the terminal result |
| Harmless closure | Inspect diagnostic order's producer/consumers; establish no user exposure, selection or mutation; close without unrelated obligations/reruns |
| Identity and authority | Retain G IDs, quotes/provenance, valid receiving/interim owners, exclusions and authorized changes; missing evidence affects only its dependent promise |
| Honest evaluation | Compare decisions with ODF-223, record extra work, implementation SHA, release when known and remaining limits; do not resolve it from delivery |

## Ordered slices

### 1. Acceptance closes a reported gap only when its relevant paths support closure
Type: Behavior
Status: done
Proof: mapped representative walkthroughs, preserved record/boundary checks and ODF-223 evaluation.

Strengthen the existing obligation judgment and acceptance link. Read relevant
paths through their consuming result; reuse sufficient evidence and obtain only
missing observations. Review all three historical mechanisms and the harmless
control as boundaries of one rule. Align only affected links/examples and record
response/evaluation with implementation SHA once known. Run focused commands below
through the project runner; add deterministic checks only for changed executable
contracts or meaningful maintained examples, never phrase-pinning tests.

Walk discovery → required context → useful acceptance outcome, then the remaining
examples. This conventional guidance change adds no discovery/integration
mechanism: infer no all-host success. Any unresolved required native acceptance
must remain linked active work before release. Safe stop: shared rule, useful
review and evaluation deliver together, without a weaker intermediate rule or
cleanup slice. Boundedness is one outcome/proof/cleanup loop; no numeric budget,
hard limit or exception was supplied. Refinement found no independent hidden
outcome or remaining slice-specific concern; preparation claims no future run.
Execution retains independent refactor, focused proof, formatting, hooks and
delivery gates; planning alone grants no Take or implementation.

## Execution context

Established publisher `dashboard-territory.local-open-dough`, agent `bas-chan`;
Story Branch Mode, reused owned checkout
`/Users/terryyin/git/open-dough/.worktrees/check-a-reported-gap-against-the-paths-the-story`,
branch `codex/check-a-reported-gap-against-the-paths-the-story`.
Default/integration checkout: `/Users/terryyin/git/open-dough`; remote `origin`,
trunk `main`; increments target the execution branch. Starting revision
`7765c8bc4ae7394f65919b514835fd0339672370`; claim/candidate
`f81dffb23753d7a382e087daa7487184ee8a4129`, confirmed on remote trunk and story
branch. Trunk claim CI is unobserved. Ordinary in-scope planning authority remains;
no overrun replanning option selected. Formatting: `npm run format`; pre-commit
is check-only staged lint, plus dashboard typecheck only for staged scripts.

Retained setup failed because locked Playwright was unavailable. On 2026-10-12,
ran `node scripts/setup-native.mjs npm`, `node scripts/setup-native.mjs browser`,
`node scripts/setup-native.mjs check` to success here (Chromium 153.0.8010.12),
without locked metadata changes; check passed again on resumption.
CI: GitHub Actions `terryyin/open-dough`, verified active `ci.yml`, workflow
351271804, name `CI`, execution-branch target; same-checkout installed runtime
`.agents/skills/dough-execute-plan`. Coordinator `bas-chan-seed132`:
old `/tmp/dough-ci-501/watch-dkE49C`, PID 53753/session 71016/cell 11 stopped
(unread 0, ended coverage, CI unobserved), PID exit and terminal stream accounted
for. New observer `/tmp/dough-ci-501/watch-m7EMbR`, PID 30048/session 38871/cell 34.

Independent refactor found no conceptual candidates, but its 250-line gate
stopped the catalog/plan. The human rejected a narrow exception and authorized
conciseness without information loss. Resume preserves claim/workspace/proof;
condense this plan and organize complete finding records behind stable catalog
anchors. Independent refactor completed: all 72 records preserve token order,
194 external destinations, seven equivalent relative destinations and 72 parsed
CommonMark headings/anchors. Index 169 lines; largest record 245; all 76 files
within 250. Disposable verification script exited 0, inspected by coordinator
before cleanup; source proof unchanged. `npm run format` and slice-obligation
check succeeded. Slice 1 is done; candidate awaits commit/publication.

## Slice 1 proof review

Current 2026-10-12 guidance walkthrough, not native-host execution:
planned-work discovery → `Execute the next slice` → `wrap-up.md#accept-proof`
→ `story-obligations.md#check-the-paths-before-closing-a-gap`. Inputs: selected
Source story, reported gap, relevant project guidance/implementation and accepted
observations. Missing selected source stops that decision; missing observations
leave only dependent promises open. Checker does not invent semantic judgment.
G5 is the representative useful-outcome review; G9/G3/control extend it.
Historical IDs, exact quotes/provenance, accepted proof and later corrections stay
at their checkpoints. Their product gaps are not adopted as this story's repairs.
All three original stories are in `.planning/seeds/SEED-088-dashboard-story-code-review.md`.

### Recovered checkpoints and current decisions

- **292/G5**, slice 3, `1d2de5da4b38eb379caa25da45e9254c42949795`,
  `.planning/slice-plans/292-landed-story-branch-review/PLAN.md`, story
  `#review-merged-story-branch-changes`: “by other means” → unretained pair,
  `landing.state: "unacknowledged"`, missing `landing-current.json`.
  Required: “once remote trunk accepts the integrated SHA the handoff records
  the pair”; old uncaptured-landings rejection excludes no new guided integration.
  At that revision under `src/skills/`, inspected wrap-up's `story-branch-integration.md`
  hand resolution, backlog's `merge-conflicts.md` adapter `continue` and execution's
  `publish-the-candidate.md` exact push/acceptance. `history-preserving-candidate.mjs:constructCandidate`
  always detaches to fetched trunk; `history-preserving-publication.mjs` retains
  only after construction. After hand resolution/accepted push, `already-accepted`
  capture sees ancestor tip but no retained pair. `dashboard/src/storyReviewLandedRun.ts`
  admits the retired-workspace run; `dashboard/server/storyReviewLanded.ts:landedStoryReview`
  returns `landing-unavailable`, no files. `story-review-story-branch-unavailable.spec.ts`
  observes feedback, no files/Mark reviewed. Recovered retrospective also observed
  conflict again on hand-resolved rerun. Needed slice-3 `return`; retain correction
  294. Normal-merge receipt/base/revision/preparations/pins, fast-forward and
  lost-push-answer assertions in `dashboard/tests/story-branch-landing-capture.spec.ts`
  remain accepted for those paths, not hand resolution.
- **296/G9**, slice 2, `0ff0e2421c6260ef25d584323d62b86c51758f3b`,
  `.planning/slice-plans/296-trunk-mode-worktree-review/PLAN.md`, story
  `#review-trunk-mode-story-worktree`: different-agent ambiguity dismissed from
  one start. Required: “per-worktree author config names the card's agent”.
  `product-backlog.mjs:place`/`product-backlog-place.mjs:placeEntry` authorized
  `--return` moves queue membership without retirement or committed-profile changes.
  Another Take via `execution-start-operation.mjs`/`workspace-publication-claim.mjs:stageAgentProfile`
  writes/configures the new owner; old HEAD/config survives. `dashboard/server/localWorkspaces.ts:localWorkspacesOf`
  reads each HEAD profile; `dashboard/src/storyReviewWorkspace.ts:reviewWorkspaceOf`
  filters only source/identity. `storyReviewWorkspaceAdmission.ts:resolvedWorkspace`
  yields false ambiguity; `reviewedWorkspace` refuses file/mark access (409).
  Needed slice-2 `return`; retain correction 297. Same-agent ambiguity and
  single-worktree specs remain valid; neither proves handoff nor permits replacing
  the card's agent with “a known agent”.
- **295/G3**, slice 2, `1417faf986a208084aa0a774ed3dd27f917bbb05`,
  `.planning/slice-plans/295-resolved-integration-survives-reruns/PLAN.md`, story
  `#resolved-integration-survives-reruns`: foreign merge's “commit it, then run
  the same command” detaches/rebuilds; return explicitly marks it untested.
  Execution's `preserve-published-history.md` directs that for any `uncommitted-merge`
  and promises failed-run retention. `history-preserving-candidate.mjs:candidateInWorkspace`
  guards every MERGE_HEAD; after commit, `headMerges` accepts only expected two
  parents, else `mergedCandidate` checks out fetched trunk. Recovered scratch
  observation: `published` names another SHA, foreign commit on no ref.
  Needed slice-2 `return` for guidance/behavior; no later owner established.
  `closure-story-uncommitted-merge-cases.mjs:assertPreservedThenPublished` observes
  unchanged HEAD/MERGE_HEAD/index/status/branch and then publishes expected commit;
  fixture supplies `closureSha`. Keep initial preservation/expected-merge proof,
  without inferring foreign terminal proof. Adapter `refused-before-commit`
  terminal subcase remains an unobserved historical dependent claim.

### Constructed harmless control and limits

Disposable immutable two-worktree model: `review` filters by card story/agent,
returns selected workspace/content, collects diagnostics without consuming or
exposing them, and mutates nothing. Entry/Refresh share that boundary. Executed
`node --input-type=module` heredoc with `node:assert/strict`; exact code is in the
implementation handoff. Opposite diagnostic orders both yield `current-tree` /
`saved work`; worktree JSON unchanged; `internalDiagnostics` absent. Exit 0,
`{"kind":"constructed-control","entry":{"workspace":"current-tree","content":"saved work"},"continuation":{"workspace":"current-tree","content":"saved work"},"workPreserved":true,"diagnosticOrderExposed":false}`.
Supports costless closure for this constructed report, not dashboard/native proof.
A path exposing/consuming order invalidates the reason. No product fixture, extra
obligation or unrelated rerun was added.

## Accepted focused checks

Both commands completed with exit 0 and empty output; `git diff --check` also passed:

```sh
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh src/skills/dough-execute-plan/scripts/story-obligations-guidance.test.mjs src/skills/dough-execute-plan/scripts/story-obligations.test.mjs
PATH="/opt/homebrew/bin:$PATH" bash scripts/test.sh tests/payload-declaration-links.sh
```

Inspected maintained Markdown example/read/list/open-refusal/closure, acceptance
wiring, quote/ownership grammar, genuine exclusions/authorized changes and payload
links. Planned/quick acceptance links reach the common judgment; delegation,
delivery, completion and replanning retain the unchanged record. No schema,
reader/checker, host mechanism or installed copy changed. Historical product,
dashboard-wide and older native harness suites were not rerun: no executable or
rendered contract changed. Tests preserve boundaries, not semantic/native judgment.
Extra work: three historical traces, small control and authorized record concision.
Native follow-through/recurrence prevention remain unobserved; no release claim.
ODF-223 stays unresolved; implementation SHA awaits delivery.
