---
id: SEED-075
status: active
planted: 2026-10-01
planted_during: Terry's selection from the dashboard multi-tool architecture review (SEED-069)
trigger_when: Before Cursor joins the dashboard (SEED-052#use-cursor-from-dashboard)
scope: story
---

# SEED-075: Make shared dashboard code host-neutral before Cursor

## Why This Matters

Claude Code and Codex already sit behind one `LaunchHost` boundary in
`dashboard/server/launchHosts.ts`, and shared code never imports another host's
private helpers. Shared server and browser code still decides by host name,
though, and its fallbacks answer for any host it does not name. Adding Cursor on
top of that would mean editing shared ternaries, inheriting Claude's or Codex's
wording and alert rules, and joining Codex-only gates by name. The review of the
delivered integrations (2026-10-01, at `1cdd476c`) ranked these four changes
ahead of Cursor; Terry selected them and their order. Each keeps an operation a
host lacks unavailable rather than supplied by another host
([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).

## Stories

<a id="one-host-description"></a>

### 1. Shared dashboard code reads one host description

**Identity:** SEED-075#one-host-description
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/205-one-host-description/PLAN.md","assessment":"not-ready","reasons":["Slice 3 needs human clarification: may existing workspace spec calls add explicit Claude host arguments while preserving all assertions, despite the source requirement that specs pass unchanged?"],"basis":{"document":"ad855a1471c037dafcd35bc23c3cd349f11d027b550283d79a9b16320e422b70","plan":"caaf443be2d5527464fcbfce0e5592e934c9537ff2a1ce129916e8fd7b7da872"}}
```

- **Goal:** A dashboard maintainer describes each host's shared facts once,
  so adding a host does not require finding and editing scattered name-based
  choices. Shared server and browser code consume that description without
  borrowing another host's facts or operations. Claude and Codex users retain
  the same launch choices and session actions; this removes an obstacle to
  adding Cursor in its own story.
- **Scope:**
  - One authoritative description per host supplies its display name, skill
    sigil, offered model aliases and labels, "no trusted answer" hint, branch
    namespace, and availability of embedded terminal and Mark as done.
    Shared server and browser consumers use those facts without host-name
    comparisons for them. Server dispatch selects the matching host boundary
    without a catch-all host fallback.
  - Model choices and admission agree with the selected host's offerings.
    Claude Code keeps Default, Fable (`fable`), Opus (`opus`), and Sonnet
    (`sonnet`), in that order; Codex keeps Default only. Default omits the
    model from the request and uses the host's configured setting. Changing
    host resets the model to Default. A model not offered by that host is
    refused before native launch, as today.
  - Browser action availability agrees with the server's own host operations:
    embedded terminal needs `attach`, and Mark as done needs `stop`. Claude
    and Codex continue to offer both. A missing host or operation stays
    unavailable and never runs another host's implementation; this is the
    existing `LaunchHost` boundary's rule, not a new restriction on hosts.
  - Shared helper calls and launch choices carry an explicit host rather than
    silently defaulting omitted arguments to Claude. The launch dialog still
    initially selects Claude Code. Existing stored-record and external request
    compatibility defaults remain at their boundaries; this delivery changes
    neither those defaults nor the interpretation of host-less legacy data.
  - Workspace branches retain their host namespace, and occupied-slug lookup
    still considers all existing supported host namespaces, including Cursor
    branches, as well as workspace folders. Recognizing a branch namespace
    does not make that host launchable.
  - Existing Claude and Codex behavior and every dashboard spec remain
    unchanged. Native commands and transport stay private to their host; the
    browser receives only the facts it needs. One representation of each fact
    follows [ADR 0002 — Software development lifecycle principles, §4](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md#4-high-cohesion).
- **Deferred:** Cursor launch support or new model offerings
  (SEED-052#use-cursor-from-dashboard); session record variants
  (SEED-075#session-record-per-host); session-state wording, continuation
  labels, and alert policy (SEED-075#host-neutral-session-meaning); duplicate
  launch and creation-recovery gates (SEED-075#launch-gates-every-host).
  Dynamic host discovery or third-party registration is not a delivery promise.
- **Key examples:**
  - Open a Claude launch dialog → the heading names Claude Code, Command
    details use `/dough-story-refinement` for refinement, and Model offers
    Default, Fable, Opus, and Sonnet. Select Opus and start → Claude receives
    `--model opus`, and the retained request still identifies Opus.
  - With Opus selected, change Host to Codex → the heading names Codex,
    Command details use `$dough-story-refinement`, Model resets to Default
    and offers no named model. Start → Codex receives no model selection.
    Submit a Codex request naming `opus` directly → the existing refusal is
    returned before any native session starts.
  - A Claude launch has no trustworthy server answer → the uncertainty hint
    says to check `claude agents`; the same situation for Codex → it says to
    check dashboard history and native Codex conversations. Neither answer
    is inferred by treating all other hosts as the opposite host.
  - Show a recorded Claude or Codex session → embedded terminal and Mark as
    done remain available under their existing session-state rules, and each
    action calls that session's own host. Lookup of an unavailable host or an
    absent operation → no other host supplies the operation.
  - Start a Codex story titled “Example” with `cursor/example` already
    present → the workspace slug avoids `example` and the new branch retains
    the `codex/` prefix, as today; a Claude start retains `claude/`.
  - A shared options or workspace helper is called without a host → its
    interface requires the caller to supply one. A predecessor stored record
    or action request without a host → keeps its existing boundary-level
    compatibility behavior.
- **Depends on:** None.
- **Capture:** Terry selected it on 2026-10-01 from the dashboard multi-tool
  architecture review. Refined 2026-10-01 against `8dfd2bf1`: the description
  consumers are `dashboard/server/launchHosts.ts`,
  `dashboard/src/sessionCapabilities.ts`, `dashboard/src/StartLaunch.tsx`,
  `dashboard/src/LaunchHostModel.tsx`, `dashboard/src/agentLaunchClient.ts`,
  `dashboard/src/launchWorkflow.ts`, and `dashboard/server/startGit.ts`;
  admission is `dashboard/server/agentLaunchAdmission.ts`. Existing model
  and host-switch examples are in `dashboard/tests/agent-launch-model.spec.ts`,
  `dashboard/tests/agent-launch-model-boundary.spec.ts`, and
  `dashboard/tests/agent-launch-codex.spec.ts`.

<a id="host-neutral-session-meaning"></a>

### 3. Session meaning and wording are host-neutral

**Identity:** SEED-075#host-neutral-session-meaning
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/203-host-neutral-session-meaning/PLAN.md","assessment":"not-ready","reasons":["SEED-075#one-host-description is undelivered on fetched origin/main at 8dfd2bf19a4a451f66513944b780b9edf9c0d2b9; its shared description contract must be integrated and its consumers observed before this dependent plan is ready."],"basis":{"document":"256e0822beb2b9af9308cae4cbce0b4e238f16333f65dafcde60ee6684813e91","plan":"f1cb2888f293f4e7320199086413c19e1b2acb6e4e2259dbbc6796c4e9bc17e1"}}
```

- **Goal:** A developer reading or continuing dashboard sessions sees each
  session described in its own host's terms, and receives notifications based
  on the observation's meaning. This removes inherited Claude Code or Codex
  assumptions before another host joins the shared dashboard.
- **Scope:**
  - Read host-specific unknown-observation wording through the host description
    supplied by `SEED-075#one-host-description`. Preserve Claude Code's and
    Codex's existing wording wherever it already names the correct host.
  - Name the recorded session's host in an unavailable-session terminal attach
    refusal and in its continuation label. Keep the recorded continuation
    command, workspace, and notice intact; a label does not establish a host
    capability or invent a continuation.
  - Produce pending execution and refinement wording for the selected host
    directly, including the launching phase after preparation. Preserve the
    preparation-phase wording. Shared presentation must not choose a host by
    name or replace a literal "Claude Code" to produce another host's words.
  - Let the host's observation distinguish an explicit unrecognized native
    state from an incomplete read and supply the fact governing an
    unrecognized-state alert. Shared presentation and alerting consume that
    fact without checking the host's name. Explicit unrecognized Codex native
    statuses alert; incomplete or unreadable observations stay quiet.
  - Preserve confirmed absence versus unknown observation, existing recognized
    activity readings, attention counts, and marked-done semantics. An
    unrecognized state stays unsettled and does not increase the number of
    sessions needing attention, even if it raises a notification. Preserve
    notification baselining and deduplication.
  - Correct the implicated launch-boundary and terminal-contract comments to
    describe supported hosts and the existing `host` query parameter.
- **Constraints:** A failed or partial read does not establish session absence
  or developer-needed activity. Unsupported operations stay unavailable; this
  story does not supply another host's operation or infer support from a label
  ([ADR 0005](../../docs/adrs/0005-cross-tool-validation-accepted.md)).
- **Deferred promises:** Cursor integration, additional continuation or terminal
  capabilities, changes to stored session records or their legacy defaults,
  launch gates, and a new notification delivery mechanism. These are delivery
  exclusions, not reasons to reject naturally supported host observations.
- **Key examples:**
  1. A recorded session cannot be observed → its state is displayed → Claude
     Code retains "State unknown: Claude Code's session list could not be
     read"; Codex retains "Live observation unavailable: Continue this
     conversation in Codex". Neither observation raises a notification or
     contributes to the attention count, and neither proves absence.
  2. A recorded session has continuation information → its entry is opened →
     the label is "Continue in <the session's host name>" and its saved command
     and workspace are shown unchanged. A session without continuation
     information gains no command merely from its host name.
  3. A host supports attachment and a kept session is confirmed unavailable →
     a terminal attach request reaches admission → it is refused and names
     that session's host. Claude Code keeps "Claude Code no longer lists this
     session"; Codex does not receive a Claude Code refusal.
  4. Execution or refinement is launching → the pending sentence is displayed
     → it says "Starting execution in Codex…" or "Starting refinement in
     Claude Code…" for the selected host. During start preparation it still
     says "Preparing execution…" or "Preparing refinement…".
  5. An unmarked session changes from a recognized state to an explicit native
     status the host cannot recognize → the page displays "State not
     recognized" with the host's description → it stays unsettled with no
     attention-count increase. Shared alerting follows the host-supplied fact;
    Claude Code continues to alert, and Codex now alerts too. The notification
    occurs once on entering that reading, not on every poll or startup baseline.
  6. Codex metadata confirms a retained conversation, but its latest turn cannot
     be read → the partial observation is presented with Codex's explanation →
     it stays quiet and available for supported continuation. The host reports
     the incomplete observation rather than shared code suppressing every
     unrecognized Codex state by name.
- **Decision:** Terry accepted the proposed Codex alert policy on 2026-10-01:
  explicit unrecognized native statuses alert, as Claude Code's do; incomplete
  or unreadable observations stay quiet. The host reports the observation's
  meaning; shared presentation contains no host-name exception. No goal,
  scope, or example decision remains open.
- **Current basis:** `dashboard/src/sessionShown.ts` selects unknown wording
  and suppresses unrecognized-state alerts by host name.
  `dashboard/server/hosts/codex/sessions.ts` can distinguish unexpected native
  statuses from a failed latest-turn read, but currently represents both as
  available activity `unknown` with a description.
  `dashboard/tests/agent-launch-codex-observation-alerts.spec.ts` confirms both
  currently stay quiet. The other affected wording and contracts are in
  `dashboard/server/agentLaunchAdmission.ts`, `dashboard/src/LaunchSession.tsx`,
  `dashboard/src/launchWorkflow.ts`, `dashboard/src/StartLaunch.tsx`,
  `dashboard/server/agentLaunchPlugin.ts`, and `dashboard/src/agentTerminal.ts`.
- **Plan:** [Session meaning and wording follow the host](../slice-plans/203-host-neutral-session-meaning/PLAN.md).
- **Depends on:** SEED-075#one-host-description.
- **Capture:** Terry selected it on 2026-10-01 from the dashboard multi-tool
  architecture review.

<a id="launch-gates-every-host"></a>

### 4. Launch gates apply to every host

**Identity:** SEED-075#launch-gates-every-host
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/204-launch-gates-every-host/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a4a94c71b5a99ecffa1f68b780ced4a2d852de540dab5ab7755b90914c27491b","plan":"e5744fb086502b42fa879232924e4368133c5fe7a1ba5185f3d49b5582e02b78"}}
```

- **Goal:** A developer using the dashboard cannot accidentally submit the
  same in-flight launch twice, whatever its host. A maintainer adding a host
  can declare its creation-evidence requirement and native recovery information
  without adding host-name checks or another host's commands to shared gates.
  This removes the remaining launch-gate assumptions before Cursor joins.
- **Scope:**
  - Apply the existing in-flight duplicate gate across delivered hosts and
    dashboard launch workflows, including ad hoc sessions and workflows whose
    installed start is unavailable. Claude gains this protection; Codex keeps
    its current behavior.
  - Preserve the existing meaning of the same launch: project, host, workflow,
    and story identity; for ad hoc sessions, project, host, workflow, and
    instruction (including a blank instruction). A story's changed title,
    instruction, model, options, or policy does not bypass its in-flight gate.
    Different subjects remain independent under the existing admission rules.
  - While the first attempt is running in the same dashboard server, a second
    matching request receives an explanation that the launch is already in
    progress and makes no second workflow start, native session, or input
    submission. This includes requests from two pages and a retry after the
    original page detaches. Once the attempt settles, this in-flight gate
    releases; existing installed-start and retained-evidence rules still apply.
  - The selected host declares whether native creation requires durable
    creation evidence. Shared orchestration applies the unresolved-creation
    and unreadable-evidence gates from that declaration, without checking for
    Codex by name. Codex continues to save creation evidence before native
    creation; an unreadable store or a matching unresolved creation prevents
    another conversation from being created.
  - A host that does not require creation evidence is not blocked merely
    because the launch-record store is unreadable. Preserve Claude's current
    admission behavior; this promises admission to native launch, not successful
    saving of its result.
  - Creation recovery in the launch response and dashboard entry names the
    record's host and uses recovery arguments supplied by that host. Shared
    code neither constructs a Codex command for another host nor substitutes
    another host's missing recovery operation. Existing Codex creation records
    still load and offer the same history inspection using their saved native
    endpoint and workspace, with no invented conversation ID.
  - Preserve the existing distinction between an unresolved creation without
    a trustworthy session identity and a known session whose first input is
    unconfirmed. This story does not alter Codex's native reconciliation or
    authorize blindly resending uncertain input.
- **Deferred promises:** Cursor integration
  (SEED-052#use-cursor-from-dashboard); adding creation recording to Claude;
  automatic resolution of unknown creation identities; new recovery UI;
  coordination between separate dashboard servers or machines; preventing
  intentional new launches after completion. No stored-record migration is
  promised; existing saved Codex creation evidence remains usable.
- **Key examples:**
  - Two pages request the same Claude ad hoc session while its native launch
    is pending → only the first launches; the second explains that
    it is already in progress. The same result applies to a blank ad hoc
    session and a story launch without an installed start.
  - An in-flight Codex story launch is retried with different options or a
    changed instruction → no second start, conversation, or input submission;
    the original attempt retains its intent, as today.
  - The caller leaves its page while the launch remains in flight, then another
    page submits the same request → the gate still prevents a second attempt.
  - A pending launch for one project, host, workflow, or subject is followed by
    a different launch under the existing matching rule → the duplicate gate
    does not block it; other admission rules still decide whether it starts.
  - A completed ad hoc launch is requested again → the in-flight gate alone
    does not block a new session. Retained unresolved evidence may still block
    a host that requires it.
  - Codex creation returns no trustworthy session ID and the dashboard server
    restarts → the saved creation still blocks a matching retry; both the
    response and unresolved-creation entry offer Codex's history inspection
    with the saved endpoint and workspace, and no new native creation occurs.
  - The launch-record store is unreadable → Codex is blocked before native
    creation; Claude still reaches native launch, subject to its
    other admission rules.
  - A host requiring creation evidence supplies its own native recovery
    arguments → the shared gate and entry use that host's name and supplied
    arguments. Missing recovery support never yields another host's command;
    this example commits to the shared rule, not delivery of an additional host.
- **Decision:** Terry confirmed on 2026-10-01: refuse matching in-flight
  launches for Claude as for Codex, and preserve Claude admission when the
  launch-record store is unreadable. This gate does not limit a story to one
  active session after startup has completed.
- **Slice plan:** [Launch gates apply to every host](../slice-plans/204-launch-gates-every-host/PLAN.md).
- **Depends on:** None; per-host session record variants are available.
- **Capture:** Terry selected it on 2026-10-01 from the dashboard multi-tool
  architecture review. Refined 2026-10-01 against `a04edf85`:
  `server/agentLaunches.ts` owns the running set and Codex-only gates;
  `src/launchRequest.ts` defines matching; `server/launchRecordStore.ts` reads
  unresolved creation; `server/hosts/codex/launch.ts` saves evidence before
  native creation; `src/launchCreation.ts` constructs Codex recovery text and
  arguments used by the response and `src/CreationEntry.tsx`.
