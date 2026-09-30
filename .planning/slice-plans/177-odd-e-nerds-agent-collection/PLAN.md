# Select the Odd-e nerds agent names and avatars through configuration

## Source and authority

- **Identity:** SEED-060#odd-e-nerds-agent-collection
- **Source:** [refined story](../../seeds/SEED-060-odd-e-nerds-agent-collection.md#odd-e-nerds-agent-collection)
  (Goal, Scope, Key examples, Decided; Terry, 2026-09-30).
- **Authority:** planning only. This plan grants no Take, implementation, or
  publication beyond landing the preparation.

## Goal and scope

A developer sets `nerds` in `.planning/open-dough.json` and new agent
assignments take names from the 26 Odd-e members (`stanly-chan`, `ZiQingLau-chan`
…), shown with that member's photo on Taken/Preparing cards and in the roster.
With no setting, the current 29 names and portraits are used unchanged. Included:
the collection, the setting, name selection, portraits, roster listing. Excluded
(seed): publishing the photos, other collections, a collection editor. Photos live
only in the git-ignored `dashboard/public/agent-avatars/odd-e-nerds/<lowercase name>.jpg`
(Terry has them locally; permission to push is his to obtain). Names are the Slack
names with spaces removed; identity keeps `<name>-chan`, lowercase profile file and
email. Value shape: `"nerds": true`; any other value is refused with a message.

## Direction followed

[ADR 0001](../../../docs/adrs/0001-ubiquitous-language-accepted.md): settings live in
`.planning/open-dough.json`, introduced for a demonstrated need (this story). No other
Accepted ADR or North Star topic constrains the work.

PFE: reuse the single rotation module `product-backlog-agent-profile.mjs` (shared by
skills scripts and the dashboard), the single selection point `selectAgent`
(`agent-assignments.mjs`, used by execution and preparation start), and the existing
portrait component. Gap: the module holds one fixed name list and no reader for
`open-dough.json` exists in scripts.
Design: identity/profile-recognition functions (`agentIdentity`, `profileAgentName`,
`agentForName`) accept the names of every collection, so a profile written under either
collection stays recognized after the setting flips; only *selection* (and the roster
listing) depends on the setting.

## Decisive premises (observed 2026-09-30 in the preparation workspace)

| Premise | Consuming operation | Observation | Result |
| --- | --- | --- | --- |
| No name overlaps between collections | profile-file → name lookup | python set intersection of lowercased lists | empty; slice 1 also asserts it |
| One function selects the name for both execution and preparation | new assignment | `grep -rn "nextAgentName\|selectAgent" src --include='*.mjs'` | only `selectAgent` (agent-assignments.mjs) calls `nextAgentName`; execution-start-agent uses it directly, both from rev |
| Names with `.` are legal profile/email/file parts | profile path `d.kanai-chan.json`, email | read `agentIdentity` | only lowercase + suffix, no character rules |
| Dashboard cannot read the setting today | roster listing | read `reachablePaths.ts` | reads are allowlisted to backlog-named records and profiles; `.planning/open-dough.json` is unreachable — slice 4 adds it (probe first) |
| Portrait folder is served from `dashboard/public` | card portrait | `ls dashboard/public/agent-avatars` | atlases live there; `dist/` is ignored build output; photos placed under `public/.../odd-e-nerds/` |

## Outside-in proof

Skills scripts: `tests/support/product-backlog-agent-profile.test.mjs` and the existing
real-Git assignment tests in `src/skills/dough-story-refinement/scripts/` and
`src/skills/dough-execute-plan/scripts/` (fixtures already create profiles in a temp
repo). Dashboard: `dashboard/tests/agent-roster.spec.ts`, `agent-roster-avatar.spec.ts`
and `authenticated-avatar.spec.ts` (Playwright with the fake GitHub). Local runs are the
focused files only; the whole suite is CI's.

## Slices

### 1. Every collection's names are recognized as agents
Type: Structure (enables slice 2)
Status: done
Proof: existing profile tests stay green unchanged; new cases: `agentIdentity("stanly")`
gives `stanly-chan`, `stanly-chan@example.org`, `agents/stanly-chan.json`;
`agentIdentity("ZiQingLau").path` is `agents/ziqinglau-chan.json`;
`profileAgentName("d.kanai-chan.json")` is `d.kanai`; the two collections share no name.

The rotation module holds two named collections (current, nerds with the 26 names) and
the lookups above search all of them; `agentNames` keeps meaning the current rotation.

### 2. The `nerds` setting selects the nerds rotation for new assignments
Type: Behavior
Status: done
Proof: real-Git assignment tests: repository without the setting → next name follows the
current rotation; `{"nerds": true}` in `.planning/open-dough.json` at the revision → next
name is `terry` first, then the next free nerds name; setting turned on while `Yui-chan`
holds a profile → that profile stays held and recognized, the next assignment is a nerds
name; setting `"nerds": "yes"` or unreadable JSON → assignment refused with a message that
names the file and key; all 26 held → the existing "every name is held" stop. Documented in
`docs/installation-and-updates.md` beside `skipProcessRetrospective`.

Pre-condition: a queued story and a project repository at a revision → trigger: an agent
starts preparation or execution → post-condition: the profile committed on trunk is named
per the setting at that revision.

### 3. Cards show the nerds member's photo
Type: Behavior
Status: done
Proof: Playwright: a Taken card whose profile is `stanly-chan` shows `odd-e-nerds/stanly.jpg`
as its portrait (enlarged on hover as for others); the same card with the photo file absent
shows the name and no portrait, and no error; a current-collection agent still shows its
atlas tile. `.gitignore` gains `dashboard/public/agent-avatars/odd-e-nerds/` (verified with
`git check-ignore`) and `dashboard/public/AVATARS.md` states the photos are local-only.

Pre-condition: the ignored photos exist locally → trigger: dashboard shows a nerds-named
assignment → post-condition: that member's photo appears beside the name.

### 4. The roster lists the selected collection
Type: Behavior
Status: done
Proof: probe first: the fake-GitHub read of `.planning/open-dough.json` at the pinned
revision is allowlisted and returns `{"nerds":true}`; a failed or absent read means the
current collection. Then Playwright: setting absent → 29 agents; `nerds` set → 26 nerds
entries with portraits; a current-collection agent still holding an assignment while
`nerds` is set is also listed with its assignment (existing work stays visible); unreadable
setting → roster says the collection is unknown rather than guessing.

Pre-condition: the selected project's snapshot → trigger: open the Agent roster →
post-condition: the roster names the agents of the collection the project selected.

## Current decisions

- `nerds: true` is the setting; extra collections are out of scope (seed).
- A profile from either collection stays recognized whatever the setting says.
- Photos never enter Git in this delivery.
- A failed (non-404) read of the setting fails the roster read visibly rather than falling back to the current collection; only a 404 means absent.
