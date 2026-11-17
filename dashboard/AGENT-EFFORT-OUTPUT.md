# Agent effort output contract

The JSON and readable output of the [retained effort command](AGENT-EFFORT.md).

## Selection contract

Every selection outcome is one of: a catalog, a selected report or a refusal.

- Catalog (`--list`, or `--host cursor --list`): JSON is
  `{"format":"agent-effort-v1","selections":[...]}`; readable output is the
  same `selections` array, indented. Native entries have exactly `id`, `host`,
  `sessionId`, `rootTurnId`, `identity` and `launchedAt` (absent when unknown);
  Cursor entries have exactly `host` (`cursor`), `id`, `root` and `directory`.
  Pass a native `id` to `--task`; pass a Cursor `id` to `--family` with its
  `root` as `--cursor-root`. Internal scan fields never appear.
- Selected report: `selection.boundary` names what was selected:
  `explicit-half-open-native-family-window` for a native family (responses at
  `from` are included, at `until` excluded) and
  `whole-retained-directory-family; native task/turn/time boundary unprovable`
  for Cursor. A Cursor `--from`/`--until` is echoed in `selection.from`/`until`
  but never applied: `selection.appliedBoundary.kind` is
  `whole-retained-directory-family` with null bounds, and gaps include
  `requested-time-window-unprovable-whole-family-reported`.
- Refusal: exit status 1, nothing on stdout and one message on stderr. An exact
  story identity matching several tasks reports `Task selection is ambiguous`
  with the matching catalog entries; an unknown task reports `was not found`;
  a repeated Cursor family reports `Cursor family is ambiguous`; a native
  `--family` without `--host`, `--from` and `--until` is refused.

## Single-report contract

A selected report is mapped explicitly from internal results
(`dashboard/server/agentEffortSingleReport.ts`); JSON and readable output use
the same mapped facts. Every report has `format` (`agent-effort-v1`), `scope`
(`retained-local-evidence`), `host`, `selection`, `definition`, `accounting`,
`requestedSettings`, `guidanceVersion` (`value`, `provenance` of `supplied` or
`unknown`), `sources`, `totals`, `agents`, `peakInput` (always `null`: peaks are
per agent), `peakInputRule`, `idleWakeRequests`, `idleWakeRule` and sorted
`gaps`.

- Figures: `totals` and each agent's `totals` hold `requests`, `totalInput`,
  `cachedInput`, `uncachedInput`, `cacheWrite`, `cacheWrite5m`, `cacheWrite1h`,
  `output`, `totalTokens` and, only when present (Cursor),
  `reasoningOutput`, each `{value, status}` in
  tokens (requests in requests). `status` is `complete`, `partial` (a known
  subtotal) or `unavailable` (`value` null, never zero). Per-counter figures
  may add `missingRequests`; `totalInput` may add `missingComponents`
  (`uncachedInput`, `cachedInput`, `cacheWrite` request counts).
- `idleWakeRequests` has `value`, `status`, `classifiedRequests`,
  `unclassifiedRequests`, `progressRequests`, `mixedResultRequests`,
  `clockOnlyRequests` and `coverage` when wake evidence was examined; Cursor
  reports only `value` null with `status` `unavailable`. `observedSettings`
  entries have `model`, `effort`, `serviceTier` and `requests`; `sources`
  entries have `kind`, `file` and, when recorded, `line`, `repository` and
  `revision`. These nested
  facts are mapped key by key (`agentEffortSingleReportFacts.ts`).
- Codex/Claude (`definition` `codex-inclusive-input` or
  `claude-disjoint-input`): `selection` has `kind` (`task` or
  `native-family`), `taskId`, `identity`, `rootSessionId`, `rootTurnId`,
  `nativeTurns`, `from`, `until`, `projectScope` and `boundary`; the report
  adds `unownedResponses` (each `id`, `sessionId`, `agentId`, `turnId`,
  `rootTurnId`, `sources`, `gaps`) and `threads`, and
  `guidanceVersion.evidence`. `requestedSettings` is `null` or the launch's
  `model`, `effort`, `approvalPolicy`, `sandbox`, `serviceTier`, `options` and
  `policy`. Each
  agent has `id`, `sessionId`, `agentId`, `role` (`coordinator` or `worker`),
  `provenance`, `totals`, `observedSettings`, `sources`, `responseIds`,
  `peakInput` (observed per-agent maximum with `status`, `observedRequests`,
  `missingInputRequests`, `coverage`) and `idleWakeRequests`.
- Cursor (`definition` `cursor-retained-workflow`): `selection` has `kind`,
  `rootSessionId`, `from`, `until`, `appliedBoundary` and `boundary`; the report
  adds `observedSettings`, `observedSettingsCoverage` and `workflow` (retained
  transcript, worker, byte and tool counts with `status` and `coverage`). Each
  agent has `id`, `role`, `provenance`, `sources`, `workflow`, `totals`,
  `requestedSettings`, `observedSettings`, `observedSettingsCoverage`,
  `peakInput` and `idleWakeRequests`; token figures are unavailable.
- Readable output prints the host and definition, then labelled lines
  `Selection:`, the accounting rule, `Requested settings:`, `Guidance
  version:`, `Observed settings coverage:` (Cursor), the peak and idle-wake
  rules, `Combined known figures:` (the JSON `totals`), `Workflow:` (Cursor),
  one `ROLE ID:` line per agent without `responseIds`, and `Gaps:`.


## Comparison contract

`--comparison FILE` output is mapped explicitly from internal group results
(`dashboard/server/agentEffortComparisonReport.ts`); JSON and readable output
use the same mapped facts. JSON has `format` (`agent-effort-comparison-v1`),
`baseline`, `candidate`, `deltas` and sorted `warnings`, and never a winner.

- Each side has `notes` (supplied `outcome`, `proof`, `humanIntervention`, or
  `null`), `executions` (each member's `label` plus its full
  [single report](#single-report-contract)) and `perHost`.
- Each `perHost` entry has `host`, `definition`, deduplicated `totals`,
  `workflow` (Cursor counts with `workers`, otherwise `null`),
  `idleWakeRequests`, `agents` (`host`, `id`, union-recomputed `peakInput`),
  `sources`, `gaps` and `deduplication` (`reconciled-response-identity;
  exact-stored-contribution-identity` or `transcript-file-identity`).
- Each `deltas` entry, for one like host and definition, has `host`,
  `definition`, `totals` (only metrics known on both sides: candidate minus
  baseline `value`, both figures, and `status` `complete` or
  `partial-known-subtotals`), `workflow` differences or `null`, and
  `idleWakeRequests` difference or `null`.
- `warnings` always include
  `exploratory-retrospective-comparison; no automatic improvement or causal
  claim` and the maintainer-judgment reminder, plus differences in settings,
  guidance, selection, gaps or coverage, unknown settings, and hosts without a
  like counterpart.
- Readable output starts `Exploratory agent effort comparison; no automatic
  improvement or causal claim`, then per side `NAME supplied notes:`, one
  `NAME execution:` line per member (agents without `responseIds`) and
  `NAME deduplicated group:`, then `Deltas:` and `Warnings:` (joined by `; `).
