# Dashboard agent assignments

Part of the [project visibility requirements](project-visibility-requirements.md).
Their discussion status, scope, and source apply to this page.

## Agent profiles and rotating names

Open Dough ships one fixed rotation of 29 agent names, starting at Yui and
ending at Rina. An agent's identity is `<Name>-chan` with email
`<lowercase name>-chan@example.org`. These names identify agent developers,
not human contributors.

Each active agent has one JSON profile at
`.planning/agents/<lowercase name>-chan.json` beside the backlog. It records
the agent name and email, the work item identity, and its activity: either
execution, with its execution mode and branch context (the owned execution
branch in Story Branch Mode, remote trunk in Trunk Mode), or preparation of a
queued story, which records no mode or branch. When the agent reports them, it
also records its host tool (Claude Code, Codex, or Cursor) and AI model.
Execution profiles written before activities existed record none and read as
execution. Separate files keep parallel claims from contending for one shared
file.

- **Assignment.** The shared startup operation (`execution-start`) selects the
  name, writes the profile, and commits it with the Take. A name is held while
  its profile exists on remote trunk. The next name follows the profile most
  recently added on trunk, skipping held names and wrapping after Rina, so a
  released name is not reused at once. With no prior profile the rotation
  starts at Yui. The name is chosen on the trunk the workspace is built on, so
  a name published while startup fetches is skipped rather than stopping the
  Take. When every name is held, the Take is refused and nothing is published.
  When a lost publication race finds the selected name now held, the claim is
  rebuilt on the new trunk under the next available name. Preparation start
  (`preparation-assignment start`) assigns a name from the same rotation when
  refinement or planning of a queued story begins, publishing a commit that
  adds only its preparation profile; the story stays queued. Each profile is
  one allocation, identified by its path and the commit that added it.
- **Authorship.** The agent is the Git author of its coordination commits (the
  Take and the preparation announcement and end) and, through the guided agent
  commit, of the commits it makes for its own work in its owned workspace,
  including closure and amended commits and the merge commit that integrates
  its published Story Branch into trunk, whether made directly or by the
  product-backlog merge adapter; the configured Git user remains the
  committer. Each such commit credits that developer once as a
  `Co-authored-by` trailer, read at commit time from the effective committer
  identity of the checkout making it, never from a fixed account, beside any
  co-authors the message already names, such as a model trailer. A message
  that already credits the developer's email, whatever the trailer key case,
  email case, or display name, keeps that one credit, and a rebase replays an
  owned commit's message unchanged, so neither amendment nor replay duplicates
  or drops a trailer. A missing, malformed, or agent-equal committer refuses
  the commit before anything is committed or published
  (`developer-identity-refused`). Startup and preparation start configure the
  agent author through per-worktree Git config, so other checkouts keep their
  usual author and gain no trailer. In a bare repository whose shared config
  sets `core.bare=true` or `core.worktree`, enabling per-worktree config would
  break every checkout, so it is left untouched: only coordination commits are
  authored by the agent, the receipt reports
  `workspaceAuthorship: "not-configured"` (otherwise `"configured"`), and
  ordinary commits there are the developer's own. Historical commits are not
  rewritten. GitHub attributes the credit only when the configured email
  belongs to the developer's account, which is their Git setup, not checked
  locally. Commit authors and co-authors are the history trace; the profile
  records current ownership, so a developer-authored commit naming the agent
  as co-author still belongs to the assignment its published profile names.
- **Resume and release.** Resume keeps the profile and restores the
  workspace's authorship from it. Completing the Taken entry through
  `product-backlog complete` deletes every readable execution or preparation
  profile naming that identity in the same change, releasing those names.
  The done record credits the execution agent, when recorded; preparation
  profiles do not supply execution credit. Other work's profiles and
  unreadable profiles remain untouched. A preparation assignment is also
  released when its kept result lands (the landing removes the profile beside
  the result), when its
  workspace explicitly abandons the preparation, or, when that workspace is
  lost, when a developer confirms that one exact allocation is abandoned and
  the release is addressed by profile path and allocation. A release of an
  allocation that trunk already ended publishes nothing and never removes a
  later allocation of the same name. Silence, age, a missing process, or a
  lost workspace alone never releases a name; an abandoned profile keeps its
  name held until one of these releases.
- **Dashboard.** Each Taken card's scan view shows the agent's portrait and
  name from the published profile. A queued card whose story has a published
  preparation profile shows Preparing and its developer's portrait and name.
  The story's inspected detail shows the assignment's mode, branch context,
  host, model, and credited human developer; the agent roster shows mode,
  host, model, and credited human developer beside each assignment. Branch
  context is labelled as story branch work, never as work on trunk. A missing
  profile shows "Owner not recorded" on the card, a missing field shows as not
  recorded in the detail and roster, and an unreadable profile is listed as
  unreadable without being matched to any entry. Decorative identity marks
  sit beside their own text labels: the agent's portrait beside its name on
  the card, and, in the detail and roster, the mode symbol beside the mode and
  the host tool's mark beside the host. Hovering the portrait shows it larger
  in place, over the card, without moving the owner line; each rotation
  agent's gesture strip plays once in that enlargement on each hover and
  settles on the still portrait, which reduced motion shows without the
  gesture. Text alone carries each fact; no mark is drawn for an unrecorded or unreadable fact, and no mark implies that an
  agent is present or active.

## Future messaging and handover

A later possibility is to address messages to a named developer through a
commit mailbox or a similar repository-backed mechanism. Another agent or a
human could send a message and wait for that developer's response.

Terry suggested a response deadline, for example ten minutes, after which the
developer could be considered gone and someone else could continue the work.
The mailbox mechanism, deadline, and takeover protocol are exploratory, not
requirements for the first dashboard phase.

An unanswered message establishes a lack of observed response, not proof that
the previous agent has stopped. Later design must settle how reassignment
prevents competing owners, how a late response or returning agent is handled,
and how recycled names remain distinguishable from earlier assignments.
