---
id: SEED-421
status: active
planted: 2026-11-21
planted_during: Execution of SEED-418#attribute-every-workflow-session-record found a load-sensitive publisher test
trigger_when: selected from the product backlog
scope: one story
---

# SEED-421 — Stop repeating git work in shared publication

<a id="stop-repeating-git-work-in-shared-publication"></a>

### Stop repeating git work in shared publication

**Identity:** SEED-421#stop-repeating-git-work-in-shared-publication

```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/763-stop-repeating-git-work-in-shared-publication/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"ec35f962ea03d3011679e09d59e2e7a0e87509456717e29f3c08d37a5777a363","plan":"8dd25963f0c9b066cb73f4b6022e7161b0011ebf3d6e5aa18c67ede374cd8246"}}
```

**Goal.** A maintainer running publisher-heavy tests gets reliable feedback
within the default timeout under representative load. Shared publication
reuses Git observations and ref writes while their results remain valid.

**Current behavior.** `dashboard/backend-tests/launches/declared-blank-launch-publication.spec.ts:23`
("a blank Default main launch keeps its declared landing until record
deletion") is load-sensitive: 515 ms in CI, about 1.0 s locally alone at load
~9, 2.1–4.1 s at load 23–25, and it timed out (5088 ms against the 5 s default)
in a group run at load ~25. The original Git trace counted 61 process starts.
Repeated work includes reads of the same candidate tree and checks and writes
for the same prepared landing pair. Under the
[failure policy](../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
the flaky case is a defect; the developer chose this correction over a
per-test timeout or splitting the case.

**Scope.** Reduce repeated work in the shared publisher and its Dashboard
landing verification and pin lifecycle. Consider the retirement path where
observations can be reused within its ownership and containment checks. Reuse
immutable candidate facts only for the same commit. Fetch or otherwise observe
the authorized target at each boundary that needs fresh remote evidence.
Keep ordinary push, bounded retry, refusal, reporting-only recovery and safe
retirement, including preservation of another writer's work. Keep the default
test timeout, assertions and retirement fixture's pruning check. Full suites
are required before landing implementation.

**Key examples.**

- A blank Default main launch declares a worktree and publishes an unchanged-base
  candidate. Its existing test starts fewer Git processes and completes within
  5 s at representative load around 25. The accepted comparison and its pins
  survive branch retirement and exact reporting retry. Record deletion removes
  those pins.
- When trunk advances before a push succeeds, publication observes the newer
  target and checks the rewritten candidate. It retains that candidate and its
  actual suffix base before the retry. A second rejection preserves the work.
- When recording a prepared pair, the receiver confirms remote containment
  before it accepts the landing. Existing healthy pins need no repeated writes.
  A reporting retry after acceptance returns the same receipt.
