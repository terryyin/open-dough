# Credit the developer and agent on agent-enabled commits

## Source

**Identity:** SEED-047#agent-and-developer-credit

[Refined story](../../seeds/SEED-047-credit-agent-and-developer-commits.md#agent-and-developer-credit).
The developer reported on 2026-09-27 that agent-authored commits record the
configured developer only as committer, so GitHub may omit that developer's
commit credit. The instruction authorizes refinement and planning, not
implementation. The story's `15362af` example is the observed baseline;
execution must confirm a failing focused reproduction before repair.

## Goal and scope

Agent-enabled Take, preparation, and guided work commits credit both the
assigned agent and the Git-configured developer. The agent remains Git author;
the developer appears once as `Co-authored-by` using the effective committer
name and email of the checkout making the commit. Existing co-authors remain.
Current assignment ownership remains the published agent profile. A history
reader that interprets contributors must accept an agent as author or
co-author; profile-based readers continue to use the profile. The rule also
works when a bare repository cannot enable per-worktree author configuration.

Included paths are Open Dough's Take, preparation announcement and end,
ordinary implementation and closure commits guided by its skills, and resume
or replay of those commits. A missing, malformed, or agent-equal committer
identity refuses the agent-enabled commit before publication. GitHub account
association of the configured email is the developer's Git setup prerequisite;
the product cannot validate it locally. Historical commits are not rewritten.
Do not install or override Git hooks, change unrelated checkouts, or make an
arbitrary human-run Git commit in an agent worktree an Open Dough commit.

## Current decisions and existing solution

- **One credit rule.** Extend the existing
  `src/skills/dough-execute-plan/scripts/workspace-agent-authorship.mjs`
  responsibility with a shared, commit-time trailer operation. It reads the
  effective `GIT_COMMITTER_IDENT`, validates the person, and uses Git trailers
  rather than hardcoded account data. Reuse it from scripted `git commit`,
  the preparation `commit-tree` path, and a small guided-commit entry point
  for ordinary agent work. Do not replace `core.hooksPath`; Git's existing
  hooks still run on the ordinary `git commit` path.
- **Agent evidence.** Keep the agent as the primary Git author in the current
  worktree contract. The profile addition identifies the assigned agent in
  `agent-assignments.mjs` and `execution-start-agent.mjs`; neither infers
  assignment from `%an`. Prove that a developer-authored, agent-co-authored
  profile commit is still read as that agent's assignment. Add a contributor
  parser only if an actual history reader needs it; do not add an unused
  second source of assignment identity.
- **Guidance ownership.** Put the guided-commit invocation and refusal rule
  in one runtime reference linked by execute-plan, preparation, and wrap-up
  where they create agent-enabled commits. Update
  `docs/project-visibility-requirements.md` for the product contract and edit
  `src/skills/` as the release source, following [ADR 0006 — Write skills for
  executing agents](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  and [AGENTS.md](../../../AGENTS.md). Do not hand-edit managed installed
  `.agents/skills/` or `.claude/skills/` copies.
- **Architecture.** [ADR 0000 — Use ADRs](../../../docs/adrs/0000-use-adrs-accepted.md)
  keeps this feature behavior with its story. [ADR 0002 — Software development
  lifecycle principles](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  favors one coherent domain rule and small integrated increments. The
  [remote publication and default-checkout ownership North Star](../../NORTH-STAR.md#remote-publication-and-default-checkout-ownership)
  keeps each owned workspace's publication separate from default-checkout
  identity; no new ADR or North Star topic is needed.

PFE finding: `workspace-agent-authorship.mjs` already owns per-worktree agent
author configuration; `workspace-publication-select.mjs` and
`preparation-assignment-start.mjs` create explicit agent-authored commits;
`preparation-assignment-abandon.mjs` creates a commit with `commit-tree` and
bypasses normal commit hooks. Profile readers use file additions, not Git
author text. Change these owners and share trailer construction instead of
adding a parallel identity registry or repository-wide hook.

## Outside-in proof

| Promise | Owning slice and observable proof |
| --- | --- |
| Take credits agent and configured developer, including a bare worktree | 1: real `execution-start.mjs start` fixture; inspect published `main` commit author, committer, and trailers; another checkout retains its identity |
| Missing or invalid developer identity refuses before publication | 1: startup fixture confirms unchanged remote SHA and a specific refusal |
| Preparation start and end credit both people | 2: real preparation assignment CLI fixture; inspect both published commits, including `commit-tree` end |
| Ordinary guided work commits retain model credit and one developer trailer | 3: commit through the documented entry point in an owned workspace; inspect the Git message and preserve an existing commit hook's effect |
| Closure and replay keep correct credit | 4: close a story through its guided commit boundary, amend or replay an owned commit, and inspect each resulting message for one developer trailer |
| Agent co-author remains recognizable while current ownership comes from the profile | 1: a profile-addition fixture with developer Git author and agent trailer still yields the assigned agent; any actual contributor-reading caller found during implementation gets a direct regression case |

Use the smallest matching existing fixtures. Focused checks:
`node --test src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent-resume.test.mjs`,
`node --test src/skills/dough-story-refinement/scripts/preparation-assignment-announce.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-abandon.test.mjs`,
and the focused guided-commit and closure tests selected in slices 3–4. Run
`npm run lint` for touched release-source guidance and `git diff --check`.
After each slice, run its related focused checks and the project's required
post-change refactor and delivery gates; broaden testing only for a concrete
remaining risk. Review one representative skill invocation under AGENTS.md's
invocation, required-context, and useful-outcome checks.

## Ordered slices

### 1. A published Take credits the developer and assigned agent
Type: Behavior
Status: done
Proof: Add a failing assertion to
`workspace-publication-startup-agent.test.mjs` for a real published Take's
`%an`, `%cn`, and `Co-authored-by` trailer; reproduce the current absence
before repair. Assert a different test-configured developer is read from Git,
not a fixed name. Cover absent/invalid committer identity, the bare-repository
fallback, and an unrelated checkout. A profile-addition commit whose Git
author is the developer and whose co-author trailer names the agent still
resumes under that agent via the published profile.

Behavior: valid developer identity + queued Take → `execution-start` publishes
one claim commit with agent author and developer co-author; invalid identity
→ no claim publication. Add the shared credit operation at this boundary.

Safe stop: newly published Takes carry correct credit; existing ordinary and
preparation paths still need slices 2–4.

Accepted proof: before repair, the new co-author assertion failed with
`actual: ''`. After repair,
`node --test src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent-credit.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent-resume.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-race.test.mjs`
passes 14/14. The Take tests observe the published `main` author, committer,
and `Co-authored-by` for a fixture-configured developer, the bare-clone
fallback, and an unrelated checkout without a trailer. The credit tests
observe `developer-identity-refused` with an unchanged remote and a clean
workspace for missing, malformed, and agent-equal identities. The resume test
shows a developer-authored, agent-co-authored profile commit resumes under
that agent.

### 2. Preparation coordination commits carry the same credit
Type: Behavior
Status: done
Proof: Extend the existing announcement and abandonment CLI cases to inspect
published commit messages and people. The preparation end made with
`commit-tree` uses the same trailer operation; a repeated or lost-response
attempt publishes no duplicate end or trailer. Confirm the profile lifecycle
and queue remain unchanged.

Behavior: start or explicitly end a preparation assignment → the published
coordination commit credits its agent author and configured developer
co-author. Preserve the refusal and recovery behavior of these commands.

Safe stop: both kinds of coordination commit carry correct credit; guided
implementation and closure commits still need slices 3–4.

Accepted proof: before repair, the announce and end trailer assertions got
`''`, and both refusal cases exited 0. After repair,
`node --test src/skills/dough-story-refinement/scripts/preparation-assignment-announce.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-abandon.test.mjs src/skills/dough-story-refinement/scripts/preparation-assignment-stops.test.mjs`
passes 17/17, and `node --test src/skills/dough-story-refinement/scripts/*.test.mjs`
passes 33/33.

`remoteCredit` observes each published commit on origin: the announcement,
the end, and the end after a lost response and rerun. Each has the agent as
author, the developer as committer, and one developer trailer. The lost-response
rerun also keeps a single end commit.

The refusal tests observe `developer-identity-refused` with the remote,
workspace, and draft unchanged. They then show that configuring the
developer makes the command succeed.

### 3. Ordinary guided work commits credit both contributors
Type: Behavior
Status: done
Proof: A representative execute-plan work commit uses the shared guided-commit
path, retains a pre-existing model trailer, and contains the configured
developer trailer exactly once. An existing `commit-msg` hook still runs.
Run focused tests of that commit boundary and AGENTS.md's representative
skill behavior review. Update the shared execution guidance to invoke it.

Behavior: an assigned agent commits ordinary verified work → its
commit remains agent-authored, has developer co-author credit, preserves other
co-authors and Git hooks, and remains attributable to the published profile.

Safe stop: ordinary guided implementation commits are credited; closure and
replay still need slice 4.

Accepted proof: before repair, a plain workspace commit's co-authors were only
the model. After repair,
`node --test src/skills/dough-execute-plan/scripts/agent-commit.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent.test.mjs`
passes 8/8. In a real Taken workspace, a commit through
`scripts/agent-commit.mjs` is authored by the agent and committed by the
configured developer. It carries the model trailer and then the developer
trailer, once each, even when the message already credits the developer. The
fixture's `commit-msg` hook saw the credited message. The
`developer-identity-refused` and `no-workspace-agent` refusals leave HEAD
unchanged and the content staged. The guidance tests that read `wrap-up.md`
and `tests/payload-declaration-links.sh` pass.

The runtime rule lives in `references/agent-commits.md`, which delivery step 7
links. It applies only when the start or announce result named an agent and
did not report `workspaceAuthorship: "not-configured"`. Every other execution,
including the bare-repository fallback, commits with plain `git commit`,
because those commits are the developer's own under the current worktree
contract.

### 4. Closure and replay preserve contributor credit
Type: Behavior
Status: done
Proof: A representative wrap-up closure commit uses the guided-commit path.
Amend or replay an owned commit with existing model and developer trailers;
each resulting Git message contains the developer exactly once. Run focused
tests of the affected closure and replay boundary. Update the product
authorship requirement and the shared preparation and wrap-up guidance to
match the proved behavior.

Behavior: an assigned agent closes or replays its work → the resulting commit
credits the same agent and configured developer without duplicate trailers or
loss of existing co-authors.

Safe stop: the story's current agent-enabled commit paths share one credit
rule; no historical rewrite is required.

Accepted proof: before repair, amending a message that credited the
developer's email under another display name added a second developer
trailer. After repair,
`node --test src/skills/dough-execute-plan/scripts/agent-commit.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent-credit.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-agent-resume.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-race.test.mjs src/skills/dough-execute-plan/scripts/publication-racing-suffix-replay.test.mjs src/skills/dough-execute-plan/scripts/publication-racing-suffix.test.mjs`
passes 23/23. The story-refinement, wrap-up, and guidance suites pass 33/33,
14/14, and 29/29.

What the tests observe:
- A wrap-up closure commit through `agent-commit.mjs` in a real Taken workspace
  is authored by the agent and credits the model and the developer once each.
- `--amend`, with or without a new message, and with the developer trailer
  spelled with a different key case, email case, or display name, keeps
  exactly one developer credit.
- An owned suffix replayed twice by publication rebase keeps its trailers
  unchanged.
- A replayed agent Take keeps one developer credit.

`docs/project-visibility-requirements.md` states the authorship contract.
Execute-plan start, preparation `start` and `abandon`, wrap-up closure, the
execution-complete record, and Dough Land's commit link `agent-commits.md`.

## Learnings

- Planning audit found no current assignment reader that depends solely on the
  Git author field. `agent-assignments.mjs` and
  `execution-start-agent.mjs` read the profile added by a commit. Keep the
  contributor rule explicit without introducing an unused history parser.
- Slice 1 added `creditDeveloper(checkout, message, { agent, email })` in
  `workspace-agent-authorship.mjs`. It reads
  `git -c user.useConfigOnly=true var GIT_COMMITTER_IDENT` in the committing
  checkout and appends the trailer with `git interpret-trailers --if-exists
  addIfDifferent`. It throws `DeveloperIdentityRefused` before any commit.
  Later slices call it with the committing workspace and turn a refusal into
  their own stop before any ref update. The Take commit moved from
  `workspace-publication-select.mjs` to `workspace-publication-claim.mjs`.
- Git's `addIfDifferent` compares trailer keys and values case-insensitively.
  It still duplicates the same email under a different display name, so
  slice 4 changed `creditDeveloper` to skip any message whose `Co-authored-by`
  trailers already name the developer's email.
- A later session such as wrap-up cannot see the start result. `agent-commits.md`
  therefore applies while the workspace's `git config --worktree author.name`
  still names the agent.
- `docs/project-visibility-requirements.md` was already over the 250-line
  file bound before this story. Splitting it would touch ADR 0008, ADR 0009,
  and the dashboard North Star links, so it is left for a separate decision.

## Execution state

- Mode: Story Branch. Checkout:
  `.worktrees/119-agent-and-developer-commit-credit`, branch
  `claude/119-agent-and-developer-commit-credit`. Remote `origin`, trunk
  `main`.
- Take claim: `4c23f11032bd88e9640cf20980020a565a057479`, published on
  `main` and on the execution branch. Agent: Tsubomi-chan.

