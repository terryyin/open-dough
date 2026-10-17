---
id: SEED-139
status: active
planted: 2026-10-18
planted_during: Terry's request to review every completed story from the dashboard
trigger_when: A completed story has no retained launch on the observing machine
scope: bounded
---

# SEED-139: Review completed stories from published evidence

<a id="review-completed-stories"></a>

### Review every completed story

**Identity:** SEED-139#review-completed-stories
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/314-completed-story-review/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"27e9bbe482ee655cfcf23ece06fa2b6747360da76ee498b21366edbf382463a3","plan":"3dc042b3e13e262fb5aba3f07d2f3fec77f33c1403aa140339645aa6f00d8267"}}
```

**Goal:** Let a developer review the changes of a completed story in Recently
done regardless of which machine or interface executed it.

**Scope:** Every completed-story card offers Review changes. Resolve a fixed
historical comparison from the project's published completion and execution
evidence, independently of retained dashboard launches, retired workspaces and
deleted story branches. Reuse the existing review panel and file diffs. Keep
other stories' changes out of the comparison. Where published evidence cannot
identify the work safely, explain the missing evidence in that review rather
than guessing or treating missing evidence as an empty change. Preserve active
workspace reviews and locally captured landed runs.

**Key examples:**

- A story was executed and completed in a terminal on another machine. With no
  local launch records, its Recently done card opens its published changes and
  an individual file's diff.
- Two agents interleave their work on trunk. Opening the first completed story
  shows that story's delivered changes and leaves the other agent's changes out.
- The execution workspace and branch are retired and trunk advances. Refresh
  and reopening retain the completed story's historical comparison.
- A legacy completion does not carry enough trustworthy attribution. Its card
  still opens a review that explains the evidence gap.

Existing shared completion records, agent profiles in Git history and captured
landed comparisons are the first reuse candidates. No independent dashboard
completion store or machine-specific shared path is required.
