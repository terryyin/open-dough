---
id: SEED-295
status: active
planted: 2026-11-10
scope: story
---

# View each project's Open Dough configuration in dashboard settings

<a id="inspect-project-configuration-in-dashboard"></a>

### View each project's Open Dough configuration in dashboard settings

**Identity:** SEED-295#inspect-project-configuration-in-dashboard
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/570-inspect-project-configuration-in-dashboard/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"2d9939a04202c16814ce9b78c7292dd22d44856057fbeba51cd3bc567580796a","plan":"d730dcf33709343f28c7eac7b868388f6036eddc140b158847a503660b5018ae"}}
```

#### Goal

A maintainer using **System settings → Projects** can inspect each configured
project's Client configuration (`.planning/open-dough.json` in that project's
local checkout) without opening the checkout in an editor, so they can see what
that machine's dashboard checkout holds for Open Dough without leaving settings.

#### Scope

Required behavior:

- **Where.** On each project entry under **System settings → Projects**, the
  maintainer can see that project's Client configuration. The Projects list,
  local path, add/hide/remove, and other settings sections stay available.
- **Source.** For each configured project, read `.planning/open-dough.json`
  from that project's configured local checkout path on this machine. Do not
  substitute another project's file, a published GitHub revision, or a cached
  copy from a different project.
- **Readable file.** When the file exists and can be read as text, show that
  project's file text (including unrecognized keys and invalid JSON). Opening
  or leaving the view does not write the file.
- **Absent or unreadable.** When the file is absent, or the checkout path or
  file cannot be read, that project's entry explains the condition. It does not
  show another project's settings or invent defaults as if they were the file.
- **Read-only.** Provide no editing or saving actions for Client configuration
  in this story.

Required restrictions: none beyond the read-only promise. Isolating each
project's file is required correctness for the stated goal, not an arbitrary
cap.

Scope limits (not undertaken): editing or saving `.planning/open-dough.json`;
comparing two projects side by side; showing the published GitHub revision that
Intent or the agent roster use; interpreting or validating individual keys for
the maintainer; opening the file in an external editor from settings.

Deferred promises: published-revision inspection or local-vs-published
comparison; structured field explanations; editing from the dashboard.

#### Key examples

1. **Different projects, different files.** Projects A and B are configured
   with distinct local checkouts whose `.planning/open-dough.json` texts differ.
   Opening **System settings → Projects** → A's entry shows A's file text; B's
   entry shows B's. Neither entry shows the other's content.
2. **Absent file.** Project C's checkout has no `.planning/open-dough.json`.
   C's entry explains that the Client configuration file is absent. Other
   projects that have readable files still show theirs.
3. **Unreadable.** Project D's local path is missing or the file cannot be
   read (for example permission or I/O failure). D's entry explains that the
   configuration could not be read. It does not fall back to another project.
4. **No write.** A project's file is readable. The maintainer opens settings,
   views the configuration, and leaves settings. The file bytes are unchanged.
5. **Invalid JSON still inspectable.** A project's file exists as text but is
   not valid JSON. The entry shows that text so the maintainer can see what is
   on disk; it does not treat parse failure as another project's settings.

#### UX/UI

**User.** A maintainer already using System settings to manage which projects
this machine's dashboard observes.

**Task and context.** Check what Client configuration each configured checkout
holds, beside the existing GitHub repository and local path facts, without
switching to an editor.

**Interaction.** Keep the inspection on the project entry in **System settings
→ Projects**. Do not place it in the Side panel (terminals, final reports, and
story reviews) or invent a separate settings page. Show or disclose the file
text within that entry so the maintainer can reach it from the Projects list.
When absent or unreadable, the explanation is on that same entry. Feedback is
the shown text or the per-project explanation; recovery is retrying the
settings load or fixing the checkout outside the dashboard. No edit controls.

#### Architecture

Client configuration is the project-owned `.planning/open-dough.json`
([ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md)).
Machine-local project configuration (which checkouts this dashboard observes)
remains separate from published repository workflow records
([ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)).

This story adds a read-only settings responsibility: for each configured
project, read Client configuration from that project's local checkout and
present it under System settings. It does not move Intent's or the agent
roster's published-revision reads, does not write the file, and does not make
the dashboard authoritative for Client configuration contents. No Accepted ADR
conflict.

#### Challenge, clarify, and investigate notes

**Challenge.** The purpose is inspecting each configured project's Client
configuration from settings without an editor. Showing the local checkout file
meets that purpose on the machine-local settings surface. The strongest
consequential doubt is mistaking this view for what Intent or the agent roster
consume (published revision at observation time). That is a scope boundary, not
a failure of the purpose: this story owns the local file; published-revision
inspection stays deferred.

**Clarify.** Smallest scope that still delivers the purpose is per-project
local file text (or a clear absent/unreadable explanation) on the Projects
entries, read-only. Competing interpretation "show only validated JSON
settings" was deferred in favor of inspectable on-disk text.

**Investigate.**

| Claim | Status | Source / observation |
| --- | --- | --- |
| Projects settings lists each configured project with repository and local path | Fact | `dashboard/src/SystemSettings.tsx`; GET `__project-configuration/settings` returns `{ id, localPath }[]` |
| No settings UI shows Client configuration file text today | Fact | Projects section shows label, repository, local path, hide/remove only |
| Intent and agent roster read `.planning/open-dough.json` at a published revision, not necessarily the local working tree | Fact | `dashboard/PROJECT-CONFIGURATION.md`; Intent locations / authenticated profile reads |
| Local CI configuration already reads the checkout file for other features | Fact | `readCiConfiguration` via project folder path |
| Ordinary install preserves unrecognized keys byte-for-byte | Fact | `docs/installation-and-updates.md` |
| This workspace's `.planning/open-dough.json` exists and is valid JSON | Observed | file present; parses as JSON |

No remaining hypothesis blocks goal or scope.
