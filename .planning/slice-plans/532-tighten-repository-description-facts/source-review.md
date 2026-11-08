# Source review

Launch: fresh general-purpose reviewer, no conversation inheritance, 2026-11-08, at execution startup.
Input: the seed section `SEED-262#tighten-repository-description-facts` (Identity, Goal, Scope; story-state block and plan link removed) plus the correction input from PLAN.md (Provenance, Goal and boundaries, Findings), excluding Current decisions, proof ownership, gates, slices and premises. Instruction: use only that input, read nothing else, change nothing, return numbered commitments, qualifications and exclusions.
Reviewer note: Q2 is reported as a finding; neither Goal nor Scope promises removing the duplication.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A maintainer reading a shared repository description gets exactly the repository it declares. | slice 5 |  |
| 2 | The description and its materializer state each fact once and honestly. | slice 5 |  |
| 3 | MakeMe edits no longer change the native worktree-preparation journey's evidence identity (the journey stops depending on MakeMe). | slice 1 | observed: slice 1: prep_native_input_hash_lines unchanged after a makeMe.mjs/repositoryTestData.mjs edit (24 lines); control at HEAD changed |
| 4 | This corrects the clean-trunk migration (`SEED-262#migrate-clean-trunk-fixtures`; reviewed commits 1f6adb33a, 0b6bdb925, 8f7f8443f, 15cec64d2, 91966e3aa on base db42e79a7). | slice 5 |  |
| 5 | The native worktree-preparation modules stop loading MakeMe and the materializer (assess/observe/fixture import closure). | slice 1 | observed: slice 1: native-import-closure over assess/observe/fixture = 11 modules, none MakeMe/materializer/product-backlog |
| 6 | The native worktree-preparation repositories (fresh-node, failed-prep, reuse, wrapper) stay identical to `db42e79a7` in: | slice 1 | observed: slice 1: compare.sh, fresh-node/failed-prep/reuse/wrapper built from HEAD and db42e79a7 export in same dir: ls-tree (modes, blobs), rev-list count, log authors/messages, remote -v, local config, worktree list, status identical |
| 6.1 | tree | slice 1 | observed: slice 1: compare.sh, fresh-node/failed-prep/reuse/wrapper built from HEAD and db42e79a7 export in same dir: ls-tree (modes, blobs), rev-list count, log authors/messages, remote -v, local config, worktree list, status identical |
| 6.2 | file modes | slice 1 | observed: slice 1: compare.sh, fresh-node/failed-prep/reuse/wrapper built from HEAD and db42e79a7 export in same dir: ls-tree (modes, blobs), rev-list count, log authors/messages, remote -v, local config, worktree list, status identical |
| 6.3 | remotes | slice 1 | observed: slice 1: compare.sh, fresh-node/failed-prep/reuse/wrapper built from HEAD and db42e79a7 export in same dir: ls-tree (modes, blobs), rev-list count, log authors/messages, remote -v, local config, worktree list, status identical |
| 6.4 | commit count and messages | slice 1 | observed: slice 1: compare.sh, fresh-node/failed-prep/reuse/wrapper built from HEAD and db42e79a7 export in same dir: ls-tree (modes, blobs), rev-list count, log authors/messages, remote -v, local config, worktree list, status identical |
| 6.5 | authors | slice 1 | observed: slice 1: compare.sh, fresh-node/failed-prep/reuse/wrapper built from HEAD and db42e79a7 export in same dir: ls-tree (modes, blobs), rev-list count, log authors/messages, remote -v, local config, worktree list, status identical |
| 6.6 | local config | slice 1 | observed: slice 1: compare.sh, fresh-node/failed-prep/reuse/wrapper built from HEAD and db42e79a7 export in same dir: ls-tree (modes, blobs), rev-list count, log authors/messages, remote -v, local config, worktree list, status identical |
| 6.7 | worktree layout | slice 1 | observed: slice 1: compare.sh, fresh-node/failed-prep/reuse/wrapper built from HEAD and db42e79a7 export in same dir: ls-tree (modes, blobs), rev-list count, log authors/messages, remote -v, local config, worktree list, status identical |
| 7 | The native owned-context helpers keep their behavior: | slice 1 | observed: slice 1: helpers untouched; consumers git-publication-native-owned-context.sh, preparation-assignment-owned-context, dough-land-remote-context, workspace-publication-admission, supplier-integration-visit/revisit quiet pass |
| 7.1 | `ownedWorktreeOnly` | slice 1 | observed: slice 1: helpers untouched; consumers git-publication-native-owned-context.sh, preparation-assignment-owned-context, dough-land-remote-context, workspace-publication-admission, supplier-integration-visit/revisit quiet pass |
| 7.2 | `advanceOriginFromAnotherWriter` | slice 1 | observed: slice 1: helpers untouched; consumers git-publication-native-owned-context.sh, preparation-assignment-owned-context, dough-land-remote-context, workspace-publication-admission, supplier-integration-visit/revisit quiet pass |
| 7.3 | `cloneAsAnotherWriter` | slice 1 | observed: slice 1: helpers untouched; consumers git-publication-native-owned-context.sh, preparation-assignment-owned-context, dough-land-remote-context, workspace-publication-admission, supplier-integration-visit/revisit quiet pass |
| 8 | A workspace's declared checkout identity stays with its worktree (does not replace the integration checkout's identity in shared config; matches `withWorkspace` JSDoc). | slice 2 |  |
| 9 | The trunk without a backlog becomes an explicit fact (not an accident of spreading `backlog: undefined`). | slice 4 |  |
| 10 | A revision that declares both a rendered backlog and backlog file bytes is refused. | slice 4 |  |
| 11 | The builder's refusals get one Git-free test, covering: | slice 3 |  |
| 11.1 | a duplicate name across trunk and unpublished revisions | slice 3 |  |
| 11.2 | an unknown `from` | slice 3 |  |
| 11.3 | an unpublished revision without a workspace | slice 3 |  |
| 11.4 | a second workspace | slice 3 |  |
| 12 | The test-data architecture (`tests/README.md#test-data-architecture`) describes the current repository facts, including: | slice 5 |  |
| 12.1 | workspace and unpublished revisions | slice 5 |  |
| 12.2 | the trunk branch | slice 5 |  |
| 12.3 | the checkout identity | slice 5 |  |
| 12.4 | `executables` | slice 5 |  |
| 12.5 | the no-backlog fact | slice 5 |  |
| 12.6 | template reuse gives identical commit IDs within one process | slice 5 |  |
| 13 | Migrated tests keep their verdicts and assertions. | slice 5 |  |
| 14 | Follow test automation rules: | slice 5 |  |
| 14.1 | MakeMe for data | slice 5 |  |
| 14.2 | never sleep | slice 5 |  |
| 14.3 | never `test.slow()` | slice 5 |  |
| 14.4 | default timeouts | slice 5 |  |
| Q1 | Qualification: the credential-free default `tests/execution-worktree-preparation-native.sh` and `tests/native-evidence-identity.sh` may run. | slice 5 |  |
| Q2 | Context: about 200 lines of project/wrapper file content are duplicated between native builders and described builders. | slice 1 | observed: slice 1: native builders write shared lockedNodeProject/wrapperProject via writeProject; diff -370/+44 |
| X1 | Exclusion: no paid or native host run. | slice 5 |  |
| X2 | Exclusion: no change to the sibling stories' scope. | slice 5 |  |
| X3 | Exclusion: the reviewed story's exclusions hold: | slice 5 |  |
| X3.1 | queued and preparation trunks | slice 5 |  |
| X3.2 | the one-shot payload installation | slice 5 |  |
| X3.3 | dashboard origins | slice 5 |  |
| X3.4 | Node backlog repositories | slice 5 |  |
| X3.5 | shell and native fixture migration (sibling story) | slice 5 |  |
| X3.6 | new caching (`#reuse-immutable-git-histories`) | slice 5 |  |
| X4 | Exclusion: no general branch or merge model. | slice 5 |  |
| X5 | Exclusion: refreshing retained native evidence is paid, manual-only, and not part of this correction. | slice 5 |  |
| X6 | Exclusion: the git-publication admission identity weakness is provenance only; its refresh belongs to the shell release and native fixture story. | slice 5 |  |
