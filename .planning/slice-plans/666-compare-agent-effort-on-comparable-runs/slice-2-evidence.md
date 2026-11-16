# Accepted slice evidence

## Slice 2 acceptance

Trigger: multiple agents or observed settings changes; expected individual maxima,
settings distributions and honest guidance provenance. Inspected
`agentEffortObservations.ts` request-level shared accounting, separate identities,
maxima and coverage policy, deterministic settings groups; report and CLI supply
requested settings separately and no VERSION read. Settings spec observes Codex
inclusive peaks200/300 and input750, requested versus observed/tier changes and
null unknowns. Peaks spec observes Claude disjoint42/100 plus separate models;
missing identity/components/readable-row variants prove lower bounds32/80/110.
Coverage spec observes unavailable stored-only peak. Guidance test changes isolated
working-directory VERSION independently; static inspection supplies the no-current-
installation-read conclusion. It does not claim the fixture models every install.

`caffeinate -s -i env -u NO_COLOR -u FORCE_COLOR npx playwright test --config dashboard/backend.playwright.config.ts dashboard/backend-tests/usage-history/agent-effort --reporter=list --workers=2`:12 passed (6.4s); `npm run typecheck:dashboard` passed; whitespace passed. All original six CLI observations remain passing. Consumer trace `/tmp/compare-effort-slice2-consumers.txt` inspected: observations→report→CLI/type-only harness/specs covered; upstream normalization/ownership/writer and independent evaluation do not consume this changed output. No shared scan change.

Actual CLI replay: `node dashboard/server/compareAgentEffort.ts --home /tmp/compare-effort-slice2-home --codex-root /tmp/compare-effort-slice2-empty --claude-file /Users/terryyin/.claude/projects/-Users-terryyin-git-open-dough--worktrees-make-landed-ci-repeat-checks-pass-under-moderate/296b888d-08b1-4b06-ac2e-24a4462da7d0.jsonl --host claude --family 296b888d-08b1-4b06-ac2e-24a4462da7d0 --from 1970-01-01T00:00:00.000Z --until 2100-01-01T00:00:00.000Z --json > /tmp/compare-effort-slice2-claude.json` exited0. [Retained summary](claude-sample-summary.json) inspected: coordinator752562 observed-maximum,280 requests,0 missinginput,122Fable/medium and158Opus/high, standard tier, grouppeak null, requested/guidance unknown. Missing worker files remain group gaps without invalidating the coordinator's own retained maximum. Active implementation13m. G1/G3/G4 retain their owners; G2 proved here. Freshness unchanged at pinned trunk `f1bff2c549f5080adb4f3f81e3ec11c5342294ea`; no named sibling landed there.

G5 acceptance correction: `agent-effort-stored-worker.spec.ts` imports native coordinator/worker then deletes only worker file; CLI observes coordinatorpeak100 observed-maximum, stored-only worker peak unavailable/input100partial and combined200partial with all three gaps. Inspected setup and assertions; three stored-only detail gaps no longer downgrade other native agents. Same focused command now13 passed (5.7s), typecheck/whitespace passed. Consumer record `/tmp/compare-effort-slice2-stored-worker-consumers.txt` inspected; shared accounting unchanged. Cumulative implementation14m15s.

Independent slice2 refactor returned none—already clean and `## REFACTOR COMPLETE`; no tests run by reviewer. Real formatted sources all<250 (largest report232). Inspected new stored-worker correction/observations and reused13-case, typecheck and native sample proof; no additional runtime consumer.

Slice2 accepted publication: `4ceb10acf5bcda6574de42e2bd2cc687ffb4fbea` to `origin/refs/heads/codex/compare-agent-effort-on-comparable-runs`, suffixBase `4f2059948d26b900bd1adcf090c12a93c62bdd2d`, same observer reused. Next increment uses this accepted SHA as its base.
