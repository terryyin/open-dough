# Dashboard project configuration

`server/projectConfiguration.ts` owns the saved project list and each project's
repository, ref, backlog path, local checkout folder, and optional `hidden`
flag (absent means visible). Each environment keeps
its ordered list on this machine in `~/.open-dough/dashboard/projects-production.json`
or `projects-development.json`, resolved through `HOME`. Built preview uses production;
the live dev server uses development. Only a missing file seeds production with
Open Dough, Doughnut, Pygardon, and Terry Talks and their existing refs and folders.
Development starts empty. An existing empty list stays empty; the first visible
saved project is the default selection. An unreadable or malformed file is reported
with its path and left untouched. The empty page explains that no projects are
configured and directs to **System settings → Projects**; when every configured
project is hidden, the page explains that all projects are hidden and directs to
**System settings → Projects** without presenting any project's Board or Intent.
The global banner keeps the project selector for visible projects and ends with
the **System settings** gear at its far right, including when no project is
visible or configured. Settings lists each configured name,
repository, local path, and hidden state; **Add project** opens the existing dialog. Back to
dashboard and browser Back/Forward return to the preceding project/view with
useful focus. Opening settings preserves the mounted dashboard, Sessions sidebar
and attached terminal.
The dialog asks for a GitHub repository URL (HTTPS, with or without `.git`, or SSH)
and Local path, prefilled as `~/git/<repo>`. Add checks the developer's local `gh`
access and the checkout's origin, derives the default branch, saves the project,
and selects it. The repository name supplies the project id and label; duplicate
repositories or ids are refused because saved sessions are keyed by project id.
The selected default branch is saved at add time, and the backlog path is
`.planning/PRODUCT-BACKLOG.md`. Local path must name the checkout root; `~`
expands to the home folder, and a different checkout folder is allowed. Cancel or Escape
saves nothing and returns focus to Add project. An invalid entry keeps its values
and shows the reason beside the field. Projects added in development do not enter
production's saved list.
**Hide project** and **Show project** on each settings row toggle that
environment's saved visibility without a confirmation dialog. A hidden row
states `Hidden from dashboard`, stays in the environment's saved list for
release updates and feedback maintenance, and leaves project tabs, the compact
selector, and Left/Right cycling. Hiding the selected row selects its next
visible neighbor or the first remaining visible project; hiding every project
presents no Board or Intent content while keeping System settings and open
Sessions sidebar entries reachable. Showing a hidden project restores it to
navigation without re-adding it.
**Remove project** on each settings row asks for confirmation naming that
project. Confirm removes only that environment's configuration entry. Removing
an unselected row preserves selection; removing the selected row selects its
next neighbor or the first remaining project. Removing the last project leaves
settings usable, with Add project and Back to dashboard's empty page. Nothing on disk or GitHub changes: checkouts,
running sessions, and saved launch/session records remain. Removed sessions leave
Recently done and the Sessions sidebar; adding the same repository restores them.
Cancel or Escape keeps the entry and returns focus to Remove project.

Each project's repository may also publish Intent locations in
`.planning/open-dough.json` as
`"intent": { "locations": [{ "path": "<folder>", "kind": "<kind>", "include": ["<pattern>", ...] }] }`.

An optional `label` names a location in the browser and its summary, for example
`"label": "Dashboard Backend Test"`. The repository `path` remains its identity
for selection, source reads and CI proof. A blank or non-string label falls back
to the path; omitting the label preserves the path title.

The kind selects which files Intent can list and the syntax grammar of the same
name: `gherkin` (`.feature`), `typescript` (`.ts`, `.tsx`), `javascript`
(`.js`, `.mjs`, `.cjs`), `python` (`.py`), or `shell` (`.sh`, `.bash`). An
optional `include` list of path patterns relative to the location narrows that
set (`*` stays in one folder; `**` crosses folders). Without `include`, Intent
lists every file of the kind under the folder. Absence of the `intent` key
means Intent shows that no locations are configured. An unreadable settings
file and malformed JSON are distinct from that absence. The dashboard reads
that setting and the listed source at Intent's reading revision, a revision
the backlog observed, which moves to a newer observed one only on **Show
latest**; it does not edit the file.

[Dashboard overview](README.md) describes project observation and navigation.
