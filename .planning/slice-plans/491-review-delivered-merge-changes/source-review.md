# Source review: SEED-253#review-delivered-merge-changes

Launch: fresh general-purpose reviewer at slice 1 acceptance, no conversation
inheritance, instructed to use only the input file, read no other project
files and change nothing, and to return numbered commitments, qualifications,
journey examples and exclusions without slice ownership.

Input: the story section of
`.planning/seeds/SEED-253-review-delivered-merge-changes.md` from
**Beneficiary** through the Architecture paragraph, unchanged since planning.

Reviewer notes: 1.1 and A5 phrase the same rule; 3.2/3.3, K1.2 and K3.3
require both Review changes and Intent's overlay.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| G1 | Serves a developer reviewing a completed story's delivered changes in Review changes and Intent's selected-story overlay | slice 2 | |
| G2 | Opening Review changes for a completed story shows its delivered changes, including changes made during its merges and landing | slice 2 | |
| G3 | Delivered changes stay inspectable when the story branch, workspace, or local launch record no longer exists | slice 2 | |
| G4 | Delivered changes stay inspectable, and stay the story's own, after later merges carry the story's existing done record | slice 1 | observed: dashboard/backend-tests/review/story-review-completed.spec.ts "${mode} completion keeps its own delivery after a later story's branch merges trunk and fast-forwards": laterBranchMergesTrunkAndFastForwards (dashboard/tests/support/laterStoryMergesTrunk.ts) first proves first-parent now names the later merge; the review afterwards toEqual the review before it and the shared.txt diff still shows +story first, in trunk and story-branch modes |
| 1.1 | Completion revision is the newest trunk-first owning merge that integrates the commit that added the done record | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-fast-forward.spec.ts "a later fast-forward keeps an earlier story's trunk-first landing and baseline" (Landed stays the trunk-first owning merge); real-history probe of deliveredCompletion at origin/main: SEED-248 -> e6948bfce (trunk-first merge whose second parent 296a29c66 added the done record), SEED-241 -> c9a142ac3 |
| 1.2 | Without a trunk-first owning merge, completion is the done-record commit (completed on trunk or fast-forwarded onto trunk) | slice 1 | observed: dashboard/backend-tests/review/story-review-completed.spec.ts "${mode} completion keeps its own delivery after a later story's branch merges trunk and fast-forwards" (trunk mode and fast-forward story-branch mode: completion stays the done-record commit); real-history probe: SEED-249 -> 328b316e9, SEED-247 -> 5befe37bd |
| 1.3 | A later merge by another story carrying the done record onto a new first-parent path keeps the completion revision unchanged | slice 1 | observed: dashboard/backend-tests/review/story-review-completed.spec.ts "${mode} completion keeps its own delivery after a later story's branch merges trunk and fast-forwards": review after the later merge toEqual the pre-merge review (same completion and files); dashboard/tests/intent/intent-ci-comparison-fast-forward.spec.ts SEED-253 test: Landed names completion, not the later merge or run 501 |
| 2.1 | Comparison still produced when an owning or completion merge edited paths Git did not report as conflicted | slice 2 | |
| 2.2 | Comparison still produced when another story's non-owning merge resolved a conflict on a path this story also changed | slice 2 | |
| 3.1 | Subtracted changes include non-conflicted merge and landing edits (automatic merge tree vs committed merge tree on non-conflicted paths) | slice 2 | |
| 3.2 | Those edited files and diffs appear in the published completion review | slice 2 | |
| 3.3 | Those edited files and diffs appear in Intent's selected-story overlay | slice 2 | |
| 4.1 | A merge-tree directory-rename path unchanged by the story branch and kept identical to trunk parent is ignored as a story change | slice 2 | |
| 4.2 | Such unrelated trunk files are not listed as story changes | slice 2 | |
| 4.3 | Such unrelated trunk files are not flagged as mixed work | slice 2 | |
| 5.1 | Genuine conflict resolutions in owning/completion merges are identified as mixed changes | slice 2 | |
| 5.2 | A file whose story commits or merge edits cannot be cleanly restated out of trunk is a mixed change | slice 2 | |
| 5.3 | Mixed files show includesTrunkFrom ("includes trunk's changes") compared from before the mixed work | slice 2 | |
| 5.4 | Non-mixed files keep their isolated story attribution in the same comparison | slice 2 | |
| 6.1 | Genuinely missing comparison evidence explains the specific gap, not a generic failure | slice 2 | |
| 6.1a | Gap example: missing or unreadable done record | slice 2 | |
| 6.1b | Gap example: unrecoverable or ambiguous execution agent | slice 1 | observed: dashboard/backend-tests/review/story-review-completed-agent-recovery.spec.ts "an agentless completion refuses conflicting published execution owners" and "an agentless completion with no claim history is not attributed" (pass after the claim bound) |
| 6.1c | Gap example: shallow or missing claim history | slice 1 | observed: dashboard/backend-tests/review/story-review-completed-gaps.spec.ts "missing claim history explains the gap rather than showing a partial comparison"; story-review-completed-agent-recovery.spec.ts "an agentless completion refuses shallow claim history" |
| 6.1d | Gap example: unreadable Git objects | slice 2 | |
| 6.1e | Gap example: unsupported Git merge-tree | slice 2 | |
| 6.2 | Missing or unreadable local captured run with establishable published history shows the published completion comparison | slice 2 | |
| 6.3 | That gap is explained on the explicit run choice | slice 2 | |
| R1.1 | Historical file diff and text requests limited to the configured project | slice 2 | |
| R1.2 | Those requests limited to the exact story | slice 2 | |
| R1.3 | Those requests limited to the established completion revision | slice 2 | |
| R1.4 | Those requests use only admitted trees: baseline or the file's includesTrunkFrom | slice 2 | |
| R1.5 | Those requests limited to literal listed paths | slice 2 | |
| R1.6 | Selecting a file triggers no network fetch | slice 2 | |
| R1.J | Justification: preserves the read-only local admission boundary and immutable snapshot guarantees | slice 2 | |
| R2 | No execution owner is guessed when the done record omits agent and claim history before the done record is problematic | slice 1 | observed: dashboard/server/storyPublishedEndpoints.ts recovers the agent only from claims up to the done-record commit; story-review-completed-agent-recovery.spec.ts refusal tests pass |
| R2a | Restriction condition: that history is missing | slice 1 | observed: story-review-completed-agent-recovery.spec.ts "an agentless completion with no claim history is not attributed" and story-review-completed-gaps.spec.ts "missing claim history explains the gap rather than showing a partial comparison" |
| R2b | Restriction condition: that history is shallow | slice 1 | observed: story-review-completed-agent-recovery.spec.ts "an agentless completion refuses shallow claim history" |
| R2c | Restriction condition: that history names more than one execution agent | slice 1 | observed: story-review-completed-agent-recovery.spec.ts "an agentless completion refuses conflicting published execution owners" |
| R2.J | Justification: prevents attributing another story's commits to an unrecoverable completion | slice 1 | observed: storyCompletedCommits.ts completedStoryClaimEvidence keeps only claims that are ancestors of the done-record commit; agent-recovery refusals pass |
| X1 | Exclusion: does not change live workspace review | slice 2 | |
| X2 | Exclusion: does not change review marks | slice 2 | |
| X3 | Exclusion: does not change captured landed-run storage | slice 2 | |
| X4 | Exclusion: no sub-file line-by-line blame UI beyond includesTrunkFrom base and diff | slice 2 | |
| X5 | Deferred: sub-file hunk splitting for files combining conflict resolution and independent hunks | slice 2 | |
| K1.1 | Landing/integration merge resolving shared.txt plus non-flagged edits: Review changes opens with delivered files and diffs | slice 2 | |
| K1.2 | Same trigger: Intent's selected-story overlay opens with delivered files and diffs | slice 2 | |
| K1.3 | Same trigger: delivered files and diffs include landing edits such as merge-resolution.txt and the renamed test file | slice 2 | |
| K1.4 | Same trigger: shared.txt is marked "includes trunk's changes" | slice 2 | |
| K1.5 | Same trigger: untouched trunk files such as <other>.json are left out of the story's diff | slice 2 | |
| K2.1 | Another story's trunk merge resolves a conflict on this story's file: Review changes opens with this story's comparison, no refusal | slice 2 | |
| K2.2 | Same trigger: a cleanly restatable change is shown isolated | slice 2 | |
| K2.3 | Same trigger: overlapped or overwritten lines mark the file "includes trunk's changes" | slice 2 | |
| K3.1 | Later branch started before completion merges trunk and fast-forwards: Review changes still names the earlier story's own completion | slice 1 | observed: dashboard/backend-tests/review/story-review-completed.spec.ts "${mode} completion keeps its own delivery after a later story's branch merges trunk and fast-forwards": review after the later merge toEqual the pre-merge review, whose completion matched the story's own completion |
| K3.2 | Same trigger: Review changes shows the earlier story's own delivered comparison | slice 1 | observed: dashboard/backend-tests/review/story-review-completed.spec.ts "${mode} completion keeps its own delivery after a later story's branch merges trunk and fast-forwards": review after the later merge toEqual the pre-merge delivered review (files, baseline, tree); shared.txt file diff at that completion shows +story first |
| K3.3 | Same trigger: selecting the earlier story in Intent names its own completion and shows its own delivered comparison | slice 1 | observed: dashboard/tests/intent/intent-ci-comparison-fast-forward.spec.ts SEED-253 test: Intent's selected story names shortSha(completion) as Landed with run 103, not the later merge; Intent's overlay reads the same story review endpoint (dashboard/src/useStoryComparison.ts) observed by dashboard/backend-tests/review/story-review-completed.spec.ts "${mode} completion keeps its own delivery after a later story's branch merges trunk and fast-forwards" |
| K4.1 | Local captured landing missing/unreadable with intact published history: Review changes opens on Published completion with files and diffs | slice 2 | |
| K4.2 | Same trigger: switching to Landed runs explains that run's specific capture gap | slice 2 | |
| K4.3 | Shallow or missing published claim history: Review changes explains that specific gap | slice 1 | observed: story-review-completed-gaps.spec.ts "missing claim history explains the gap rather than showing a partial comparison"; agent-recovery "refuses shallow claim history" |
| K4.4 | Same trigger: Review changes does not guess files | slice 1 | observed: story-review-completed-gaps.spec.ts "missing claim history explains the gap rather than showing a partial comparison" (no partial file list) |
| A1 | Comparison rebuilt from published Git history on origin without surviving worktree, branch, or launch record | slice 2 | |
| A2.1 | ADR 0008: durable state read from origin | slice 2 | |
| A2.2 | ADR 0008: mixed and missing evidence reported distinctly, not one blanket failure | slice 2 | |
| A3 | Design follows ADR 0010 | slice 2 | |
| A4 | Design aligns with Proposed ADR 0009 | slice 2 | |
| A5 | storyPublishedEndpoints.ts anchors completion to the done-record commit or newest trunk-first owning merge integrating it, not trunk's --first-parent path | slice 1 | observed: dashboard/server/storyPublishedEndpoints.ts uses git log --diff-filter=A then deliveredCompletion (storyPublishedEndpointDerived.ts); no --first-parent selection remains |
| A6.1 | storyCompletedCommits.ts decomposes owning/completion merges: genuine conflict paths as resolutions with includesTrunkFrom | slice 2 | |
| A6.2 | Non-conflicted merge edits restated in trunkLess against the pre-edit merge tree | slice 2 | |
| A6.3 | Untouched trunk paths affected only by merge-tree directory-rename heuristics | slice 2 | |
| A7 | Assertion: no conflict with Accepted ADRs | slice 2 | |
| A8 | dashboard/AGENT-LAUNCH-REVIEW.md describes the published completion attribution rule | slice 2 | |
| A9 | Context: Landed run review compares trunk before publication with the accepted revision | slice 2 | |
