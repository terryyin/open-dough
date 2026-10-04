# Agent assignments and roster

Each **Taken** card shows who holds that work, from the agent profile published
beside the backlog (`.planning/agents/<name>-chan.json`) at the same revision.
The card's scan view shows, beside the agent's portrait and name, the credited
human developer, the tool (host, with its mark), and the model, for example
"Akiho-chan · Terry Yin · Claude Code · <model>". Its detail (**Inspect
story**) shows what the profile records with the mode, for example
"Akiho-chan · Trunk Mode · Claude Code · <model>", and why a human is unknown.
A Story Branch Mode profile's branch is shown there as branch context, never
as work on trunk. A host or model the profile does not record is shown as not
recorded, and a Taken entry without a profile shows "Owner not recorded" on
the card. A profile the shared reader cannot read, or one naming another agent
than its file, is listed with the Taken stage as unreadable and matched to no
entry. A revision without a profile directory simply has no profiles. What a
profile means is decided by the shared profile module under
`src/skills/dough-product-backlog/scripts/`.

A queued card named by a published preparation assignment shows **Preparing**
and that developer's portrait, name, credited human, tool and model, keeping
its priority and badges; its detail shows what the assignment records. It is
never a Taken owner. It disappears when preparation lands or is abandoned.
Unreadable profiles show "Preparation assignment unknown"; two assignments show
as conflicting records.

Each agent portrait on a Taken or Preparing card opens the selected project's
**Agent roster**: all 29 agents with portraits and assignments recorded at the
shown revision (Taken or Preparing, task title/identity, mode, host, model, or
"No assignment recorded"). Work not in the backlog keeps identity with a title
gap; an unreadable profile leaves its agent uncertain, and a failed snapshot or
profile read leaves every assignment unknown. It comes from the same snapshot as
cards, with no read of its own; selecting another project replaces its source.
Stories and roster views have project-aware URLs (`/?project=<id>` and
`/?project=<id>&view=roster`, with default stories at `/`). Browser
Back/Forward and **Back to stories** keep the URL, selected project, view, and
focus coherent; direct roster visits focus the roster heading. An invalid
project URL resolves to the default project's stories and normalizes the URL.

Each assignment, on its Taken or Preparing card, in its story's detail, and in
the roster, names the **human developer** credited for it: the Git committer of
the commit that added its profile's current allocation. The local boundary lists
that profile's history at the shown revision (its ten latest changes) and walks
it back until the change that added the file, so a later modification of the
profile names nobody, and a removal ends the walk before an older allocation of
the same rotating name. When no addition is found, the adding commit names no
usable committer, or the history cannot be read, the card's scan view shows the
short "Human developer unknown" and the detail and roster say why, never
guessing from another commit.
Beside a credited name is the avatar of the GitHub account GitHub matched to
that committer. The local boundary fetches it from the avatar address GitHub
named for that account (only https on GitHub's avatar host, bounded in size,
time, and image type) and keeps it in the running process by that address, so
each avatar version is read from GitHub once however often it is shown, and a
changed one is read afresh; the page names only a profile and revision to the
local boundary. Without a matched account or a usable, fetched avatar, the
name keeps its initials. Neither name nor avatar says anyone is working now.
