# Source review

Launch: fresh general-purpose subagent, no conversation inheritance, on 2026-11-20,
before the first implementation delegation. Input: only the Goal, Scope, Key
examples, Evaluation and Effort hypothesis of
[the story](../../seeds/SEED-413-renovate-dashboard-unit-tests.md#split-branch-entry-proposal-from-store),
verbatim, with instructions to read no project files and change nothing.

Unnumbered context returned: the Goal's reason (reducing setup, tying evidence
checks to the owning host and session); the sibling-story delivery deferral; the
comparison method ("as in the first story", "at comparable load"); effort M, one
plan; "while the launch is open" qualifies C3 and is not a separate rejection rule.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | The branch-entry proposal is separate from the adapter that keeps the entry and its pins; it works over the trunk ref, typed launch record and requested worktree and branch, so maintainers prove capture and refusal with real Git and no kept store. Source: Goal; Scope; Key examples ("returns a conflict without a kept store") | slice 1 | observed: dashboard/backend-tests/review/branch-entry-proposal.spec.ts (all three cases: real Git, composed records, no keep or HOME stub) over dashboard/server/branchEntryProposal.ts proposeBranchEntry |
| C2 | The adapter takes only the source id and the ref it uses. Source: Scope | slice 1 | observed: dashboard/server/sessionBranchEntry.ts recordSessionBranchEntry(source: Pick<PublishedSource,'id'\|'ref'>); typecheck s1-typecheck-3 |
| C3 | A registered non-trunk branch of the launch's repository is admitted and recorded while the launch is open, after the proposal validates the registered worktree. Source: Scope | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-session-branch-handoff.spec.ts 'the launch command binds the original checkout's own branch' (stored entry equals route answer); dashboard/backend-tests/review/branch-entry-proposal.spec.ts 'an open launch proposes its draft's working tree, Default main tip and trunk' |
| C4 | A successful entry captures the worktree's committed tip, its working tree (entry tree incl. dirty changes), the distinct Default main tip and the trunk observation. Source: Scope; Key examples (dirty handoff) | slice 1 | observed: dashboard/backend-tests/review/branch-entry-proposal.spec.ts 'an open launch proposes its draft's working tree, Default main tip and trunk' (committedTip, defaultTip, trunk, dirty tree); ad-hoc-session-branch-entry.spec.ts 'a declared branch keeps its entry state and Default main tip after main moves' |
| C5 | Given a Default main launch, proposing a foreign clone returns a conflict (protects attribution to the original launch). Source: Key examples; Scope | slice 1 | observed: dashboard/backend-tests/review/branch-entry-proposal.spec.ts 'a proposal refuses a foreign clone, a wrong branch and a second place' (foreign clone 409) |
| C6 | Proposing a mismatched worktree and branch returns a conflict. Source: Key examples | slice 1 | observed: dashboard/backend-tests/review/branch-entry-proposal.spec.ts 'a proposal refuses a foreign clone, a wrong branch and a second place' (other worktree with draft branch 409) |
| C7 | Proposing a second place after a successful entry returns a conflict. Source: Key examples | slice 1 | observed: dashboard/backend-tests/review/branch-entry-proposal.spec.ts 'a proposal refuses a foreign clone, a wrong branch and a second place' (entered record, second place 409; second session own worktree accepted) |
| C8 | The same place returns the first kept entry unchanged, even if main, the worktree or the live record moves during the request. Source: Scope; Key examples | slice 1 | observed: dashboard/backend-tests/review/branch-entry-proposal.spec.ts 'the same place proposes the kept entry after main and the worktree move'; adapter transaction recheck existingEntry in sessionBranchEntry.ts; ad-hoc-branch-cursor-recovery.spec.ts:159 stale native replacement |
| C9 | Repeating the handoff leaves the kept entry's pins in place. Source: Key examples | slice 1 | observed: dashboard/backend-tests/review/ad-hoc-session-branch-entry.spec.ts 'a declared branch keeps its entry state and Default main tip after main moves' (three pinned objects, same entry on repeat) |
| C10 | Cases about review, attribution or publication start with the branch entry already in the record; MakeMe composes it when it is a precondition, including in `aDeclaredPublisherBranch`. Source: Goal; Scope | slice 5 |  |
| C11 | Cases whose topic is persistence or pin survival keep the real store adapter. Source: Scope | slice 6 |  |
| C12 | When a review's launch already holds its branch entry, the branch comparison shows only post-entry branch changes and earlier Default main commits appear in their own comparison. Source: Key examples | slice 4 |  |
| C13 | Evidence cases query session branch pins and one-shot landing pins through their production owners, reading the actual refs; the test-only pin queries are retired. Source: Goal; Scope | slice 3 | observed: Production reads sessionBranchPins (launchRecordPins.ts) and heldLandingPins (launchLandingGit.ts) used by ad-hoc-branch-* / ad-hoc-manual-landing-* / declared-blank-launch-publication / one-shot-landing-recovery-deletion / one-shot-landing-capture-admission specs; support sessionBranchPins, landingPins and Cursor's cursorPins removed; no spec queries session-branch or one-shot pins with its own for-each-ref |
| C14 | After Cursor replaces a native session, its pins still belong to, and are queried under, the original host-qualified session. Source: Scope; Key examples | slice 2 | observed: dashboard/backend-tests/review/ad-hoc-branch-cursor-recovery.spec.ts deletion/expiry cases: sessionBranchPins(repository, topic.record.session) holds prior and latest after replacement, replacement.session reads []; production query dashboard/server/launchRecordPins.ts sessionBranchPins |
| C15 | Expiry removes the replaced session's pins and keeps the other session's pins. Source: Key examples | slice 6 |  |
| C16 | The expiry cases name their cleanup collaborator explicitly. Source: Scope | slice 6 |  |
| C17 | Deleting a declared landing releases its one-shot pins after the comparison has outlived retirement, and deletion cases use the production deletion operation. Source: Scope; Key examples | slice 5 |  |
| C18 | `retireAdHocBranch` stays only in cases that actually prune a worktree. Source: Scope | slice 3 | observed: dashboard/test-support/support/adHocBranchRefs.ts retireAdHocBranch kept; all 8 call sites prune a worktree their case created (slice-3-report.md) |
| C19 | `declaredBranchCase.ts` is retired. Source: Scope | slice 5 |  |
| C20 | Every replaced assertion is preserved. Source: Evaluation | slice 6 |  |
| C21 | The affected specs are compared at comparable load, as in the first story, on imports, branch-entry actions, HOME stubs and case time. Source: Evaluation | slice 6 |  |
| C22 | Backend spec imports of `adHocReview.ts` are counted. Source: Evaluation | slice 6 |  |
