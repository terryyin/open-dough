---
id: SEED-049
status: active
planted: 2026-09-27
planted_during: Maintainer request for a project-wide agent overview in the dashboard
trigger_when: A developer wants to inspect an agent or understand who is commissioned in the selected project
scope: 1 story
---

# SEED-049: See all project agents and their commissions

## Why This Matters

The dashboard identifies agents beside individual stories, but a developer
cannot open an agent-centered view of the selected client project. It also
omits the human developer who commissioned an agent, although that person is
credited in the assignment commit. The developer needs one place to see the
roster, each current commission, and the human beside the agent on the existing
story cards.

## Story

<a id="project-agent-roster"></a>

### See all project agents, their commissions, and human partners

**Identity:** SEED-049#project-agent-roster
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/123-agent-roster-overview/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"cc564d80946600a1b3b19cccfe6e7340e0f3e1a40f9feb32c351e5a56cd25ac4","plan":"00a28e39f7de95fe5719f1baa0863fce6bbce3822288a123fc125ad8eb508b60"}}
```

**Goal:** A developer viewing one client project can open its agent roster
from an agent portrait, see which of the 29 named agents have published
commissions and what each is preparing or executing, recognize the human
developer credited for a commission, and return to the story dashboard.

**Scope:**

- Each agent portrait on a Taken or Preparing card opens the roster for the
  selected project and identifies the agent clicked. The roster shows all 29
  existing portraits and names. A Back button at the top returns to the same
  project's story dashboard and its prior reading context.
- A readable current agent profile supplies a commission's task title and
  identity, Preparing or Taken activity, and the recorded IDE/host tool and
  model. If its story cannot be read, show the recorded identity and a title
  gap. When profiles are read successfully, a roster member without one is
  labelled not commissioned.
  Unreadable or conflicting profile evidence stays uncertain rather than
  becoming a negative or a live-presence claim.
- For a current commission, the human developer's name comes from the Git
  committer of the published commit that added that profile allocation.
  GitHub's matched committer account supplies its avatar. Show the human name
  and avatar beside the agent on the existing Taken or Preparing card and in
  the roster. Cache the retrieved avatar for display without making it a
  separate authority for project state. If GitHub cannot match an account or
  supply an avatar, retain a supported human name and a text fallback; if the
  assignment commit or human identity cannot be established, say so.
- The view uses the dashboard's selected project and existing published
  revision, local authenticated GitHub read boundary, agent roster and
  portraits. It does not require a new project selector, agent profile field,
  database, or direct browser API call to GitHub.

**Key examples:**

1. A project has one Taken and one Preparing agent profile. The developer
   activates the Taken agent's portrait → the roster opens with that agent
   identified, both commissions show their respective tasks and recorded
   host/model, and the other named agents show no commission. Back returns to
   the same project's story dashboard.
2. The profile addition commit credits a human committer with a matched
   GitHub account → the human's name and cached GitHub avatar appear beside
   the agent on the story card and roster. A profile whose host or model was
   never recorded says so without guessing from the current IDE or model.
3. GitHub has no account match for the recorded human → the supported Git
   committer name remains visible with a text fallback. An unreadable profile
   or an attribution read failure is shown as uncertain, not as an available
   agent or an anonymous human with a guessed avatar.
4. The selected project changes, or its published revision changes → the
   roster and human attribution reflect only that project's current published
   assignments; an old response cannot attach a person to a different
   project or allocation.

**Deferred promises:** Historical commissions, an aggregate across projects,
live presence, local worktree state, commission controls, and a general people
directory are outside this story. Existing portrait artwork and the 29-name
rotation remain the roster source.

**Source decision for this story:** The profile allocation's addition commit
identifies the commissioning human. This is the commit that established the
current assignment, not an arbitrary later work commit by the same agent.
GitHub's commit response distinguishes the Git committer name from the matched
GitHub account; the latter may be absent. Attribution and avatar reads are
bounded to profiles in the selected project's published snapshot.

<a id="roster-evidence-correction"></a>

### Keep roster and human credit honest under slow or odd evidence

**Identity:** SEED-049#roster-evidence-correction
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/125-roster-evidence-correction/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e43ef3139833f3d60f999904568d5c2852a081592e772fae91d7fe99cc8c56fe","plan":"77c86066b5629e2399917be332c349617423fdaa19b8a14ca0521d14fc58b3fb"}}
```

**Goal:** A developer reading the agent roster and story cards gets slice
clocks as promptly as before human credit existed, never sees a rotation
name falsely called not commissioned, reads uncertainty rather than a
perpetual "reading" state, and sees the current avatar of the credited
account. The roster's facts and the Take's slice clock follow one allocation
rule, with one vocabulary and a suite free of repeated proof. This corrects
the [project agent roster](#project-agent-roster) execution and adds no
feature promise.

**Scope:** attribution timing within the snapshot read; profile-name
validation shared with the execution scripts; the roster without a readable
snapshot; avatar cache keying; dating the Take from the allocation's
addition; commission wording across cards, roster, code, and the UX North
Star; and consolidation of the roster, attribution, avatar, and boundary
tests. Correction plan:
[125-roster-evidence-correction](../slice-plans/125-roster-evidence-correction/PLAN.md).

## Ordering and When to Surface

First in the product backlog as requested. Refinement and planning do not
authorize execution.

## Breadcrumbs

- Maintainer request on 2026-09-27: clicking an agent avatar should open a
  client-project overview of all agent thumbnails and commissions, with task,
  human developer, IDE/host tool, model, a Back button, and human name/avatar
  on the current dashboard; obtain and cache a GitHub avatar.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  keeps workflow facts in authoritative repository records and dashboard views
  derived from published evidence.
