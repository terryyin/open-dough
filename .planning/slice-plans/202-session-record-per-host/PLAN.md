# Each host has its own session record shape

**Identity:** SEED-075#session-record-per-host
**Source:** [refined story](../../seeds/SEED-075-host-neutral-dashboard-before-cursor.md#session-record-per-host)
**Authority:** Execution and landing authorized by Terry on 2026-10-01.
**Preparation:** Established workspace
`/Users/terryyin/git/open-dough/.worktrees/each-host-has-its-own-session-record-shape`,
branch `claude/each-host-has-its-own-session-record-shape`, published assignment
`2cd2e9d662390fb1433ef580b2a9bd91b87e0816`, agent `DavidKo-chan`, remote
`origin`, target `main`, integration checkout `/Users/terryyin/git/open-dough`.
**Sequencing decision:** Terry authorized proceeding before
SEED-075#one-host-description lands, on the established Story Branch workspace,
then landing the finished work. Neither story's outcome depends on the other's
code. Re-read overlapping call sites when reconciling the landing candidate.


## Execution context

- Identity: `SEED-075#session-record-per-host`; publisher:
  `dashboard-mac.lan-open-dough`; agent: `steven-chan`.
- Workspace: `/Users/terryyin/git/open-dough/.worktrees/each-host-has-its-own-session-record-shape`;
  branch: `codex/each-host-has-its-own-session-record-shape`; mode: `story-branch`.
- Remote: `origin`; landing target: `main`; increment target:
  `refs/heads/codex/each-host-has-its-own-session-record-shape`.
- Established claim: `e9fb9d3120dbd32e64e46caa7829872bd2676f18`;
  starting revision: `a04edf85d0af3abb39f1734401305e008cc5b81b`.
- Checkout preparation: `npm ci` and `npm run typecheck:dashboard` passed in
  this checkout with unchanged `package-lock.json`.
- Replanning: retain existing planning authority; no numeric slice budget is
  configured. One behavior slice and one focused proof loop bound the work.
- CI: GitHub Actions `ci.yml`, verified push workflow; repository
  `terryyin/open-dough`; observation will attach through managed delivery.

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
Status: done
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

## Verification environment

The first `npm run test:dashboard` exited 1 because the host exports
`NO_COLOR=1` and Playwright workers set `FORCE_COLOR=1`. Node emits a warning
for that combination. `quietReporter.ts` correctly refuses passing tests that
print, and `quiet-reporter.spec.ts`'s passing-child test also refuses the
warning-producing child. The failed test ID resolved to that passing-child
example; no session variant assertion failure was observed.

Cause evidence: `node_modules/playwright/lib/runner/index.js` WorkerHost sets
`FORCE_COLOR: "1"`; `env FORCE_COLOR=1 node -e 'console.log("probe")'` reproduces
the warning, while `env -u NO_COLOR FORCE_COLOR=1 node -e 'console.log("probe")'`
does not. The full suite is rerun as
`env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard`, with every spec and
assertion retained. This changes command environment only.

## Accepted slice proof

- Schema baseline: new rules spec on unchanged product accepted five existing
  cases and rejected only the two new cross-host field assertions.
- Schema and operation focus: `npx playwright test --config dashboard/playwright.config.ts --reporter=line dashboard/tests/launch-record-session-rules.spec.ts dashboard/tests/agent-launch-host-identity.spec.ts dashboard/tests/agent-launch-codex-observation-boundary.spec.ts dashboard/tests/agent-launch-codex-confirmation.spec.ts dashboard/tests/agent-terminal-codex.spec.ts dashboard/tests/agent-launch-codex-recovery.spec.ts dashboard/tests/agent-launch-done-codex.spec.ts dashboard/tests/agent-terminal.spec.ts dashboard/tests/agent-launch-done-stop.spec.ts dashboard/tests/agent-launch-ad-hoc-codex.spec.ts dashboard/tests/agent-launch-codex-lifetime.spec.ts dashboard/tests/agent-launch-codex.spec.ts dashboard/tests/agent-launch-done-codex-intent.spec.ts`
  passed 41 tests. Pure schema tests exercise both session and launch-record
  boundaries; native fakes supply only external host responses, and existing
  journeys exercise the real store, browser, RPC and PTY boundaries.
- Inspected observations: rules spec's alias/endpoint refusal and parsed
  cross-host-field absence; host-identity's legacy unknown, missing-endpoint
  diagnostic, terminal 1011 and no-quarantine assertions; Codex terminal's
  saved resume arguments/workspace; done's native rename/interruption;
  recovery's no-resend and one conversation/turn; confirmation's persisted
  notice/arguments; Claude terminal and done-stop's actual native alias.
- Independent refactoring removed one redundant guard and extracted only
  kept-start fixture operations. All files satisfy the 250-line rule.
- Full proof: `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard > /tmp/dough-session-record-dashboard-final.log 2>&1`
  exited 0, all specs selected, no retries or reporter output.
- `npm run typecheck:dashboard` exited 0 after final mechanical lint repairs.
- `npm run format > /tmp/dough-session-record-format-repaired.log 2>&1` exited
  0; `git diff --check` passed. Hook-owned lint remains the commit hook's check.
- Existing Codex specs needed mechanical discriminator narrowing; all their
  behavioral assertions remain. Missing-continuation recovery retains its
  original uncertain branch by inspected code, not a separate runtime claim.
- Full-suite recovery test exposed a pre-existing deadline race: original trace
  showed 1068ms against 1000ms; the sole start uncertain constructor is
  timed-out. Raw HTTP body was unavailable. Isolated 507/668ms diagnostic passes
  were not repair evidence. The corrected same-server fixture holds the first
  push until after timeout assertions, releases it explicitly, and allows
  ordinary resumption a 5s bound. All one-claim/workspace/start assertions remain.
  `env -u NO_COLOR -u FORCE_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-start-resume.spec.ts --output=/tmp/dough-resume-refactor-results`
  passed before the final full-suite pass. No runtime behavior changed.

## Delivery and review

Implementation accepted on `origin` at
`7c380b080924b251f4b9ef11bf33a8c0536b4491`, target
`refs/heads/codex/each-host-has-its-own-session-record-shape`. The managed receipt
reported branch CI unobserved because the installed Codex runtime has no
supported managed-observer stream attachment (DearDough DD-201); no observer
was started, so no branch shutdown operation exists. Trunk observation is a
separate landing boundary.

Retrospective: reviewed original plan/story, human sequencing authorization,
aggregate owned change, native and shared readers, public schemas, maintained
launch documentation, test boundaries, and full proof. Claim `e9fb9d31` is
provenance; `7c380b08` is the only implementation revision. Nearby preparation
commits and other stories are excluded. No product correction or suite cleanup
is supported; existing host-neutral wording and capabilities remain explicitly
deferred. Process review adds one occurrence to existing DD-201.

## Execution complete

Product advice: Keep the current queue order. Complete the existing host
description, session meaning and launch-gate stories before Cursor; no new
product work is recommended.
