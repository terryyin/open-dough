---
id: SEED-339
status: active
planted: 2026-11-13
planted_during: Terry asked to retain the cloud launch and billing research as one epic
trigger_when: selected from the product backlog for decomposition and refinement
scope: epic
---

# SEED-339 — Run Open Dough tasks in the cloud

<a id="run-open-dough-tasks-in-the-cloud"></a>

### Run Open Dough tasks in the cloud

**Identity:** SEED-339#run-open-dough-tasks-in-the-cloud
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

#### Goal

A developer can start Open Dough work from the dashboard on Cursor Cloud
Agents, Codex Cloud, or Claude Code in the cloud and let it run while their
machine is offline. On return, the developer can find the same session,
inspect its result, and see what was published for the story. Decompose this
epic when it comes up for refinement.

#### Dashboard behavior to refine

- Today the dashboard launches all three hosts on this machine. Story starts
  can establish a local worktree, announce Preparing or Take through an
  installed skill, and pass the workspace, branch, revision and authority into
  the launch. Terminals attach to native sessions. Images are retained as
  local files, and completion and landing reports use a loopback HTTP
  endpoint with matching receipts. A vendor VM cannot read those local
  paths or reach the dashboard through that loopback address.
  [Agent launch](../../dashboard/AGENT-LAUNCH.md) ·
  [Launch start](../../dashboard/LAUNCH-START.md) ·
  [Terminals](../../dashboard/AGENT-LAUNCH-TERMINALS.md) ·
  [Completion reporting](../../dashboard/AGENT-LAUNCH-COMPLETION.md) ·
  [Reporting client](../../Distribution/src/skills/dough-execute-plan/scripts/dashboard-completion.mjs)
- Determine how a hosted launch identifies the intended published repository
  and revision, receives the released Dough skill and project tools, and
  returns a session identity and result. Decide which actions to expose for
  each host, including opening the provider session, follow-up, cancellation,
  and recovery after an ambiguous submission or a dashboard restart. Check
  how model, effort, image inputs, and the current review and landing choices
  map to each hosted interface.
- Preserve the developer's publication authority. Distinguish provider run
  status, the workflow's explicit completion or attention report, and
  published story progress or closure. A provider's finished status alone
  cannot establish story closure. Git on origin owns durable workflow facts,
  including assignment and published progress. Decide how to carry completion
  and landing evidence across the cloud boundary while preserving that
  ownership. [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)

#### Provider research and integration ranking

Research snapshot from 2026-11-13. The ranking considers launching at the
intended Git revision, tracking the result, and recovering after a timeout or
restart. It is an integration judgment based on documented interfaces and
read-only local CLI checks.

1. **Cursor Cloud Agents is the most straightforward.** The dashboard
   currently uses `cursor-agent create-chat` and a local terminal client
   with `--workspace` and `--resume`. Cursor documents an interactive
   `&` handoff, and its public-beta Cloud Agents API gives the dashboard a
   direct integration. `POST /v1/agents` accepts a Cursor user or service
   account API key, a connected repository, a branch or full commit SHA,
   and a prompt with optional images and model settings. It returns an
   agent ID, a run ID and a web URL. It provides run status, event streaming,
   results, follow-ups, and cancellation. A caller-supplied `agentId`
   prevents duplicate creation when a response is lost. This option cannot
   be combined with per-launch `envVars`. The v1 docs point to streaming
   or polling today and document webhooks on legacy v0. By default Cursor
   pushes to a generated `cursor/...` branch. `workOnCurrentBranch` can
   target an existing branch, and `autoCreatePR` controls PR creation.
   Verify that the chosen branch and result handling fit the story's
   publication authority. Cursor documents repository skills and
   command-based project hooks on hosted agents.
   [Current launcher](../../dashboard/server/hosts/cursor/launch.ts) ·
   [CLI handoff](https://cursor.com/docs/cli/overview#cloud-agent-handoff) ·
   [Cloud Agents API](https://cursor.com/docs/cloud-agent/api/endpoints) ·
   [Cloud setup](https://cursor.com/docs/cloud-agent/setup) ·
   [Cloud Agent capabilities and billing](https://cursor.com/help/ai-features/cloud-agents)
2. **Codex Cloud is straightforward to submit and list.** The dashboard
   currently uses local app-server `thread/start` and `turn/start`.
   The hosted route uses ChatGPT sign-in and a configured cloud environment
   with repository access. Use
   `codex cloud exec --env <id> --branch <branch> "<task>"` to submit and
   `codex cloud list --json` to retrieve task IDs, URLs and status. The
   installed CLI also exposes `codex cloud status <task-id>` and
   `codex cloud diff <task-id>`. Codex offers review and follow-up in
   the cloud UI, and `codex apply` can apply a task's diff locally. Verify
   reliable task ID capture on submission and reconciliation when the
   command times out. Verify that the chosen environment can start at the
   required revision.
   [Current launcher](../../dashboard/server/hosts/codex/launch.ts) ·
   [CLI reference](https://learn.chatgpt.com/docs/developer-commands?surface=cli#cli-codex-cloud) ·
   [Authentication](https://learn.chatgpt.com/docs/auth) ·
   [Cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environments)
3. **Claude Code is easy to start and the least straightforward to track.**
   The dashboard currently uses `claude --bg` and confirms the session in
   the local background-agent listing. `claude --cloud "<task>"` starts
   a hosted session from the current repository and branch with a claude.ai
   sign-in and eligible cloud access. `--remote` is a deprecated alias.
   `--remote-control` steers a session on the developer's machine. A
   missing published branch can fall back to an older pushed commit or the
   default branch. In some configurations Claude uploads a bundle of the
   local repository, which can include history and tracked edits. Verify
   that the launch uses the intended published revision and repository
   transfer. The web session shows progress and accepts steering.
   `claude -p "<message>" --cloud <session-id>` sends a follow-up and can
   return JSON for that send. `--teleport` brings the session into a local
   checkout. The experimental HTTP routine trigger starts a preconfigured
   routine with per-run text and returns a session ID and URL. Its token
   only triggers that routine. Verify unattended creation, session ID
   capture, and status retrieval for arbitrary dashboard story launches.
   [Current launcher](../../dashboard/server/hosts/claude/launch.ts) ·
   [Cloud sessions](https://code.claude.com/docs/en/claude-code-on-the-web) ·
   [Routine trigger API](https://platform.claude.com/docs/en/api/claude-code/routines-fire)

#### Subscription and marginal cost

Public US prices checked on 2026-11-13, before tax and extra usage. These
figures describe the vendors' hosted coding products. The base cost for one
new monthly subscription to each is **$70/month**, or **$60/month** with an
existing $20/month legacy Cursor Pro subscription.

- **Cursor.** Premium $30/month is the lowest current tier with Cloud
  Agents. Super is $100/month and Ultra $200/month. The current $8/month
  Plus tier lacks Cloud Agents. Existing legacy Pro ($20/month), Pro+
  ($60/month), and Ultra ($200/month) include them. Cursor charges no
  separate VM, compute or memory fee for hosted Cloud Agents. Cloud and
  local runs draw from the same plan usage at the selected model's rate.
  Current plans include a shared weekly allowance for Cursor models and
  bill third-party models such as Claude and GPT separately from the first
  request. Runs can differ in token use. On legacy request-based plans,
  Cloud Agents always run in Max Mode at the model's API rate plus 20%.
  [Current plans](https://cursor.com/pricing) ·
  [Legacy plans](https://cursor.com/docs/account/pricing/legacy-cursor-plans) ·
  [Models and usage](https://cursor.com/docs/models-and-pricing) ·
  [Cloud billing](https://cursor.com/docs/cloud-agent#billing) ·
  [Cursor's VM fee clarification](https://forum.cursor.com/t/what-is-the-pricing-structure-for-using-cloud-agents/156843/14)
- **Codex.** ChatGPT Plus at $20/month is the lowest tier OpenAI lists for
  Codex cloud chats. Pro tiers are $100, $200, and $500/month. OpenAI's
  subscription pricing lists no separate VM charge. Local and cloud runs
  share the allowance, and cloud tasks can use more of it depending on
  model and task. Paid credits are available beyond included usage. The
  published credit rates are token-based with no fixed cloud surcharge
  listed. [OpenAI pricing and usage](https://learn.chatgpt.com/docs/pricing)
- **Claude Code.** Pro is $20/month or $200/year, Max is $100/month, and
  Ultra is $200/month. Anthropic explicitly states that its hosted Claude
  Code VM has no separate charge. Hosted sessions count toward the same
  subscription limits as local Claude Code, with no cloud-specific usage
  surcharge published. The separate Claude Managed Agents API has its own
  token and session-runtime billing.
  [Claude pricing](https://claude.com/pricing) ·
  [Claude Code cloud billing](https://code.claude.com/docs/en/claude-code-on-the-web) ·
  [Managed Agents session budgets](https://platform.claude.com/docs/en/managed-agents/budgets)

#### Evidence and first example to refine

Research confirmed the installed Codex cloud commands, received an empty
task list from a read-only `codex cloud list --json` call, and confirmed
Claude Code CLI sign-in to claude.ai and the presence of `--cloud`. It
also checked the installed Cursor CLI and the three local dashboard
launchers. Hosted task creation, repository access, discovery of the Dough
skill, and dashboard result delivery remain unverified for all three hosts.

The suggested first trial is a review-only Cursor task on a disposable
published branch. Verify that the agent checks out the expected commit,
uses the intended Dough skill, and returns a result the dashboard can
associate with the original launch after a restart. Establish separate
native evidence for Codex and Claude Code before relying on either for
story work. Confirm which workflow capabilities the evidence supports
before deciding the order and boundaries of the smaller stories.
[ADR 0005 — Cross-tool validation through native acceptance stories](../../docs/adrs/0005-cross-tool-validation-accepted.md)
