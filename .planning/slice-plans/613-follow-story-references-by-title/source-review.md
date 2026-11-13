# Source-only review

Reviewer launch: `/root/source_review`, fresh context (`fork_turns: none`). Its input supplied only the story’s Goal, Scope, key examples, audit subjects and exclusions, with instructions to read no project files and change nothing. The numbered return below retains its individual commitments, qualifications, examples and exclusions.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | A developer can tell what a referenced story is about. | slice 3 |  |
| C02 | A developer can reach that exact story in one click. | slice 3 |  |
| C03 | Label a story link with the story’s title. | slice 1 | observed: src/skills/dough-product-backlog/references/identity.md item 3; coordinator diff review and representative CI-history title-and-anchor walkthrough, no new paragraph or section |
| C04 | Point a story link at that story’s anchor. | slice 1 | observed: src/skills/dough-product-backlog/references/identity.md item 3; coordinator diff review and representative CI-history title-and-anchor walkthrough, no new paragraph or section |
| C05 | Label a whole-seed link with the seed’s title. | slice 1 | observed: src/skills/dough-product-backlog/references/identity.md item 3; coordinator diff review and representative CI-history title-and-anchor walkthrough, no new paragraph or section |
| C06 | Link a removed story section at a retained revision containing it. | slice 1 | observed: src/skills/dough-product-backlog/references/identity.md item 3; coordinator diff review and representative CI-history title-and-anchor walkthrough, no new paragraph or section |
| C07 | Resolve an unclear reference target from evidence when possible. | slice 1 | observed: src/skills/dough-product-backlog/references/identity.md item 3; coordinator diff review and representative CI-history title-and-anchor walkthrough, no new paragraph or section |
| C08 | Flag a target that remains unclear. | slice 1 | observed: src/skills/dough-product-backlog/references/identity.md item 3; coordinator diff review and representative CI-history title-and-anchor walkthrough, no new paragraph or section |
| C09 | Add about one sentence to contract item 3, “The link is navigation, not identity,” in Work item identity. | slice 1 | observed: src/skills/dough-product-backlog/references/identity.md item 3; coordinator diff review and representative CI-history title-and-anchor walkthrough, no new paragraph or section |
| C10 | Address that guidance to the agent writing the reference, following ADR 0006. | slice 1 | observed: src/skills/dough-product-backlog/references/identity.md item 3; coordinator diff review and representative CI-history title-and-anchor walkthrough, no new paragraph or section |
| C11 | Let the seed format reach the rule through its existing Work item identity link. | slice 1 | observed: src/skills/dough-story-decomposition/references/seed-format.md:74 and dough-story-refinement/references/planning.md:131 retain existing links to the contract without restatement |
| C12 | Let the executable plan format reach the rule through its existing Work item identity link. | slice 1 | observed: src/skills/dough-story-decomposition/references/seed-format.md:74 and dough-story-refinement/references/planning.md:131 retain existing links to the contract without restatement |
| C13 | Label each dashboard dependency supplier with its story title when available. | slice 3 |  |
| C14 | Obtain that title by the supplier’s recorded identity. | slice 3 |  |
| C15 | Support obtaining the title from the project’s active work. | slice 3 |  |
| C16 | Support obtaining the title from the supplier’s done record. | slice 3 |  |
| C17 | Keep dependency navigation working to the exact active story. | slice 3 |  |
| C18 | Keep dependency navigation working to the exact Recently done story. | slice 3 |  |
| C19 | Show the recorded identity when a supplier title is unavailable. | slice 3 |  |
| C20 | Update Dashboard navigation documentation where it describes the dependency label. | slice 3 |  |
| C21 | Apply the convention to the still-relevant SEED-337 history-story CI-history reference. | slice 2 |  |
| C22 | Apply it to the still-relevant SEED-336 live-status Done-record reference. | slice 2 |  |
| C23 | Apply it to the relevant SEED-321 references concerning speedup, default timeout, and review/Side panel page objects. | slice 2 |  |
| C24 | Apply it to the relevant plan 611 references concerning those subjects. | slice 2 |  |
| C25 | Apply it to the relevant SEED-341 session-discovery/report page-object references. | slice 2 |  |
| C26 | Apply it to the relevant SEED-340 session-discovery/report page-object references. | slice 2 |  |
| C27 | Apply it to the relevant SEED-332 correction references concerning high-load completion, default Actions, and custom rebuilds. | slice 2 |  |
| C28 | Apply it to the relevant SEED-324 correction references concerning those subjects. | slice 2 |  |
| C29 | Apply it to the relevant plan 607 references concerning those subjects. | slice 2 |  |
| C30 | Apply it to the relevant SEED-319 mobile-terminal, default-timeout, and repeat-check-speedup references. | slice 2 |  |
| C31 | Apply it to the relevant SEED-292 Donut explicit-CI-count references. | slice 2 |  |
| C32 | Apply it to the SEED-053 native-guidance acceptance retained links. | slice 2 |  |
| C33 | Apply it to the SEED-053 companion-case retained links. | slice 2 |  |
| C34 | When touching ODF-436, apply it to the execution reference “Publish Donut CI proof for Intent.” | slice 2 |  |
| Q01 | The understandable-label and exact-navigation promises cover references in stories, plans, and dashboard dependencies. | slice 3 |  |
| Q02 | Those promises hold when several stories share one seed. | slice 3 |  |
| Q03 | Those promises hold after the referenced story completes. | slice 3 |  |
| Q04 | Recheck current story ownership before editing audited references. | slice 2 |  |
| Q05 | Recheck current destinations before editing audited references. | slice 2 |  |
| Q06 | Coordinate changes to Taken stories with their owners. | slice 2 |  |
| Q07 | Coordinate changes to Taken plans with their owners. | slice 2 |  |
| Q08 | Respect existing readiness-review rules. | slice 2 |  |
| Q09 | An existing format link may be retargeted if necessary. | slice 1 | observed: src/skills/dough-story-decomposition/references/seed-format.md:74 and dough-story-refinement/references/planning.md:131 retain existing links to the contract without restatement |
| Q10 | Apply audited-reference changes only where the references remain relevant. | slice 2 |  |
| Q11 | The source groups some audit subjects across multiple documents; it does not establish their exact document-to-target mapping. | slice 2 |  |
| E01 | An agent reading only contract item 3 can write a plan reference labelled “Read CI history at a glance in story comparison and test Proof” targeting `SEED-331-read-ci-history-at-a-glance.md#read-ci-history-at-a-glance`. | slice 1 | observed: src/skills/dough-product-backlog/references/identity.md item 3; coordinator diff review and representative CI-history title-and-anchor walkthrough, no new paragraph or section |
| E02 | References into one page-object seed distinguish review/Side panel work from session-discovery/report work. | slice 2 |  |
| E03 | Each of those page-object references opens its own section at a retained revision. | slice 2 |  |
| E04 | “Spot completed stories that need review,” referenced from the live dashboard status seed, opens its completed section at a retained revision. | slice 2 |  |
| E05 | A reference to the whole live dashboard status seed uses that seed’s title. | slice 2 |  |
| E06 | Two dependency suppliers sharing a seed display their individual story titles. | slice 3 |  |
| E07 | Each supplier link opens its own story in the correct project. | slice 3 |  |
| E08 | A completed supplier link opens its Recently done card. | slice 3 |  |
| E09 | A supplier whose title is unavailable displays its identity. | slice 3 |  |
| E10 | That fallback link still opens the exact supplier story and never a sibling. | slice 3 |  |
| X01 | Add no new guidance section. | slice 1 | observed: src/skills/dough-product-backlog/references/identity.md item 3; coordinator diff review and representative CI-history title-and-anchor walkthrough, no new paragraph or section |
| X02 | Add no new guidance paragraph; keep the guidance change to about one sentence in the existing contract item. | slice 1 | observed: src/skills/dough-product-backlog/references/identity.md item 3; coordinator diff review and representative CI-history title-and-anchor walkthrough, no new paragraph or section |
| X03 | Do not restate the rule in the seed format. | slice 1 | observed: src/skills/dough-story-decomposition/references/seed-format.md:74 and dough-story-refinement/references/planning.md:131 retain existing links to the contract without restatement |
| X04 | Do not restate the rule in the executable plan format. | slice 1 | observed: src/skills/dough-story-decomposition/references/seed-format.md:74 and dough-story-refinement/references/planning.md:131 retain existing links to the contract without restatement |
| X05 | Change other older prose only when touched for another reason. | slice 2 |  |
| X06 | Preserve the backlog format. | slice 3 |  |
| X07 | Preserve structured identities. | slice 3 |  |
| X08 | Preserve the dependency record’s supplier identity. | slice 3 |  |
| X09 | Preserve the dependency record’s href. | slice 3 |  |
| X10 | Store no title in dependency facts. | slice 3 |  |
| X11 | Store no title in the done catalog. | slice 3 |  |
| X12 | Preserve existing dependency recovery behavior. | slice 3 |  |
| X13 | Limit Dashboard navigation documentation changes to its description of the label. | slice 3 |  |
