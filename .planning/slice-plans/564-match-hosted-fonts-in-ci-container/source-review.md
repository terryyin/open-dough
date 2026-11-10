# Source-only review

Launched fresh reviewer `/root/source_review` with `fork_turns: none`. Its actual launch and return are retained in this execution conversation. Input: only the selected story’s Goal, six Scope bullets, four Key examples, and final safe-stopping paragraph, transcribed from SEED-289#match-hosted-fonts-in-ci-container; no plan, implementation, proof, or other project files. Reviewer was instructed to read no files and change nothing.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Maintainers and agents checking font-dependent dashboard layout through `scripts/ci-container.sh` see the hosted Ubuntu runner’s fallback-font layout before publishing. | slice 2 | |
| C02 | The diagnostic image exposes both narrow-width failures in DD-435. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| C03 | New layout specs obtain this default font environment without supplying a wider substitute font. | slice 2 | |
| C04 | Supply the hosted `ubuntu-24.04` runner’s font families in the diagnostic image. | slice 2 | |
| C05 | Make the dashboard’s normal font stack resolve to the hosted fallback. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| C06 | Compare against an identified hosted image’s published font inventory. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| C07 | Demonstrate each DD-435 failure on its respective pre-repair revision. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| C08 | Perform those demonstrations without a spec font override. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| C09 | Demonstrate a passing narrow-width journey on current trunk using the same diagnostic font setup. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| C10 | Observe browser font selection. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| C11 | Observe overflow. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| C12 | Extend `tests/ci-container.sh` to protect the hosted font-set contract. | slice 2 | |
| C13 | Document the font contract’s source. | slice 2 | |
| C14 | Document its refresh procedure. | slice 2 | |
| C15 | Keep font changes in the image recipe. | slice 2 | |
| C16 | Ensure those recipe changes invalidate the existing image cache key. | slice 2 | |
| C17 | Retain the existing Verdana overrides. | slice 2 | |
| C18 | Separately observe the application’s normal font stack during container acceptance. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| C19 | Conduct that normal-stack observation without the retained font overrides. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| C20 | Preserve the diagnostic helper’s existing invocation. | slice 2 | |
| C21 | Preserve its native architecture. | slice 2 | |
| C22 | Preserve its runtime refusals. | slice 2 | |
| C23 | Preserve its path refusals. | slice 2 | |
| C24 | Preserve its user identity. | slice 2 | |
| C25 | Preserve its checkout mounts. | slice 2 | |
| C26 | Preserve its isolated npm volumes. | slice 2 | |
| C27 | Keep normal local tests using their native environment. | slice 2 | |
| C28 | Keep hosted CI using its native environment. | slice 2 | |
| C29 | Probe runtime availability early in execution. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| C30 | Probe actual fallback equivalence early in execution. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| Q01 | Package presence alone does not establish browser equivalence. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| Q02 | An unrelated historical failure cannot count as reproducing either DD-435 overflow. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| Q03 | The retained Verdana overrides continue exercising wider text on native macOS. | slice 2 | |
| Q04 | Removing those overrides is unnecessary for the image correction. | slice 2 | |
| Q05 | Naturally equivalent layouts may have harmless rendering differences; those differences need not cause rejection. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| Q06 | The completed image change, maintained contract check, and observed historical and current browser results together form a useful safe stopping point. | slice 2 | |
| Q07 | Preparation does not claim that the browser results have already been observed. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| J01 | On `0332f824ae60b9741732ba2c83e0db505645a805`, parent of `4ad55b56d`, the narrow-width check exposes DD-435’s sideways overflow. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| J02 | That first historical check uses the diagnostic image’s hosted fonts. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| J03 | That first historical check uses the dashboard’s normal font stack. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| J04 | Its spec resides at `dashboard/tests/intent-ci-proof.spec.ts`. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| J05 | On `d146a05d95f62810da79bf653e5f0f98fa58fefc`, parent of `68e5f52b3`, the same check exposes the later sortable-header overflow. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| J06 | That second historical check injects no Verdana. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| J07 | Its spec resides at `dashboard/tests/intent/intent-ci-proof.spec.ts`. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| J08 | Current trunk’s repaired table passes the narrow journey with the normal fallback in the font-corrected container. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| J09 | Current trunk’s repaired table passes the zoomed journey under that setup. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| J10 | The retained Verdana regression also passes. | slice 1 | observed: PLAN.md — Slice 1 probe evidence: inspected historical original readsAt failures, current normal/stress passes, CDP and inventory observations; commands and source/image identities retained |
| J11 | A maintainer need not change the next layout spec to obtain the default font environment. | slice 2 | |
| J12 | Removing a required hosted font from the image recipe makes the maintained font contract fail. | slice 2 | |
| J13 | Updating the image recipe builds an image with a different tag. | slice 2 | |
| J14 | The normal cached run continues working. | slice 2 | |
| J15 | The existing refusal contracts continue working. | slice 2 | |
| J16 | The existing isolation contracts continue working. | slice 2 | |
| E01 | Other hosted-only differences are outside this increment. | slice 2 | |
| E02 | Architecture emulation is outside this increment. | slice 2 | |
| E03 | Screenshot rendering guarantees are outside this increment. | slice 2 | |
| E04 | Pixel-identical rendering guarantees are outside this increment. | slice 2 | |
| E05 | Dashboard CSS repairs are outside this increment. | slice 2 | |
| E06 | The test-deadline sibling is outside this increment. | slice 2 | |
