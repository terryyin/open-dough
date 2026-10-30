# Recover a completed review's execution agent

## Selected Stories

<a id="recover-completed-review-agent"></a>

### Recover a completed review's execution agent

**Identity:** SEED-184#recover-completed-review-agent
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Review a completed story whose done record omits its execution agent
when published claim history identifies that agent unambiguously.

**Scope:** Add a safe historical-agent fallback to published completed-story
review. Preserve existing attribution safeguards, with the explicit human-approved
exception that genuine conflicted own/completion integrations show their resolved
files as “includes trunk's changes”; keep other files attributed normally and
refuse edits outside Git's conflict paths. Do not
rewrite historical done records. Verify the reported SEED-178 review through
the running production dashboard after integration and deployment.

**Key examples:**

- An executing agent returns a story to the backlog, releasing its profile;
  closing it afterward produces an agentless done record. A unique, valid
  published execution claim recovers that agent and permits the fixed review.
- Missing claim evidence, preparation-only profiles, and conflicting candidate
  agents leave a clear refusal instead of choosing an owner or author by guess.
- A recorded agent retains existing attribution behavior, including takeovers
  and refusals for unsafe merge resolutions.
- SEED-178#resolve-dashboard-test-optimization-candidates returns a published
  review with changed files from production, and its file diffs are readable.

**Human amendment:** Show SEED-178's manually resolved shared timings document
with “includes trunk's changes”; keep other files attributed normally.
