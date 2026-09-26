---
id: SEED-040
status: active
planted: 2026-09-26
planted_during: Wrap-up follow-up requested by the maintainer after the lost-workspace preparation release correction
trigger_when: A developer discards a retained preparation draft
scope: small
---

# SEED-040: Discard a preparation draft through a script

## Why This Matters

A developer who refines or plans a queued story can keep, leave unpublished,
or discard the written result. Keep and abandonment run through the installed
`preparation-assignment` script and have automated proof. Discard is taught
only as guidance in the story-refinement `preparation-disposition` reference,
so the agent performs it with ad hoc Git commands. Nothing automated proves
that discard removes only this session's identified draft, keeps unrelated or
another session's work, publishes nothing, and stops when the content cannot
be isolated. Those are deterministic Git mechanics that behave the same on
every host when a script does them.

## Story Decomposition

<a id="scripted-preparation-discard"></a>

### 1. Discard a retained preparation draft through the installed script

**Identity:** SEED-040#scripted-preparation-discard
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Status:** Captured and queued on 2026-09-26; not refined or planned.

- **For / why:** A developer who decides to throw away a preparation draft
  gets the same result on every host, without the agent improvising Git
  commands, and the product has automated proof of it.
- **Evaluation:** After an explicit discard instruction that identifies the
  draft, one script invocation from the preparation workspace removes that
  session's retained seed, story, plan, or bug-triage content, whether
  uncommitted or committed but unpublished. Unrelated edits and another
  session's work in the same workspace stay byte-identical, remote trunk is
  unchanged, and an uncommitted mix that cannot be attributed stops with the
  conflicting paths instead of guessing. A production-CLI test against a
  local bare origin observes each of these, and the guidance invokes the
  script instead of describing the Git steps.
- **Value / learning:** Closes the last preparation disposition without
  automated proof and shows how the session's own draft is identified
  mechanically.
- **Effort hypothesis:** Small; one script operation, one journey test, and a
  guidance update.
- **Depends on:** The existing preparation workspace and assignment records
  (the per-worktree announcement record and allocation provenance).
- **Safe stopping point:** Discard removes only an identified session-owned
  draft through the script, with guidance pointing to it.

## Open Decisions for Refinement

- How does the script identify the session's own draft: from the
  announcement commit and the workspace's record, from paths the developer
  names, or both?
- Does discarding the draft also end the preparation assignment, or stay a
  separate choice from abandonment as it is today?
