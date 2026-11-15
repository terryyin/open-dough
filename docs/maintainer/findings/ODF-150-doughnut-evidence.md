# ODF-150 — doughnut execution evidence

[Canonical finding, response and assessment](ODF-150.md#odf-150).

### Retained source evidence — Doughnut (2026-10-28)

**Source:** [Doughnut / DearDough.md](https://github.com/nerds-odd-e/doughnut/blob/cc8b0fe361c07a8a6532d1a74aa0b41ba18146f0/DearDough.md).

- Execution: SEED-002#story-2 (first implementation `f0390693df002168b2ce6a81f038bcb5f90931b8`)
  - Timestamp: unknown · Tool: Codex · Open Dough release: unknown
  - Evidence: `a26a2a4094f5c0f61a3e1c56c00746e9414cf13b:e2e_test/config/common.ts` changes Cypress browser origin; leaf17 classified old MCP consumers as unchanged. First leaf18 composed run failed all nine ordinary MCP scenarios because its Node TLS client received HTTPS instead of HTTP. `b5afee6a6b5d6f27fc787ed88ebc0326b90697a3:.planning/slice-plans/073-assistant-account-linking/HOSTED-SDK-EVIDENCE.md#18-connect-through-the-documented-oauth-journey` retains failed/final10-of10 receipts and G14.
  - Observed effect: A changed configuration value reached an unchanged task/page-object/client chain that slice acceptance had excluded; the later composed journey found it and the same execution repaired the HTTP Node ingress binding.
  - Inference: Matches indirect-consumer discovery, not a new OAuth server defect. Actual CI was unobserved; no CI failure is inferred from the local failure.

- Execution: SEED-088#story-1 (first implementation `1bbc9e88fb8d06d13a7e67ac85588cddee42b6e9`)
  - Timestamp: 2026-10-28T11:48:59+08:00 · Tool: Cursor · Open Dough release: unknown
  - Evidence: Slice 1 accepted focused entity suites (`MemoryTrackerCorrectRecallDueFuzzTest` / Scheduling / Rebuild). Backend Unit CI failed on residual fixtures that still assumed Stability-hour dues (`MemoryTrackerBuilder.stabilityAndNextRecallAt` via unfuzzed `calculateNextRecallAt`; `RecallServiceDueWorkTest` absolute day offsets). Repair `8de87c62be8ab20d6337dd27948e65cb86ff8e26` reschedules Grade-path fuzz after persist and asserts relative to actual fuzzed dues; plan Accepted proof notes CI repair run 40626834805.
  - Observed effect: Indirect builder/service/controller consumers of the scheduling write escaped slice acceptance and failed in CI; same execution repaired them before later slices.
  - Inference: Matches missed-indirect-consumer proof, here fixture and due-work tests rather than E2E journeys. Distinct mechanism from ODF-272/ODF-310; tip CI for later SHAs remains pending and is not claimed green.

### Additional retained evidence — doughnut (2026-11-01)

**Source:** [DearDough.md](https://github.com/nerds-odd-e/doughnut/blob/6454e7b2b516c119876b25e3663bfc7891a15178/DearDough.md).

- Execution: SEED-090#story-1 / first implementation `6a12f6bbc287099c6e1c00916df4b48249cb0d8e`
  - Timestamp: 2026-10-28T09:01:43Z · Tool: Codex · Open Dough release: unknown
  - Evidence: slice-1 consumer trace excluded `hostedAssistant.ts` as an unchanged read-only journey; CI run `40660492127`, attempt 1, job `122722010192`, failed its old consent heading. Repair `4f226b3c992ff723868e5e4086ed2748a25cee28` and its retained plan/evidence record show the cause and focused reproduction.
  - Observed effect: Advertising `learning_session:record` changed SDK 1.32.2's selected scopes because it prefers discovered `scopes_supported` over provider `clientMetadata.scope`. The existing SDK journey requested both scopes and failed in CI despite passing selected backend/browser proof. Four E2E-only expectation edits then passed the unchanged real SDK consent/read/renewal/withdrawal journey (1/1, 16 seconds).
  - Inference: Consumer acceptance stopped at an unchanged transport/default-scope assumption instead of tracing discovery into actual client selection. The product/test repair is complete; shared prevention remains unproved. Inspect indirect discovery/default consumers before excluding an existing journey.

### Retained source evidence — Doughnut (2026-11-15)

**Source:** [Doughnut source log](https://github.com/nerds-odd-e/doughnut/blob/5170deb585edd20cfdecf2e609dea9ae3a5a6e55/DearDough.md#L414).

The same execution has separate aggregate-history and restoration observations under ODF-271 and ODF-487. This row concerns the distinct indirect Markdown consumer; combined rankings count the execution once.

- Execution: SEED-119#highlight-and-link-to-a-specific-property-item / 3349feafb0163ea7c0a72d54562b5638a9fa1b52
  - Timestamp: unknown
  - Tool: Codex
  - Open Dough release: modified; execution revision 8ab86f53f02c4cdb243ff0a2b34567d3a7f6c8a8; base release unknown
  - Evidence: 2026-11-10; CI run42770072237/attempt1 frontend job129675536405, autosaveTrash expected3 saves/got2; local deterministic red and repair c5134729baf5379be70bb458200128998793efd8.
  - Observed effect: stricter unknown-history refusal reached ordinary Markdown frontmatter removal in an existing mounted autosave/trash case omitted from slice7's indirect-consumer proof. Missing getNoteInfo data blocked its third save. Known-empty-history HTTP setup repaired the test; original expectations and exact third payload passed, with no production workaround.
  - Inference: symbol-based tracing did not expose the indirect edit-to-property-removal path. The owned CI repair restored proof; shared prevention remains unestablished.
