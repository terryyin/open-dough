# Source review

Launched 2026-11-19 by the execution coordinator (Rio-chan) as a fresh
general-purpose reviewer without conversation inheritance. Input: the story
section of [SEED-353#declare-merged-review-histories](../../seeds/SEED-353-declarative-git-test-state.md#declare-merged-review-histories)
(Goal, Scope, exclusions, key examples, safe stopping point, state blocks
removed) followed by the seed's shared scope and correctness requirements, as
one file; no plan, product, proof or slice scope. The reviewer read only that
file and changed nothing.

Unnumbered context returned: the Goal's reason; the local-worktree sibling's
and other siblings' exclusions; the start-after-local-worktree sequencing; no
open human decision; no speedup promise unless measured; the audit scan is a
starting point; harnesses own filesystem, Git, installation, environment and
cleanup; each plan carries the shared failure policy.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Story A's committed story-branch topology (`worktreeWithStoryCommits`, `integrateTrunk`, `sixth`, and the spec-local separate-line edit and renames either side of a conflicted integration) is declared through the shared MakeMe repository description and start-origin workspace: trunk files, landed slice, story commits, trunk's changing commit, each integration merge with first parent story and second parent trunk, resolved bytes and author; one shared declarative owner (Scope; Goal; Safe stopping point; Shared requirement 2). | slice 2 | |
| C2 | The starting commits added before opening the review are declared: the newest plain story edit and the empty story commit in `story-review-commits.spec.ts`, and the first story commit in `story-review-commit-refresh.spec.ts` (Scope). | slice 2 | |
| C3 | Owners are extended only for demonstrated needs; no imperative scripts in builder spelling and no second representation of the declared facts (Scope; Shared requirement 2). | slice 2 | |
| C4 | Named revision results replace incidental `rev-parse` (Scope; Shared requirement 3). | slice 2 | |
| C5 | Deferred, prepared-prefix reuse is preserved; materialization only on demand (Scope; Shared requirement 3). | slice 2 | |
| C6 | Each test keeps its private mutable worktree, including private refs, objects, config, index and files (Scope; Shared requirement 3). | slice 2 | |
| C7 | A conflicted integration stays a real conflict: the test confirms independently, without the description's renderer, that its declared parents conflict on the resolved file, including the rename case's conflicted integration (Scope; Key examples 2 and 4). | slice 2 | |
| C8 | The test confirms independently, without the renderer, that a clean integration's parents merge without conflict, e.g. the separate-line `src/a.ts` edit (Scope; Key example 3). | slice 1 | observed: story-review-commit-trunk.spec.ts `parentsConflict` (independent `git merge-tree --write-tree` of the named parents) false for the clean and separate-line cases, true for `c story and trunk` and `c 5` |
| C9 | Commits made, a push to trunk and a Refresh after the review opened stay visible scenario actions; post-observation publication, competing writers, failed pushes, ref movement and destructive operations remain actions (Scope; Shared requirement 5). | slice 2 | |
| C10 | Staging, dirty state, authorship, topology and byte distinctions explaining each case, and purposes and independent assertions, are preserved (Shared requirements 1 and 5). | slice 2 | |
| C11 | Builders derive related incidental IDs; specs do not import `randomUUID` for defaults or pass an incidental UUID to relate construction steps; meaningful differences, malformed IDs and real launch-returned reporting contexts remain (Shared requirement 4). | slice 2 | |
| C12 | The test-data architecture guide is updated for the delivered capabilities (Scope; Shared requirement 6). | slice 2 | |
| C13 | Representative construction is compared before and after under ADR 0010; readable construction is kept only when its benefit justifies builder complexity without weaker proof, lost isolation or eager preparation (Scope; Shared requirement 6). | slice 2 | |
| C14 | The selected MakeMe and page-object conventions, ADR 0002's direct domain mapping and ADR 0008's published/local distinction are applied (Shared requirement 6). | slice 2 | |
| C15 | No production behavior change (Scope). | slice 2 | |
| C16 | Unrelated trunk-mode and completed scenarios remain unchanged; `storyReviewMergeDriver.ts` keeps importing `sixth`; shared `git`, `commitAll` and `writeAt` stay while other families import them (Safe stopping point; Excluded). | slice 2 | |
| C17 | Declared branch with a clean `README.md` trunk merge: Commits shows two story commits, trunk integrated within the range, the merge alone changed nothing, and the whole range only `src/c.ts`'s `-c 5`/`+c story`, without `landed.txt`, `README.md` or `src/a.ts` (Key example 1; Goal). | slice 1 | observed: story-review-commit-trunk.spec.ts clean case: 2 rows, "Trunk was integrated within the range", "The chosen commits changed nothing.", range `src/c.ts` `-c 5`/`+c story` without `landed.txt`, `README.md`, `a.ts` |
| C18 | Trunk also changes `src/c.ts`'s sixth line and the declared merge settles `c story and trunk`: merge alone shows `-c story`/`+c story and trunk` flagged "includes trunk's changes"; range shows `-c 5`/`+c story and trunk` (Key example 2). | slice 1 | observed: story-review-commit-trunk.spec.ts conflicted case: merge alone flagged `-c story`/`+c story and trunk`; range flagged `-c 5`/`+c story and trunk` |
| C19 | A merge settling `src/c.ts` back to `c 5`: the range stays flagged and shows `-c trunk`/`+c 5` from the destination baseline (Key example 3). | slice 1 | observed: story-review-commit-trunk.spec.ts settled-back case: range flagged `-c trunk`/`+c 5` |
| C20 | A story edit to a separate line of `src/a.ts` merged cleanly with trunk's sixth-line edit: the range shows only `-a 0`/`+a story` with no flag (Key example 3). | slice 1 | observed: story-review-commit-trunk.spec.ts separate-line case: "Changes in 3 commits", only `src/a.ts` `-a 0`/`+a story`, no "includes trunk's changes" |
| C21 | `src/c.ts` renamed to `d.ts` before a conflicted integration and to `e.ts` after it: four story commits keep their order; range shows `src/c.ts → src/e.ts` flagged with `-c 5`/`+c story and trunk` (Key example 4). | slice 2 | |
| C22 | A declared newest plain edit on Story A: the chosen commit's trees stay as today (Key example 5). | slice 2 | |
| C23 | An empty story commit: the empty range's "changed nothing" stays as today (Key example 5). | slice 2 | |
| C24 | One declared story commit: commits added and pushed to trunk after opening still move the anchored range only on Refresh (Key example 5). | slice 2 | |
