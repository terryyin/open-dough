---
id: SEED-047
status: active
planted: 2026-09-27
planted_during: Report that agent-enabled commits credit the developer only as committer
trigger_when: An agent-enabled workflow creates or reads a Git commit
scope: 1 story
---

# SEED-047: Credit both the developer and agent on agent-enabled commits

## Why This Matters

Developers use GitHub commit attribution to see their contribution to work
performed with agents. An agent-enabled commit currently names the agent as
Git author and the configured developer as committer. GitHub does not treat
that committer field as a co-author trailer, so the developer's commit credit
can be missing. The same Git history also supplies evidence about which agent
performed work; changing attribution must preserve that meaning.

## Stories

<a id="agent-and-developer-credit"></a>

### Credit the developer and agent on agent-enabled commits

**Identity:** SEED-047#agent-and-developer-credit
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/119-agent-and-developer-commit-credit/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"a47b63384d55c04ecbb6bf3c255cf837902fae9967a9d58103042db3e65792dd","plan":"a72554dd5f1367dd15cd9b57f081f943142b38118d86504ab9d7909442e9b589"}}
```

**Goal:** An agent-enabled commit credits both the configured developer and
the assigned agent as authors on GitHub, while project logic still recognizes
the assigned agent when it appears as Git author or co-author.

**Expected behavior:** In an agent-enabled workflow, keep the assigned agent
as Git author and derive the developer's name and email from the actual Git
committer identity for that checkout. Add the developer as a distinct
`Co-authored-by` trailer. Preserve other legitimate co-author trailers,
including model credit, and do not add the same person twice. Do not infer
co-authorship from the committer field alone. When a commit has the developer
as Git author and the assigned agent in a co-author trailer, agent work
recognition still attributes it to that agent.

**Actual behavior:** At `15362af`, the Git author is
`Aino-chan <aino-chan@example.org>` and the committer is the configured
developer. Its only `Co-Authored-By` trailer names Claude Opus. Startup sets
per-worktree agent author config in
`src/skills/dough-execute-plan/scripts/workspace-agent-authorship.mjs`;
Take and preparation announcement commands set an explicit agent author.
Ordinary commits made inside those worktrees inherit the agent author without
automatically adding the developer as co-author.

**Scope:** Cover commits created by Open Dough's agent-enabled execution and
preparation paths: Take, preparation announcement and end, guided implementation
and closure commits, including the bare-repository fallback. Derive credit
from Git at commit time; do not hardcode an account or change other checkouts'
identity and hooks. Keep current assignment ownership tied to the published
profile. Audit historical agent-work readers: where a reader interprets commit
contributors, agent author and agent co-author both count; where it reads the
assignment profile, keep that stronger source. Update the authorship contract
and agent-facing guidance in the shared release source. Historical commits are
not rewritten. GitHub association of the configured email is a developer Git
setup prerequisite, not something the product can prove locally.

**Key examples:**

1. A queued story is Taken in a checkout configured for a developer → the
   published Take commit names the agent as author and the developer as
   co-author; a normal commit in that agent-owned worktree has the same credit,
   while another checkout keeps its ordinary Git identity.
2. A queued story enters and exits preparation → both coordination commits
   credit the assigned agent and configured developer, including the end
   commit made without a working-tree commit operation.
3. A guided agent commit already credits a model or is amended/replayed →
   existing co-authors remain, the developer appears once, and a replay does
   not add duplicate trailers.
4. A developer-authored commit names the assigned agent in a co-author
   trailer → a history reader counts that agent as a contributor, while the
   current assignment still comes from its published profile.
5. Git has no usable committer name or email for an agent-enabled commit →
   that path refuses before publishing a misleadingly credited commit.

**Architecture check:** [ADR 0000](../../docs/adrs/0000-use-adrs-accepted.md)
keeps feature behavior and implementation design with this story. [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
requires one shared, project-relative agent-facing rule across hosts. Proposed
ADRs 0008 and 0009 are nonbinding; this change should preserve their
distinction between durable Git evidence and current assignment ownership.

## When to Surface

First in the backlog while the reported attribution bug remains open.

## Breadcrumbs

- Report and expected behavior: developer conversation on 2026-09-27.
- GitHub documents that `Co-authored-by` trailers attribute commits to
  multiple authors, and the trailer email must belong to the credited account:
  https://docs.github.com/en/pull-requests/how-tos/commit-changes/creating-a-commit-with-multiple-authors
