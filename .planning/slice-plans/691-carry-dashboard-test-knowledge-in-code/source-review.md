# Source review

Launch: fresh general-purpose agent, no conversation inheritance, on
2026-11-18. Input: the Goal, Scope and Key examples of
SEED-334#carry-dashboard-test-knowledge-in-code verbatim (seed lines 61–167 at
`9d8d70c36`), with the instruction to read no project files, change nothing
and number independently observable promises. No plan, return or proof was
supplied.

Unnumbered context returned: the drift reason; the wider ambition for the
other test roots; the carrier order and "Git recovers them"; carrier 3's
settled baseline; ADR 0006 and skill-authoring guidance for the skill edit;
the spent manual folder; no feature-folder check; ordering against the
conversions, the retirement and SEED-334#keep-one-browser-test-group-roster;
another story's plan adapts later; the 250-line boundary assumption; the 30
helper imports and the fifty-spec inventory as baselines.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | Every Markdown file under `dashboard/tests/` is removed (README.md, feature-groups.md, shards.md, fixture-origins.md, intent-ci-comparison-proof.md, native-host-fixtures.md, proof-record.md, fluent-side-panel-pilot.md, fixtures/preparation-assignment-v0.3.51.md); `find dashboard/tests -name '*.md'` returns nothing. (Goal; Scope ¶1; Key example 7) | slice 8 | |
| 2 | The whole `manual/2026-10-13-mobile-dashboard/` folder is removed, including findings.json, images and the DOM capture. (Scope ¶1) | slice 2 | observed: slice 2 proof: git status shows all 7 files under dashboard/tests/manual/2026-10-13-mobile-dashboard/ deleted (README, findings.json, DOM .txt, 4 .jpg); ls dashboard/tests/manual reports no such directory |
| 3a | A Frontend spec that takes the server-starting `test` fixture is refused by an executable check: a scratch Frontend spec importing `test` from `dashboardTest.ts` makes `npm run lint` fail naming the rule; Frontend specs take `test` only from frontendApp.ts, pageTest.ts or comparisonMountPage.ts. (Carrier 2; Key example 1) | slice 1 | observed: slice 1 proof: eslint.config.mjs frontend-tests block; scratch spec importing test from ../tests/dashboardTest.ts refused by no-restricted-imports under npm run lint (exit 1) |
| 3b | A Frontend spec that starts the dashboard server is refused by the check. (Carrier 2) | slice 1 | observed: slice 1 proof: scratch import of startDashboardServer refused by no-restricted-imports under npm run lint |
| 3c | A Frontend spec that builds a fake GitHub or a fake host is refused by the check. (Carrier 2) | slice 1 | observed: slice 1 proof: scratch imports of startFakeGitHub, installFakeClaude, installFakeCodex, installFakeCursor each refused by no-restricted-imports under npm run lint |
| 4 | The helpers Frontend specs import today from those modules stay importable; the 30 existing helper imports still pass lint. (Carrier 2; Key example 1) | slice 1 | observed: slice 1 proof: npm run lint exits 0 on the tree without the scratch spec, including the dashboardTest.ts helper imports |
| 5 | An already-carried statement is deleted with its document and the carrier is left unchanged; the fakeClaude.ts header is unchanged after native-host-fixtures.md is removed. (Carrier 1; Key example 2) | slice 4 | observed: slice 4: native-host-fixtures.md deleted; git diff shows dashboard/tests/support/fakeClaude.ts, fakeCodex.ts and fakeCursor.ts headers unchanged |
| 6 | No fact a test author needs becomes unfindable; each such fact no existing carrier holds is stated by a name, type or configuration value. (Goal; carrier 3) | slice 8 | |
| 7 | The rebalance-ci-shards skill states the job-count rule itself where it linked shards.md#the-job-count; ci.yml holds the counts; the dated job-count decisions are gone. (Carrier 4; Key example 6) | slice 5 | observed: slice 5: .agents/skills/rebalance-ci-shards/SKILL.md states the job-count rule and names ci.yml as holding the counts; dashboard/tests/shards.md and its dated decisions deleted |
| 8 | A reason or usage rule for one helper or fixture that nothing else carries becomes a short statement in that module's own header, describing only that module and citing no other document. (Carrier 5) | slice 8 | |
| 8a | "Touch journeys use one device unless the other reaches an asserted branch" is one short statement in the header of the responsive fixture a touch journey imports, and nowhere else. (Key example 4) | slice 7 | |
| 8b | support/dashboardServer.ts no longer cites `../README.md, "Two tiers"`; its comment says what developmentBoundary is for in its own words and cites nothing. (Key example 5) | slice 7 | |
| 9 | History, measurements, dated decisions, per-spec inventories, the pilot's evaluation and remaining interim-group notes are dropped and do not reappear elsewhere; no spec list appears in any comment or guide. (Carrier 6; Scope limits; Key example 3) | slice 8 | |
| 10 | Every live incoming link to a removed file points to the carrier or is dropped with its sentence (AGENTS.md, e2e/README.md, dashboard/README.md, Frontend and Backend READMEs, Distribution/tests/README.md, test-environment.md, rebalance-ci-shards, ci.yml and browser-test-group.yml comments, active seeds, code comments); no link outside the retained records points at a removed file. (Links paragraph; Key example 7) | slice 8 | |
| 10a | e2e/README.md names the fixture modules where it linked native-host-fixtures.md. (Key example 2) | slice 4 | observed: slice 4: e2e/README.md:23-24 names ../dashboard/tests/support/fakeClaude.ts, fakeCodex.ts and fakeCursor.ts where it linked native-host-fixtures.md |
| 10b | AGENTS.md's test-automation entry names the MakeMe builders, the page-object entry and the fluent side-panel journeys where it linked the dashboard test guide and the pilot document. (Key example 7) | slice 8 | |
| 11 | A sentence in a staying guide that delegates to a removed document is removed with its link. (Links paragraph) | slice 8 | |
| 12 | Records of what was observed keep their recorded links: ProjectFindings.md, DearDough.md, docs/maintainer/ findings and history, .planning/evidence/, .planning/done/, CHANGELOG.md, fixtures/observed-runs-ci.yml. (Links paragraph) | slice 8 | |
| 13 | No prose moves into another Markdown file, except the rebalance-ci-shards skill. (Scope limits) | slice 8 | |
| 14 | The other test roots' Markdown is otherwise unchanged apart from link fixes; their own drift, such as the Backend README's folder table, is left. (Scope limits) | slice 8 | |
| 15 | No spec is converted and no product behavior changes. (Scope limits) | slice 8 | |
