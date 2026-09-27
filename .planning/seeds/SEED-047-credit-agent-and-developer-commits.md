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

<a id="integration-merge-credit"></a>

### Correction: Credit the developer on Story Branch integration merges

**Identity:** SEED-047#integration-merge-credit
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/121-integration-merge-credit/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ec3d50f04f6aa5cef16ed6bcdb68450ccfd87694d3538464c0de2226573f4a0f","plan":"8df4188f0daf7c497320861002e2c74ff90d676ebee99cf0f9db6d912c8bebf7"}}
```

**Goal:** When an agent integrates its Story Branch into trunk, the developer
gets the same GitHub credit on the integration merge commit as on the
agent's other commits.

**Scope:** A bounded retrospective correction of the delivered
`SEED-047#agent-and-developer-credit` (plan 119, commits `4c23f11..87e019f`).
In the owned workspace, the integration merge commit keeps the agent as Git
author and credits the configured developer once through the shared credit
rule. This covers both the plain merge and the product-backlog merge
adapter's commit. An unusable developer identity stops the integration
before publication. The correction adds no feature promise.

Excluded:
- merges in checkouts that name no agent;
- Dough Land's rebase path, which already keeps messages;
- historical merges.

[Plan](../slice-plans/121-integration-merge-credit/PLAN.md).

## When to Surface

First in the backlog while the reported attribution bug remains open.

## Breadcrumbs

- Report and expected behavior: developer conversation on 2026-09-27.
- GitHub documents that `Co-authored-by` trailers attribute commits to
  multiple authors, and the trailer email must belong to the credited account:
  https://docs.github.com/en/pull-requests/how-tos/commit-changes/creating-a-commit-with-multiple-authors
