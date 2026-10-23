---
id: SEED-148
status: active
planted: 2026-10-23
planted_during: Terry's follow-up to a completed-story identity collision in Donut
trigger_when: Allocating a new seed or story identity after completed source records have been cleaned up
scope: small
---

# SEED-148: Allocate story identities without reusing completed work

## Why This Matters

A developer adding a new story needs its identity to remain distinct from both
active and completed work. Cleanup removes completed seeds and story sections;
choosing the next number from the remaining seed files can therefore reuse an
identity whose completion record still exists. That can mix unrelated ownership
and recovery evidence and put an earlier completion record at risk.

Terry requests checking the done catalog before allocating a new story ID.
This is shared Open Dough workflow behavior. Donut records its source as
`https://github.com/terryyin/open-dough` and its installed release as `0.3.69`.
Open Dough's `AGENTS.md` places maintained shared guidance in `src/skills/`;
installed `.agents/skills/` and `.claude/skills/` copies are updated from releases.

## Selected Story

<a id="allocate-unused-story-identities"></a>

### Check completed work before allocating a new story identity

**Identity:** SEED-148#allocate-unused-story-identities
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** A developer or agent creating a story chooses an unused identity after
checking active work and completed-work evidence, so cleanup of a completed
story cannot make its identity appear available for unrelated work.

**Scope:**

- Consult the done catalog beside the project's product backlog before choosing
  a new seed number or story identity, alongside active canonical homes and
  backlog entries. A removed seed file does not make its identity available.
- Put the allocation rule in the existing shared work-item identity contract
  and connect the workflows that allocate new identities to that rule. Preserve
  project-specific naming and numbering conventions and existing identities.
- Use the catalog's existing record references and currency/rebuild conventions
  where needed. An unreadable or missing catalog is not evidence that there is
  no completed work. Resolve the evidence needed to allocate safely before
  publishing a new canonical home or claim.
- Preserve ordinary resume and canonical-home relocation: those retain their
  recorded identity. This story concerns allocating identities to new work.
- Keep completed records intact. This work does not authorize automatically
  renumbering an existing story or replacing the human decision required when
  conflicting recorded identities have already been published.

**Key examples:**

1. Active seed files end at `SEED-074`, while the done catalog contains
   `SEED-075#story-1` through later seed numbers up to `SEED-084`. Creating a new
   seed must consult that completed evidence and avoid reusing the completed
   namespace; in the observed Donut state, `SEED-085` was unused.
2. The candidate full identity already appears in the done catalog even though
   its seed has been deleted. Allocate a different identity for the new work;
   leave the earlier completion and its recorded identity unchanged.
3. An existing story is resumed, moved, or relinked. Retain its recorded
   identity instead of allocating another one.

**Boundaries and decisions for refinement:**

- The smallest candidate is a shared allocation procedure reached by existing
  creation workflows. Decide whether any existing creation/admission operation
  also needs a bounded guard; do not assume a new allocator or parallel registry.
- Done records are currently retained for 30 days, and `complete` prunes older
  ones. The catalog is therefore not a permanent history of every allocated
  identity. Resolve how project numbering conventions and recoverable published
  history cover older allocations; do not promise permanent uniqueness from
  the current catalog alone.
- Preserve the existing single identity contract and human conflict handling.
  Instruction wording alone needs a representative allocation exercise with
  active and completed evidence, rather than only a test matching new prose.
- This request queues the story first on `main` and synchronizes it with
  `origin`. It authorizes no implementation, release, or installed-client update.

## Observed Incident and Recovery

The following facts come from the Donut/Codex session on 2026-10-23 (Asia/Tokyo):

- The original task was a small E2E assertion repair. Real-service audio CI run
  [39869492105](https://github.com/nerds-odd-e/doughnut/actions/runs/39869492105)
  at `3c228434` returned `請安靜` where
  `e2e_test/features/note_creation_and_update/record_live_audio_with_real_open_ai_service.feature`
  expected `Please be quiet.`. The next run passed with unchanged product code.
  Terry requested accepting both phrases. The cause of the language choice,
  including whether accent contributed, was not established.
- The agent inspected the remaining seed filenames, whose highest number was
  `SEED-074`, and initially allocated `SEED-075#story-1` without checking the
  done catalog. Admission commit `33cd8e751c4ca183a1182d4b6eb2118b9c06c083`
  published that new home, Taken entry, and Anri-chan profile. The startup
  operation accepted this claim despite the completed identity collision.
- `.planning/done/SEED-075_story-1.json` already identified **Keep the mobile
  note toolbar on one full-width row with a visible options menu**, completed
  at `2026-10-12T12:28:02.156Z` by Terry Yin with Julia-chan on Claude. Its
  completion commit was `a41cff855b`. The done catalog also contained later
  identities through `SEED-084`; deleted seed files had hidden that allocation
  history from the agent's initial filename-only reading.
- The test repair was committed as `0d9e7eaaa4ddd92c7750113e7881a1a0ba3a719b`.
  Four focused browser checks accepted both phrases, rejected unrelated text,
  and exercised delayed-result retries. Cucumber parsing and step delegation
  also passed. Branch CI run `39872896904` passed. The 20-second timeout and
  existing-note-content assertion remained, and product audio code was unchanged.
  The focused browser harness exercised the actual extracted page-object
  assertion against browser DOM; it did not exercise the full recording journey
  or call the paid service locally. A local E2E TypeScript check failed on
  missing generated API modules and unrelated existing diagnostics; those were
  not repaired. Full real-service integration verification came from CI.
- The collision was found before completion bookkeeping. The shared rule that
  ambiguity stops for a human required an additional approval. Terry explicitly
  approved changing this repair to the unused `SEED-085#story-1` while preserving
  the earlier toolbar completion.
- Correction commit `b3bba80754b3b1f1632f09d815088f9d8fb87a31` updated this repair's
  home, backlog link, and profile; the worktree creation reference was corrected
  consistently. Closure commit `fe706b24a66c012b92138ed2929d628f35773714` recorded
  completion under `SEED-085#story-1` and removed spent source and assignment.
  The earlier `SEED-075#story-1` completion record was preserved, not overwritten.
- Integration commit `f0b5d9f1c7cf632c73e24ef02ab4e56b5afdccd1` reached Donut
  `main`; [CI run 39874551175](https://github.com/nerds-odd-e/doughnut/actions/runs/39874551175)
  passed. The local main checkout was synchronized and clean, and the repair's
  temporary worktree and local/remote branch were removed.

## Ownership and Existing Mechanisms

Source inspection on Open Dough `main` at `273a8da1` found:

- `src/skills/dough-product-backlog/references/identity.md` is the single identity
  contract and already prohibits reallocation, but supplies no completed-catalog
  check before choosing a new identity.
- `src/skills/dough-story-decomposition/references/seed-format.md` tells the
  agent to allocate a seed ID in the project's canonical seed directory.
  `dough-execute-plan/references/admit-accepted-work.md` can also require a new
  minimal story for an accepted mission. These are affected entry paths to trace.
- `product-backlog.mjs add` accepts a supplied identity; it does not allocate
  one. Its active-list duplicate check does not consult completed records.
  `complete` documents that completing the same identity again replaces its
  done record: this was a potential consequence, not an observed overwrite.
- The catalog is derived from done-record files and includes identity and blob
  evidence. `catalog-done` is the existing rebuild operation; do not hand-edit
  the derived catalog to implement this story.

For this story's own allocation, the agent checked active seeds, the done
catalog, and published Git path history. The highest observed seed number was
`147`; `SEED-148` was unused at this capture.
