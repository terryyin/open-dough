# Codex-first source-only review

Launch: Codex `collaboration.spawn_agent`, `/root/source_review_codex`,
`fork_turns: none`, 2026-11-16. Actual launch/input and numbered return
are retained in the executing conversation. Its only input was the selected
SEED-391 source section (lines 12–178) after Terry’s explicit Codex-first
amendment. The reviewer read only that section, changed nothing, and received
no plan, implementation, proof, suspected omission or prior review.
Source content digest: `9d14096ea2a337a294b9f544518cc4c9c8ed1d65660230cb1dbe5dc8d6096a21`.
The previous unchanged-source review is retained in
[source-review-before-codex.md](source-review-before-codex.md).

Reviewer qualification: conditional examples prescribe reporting and judgment;
they do not promise B/P will exhibit the behavior. All returned IDs are retained
below. Source text and qualifications are condensed without regrouping IDs.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Retain the refused Claude attempt. | slice 1 |  |
| C02 | B starts at `4b75c2888` with only `934a51a30` applied to installed `.agents/skills` and `.claude/skills`. | slice 1 |  |
| C03 | One fresh Codex session executes historical plan 664 through execution completion, subject to the stated failure case. | slice 1 | G1 |
| C04 | B stops at execution completion without wrap-up, retrospective or landing. | slice 1 |  |
| C05 | B receives A’s instruction with scratch workspace/revisions, no dashboard context or publication authority, and Codex invocation syntax naming the installed scratch skill. | slice 1 |  |
| C06 | B receives nothing from this seed, A’s result, repair `0724558d6`, the amendment or the comparison. | slice 1 |  |
| C07 | B’s history ends at the patched Take. | slice 1 |  |
| C08 | B uses configured Codex defaults, records launched model/effort, and does not represent Claude model/effort/memory as equivalent. | slice 1 |  |
| C09 | B uses a scratch remote and local commits; the real remote, trunk, backlog and dashboard receive nothing from B. | slice 1 |  |
| C10 | B has no hosted CI and uses the plan’s local gates. | slice 1 |  |
| C11 | B adds no paid native-host run. | slice 1 |  |
| C12 | One fresh Codex session slice-plans the refined story at `0e6b0f3dc`, with plan removed and same patch applied. | slice 4 |  |
| C13 | P’s plan is read and not executed. | slice 4 |  |
| C14 | Record each of five edits’ observed moments in this plan, quoting B/P brief, return, diff or plan. | slice 5 |  |
| C15 | Give each edit keep/revise/remove with reason; revise identifies failed wording. | slice 5 |  |
| C16 | Record missing moments as not exercised, except guidance read but changing nothing. Includes later moments after failure and shotgun/follow-up when implementer already narrowed outside-subject edits away. | slice 5 |  |
| C17 | Inventory outside-effort test edits as loosened or value-updated; report updates following the nine-spec instruction as following the plan. | slice 2 |  |
| C18 | Inventory positional, count, whole-list and whole-object assertions B adds. | slice 2 |  |
| C19 | Inventory parameterized tests with bodies branching on case. | slice 2 |  |
| C20 | Show B active time beside A using one stated transcript definition where both expose required timing. | slice 3 |  |
| C21 | Report token usage with its provider’s recorded billing basis. | slice 3 |  |
| C22 | Report cost with its provider’s recorded billing basis; explicitly unavailable if missing, never derive Codex cost from Claude prices. | slice 3 |  |
| C23 | State plan budgets exact-argv churn: value updates alone do not count against guidance; loosening shows guidance prevailing. | slice 5 |  |
| C24 | State single-run variation limit, recommendations based on traced moments, and no effect size from counts/time/cost. | slice 5 |  |
| C25 | Record effective host/model/effort and memory/context differences. | slice 5 |  |
| C26 | Name observed moments those differences could explain; host/model differences prevent guidance-only attribution. | slice 5 |  |
| C27 | State local-only/no-hosted-CI B versus A published branch with CI. | slice 5 |  |
| C28 | When B follows nine-spec value updates, judge assertion guidance on newly written assertions and refactor behavior. | slice 5 |  |
| C29 | If refactor accepts about 23 outside-subject edits as clean/concept assertions, shotgun guidance is revise with sentence relied on. | slice 5 |  |
| C30 | Under that same condition, named-follow-up guidance independently is revise with sentence relied on. | slice 5 |  |
| C31 | If refactor loosens what fits, returns remainder naming smell/concept/file count/representative files, carried into plan learnings, shotgun guidance is keep with quoted return. | slice 5 |  |
| C32 | Under that same condition, follow-up guidance independently is keep with quoted return. | slice 5 |  |
| C33 | If brief names remedies, brief guidance is revise with quoted line. | slice 5 |  |
| C34 | If brief provides outside-subject test count and no remedy, brief guidance is keep. | slice 5 |  |
| C35 | If implementer narrows nine specs before refactor, assertion guidance is keep; other classifications covered by C16. | slice 5 |  |
| C36 | If P mechanically budgets consumer updates in slice 1 again, planning guidance is revise. | slice 5 |  |
| C37 | If P opens with a Structure slice narrowing consumers, planning guidance is keep. | slice 5 |  |
| C38 | When B stops on unrelated failure, failure policy governs. | slice 1 |  |
| C39 | Then report how far B reached; later unexercised edits covered by C16. | slice 1 |  |

## Unnumbered source context returned by the reviewer

- Outcome: evidence and a recommendation per edit for Terry’s release decision;
  revising guidance remains Terry’s subsequent step.
- Five targets and moments: shotgun acceptance at slice-1 refactoring; assertions,
  support and branching parameters at implementation/refactoring; named oversized
  follow-ups at refactor return and completion learnings; factual coordinator
  brief; preceding Structure slice in P.
- A is historical only: its revisions, counts, assertion patterns, refactor return,
  settings and transcript form the baseline. Nothing is rerun for A.
- Only the historical guidance patch is installed; Codex introduces another
  changed factor. Copying Claude memory does not show Codex loaded it.
- Deferred: matched Claude replays, P execution, repeated runs/variance baseline,
  and refactor-only replay on A.
- Original options and blinded-trial analogy explain method, costs and limits;
  the Codex-first amendment supersedes the same-host assumption.
