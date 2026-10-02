# Choose a Cursor model when starting work

**Identity:** SEED-052#cursor-native-activity-and-controls
**Source:** [story](../../seeds/SEED-052-start-agent-work-from-dashboard.md#cursor-native-activity-and-controls).

## Goal and scope

A developer starting Cursor work from the dashboard can run it on a model
Cursor lists for their account. With Cursor selected, the Model menu lists
`cursor-agent models` after Default. A chosen id is sent as `--model <id>` on
the prompted launch run only, and the dialog says Cursor also saves it as its
setting. Default omits `--model`. A stale id is refused before `create-chat`.
A blank ad hoc start refuses a chosen model. An unreadable list is explained
with Retry.

Excluded: Cursor activity, rename, and stop; `--model` in the stored resume
command; restoring Cursor's setting; reasoning effort for Cursor; naming
Cursor's current setting in the Default label; Claude Code and Codex
behavior changes.

## Architecture

PFE: the transient host-options catalog already exists for Codex:
`LaunchHost.options`, `GET /__agent-launch/host-options`,
`launchHostOptionsSchema`, `useLaunchHostOptions`, `LaunchHostModel`, and the
catalog recheck in `launchSettingsAdmission.ts`. Reuse it. Change only its
`host === "codex"` keys. The browser keys on a host-description catalog fact
that carries the host's wording. The server keys on `host.options` presence.
Effort stays keyed on Codex. Cursor's native command and parsing stay in
`server/hosts/cursor/`; the blank-start refusal stays in Cursor's launch module.
Accepted [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
applies: no Cursor behavior is inferred from another host. No North Star topic
is needed.

## Observed premises

Observed on 2026-10-02 in this workspace at `d4ce177c`, `cursor-agent`
2026.10.01-e373342.

- **List format.** The consumer is the Cursor `options` parser.
  `cursor-agent models` printed `Available models`, a blank line, 246
  `<id> - <name>` lines (first `auto - Auto (default)`), a blank line, and a
  line starting `Tip:`. Four names end with U+200B. A run took about 2 s, under
  admission's 10 s bound. `--list-models` printed the same output. There is
  no JSON option.
- **`--model` with `--resume`.** The consumer is the prompted launch run. A PTY
  run of `cursor-agent --workspace <this worktree> --resume <empty chat>
  --model gpt-5.2` showed `GPT-5.2 Medium` in the client footer. With
  `--model not-a-real-model`, it printed `Cannot use this model:
  not-a-real-model. Available models: ...` and did not start.
- **Global side effect.** The consumer is the disclosure text. That `--model`
  run changed `~/.cursor/cli-config.json` `model.modelId` from `claude-opus-5-5`
  to `gpt-5.2`. A later resume without `--model` showed GPT-5.2. A run with
  `--model claude-opus-5-5` restored it. Whether a chat keeps its own model is
  unobserved and not relied on.
- **Admission order.** The consumer is the stale-id refusal.
  `launchRequest` in `server/agentLaunchAdmission.ts` calls
  `admitLaunchSettings` before `withSelectedOptions`, before any host launch.
  Today a Cursor model is refused there because `hostDescriptions.cursor.models`
  is `{}`.
- **Profile model.** The consumer is example 2's profile.
  `server/executionStart.ts:174` and `server/preparationCommand.ts:56` pass
  `--model` from the request for any host. Codex's
  `agent-launch-codex-model.spec.ts` observes the resulting profile model in
  a real start.
- **Fixture log.** `tests/fixtures/fake-cursor` logs every non-attach call
  to the launch argv log. `agent-launch-ad-hoc-cursor.spec.ts` asserts exact
  call lists (lines 129–131, 187). A dialog that reads `models` would break
  those unless the fixture logs `models` separately.
- **Codex wording.** `src/LaunchHostModel.tsx`, `src/useLaunchHostOptions.ts`,
  `src/useLaunchSettings.ts`, and `server/launchSettingsAdmission.ts` hold the
  Codex catalog strings. They are pinned by
  `agent-launch-codex-model.spec.ts`, `agent-launch-codex-model-boundary.spec.ts`,
  `agent-launch-codex.spec.ts`, `codexModelCatalogCases.ts`, and
  `codexEffortDialogCases.ts`. `agent-launch-model.spec.ts` pins Claude's
  static Default label.
- **Host options endpoint.** The `host-options` admission and the plugin
  handler already serve any host whose boundary has `options`.

## Proof ownership

| Promise | Slice | Proof |
| --- | --- | --- |
| Codex and Claude menus, wording, and admission unchanged | 1 | Codex and Claude model specs listed above |
| Example 1, Cursor menu lists ids and discloses the setting | 2 | New Cursor model spec, dialog options and note |
| Example 2, chosen id on prompted run, record, profile; resume unchanged | 2 | New Cursor model spec, fixture argv, stored record, `takenProfiles` |
| Example 3, Default sends no `--model` | 2 | Existing Cursor start, preparation, and ad hoc specs stay green |
| Example 4, unreadable list, Retry, Default startable | 2 | New Cursor model spec with failing fixture list |
| Example 5, stale id refused before `create-chat` | 2 | New Cursor model spec, raw launch request with an unlisted id |
| Example 6, blank ad hoc with a model refused | 3 | Cursor ad hoc spec case |
| Host guide states Cursor's catalog and launch-only `--model` | 3 | `dashboard/AGENT-LAUNCH-HOSTS.md` review |

## Ordered slices

### 1. Key the model catalog on a host fact instead of Codex
Type: Structure
Status: done
Proof: `env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-codex-model.spec.ts dashboard/tests/agent-launch-codex-model-boundary.spec.ts dashboard/tests/agent-launch-codex.spec.ts dashboard/tests/agent-launch-model.spec.ts --workers=2`
and `npm run typecheck:dashboard` pass with no assertion changes.

Internal change: `HostDescription` gains an optional catalog fact that carries
the menu's Default label and reading, unreadable, default-note, and
unavailable wording. Codex supplies its current strings verbatim. The
options hook, `useLaunchSettings`, and `LaunchHostModel` key on that fact.
`admitLaunchSettings` rechecks against `host.options` when present, using
host wording, and keeps static `models` for hosts without options. Effort
stays Codex-only. Cursor gets no catalog yet, so its menu remains Default
only.

Enables: slice 2's Cursor catalog without a Cursor branch in shared code.

Accepted proof: the four Codex and Claude specs passed (41) with no test
changes, and typecheck passed. After the refactor, the three Codex specs
passed again (30).

Learnings for slice 2:

- The fact is `HostDescription.modelCatalog` in `src/hostDescription.ts`, with
  `defaultLabel`, `reading`, `unreadable`, `defaultNote`, `unavailable`,
  `stale`, and `unverified`. The last two hold admission's refusals. Codex's
  thread/start check reads `stale` too.
- A chosen model's feedback shows its catalog `description`, or `unavailable`
  when the model is unlisted. No catalog field carries Cursor's
  saved-setting disclosure yet.
- Admission calls `host.options(signal)` without a workspace, so Cursor's
  `options` must not need one. Entries carry `efforts`, so Cursor returns
  `[]`.
- A host-options 503 for a host without `modelCatalog` now reads
  "`<Host>` model choices could not be read." instead of Codex's sentence.

### 2. Choose a Cursor-listed model and launch with it
Type: Behavior
Status: done
Proof: New `dashboard/tests/agent-launch-cursor-model.spec.ts` with the
fixture on `PATH`, plus the existing Cursor launch specs:
`env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-cursor-model.spec.ts dashboard/tests/agent-launch-start-cursor.spec.ts dashboard/tests/agent-launch-preparation-cursor.spec.ts dashboard/tests/agent-launch-ad-hoc-cursor.spec.ts --workers=2`
and `npm run typecheck:dashboard`.

Behavior: The fixture lists `auto - Auto (default)` and `gpt-5.2 - GPT-5.2`
between the real header and `Tip:` lines. The developer opens Start execution
on Story A and selects Cursor. The Model options read "Default (your Cursor
setting)", "Auto (default)", "GPT-5.2". Choosing GPT-5.2 shows that Cursor
also saves a chosen model as its setting. Start runs `create-chat`, then
`--workspace <ws> --resume <id> --model gpt-5.2 <prompt>`. The record's
`request.model` and the taken profile's `model` are `gpt-5.2`. The stored
continuation args are unchanged. With the fixture list failing, the dialog
explains that Cursor model choices could not be read, Retry rereads, and Default
starts. A raw launch request naming an unlisted id is refused with 400, and
the fixture records no `create-chat`.

Includes: Cursor `options` in `server/hosts/cursor/`, which runs
`cursor-agent models`, parses `<id> - <name>` lines with trimmed names, and
treats a nonzero exit or no model lines as unreadable. It also includes
Cursor's catalog fact, `--model` on the prompted run only, a `models` mode in
`fake-cursor` logged apart from launch argv, and a configurable list or
failure. The existing Cursor specs keep proving Default omits `--model`.

Safe stopping point: Cursor model choice works for execution, refinement,
and ad hoc with an instruction.

Accepted proof: the four Cursor specs passed (7), the Codex and Claude guards
passed (41), and typecheck passed. After the refactor, the new spec passed
again (3). The parser matched all 246 lines of a real `cursor-agent models`
run and skipped its `Tip:` line.

Learnings for slice 3:

- The disclosure is `modelCatalog.chosenNote`: "Cursor also saves a chosen
  model as your Cursor setting for later sessions." It follows a listed
  model's description in the dialog.
- `cursor-agent` runs live in `server/hosts/cursor/exec.ts`. Parsing lives in
  `server/hosts/cursor/options.ts`.
- `fakeCursor.listModels(undefined)` makes `models` fail. `modelReads()` is
  logged apart from `calls()`.
- A blank Cursor ad hoc start with a chosen model passes admission today and
  records `request.model` without sending `--model`.
- `agent-session-cursor.spec.ts:117` fails on trunk since `00800bc2`. It
  expects `hostOperations.cursor` without the `launchedSessions` field that
  `d04999c9` added. This story does not own that failure.

### 3. Refuse a model for blank Cursor ad hoc and document the host
Type: Behavior
Status: done
Proof: A new case in `dashboard/tests/agent-launch-ad-hoc-cursor.spec.ts`:
`env -u NO_COLOR npm run test:dashboard -- dashboard/tests/agent-launch-ad-hoc-cursor.spec.ts --workers=2`.
The host guide is checked by reading.

Behavior: The developer opens Start session in Open Dough, selects Cursor,
chooses GPT-5.2, leaves the instruction empty, and starts. The dashboard
explains that Cursor applies a chosen model with the first instruction, and
the fixture records no `create-chat`. The existing blank Default case still
records `not-requested`. The Cursor paragraph and host-options paragraph in
`dashboard/AGENT-LAUNCH-HOSTS.md` state the Cursor catalog, launch-only
`--model`, the saved-setting side effect, and the blank refusal.

Safe stopping point: the story is complete.

Accepted proof: the ad hoc Cursor spec passed (3), and passed again after
the refactor. Typecheck passed. The new case failed with the guard disabled.
The refusal in `server/hosts/cursor/launch.ts` reads "Cursor applies a chosen
model with the first instruction. Add an instruction, or use your Cursor
setting. Nothing was launched." It appears on the existing launch-failure line
beside Start session.

The slice 3 code was committed and pushed as `a406dd10` by an interrupted
refactor agent, outside coordinator delivery. The developer accepted it as
slice 3's delivery, and `69634abd` added the final refactor on top.

CI repair (developer-authorized): `agent-session-cursor.spec.ts` expected
`hostOperations.cursor` without the `launchedSessions` field that `d04999c9`
added. Trunk has been red on it since `00800bc2`. Both assertions now expect
`launchedSessions: false`, and the answer type reuses `HostOperations`. The
spec failed before the fix and passed after it, and typecheck passed.
`startup-host-words.spec.ts:24` fails intermittently with "Response has been
disposed". The same failure hit unrelated branches. The developer left it out
of this story.

## Execution complete

Product advice: During wrap-up, update the Model paragraph in
`dashboard/AGENT-LAUNCH.md`. Lines 47–48 still say "Cursor offers only
Default". They should say that Cursor lists `cursor-agent models` after
"Default (your Cursor setting)", and that launch rechecks a chosen id before
`create-chat`. A chosen id goes as `--model` on the prompted run only, and
Cursor saves it as its own setting. A blank ad hoc start with a chosen model
is refused. Keep "Default omits `--model`". Also qualify lines 32–33, "no
cross-launch preference or configuration writes", for Cursor's own write. No
backlog change. Deferred promises stay deferred: Cursor activity, rename and
stop, restoring Cursor's setting, and naming it in Default. A need to restore
the setting stays a hypothesis until developers report the change as a
surprise.

## Current decisions

- `--model` goes on the prompted launch run only, never into the stored resume
  command (maintainer, 2026-10-02). The dialog discloses that Cursor saves it.
- A blank ad hoc start with a chosen model is refused, because no Cursor run
  would apply it and a record names only a model the dashboard sent.
- Cursor's Default label stays "Default (your Cursor setting)". Codex keeps
  "Use Codex setting".
- Slice 3 edits the Cursor paragraph of `dashboard/AGENT-LAUNCH-HOSTS.md` as
  landed at `f84a7a56`. That paragraph ends with "Default omits `--model`."

## Verification

No numeric slice target or hard limit was supplied. Each slice runs the
focused specs named in its proof and `npm run typecheck:dashboard`.
`npm run lint` and `git diff --check` apply before commit. Hosted CI runs
the full suite after publication. It is not an extra local gate here.
