---
id: SEED-081
status: active
planted: 2026-10-02
planted_during: Terry's request for dashboard Codex model and effort selection
scope: story
---

# SEED-081: Choose Codex model and effort when starting a dashboard session

## Why This Matters

Developers starting a Codex session from the dashboard need to choose the model
and reasoning effort for the work they are about to start, without leaving the
dashboard to change their tool configuration.

## Story

<a id="codex-session-model-and-effort"></a>

### Choose Codex model and effort when starting a dashboard session

**Identity:** SEED-081#codex-session-model-and-effort
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/211-codex-session-model-and-effort/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"743e5fdd2d677d64c0d64b5c141b8a6ec3398766010418f64a71d803f5c6b0d7","plan":"6e351f53dabeb1b7bb7edd0f72741a65fe03467983a1719c602d55785ce58d0b"}}
```

**Goal:** A developer starting a Codex session in the dashboard can choose
its model and reasoning effort for the work at hand, without editing tool
configuration, and the launched session uses those choices.

**Scope:**

- Offer model and reasoning-effort choices for new Codex conversations in both
  unattached Start session and the existing story workflow starts, through their
  shared launch interaction. This includes creating a blank unattached session
  with the selected settings, without submitting an artificial prompt.
- Obtain available models and each model's supported efforts from the installed
  Codex host. Use its names and descriptions to explain the choices; the model
  names observed below are evidence, not a fixed product list.
- Allow either setting to remain on “Use Codex setting”. Omitting an override
  delegates that setting to Codex in the actual launch workspace. A catalog's
  recommended model or suggested effort is not the developer's configuration.
  Show resolved values only when established for that context; otherwise say
  that Codex will resolve them at launch rather than guessing.
- Apply explicit choices when creating the native conversation and submitting
  any initial instruction supplied at startup. The selector belongs only to
  new-session startup. Resuming an existing conversation offers no selector and
  does not reassign or change its model or effort through this feature.
- If changing models invalidates an explicitly chosen effort, explain the
  mismatch and require the developer to choose a supported effort or return to
  the configured-setting path before submitting that combination. Preserve a
  still-supported explicit effort. Never silently substitute for an explicit
  model or effort, including if availability changes before launch.
- Keep the configured-default route usable when no overrides are chosen.
  Session-specific choices do not rewrite Codex configuration. Preserve the
  existing startup progress and conversation identity rules; a rejected choice
  must not silently create a replacement conversation.

**Rejection constraints:** The captured requirement against silent substitution
justifies preventing submission of a known unsupported explicit combination.
The absence of a model from a picker does not itself forbid a configured custom
model: “Use Codex setting” still delegates to the host. Native refusal remains
an explained refusal, never permission to replace the requested values.

**Deferred promises:** Model/effort controls for other hosts, changing an
already running conversation from the dashboard, model recommendations or
price comparisons, configuration editing, and a live model-monitoring display.
No manual model-ID entry or catalog-management UI is promised. These are
uncommitted capabilities, not new rules rejecting otherwise valid host behavior.
Resuming, reopening, terminal attachment and recovery of existing conversations
are outside this story's delivery and verification scope, including diagnosing
or fixing their failures. This boundary was confirmed by Terry during refinement:
selection occurs only when starting a new session; resume does not reassign the
model. Cross-launch preference storage is also deferred; new launches start
from configured defaults.

**Key examples:**

1. A developer opens Start session or a story workflow start and chooses Codex
   → model and effort choices reflect that host, with a configured-setting path
   for each. The developer chooses a supported pair and starts → that pair
   applies to the new conversation and its first instruction.
2. The developer leaves both settings untouched → Codex uses its applicable
   defaults. Choosing only a model overrides only the model; choosing only an
   effort overrides only effort. The UI does not label the catalog's recommended
   model or suggested effort as the developer's effective setting.
3. A selected model supports `ultra`; another supports only through `max`.
   With `ultra` explicitly selected, the developer changes to the latter model
   → the mismatch is explained and Start cannot submit that pair until resolved.
   Changing models with a still-supported effort preserves that effort.
4. The developer selects a supported pair, leaves the unattached instruction
   empty, and starts → the new conversation is created with that pair and no
   artificial prompt is submitted. Later attachment or resume is outside this
   story's acceptance examples.
5. An explicit choice becomes unavailable before startup → explain the refusal
   and permit correction through the existing startup interaction; do not
   claim that the requested pair ran or silently launch a substitute.
6. Switching from Codex to another host → Codex choices are not submitted to
   that host. Returning to Codex follows the existing host-change reset behavior
   and makes the configured-setting path visible again.

**UI:** Offer these choices only when starting a new session, never when
resuming an existing one. Describe these as settings for this session, adjacent
in the interaction to the host choice and available before Start. Name the decisions “Model” and
“Reasoning effort”; use the host's effort descriptions so the developer need
not infer meaning from identifiers such as `xhigh`. Explain loading,
unavailability and incompatible choices in text associated with the affected
setting, including for keyboard and assistive-technology users. Reading choices
must not steal focus from the instruction field. Existing cancel, submission
progress and workspace-confirmation behavior continues to carry the chosen
settings. No layout, component or technology is selected by this refinement.

**Investigation — observed 2026-10-02:**

- **Existing product:** [LaunchDialog](../../dashboard/src/LaunchDialog.tsx),
  [LaunchHostModel](../../dashboard/src/LaunchHostModel.tsx),
  [StartSession](../../dashboard/src/StartSession.tsx) and
  [StartLaunch](../../dashboard/src/StartLaunch.tsx) establish the shared dialog,
  fresh model state on each opening, and reset on host change. Codex currently
  offers no named models. [Native launch](../../dashboard/server/hosts/codex/launch.ts)
  sends only `cwd` to `thread/start`; it submits `turn/start` for nonblank input
  and materializes a blank conversation without a model turn otherwise.
  [Recovery](../../dashboard/server/hosts/codex/recovery.ts) resumes the saved ID.
- **Native catalog:** Using the existing `CodexRpc` connection and daemon
  endpoint, `initialize` then `model/list` with
  `{ "limit": 100, "includeHidden": false }` returned eight visible models,
  their effort descriptions/defaults and `nextCursor: null` on Codex CLI
  `0.159.3`. The returned models have different effort sets: GPT-6.1 Sol
  included `ultra`, GPT-6 Luna stopped at `max`, and GPT-5.5 at `xhigh`.
  Thus model-dependent effort choices are an observed need.
- **Configured versus suggested:** `config/read` with `includeLayers: false`
  and this workspace's `cwd` returned GPT-6 Astra / `high`, while the catalog
  marked GPT-6.1 Sol as recommended, with suggested effort `low`. Temporary
  `thread/start` calls with `ephemeral: true` consumed those settings: no
  overrides returned Astra / `high`; specifying only Sol returned Sol / `high`;
  specifying Sol plus `config: { model_reasoning_effort: "low" }` returned
  Sol / `low`. These were native creation responses, not completed model turns.
  Each temporary thread was unsubscribed; no prompt was submitted.
- **Separate observation, outside scope:** Disposable blank conversations
  accepted Sol / `low`, but subsequent API resume and native terminal bootstrap
  refused with `-32601`, `list_turns is not supported yet`. Both were archived;
  no model prompt or paid inference was submitted. This does not establish a
  model-selection defect or its cause. Terry explicitly excluded resume from
  this story; the observation is not a readiness blocker for this story and
  adds no investigation, repair or continuation-verification commitment.
- **External contract:** The fetched [official Codex App Server documentation](https://learn.chatgpt.com/docs/app-server)
  describes native model discovery, supported efforts, configuration reads,
  thread creation and turn overrides. The installed CLI's generated schema also
  exposes model/config overrides on thread creation and resume. Documentation
  and schema establish available interfaces; the local observations above
  establish only the behavior actually exercised.

**Planning choices and remaining premises:**

- **Persistence:** For the requested plan, retain the existing per-launch
  behavior: start each new launch on “Use Codex setting” and remember no previous
  launch's overrides. This is the conservative planning choice carried forward
  after Terry requested planning, not an added preference-storage feature.
- **Discovery failure:** Explain that choices could not be read, offer retry,
  and allow the configured-default route. Never silently clear or substitute an
  explicit choice; the developer can deliberately return both settings to the
  configured path. This preserves the captured usable-default requirement.
- **Effective context:** The local defaults observation covers this workspace
  only. A story start can establish another workspace. Verify that discovery,
  any displayed effective values and launch agree in that resulting context;
  until known, use delegation wording rather than an asserted default value.
- **Startup verification still needed during delivery:** Native creation
  responses accepted the overrides; no inference was run. Verify that a new
  nonblank session's initial instruction uses its selected pair, and that blank
  startup creates the conversation with the selected settings without an
  artificial prompt. Resume or attachment is not required to accept this story.

**Slice plan:** [Codex session model and effort](../slice-plans/211-codex-session-model-and-effort/PLAN.md).

**Capture:** Terry requested this story at the top of the product backlog on
2026-10-02, authorizing capture, commit, and synchronization on main. This is
queued work; capture does not authorize feature implementation.

## Breadcrumbs

- [Product backlog](../PRODUCT-BACKLOG.md).
- [Dashboard-initiated agent work](SEED-052-start-agent-work-from-dashboard.md)
  established configured-default model behavior for the initial launch stories.
- [Unattached session options](SEED-066-composable-lightweight-session-options.md#unattached-session-options)
  concerns workspace and landing choices, independently of model and effort.
