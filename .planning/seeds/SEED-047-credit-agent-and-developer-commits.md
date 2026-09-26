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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** An agent-enabled commit credits both the configured developer and
the assigned agent as authors on GitHub, while project logic still recognizes
the assigned agent when it appears as Git author or co-author.

**Expected behavior:** Derive the developer name and email from the active
checkout's Git identity, without hardcoding a person or address. Add the
developer as a distinct `Co-authored-by` trailer when the agent is the Git
author. Preserve other legitimate co-author trailers and avoid duplicate
credit. If the developer is the Git author, a distinct agent co-author trailer
can carry the agent's credit. Do not infer co-authorship from the committer
field alone.

**Actual behavior:** At `15362af`, the Git author is
`Aino-chan <aino-chan@example.org>` and the committer is the configured
developer. Its only `Co-Authored-By` trailer names Claude Opus. Startup sets
per-worktree agent author config in
`src/skills/dough-execute-plan/scripts/workspace-agent-authorship.mjs`;
Take and preparation announcement commands set an explicit agent author.
Ordinary commits made inside those worktrees inherit the agent author without
automatically adding the developer as co-author.

**Scope:** Reproduce the attribution gap at the public Take and preparation
boundaries and an ordinary commit in an agent-owned worktree. Repair all three
paths, including the bare-repository fallback, without changing unrelated
checkouts or replacing existing Git hooks silently. Audit author-dependent
logic and make it recognize an agent co-author where that is meaningful; keep
current assignment ownership tied to the published profile. Update the
authorship contract and agent-facing guidance in the shared release source.
Do not rewrite historical commits.

**Key examples:**

1. Start an agent-owned worktree with a configured developer identity, then
   publish its Take and an ordinary implementation commit. Both commits credit
   the developer and assigned agent; another checkout keeps its normal identity.
2. Publish a preparation assignment. Its announcement credits both parties.
3. Preserve a model co-author trailer and add the developer once, even when
   a commit is amended or replayed.
4. An agent-enabled commit with the developer as Git author and the assigned
   agent as a co-author still counts as agent-authored for logic that reports
   historical agent work.
5. Missing or unusable developer identity produces an explicit refusal before
   publishing a commit that claims credit incorrectly.

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
