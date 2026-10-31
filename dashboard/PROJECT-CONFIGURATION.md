# Dashboard project configuration

`server/projectConfiguration.ts` owns the saved project list and each project's
repository, ref, backlog path, and local checkout folder. Each environment keeps
its ordered list on this machine in `~/.open-dough/dashboard/projects-production.json`
or `projects-development.json`, resolved through `HOME`. Built preview uses production;
the live dev server uses development. Only a missing file seeds production with
Open Dough, Doughnut, Pygardon, and Terry Talks and their existing refs and folders.
Development starts empty. An existing empty list stays empty; the first saved
project is the default selection. An unreadable or malformed file is reported
with its path and left untouched. The empty page explains that no projects are
configured and directs to **System settings → Projects**. The global banner
keeps the project selector and ends with the **System settings** gear at its
far right, including with no projects. Settings lists each configured name,
repository and local path; **Add project** opens the existing dialog. Back to
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
`"intent": { "locations": [{ "path": "<folder>", "kind": "gherkin" }] }`.
The kind selects which files Intent lists (`gherkin` → `.feature`) and, later,
the syntax grammar of the same name. Absence of the `intent` key means Intent
shows that no locations are configured. An unreadable settings file and
malformed JSON are distinct from that absence. The dashboard reads that
setting and the listed source at the same observed revision as the backlog; it
does not edit the file.

[Dashboard overview](README.md) describes project observation and navigation.
