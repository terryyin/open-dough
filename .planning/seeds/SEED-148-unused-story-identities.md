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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/350-allocate-unused-story-identities/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"bcf881b4aa9a3767f6e8d090caaa56b278845ef73e8ca40cde8cedfdf06e4a47","plan":"2faf89e97279892e47f35c46946cbc16112072be3b5ac877640e95fb58a1baf3"}}
```

**Goal:** A developer or agent creating a story chooses an identity that no
active or completed work has used, by consulting evidence that outlives the
cleanup of completed seeds and story sections, so completing and cleaning up a
story never makes its identity look available again. The backlog operations
that publish a new claim refuse an identity completed work already recorded,
so a missed check cannot mix two stories' ownership and recovery evidence.

**Scope:**

- *One allocation rule in the shared identity contract.* Extend the existing
  work-item identity contract with how a new identity is chosen: a new seed
  number exceeds every seed number observed in the active seed directory, the
  done catalog and records beside the backlog, and the published trunk history
  of those paths; a new story anchor within an existing seed yields a full
  identity that none of those sources records. A removed seed file or story
  section never frees its identity. The workflows that allocate new identities,
  seed creation under the shared seed format and the minimal story drafted for
  admitted or correction work, follow that rule by reference; none restates a
  competing allocation procedure.
- *A read-only evidence operation in the installed backlog script.* One
  `product-backlog.mjs` operation reports the allocation evidence for a
  project: the highest seed number each source shows, with the done-record or
  history reference behind it, and whether a supplied candidate identity is
  listed as active, recorded as completed, or present in published history.
  It reads existing evidence and reserves, registers, and writes nothing; the
  agent still chooses the identity and the canonical home records it. The
  guidance tells agents to run it rather than to read filenames by hand.
- *Completed-identity refusals at the publication gates.* `product-backlog.mjs
  add` and the startup admission (`--admit`) refuse an identity that a done
  record names, reporting the record's identity, title, and completion time,
  and change nothing, consistent with the contract's rule that ambiguity stops
  for a person. The agent allocates a different identity for the new work.
  Take, resume, Preparing assignment, and canonical-home relocation keep the
  identity they already recorded and gain no check.
- *Evidence beyond the retention window.* Done records are pruned after 30
  days, so published trunk Git history of the seed and done directories is the
  durable source for older allocations. The evidence operation names each
  source it could not read, such as a missing catalog or unavailable history,
  instead of reporting the remaining sources as complete. An unreadable or
  missing catalog is not evidence of no completed work: the agent resolves the
  gap, rebuilding the catalog with the existing `catalog-done` operation when
  records exist, before publishing a new home or claim.
- *Preserve existing records and conventions.* Project naming, numeric padding,
  anchor conventions, and existing identities stay as they are. Completed
  records are never edited or overwritten by this work. Renumbering an
  existing story, or deciding between two already published conflicting
  identities, remains a human decision outside this story.

**Deferred:** The `complete` operation's current behaviour of replacing a done
record when the same identity is completed again is unchanged; the refusals
above keep a colliding identity from reaching completion. A hosted or
cross-project identity registry is not built.

**Key examples:**

1. *Seed numbers hidden by cleanup.* Active seed files end at `SEED-074`; the
   done catalog lists completed identities from `SEED-075#story-1` up to
   `SEED-084#...`. Running the evidence operation reports 84 as the highest
   observed seed number and names the done records behind it, so the agent
   creates `SEED-085` for the new story.
2. *Completed identity in a deleted seed.* An agent drafts a new story as
   `SEED-075#story-1`, whose seed file no longer exists, and runs `add` or the
   startup admission for it. The operation refuses, naming the existing
   `SEED-075#story-1` done record, its title, and its completion time, and
   publishes nothing. The agent allocates `SEED-085#story-1`, and the earlier
   completion record stays unchanged.
3. *Allocation older than the retention window.* The done catalog holds only
   records from the last 30 days, but trunk history shows `SEED-090` was added
   and later removed four months ago. The evidence operation reports 90 from
   history with its commit, so the next seed is numbered above it; the agent
   does not reuse `SEED-090`.
4. *Missing catalog.* Done record files exist beside the backlog but
   `done/.catalog.json` is absent. The evidence operation reports the catalog
   as unreadable, still reads the record files it can, and names the gap. The
   agent rebuilds the catalog with `catalog-done` before allocating.
5. *Resume and relocation retain identity.* A queued story's seed is renamed,
   or a Taken story resumes in a new session. No allocation happens: the
   recorded identity carries across, and `add`, Take, and resume behave as
   before.

**Architecture:** The done-record and done-catalog readers in the
product-backlog scripts already own completed-work evidence, and the admission
path already imports them (history-preserving candidate). The refusals and the
evidence operation reuse those readers rather than adding a second reading of
`done/`. Trunk history reading joins the existing product-backlog Git modules.
No new state file, lock, or registry is introduced; the catalog remains derived
from record files.

**Boundaries and decisions resolved in refinement:**

- The bounded guard is placed at the two operations that publish a new claim
  (`add` and admission); they are the only paths by which an unchecked
  allocation reached trunk in the observed incident.
- The 30-day catalog is not the permanent allocation history; published Git
  history of the seed and done paths is, and the evidence operation reads it
  so that the agent does not reconstruct it by hand.
- Instruction wording is proved by a representative allocation exercise with
  active seeds, done records, and history present, in addition to the script's
  focused tests; a test that only matches new prose is insufficient.
- This story authorizes no release or installed-client update; Donut and other
  projects receive the behaviour through an ordinary Open Dough release.

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
