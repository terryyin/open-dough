# Each host has its own session record shape

**Identity:** SEED-075#session-record-per-host
**Source:** [refined story](../../seeds/SEED-075-host-neutral-dashboard-before-cursor.md#session-record-per-host)
**Authority:** Planning only. No Take, implementation, commit, or publication.
**Preparation:** Established workspace
`/Users/terryyin/git/open-dough/.worktrees/each-host-has-its-own-session-record-shape`,
branch `claude/each-host-has-its-own-session-record-shape`, published assignment
`2cd2e9d662390fb1433ef580b2a9bd91b87e0816`, agent `DavidKo-chan`, remote
`origin`, target `main`, integration checkout `/Users/terryyin/git/open-dough`.
**Depends on:** SEED-075#one-host-description is queued ahead of this story.
Its edits touch `server/claudeHost.ts`, `server/launchHosts.ts`, and
`server/agentLaunchAdmission.ts` near this plan's edits. Execute this plan on
trunk after that story lands, and re-read the touched call sites first. Neither
story's outcome depends on the other's code.

## Goal and scope

A maintainer adding a host gives its native identity and continuation their
own session record variant instead of adding optional fields to the one shape
Claude and Codex share. Claude and Codex users see no change.

- `hostSessionSchema` (`dashboard/src/launchRecord.ts`) becomes a
  discriminated union on `host`. The Claude variant requires `shortId`. The
  Codex variant has an optional `continuation` of `workspace`, `endpoint`,
  `args`, and an optional `notice`. Both variants keep `sessionId` and `name`.
  The `superRefine` host-name branch is removed.
- The exported types gain `ClaudeSession` and `CodexSession`; `HostSession`
  stays as their union for shared callers that only pass sessions through.
- Host modules narrow to their own variant inside the module:
  `server/claudeHost.ts` `nativeAlias`, and Codex `terminal.ts`, `done.ts`,
  `recovery.ts`, `sessions.ts`, `conversation.ts`, and `launch.ts`. A missing
  Codex continuation keeps its current answer at each reader: unknown
  observation, "Saved native endpoint is missing", the terminal refusal, and
  uncertain recovery.
- Shared browser code (`src/LaunchSession.tsx`) reads a continuation by the
  variant's own field (`"continuation" in session`), with no host-name check.
  Its "Continue in Codex" label is unchanged and belongs to
  SEED-075#host-neutral-session-meaning.

**Excluded:** a Cursor variant (SEED-052#use-cursor-from-dashboard), wording,
`LaunchHost` signature changes or a per-host generic session type, request
schema host values, and any migration or rewrite of stored records.

## Architecture and PFE

The existing [North Star agent-launch topic](../../NORTH-STAR.md#agent-launch-as-a-requested-assignment)
already names this direction: each host's identity and continuation have their
own session record variant, and host code stays in one module per host behind
`LaunchHost`. This plan follows that topic and does not revise it. Accepted
[ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
(one representation per concept, smallest cohesive change) and
[ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) (an
operation a host lacks stays unavailable) apply. No conflict was found.

| Existing solution | Decision |
| --- | --- |
| zod 4.6.5 `z.discriminatedUnion`, already used for `sessionStateSchema` in the same file | Reuse it for the session variants. No hand-written host dispatch. |
| `launchRecordSchema` and `launchWithStateSchema = launchRecordSchema.extend(...)` | Keep both as objects; only the `session` field changes. `.extend` keeps working. |
| `claudeHost.ts` `nativeAlias` and Codex `terminal.ts` already narrow by host inside their modules | Keep that narrowing as the one place each host recognizes its own variant. Other Codex readers narrow the same way. |

## Observed premises

| Premise | Consumed by | Observation (2026-10-01, at `2cd2e9d6`) | Result |
| --- | --- | --- | --- |
| A record that fails the schema fails the whole machine document, which is then moved aside | Every variant must accept every record that loads today | `server/launchRecordDocument.ts` parses `z.record(z.string(), z.array(z.union([launchRecordSchema, creationSchema])))`; the header says unreadable files are moved aside by `machineJsonStore.ts` | Confirmed. This is why the Codex continuation stays optional. |
| Predecessor Codex records with no continuation are a supported stored shape | Codex variant keeps `continuation` optional; slice proof | `tests/agent-launch-host-identity.spec.ts` (no-endpoint Codex record: unknown, done problem "Saved native endpoint is missing", terminal close 1011, no quarantine) and `tests/agent-launch-codex-observation-boundary.spec.ts` (`legacy-no-endpoint` → unknown) | Confirmed. This falsified the first refinement draft ("Codex continuation required"); the seed was corrected. |
| Those predecessor journeys pass on the unchanged product | Baseline for "passes unchanged" | `npx playwright test --config dashboard/playwright.config.ts --reporter=line dashboard/tests/agent-launch-host-identity.spec.ts dashboard/tests/agent-launch-codex-observation-boundary.spec.ts dashboard/tests/agent-launch-codex-confirmation.spec.ts dashboard/tests/agent-terminal-codex.spec.ts` | 9 passed (10.3s). `npm run typecheck:dashboard` passed. |
| Stored records are re-serialized from parsed data, so fields a variant does not declare would be dropped on the next write | "Nothing stored changes" | `replaceRecords` writes the parsed `StoredRecords` | Confirmed. Safe because no host writes another host's fields: `shortId` is written only in `server/hosts/claude/{launch,runtime}.ts`; `continuation` only in `server/hosts/codex/{launch,conversation}.ts`; `grep -rn continuation dashboard/server/hosts/claude` is empty. |
| No Cursor session is ever recorded, so a Claude/Codex-only union drops no loadable record | Union lists only `claude` and `codex` although `agentHosts` includes `cursor` | `launchHost()` returns `undefined` for `cursor`; `agentLaunchAdmission.ts:168` refuses before recording; `tests/agent-launch-refusal.spec.ts:77` covers `host: "cursor"` | Confirmed. |
| No existing spec pins the per-host validation rules (alias required, endpoint required inside a continuation) | Slice 1 adds focused regression proof first | `grep -rn "alias is missing\|hostSessionSchema" dashboard/tests` is empty. The only pure schema-rules spec style is `tests/agent-launch-options-rules.spec.ts` | Confirmed gap. |
| Session readers of the shape are exactly these | Slice 1 edit list | `grep -rlE "shortId\|continuation\|HostSession" dashboard/src dashboard/server`: `src/{launchRecord,doneMark,LaunchSession}`, `server/{claudeHost,agentTerminals,launchHosts,hostLaunch,launchRecording}.ts`, `server/hosts/claude/{launch,runtime}.ts`, `server/hosts/codex/{launch,conversation,done,recovery,sessions,terminal}.ts` (the remaining hits use the word "continuation" for preparation, not the record) | Confirmed. |

## Proof ownership

| Promise | Owning slice | Proof |
| --- | --- | --- |
| Claude record requires its alias; Codex continuation requires its endpoint; each validated only for its own host | 1 | New `dashboard/tests/launch-record-session-rules.spec.ts` |
| Predecessor Codex record without continuation still loads and reads the same | 1 | Existing host-identity and observation-boundary specs, unchanged |
| Codex continuation with endpoint drives terminal, done, recovery, and notice as today | 1 | Existing `agent-terminal-codex`, `agent-launch-codex-confirmation`, `agent-launch-codex-recovery`, `agent-launch-done-codex` specs, unchanged |
| Claude alias drives attach and stop as today | 1 | Existing `agent-terminal`, `agent-launch-done-stop` specs, unchanged |
| No host-name check in the schema; shared browser code reads continuation by field | 1 | Review of the diff: `superRefine` gone; `grep -n '"codex"\|"claude"' dashboard/src/LaunchSession.tsx` empty |
| Every dashboard spec passes unchanged | 1 | Full dashboard suite plus typecheck (see Verification) |

## Slices

### 1. Each host validates and reads its own session variant

Type: Behavior
Status: planned
Proof: `launch-record-session-rules.spec.ts` green before and after the
change; listed existing specs unchanged and green; full dashboard suite and
typecheck green.

Behavior: Given stored session records of each host's shape, when the
dashboard loads and parses them, then:
- a Claude record with alias `a1b2` is accepted and attach and stop use `a1b2`;
- a Claude record without an alias is refused;
- a Codex record with a continuation is accepted, and the parsed session
  exposes its endpoint and workspace;
- a predecessor Codex record without a continuation is accepted;
- a Codex continuation without an endpoint is refused;
- a Claude record's parsed session carries no `continuation`, and a Codex
  record's parsed session carries no `shortId`.

Each host module reads only its own variant's fields.

Order inside the slice:
1. Add the rules spec against `hostSessionSchema` and `launchRecordSchema`,
   one pure test per example above, in the style of
   `agent-launch-options-rules.spec.ts`. Run it on the unchanged schema: the
   acceptance and refusal cases must pass there, because they pin today's
   behavior. Only the "carries no other host's field" cases are new and may
   fail first.
2. Replace the shape with the discriminated union, export `ClaudeSession` and
   `CodexSession`, and narrow in each listed host module and in
   `LaunchSession.tsx`. Let `npm run typecheck:dashboard` find every reader.
   Keep each reader's missing-continuation answer word for word.
3. Run the post-change refactor pass, then the verification below.

## Verification

- Focused: the rules spec plus the specs named in Proof ownership, through
  `npx playwright test --config dashboard/playwright.config.ts <files>`.
- Broader: `npm run typecheck:dashboard` and `npm run test:dashboard`. The
  shared record schema reaches every launch, terminal, done, and observation
  spec, and the story promises every dashboard spec passes unchanged. CI runs
  the same suite in nine shards plus the typecheck.
- Staged lint runs through the repository pre-commit hook (`.githooks/pre-commit`).
- `npm test` (shell suite) is not affected: no `src/skills` or script file
  changes.
