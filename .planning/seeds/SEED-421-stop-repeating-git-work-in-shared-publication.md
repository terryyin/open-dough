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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal.** A maintainer running the publisher-heavy tests gets them inside the
default timeout under load, because shared publication performs each git
observation and ref write once per publication. Publication behavior is
unchanged.

**Current behavior.** `dashboard/backend-tests/launches/declared-blank-launch-publication.spec.ts:23`
("a blank Default main launch keeps its declared landing until record
deletion") is load-sensitive: 515 ms in CI, about 1.0 s locally alone at load
~9, 2.1–4.1 s at load 23–25, and it timed out (5088 ms against the 5 s default)
in a group run at load ~25. A git wrapper counted 61 git process starts in one
run: setup 17, the installed publisher's publish ~27, branch retirement
including `gc --prune=now` 4, pin checks and record deletion ~9, test side ~4.
Each start costs ~10–12 ms at load 7.5, so git is about 65% of the case.
Shared publication writes the pin refs twice, fetches origin twice plus once
more, repeats object-type, ancestry and tree checks, and re-queries the remote.
Removing that repetition saves about 10 of the 61 starts (15–20%) and speeds
every publisher case. Under the
[failure policy](../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md)
the flaky case is a defect; the developer chose this correction over a
per-test timeout or splitting the case.

**Key example.** The declared-blank-launch case's git-start count drops, and it
completes inside 5 s at load ~25 without a timeout change.

**Scope.** The shared publication scripts under
`Distribution/src/skills/dough-execute-plan/scripts/` (publication git access,
the publish-the-candidate path, pin refs and branch retirement). Full suites
are needed before landing.
