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

The dashboard currently shows an agent beside an individual story, but a
developer cannot start from that agent and see the full roster for the selected
client project. They also cannot see the human developer working with the agent
beside the agent on the current dashboard. A project-wide view would make
commissions and their human partnerships easier to understand without opening
each story or interpreting raw records.

## Story

<a id="project-agent-roster"></a>

### See all project agents, their commissions, and human partners

**Identity:** SEED-049#project-agent-roster
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

- **For / why:** A developer viewing a client project can see which agents are
  commissioned, what they are undertaking, and which human developer is
  credited with their work.
- **Goal:** Clicking an agent's portrait in the current dashboard opens a
  project-scoped agent overview. It shows a thumbnail and name for every agent
  in the roster, whether each is commissioned, and, for commissioned agents,
  the recorded task, preparation or execution activity, credited human
  developer, IDE/host tool, and model. A Back button at the top returns to the
  project dashboard. The current dashboard also shows the human developer's
  name and avatar beside the agent's identity.
- **Evaluation:** From a Taken or Preparing card, a developer can open the
  roster through the agent portrait, find that agent among all roster members,
  inspect its commission and return to the same project view. An uncommissioned
  agent is visibly distinguished from an agent with a published assignment.
  The human developer shown beside an agent is supported by the relevant Git
  commit attribution; the avatar is obtained from GitHub and cached. If the
  commission, host, model, human identity, or GitHub avatar cannot be established,
  the dashboard shows the known facts and an honest missing or uncertain state.
- **Value / learning:** Lets developers understand agent capacity and human
  collaboration across the project, and tests whether an agent-centered view
  complements the existing story-centered dashboard.
- **Effort hypothesis:** Unestimated; refine the commit-to-commission and
  GitHub identity lookup before sizing.
- **Depends on:** The existing published agent profiles, agent portraits, and
  dashboard project selection. No new product prerequisite is established
  during capture.
- **Safe stopping point:** The roster and human identity are readable for the
  selected project without requiring live agent presence or a dashboard control
  for assigning work.

## Key Examples and Boundaries

- All 29 named agents appear for the selected project. A published preparation
  profile shows a preparation commission; an execution profile shows its Taken
  task. An agent without a published profile shows no current commission.
- The overview uses the profile's recorded host tool and model when present.
  It does not infer them from a portrait, commit, or currently open IDE.
- Human developer identity comes from the commission's relevant commit
  attribution, including the existing developer credit on agent commits.
  GitHub supplies a matched person's avatar, cached for display. A missing or
  ambiguous attribution or GitHub match remains explicit; the dashboard does
  not attach an unrelated person's portrait to the agent.
- A commission is a recorded assignment, not evidence that the agent is
  online or currently working. Back navigation retains the selected project
  and returns to the prior dashboard context.

## Open Decisions for Refinement

- Which commits identify the human developer for a preparation versus an
  execution commission, especially before the agent has made a work commit or
  when multiple humans are credited?
- How should GitHub identity matching and avatar caching work across the
  dashboard's supported projects and its existing source-access boundaries?
- How should the roster present unreadable or conflicting agent profiles and
  preserve navigation context across refreshes or project switches?

## Ordering and When to Surface

First in the product backlog as requested. Refine the attribution and source
behavior before implementation; this capture does not change existing
dashboard or agent-profile rules.

## Breadcrumbs

- Maintainer request on 2026-09-27: clicking an agent avatar should open a
  client-project overview of all agent thumbnails and commissions, with task,
  human developer, IDE/host tool, model, a Back button, and human name/avatar
  on the current dashboard; obtain and cache a GitHub avatar.
- [Product backlog](../PRODUCT-BACKLOG.md).
- [ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  keeps workflow facts in authoritative repository records and dashboard views
  derived from published evidence.
