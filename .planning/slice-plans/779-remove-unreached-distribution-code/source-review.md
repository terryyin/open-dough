# Source-only review

The coordinator launched the fresh-context reviewer `/root/source_review` in this execution session. Its only input was the original selected SEED-423 story text from Goal through the final worktree-preparation paragraph. The launch requested independently observable promises with provenance and supplied no plan, product, proof, or slice detail. The reviewer returned P01 through P60 in the session. Scope bullets and key examples below are numbered in source order.

The review treats the goal and earlier fixture moves as context. It retains the existing consumer trace, supported proof boundaries, ordinary resume ownership, and exclusions for general deduplication, CI reuse recipes, custom adapters, legacy migration and installer redesign.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| P01 | Audit candidates whose only callers are tests are removed from the product surface. This condition is determined against current guidance, hooks, installer paths, Dashboard calls, repository tooling, and transitive consumers. (Scope) | slice 8 | |
| P02 | When a test still needs fixture behavior from a retired candidate, that behavior is available in test support. (Scope) | slice 8 | |
| P03 | Retired paths are absent from the first payload declaration. (Scope) | slice 8 | |
| P04 | Retired paths are absent from the second payload declaration. (Scope) | slice 8 | |
| P05 | A clean install from the new source leaves the retired wrappers absent from its installed roots. (Example 1) | slice 2 | |
| P06 | An update from a tag that declared the retired wrappers leaves them absent from its installed roots. (Example 1) | slice 2 | |
| P07 | That update advances the recorded version. (Example 1) | slice 2 | |
| P08 | That update preserves project guidance. (Example 1) | slice 2 | |
| P09 | That update preserves project configuration. (Example 1) | slice 2 | |
| P10 | The standalone `watch-ci.mjs` invocation is retired, including the test-only inputs belonging to that invocation. (Scope bullet 1) | slice 1 | observed: assert-public-payload-install.sh and update-removes-dropped-files.sh observe omission and tagged removal in both native roots; the wrapper and its payload entry are deleted. |
| P11 | From the smaller installation, a developer can start the guided mailbox observer against an exact revision and receive its outcome. (Scope bullet 1, Example 2) | slice 1 | observed: execution-payload-update.sh and installed-wait-entrypoint-fixture.bash register the selected SHA, observe exact success and stop the mailbox in both installed roots; ci-custom-host-bridge checks exact failure delivery. |
| P12 | From the smaller installation, a developer can complete the guided mailbox observer against an exact revision and receive its outcome. (Scope bullet 1, Example 2) | slice 7 | |
| P13 | The guided observer still accepts `--execution`. (Scope bullet 1) | slice 1 | observed: ci-command-adapter-cli.test.mjs starts the installed mailbox with --execution from direct and symlink paths; execution-payload-update.sh runs installed start --execution. |
| P14 | The observer retains its existing lifetime behavior. (Scope bullet 1) | slice 1 | observed: ci-mailbox-launch.test.mjs observes launch before discovery, exact worker PID, failure delivery, confirmed stop and retained unread records; configured-provider stream shutdown cleans up the attempt. |
| P15 | The observer remains compatible with persisted requests. (Scope bullet 1) | slice 1 | observed: ci-mailbox-completion-cause.test.mjs advances the clock for a persisted request with 5000 ms and observes its exact budget-expiry reason, terminal cause and completion receipt. |
| P16 | `select-makeme.mjs` is retired. (Scope bullet 2, Example 3) | slice 2 | |
| P17 | `changed-makeme.mjs` is retired. (Scope bullet 2, Example 3) | slice 2 | |
| P18 | The former MakeMe selector export is retired. (Scope bullet 2) | slice 2 | |
| P19 | The shared matcher remains available to its surviving consumers. (Scope bullet 2) | slice 2 | |
| P20 | The existing location rules remain in effect. (Scope bullet 2) | slice 2 | |
| P21 | With mixed MakeMe and page-object rules, selecting a named test through `test-entry-rules.mjs` still reports its matching rules. (Scope bullet 2, Example 3) | slice 2 | |
| P22 | With mixed MakeMe and page-object rules, selecting changed tests through `test-entry-rules.mjs` still reports their matching rules. (Scope bullet 2, Example 3) | slice 2 | |
| P23 | The MakeMe evaluation cases recognize the current CLI. (Scope bullet 2) | slice 2 | |
| P24 | `product-backlog.mjs` no longer offers a separately callable `merge` verb or that verb’s report. (Scope bullet 3, Example 4) | slice 4 | |
| P25 | The existing merge policy is given directly as text. (Scope bullet 3) | slice 4 | |
| P26 | The real Git merge driver remains usable. (Scope bullet 3) | slice 4 | |
| P27 | The installed merge adapter continues to reconcile concurrent backlog changes during Git merge. (Scope bullet 3, Example 4) | slice 4 | |
| P28 | The installed rebase adapter continues to support backlog reconciliation during Git rebase. (Scope bullet 3, Example 4) | slice 4 | |
| P29 | The installed cherry-pick adapter continues to support backlog reconciliation during Git cherry-pick. (Scope bullet 3, Example 4) | slice 4 | |
| P30 | Git still reconciles concurrent backlog changes when a clean merge requires reconciliation. (Example 4) | slice 4 | |
| P31 | Git reconciliation preserves conflicts that must be preserved. (Example 4) | slice 4 | |
| P32 | The delivery command no longer accepts `--preferred-alias`. (Scope bullet 4) | slice 7 | |
| P33 | The delivery command no longer accepts `--max-duration-ms`. (Scope bullet 4) | slice 7 | |
| P34 | The completion command no longer accepts `--max-duration-ms`. (Scope bullet 4) | slice 7 | |
| P35 | The mailbox command no longer accepts the optional `[BUDGET_MS]` input. (Scope bullet 4) | slice 1 | observed: ci-mailbox-launch.test.mjs invokes both CLI operations with the retired numeric positional and observes refusal before mailbox storage is created. |
| P36 | `consumer-trace` no longer accepts `--path`. (Scope bullet 4) | slice 8 | |
| P37 | `story-obligations record` no longer accepts `--commitment-field`. (Scope bullet 4) | slice 8 | |
| P38 | `slice-clock status` no longer accepts `--identity`. (Scope bullet 4) | slice 8 | |
| P39 | `wait-for-publication` no longer accepts `--interval-seconds`. (Scope bullet 4) | slice 8 | |
| P40 | Publication callbacks used only to arrange tests are removed where existing boundaries can prove the same race and receipt behavior. (Scope bullet 4) | slice 7 | |
| P41 | The underlying delivery behavior survives removal of the test-only inputs. (Scope bullet 4) | slice 7 | |
| P42 | The underlying completion behavior survives removal of the test-only inputs. (Scope bullet 4) | slice 7 | |
| P43 | The underlying resume behavior survives removal of the test-only inputs. (Scope bullet 4) | slice 6 | |
| P44 | The underlying execution-tool behavior survives removal of the test-only inputs. (Scope bullet 4) | slice 8 | |
| P45 | The publication race behavior survives removal of eligible test-only callbacks. (Scope bullet 4) | slice 7 | |
| P46 | The publication receipt behavior survives removal of eligible test-only callbacks. (Scope bullet 4) | slice 7 | |
| P47 | If trunk has accepted a closure and its live observer lacks the receipt, resuming uses the accepted revision to reach registration and record the closure on that observer. (Scope bullet 5, Example 2) | slice 6 | |
| P48 | Under those same recovery conditions, resuming issues no second push. (Example 2) | slice 6 | |
| P49 | The installer no longer offers `compare`. (Scope bullet 6) | slice 5 | |
| P50 | The installer no longer offers `destination`. (Scope bullet 6) | slice 5 | |
| P51 | The installer no longer offers `fetch-release`. (Scope bullet 6) | slice 5 | |
| P52 | The installer no longer offers `pin-latest`. (Scope bullet 6) | slice 5 | |
| P53 | The payload no longer offers standalone `copy` mode. (Scope bullet 6) | slice 5 | |
| P54 | An inspected checkout can still recheck its selected release through documented `resolve-url` before applying it. (Scope bullet 6, Example 5) | slice 5 | |
| P55 | A release mismatch stops the apply before managed writes. (Example 5) | slice 5 | |
| P56 | When origin supplies no repository identity, the advertised `ci-proof-leads --repository` fallback still works. (Scope bullet 6) | slice 8 | |
| P57 | After tracing consumers, the audit-listed CI host helpers and re-exports are private. (Scope bullet 7) | slice 3 | |
| P58 | After tracing consumers, the audit-listed mailbox helpers and re-exports are private. (Scope bullet 7) | slice 3 | |
| P59 | After tracing consumers, the audit-listed session and authorship helpers and re-exports are private. (Scope bullet 7) | slice 3 | |
| P60 | After tracing consumers, the audit-listed Git adapter entry points are private as helpers while the installed adapter workflows remain usable. (Scope bullets 3 and 7) | slice 4 | |
