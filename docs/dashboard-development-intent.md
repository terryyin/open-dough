# Development and Intent

Part of the [Dashboard navigation guidance](dashboard-navigation.md), under the
[Dashboard UX/UI North Star](dashboard-ux-ui-north-star.md). Its authority, scope,
and revision policy apply here.

Development is the first-visit default perspective: the stories or agent
roster, near-future direction, Start session and published-state
qualifications. Intent replaces that content with the project's Purpose and
Proof reading surface. When the selected project's
`.planning/open-dough.json` publishes `intent.locations` of kind `gherkin`,
Intent lists each location's nested `.feature` files in a collapsible tree,
reads a selected file's exact published text with line numbers and Gherkin
syntax styling at the observed revision. When the location also declares a
`proof` directory of committed Cucumber proof (the
[Cucumber proof reference](../src/skills/dough-test-optimization/references/cucumber-proof.md)),
Proof lists the file's scenarios and outline rows in source order, each with
its latest observation's outcome (retry-assisted passes marked), duration,
time since, commit, and whether it was observed on this file version, or
_Not observed_, under a count line of those latest outcomes; proof files are
read once with the locations at that revision. A file with nothing observed
yet in that directory says so. A proof file that could not be read, or is not
valid proof, is reported by name as a read failure with retry, never as _Not
observed_, and the retry reads the locations again without changing the
selection or Purpose. Without a declared directory, Proof says it is not
recorded for the project and names the installed reference to follow; other
kinds say Proof is read only for Gherkin files so far. The selected
perspective choice names the page, so Intent shows no heading of its own. Below the banner the page does not
scroll: the location tree fills the remaining height against the left edge,
and it and the reading pane each scroll independently. Directly under the
banner, a strip of two Intent reading modes, **Intent** and **Optimization
Candidates**, chooses what that content shows; it belongs to Intent and is
not a third perspective. Entering Intent selects **Intent**: the location
tree, which holds only Purpose locations, beside Purpose and Proof.
**Optimization Candidates** shows the project's published Test Optimization
Candidates record at the observed revision across the content area without
the location tree; the record is read the first time that tab is chosen.
Choosing a location an entry names selects **Intent** with that file's
Purpose and Proof, and choosing **Optimization Candidates** again returns to
that entry without reading the record again. The choice is disposable page
state, not on the URL; a project change or a new revision starts again on
**Intent**. A location that is
missing, holds no `.feature` files, or names an unsupported kind says so
by path or kind while other locations stay usable; a failed file read says so
and offers retry. When that setting is absent, Intent says no intent locations
are configured and names the setting and file; it shows no empty tree. An
unreadable or malformed settings file is a distinct explanation from absence.
Structure and Purpose/Proof layout switching are not offered yet. The perspective is disposable
presentation state on the URL (`perspective=intent`), independent of
Development's stories/roster view, which Intent keeps to return to. Choosing
a perspective adds one history entry and never selects another project;
changing projects keeps the perspective, and Back/Forward, reload and System
settings restore it. Story URLs, story references and choosing a Sessions
sidebar entry open Development's stories, including from the same project's
Intent. Changing perspective neither starts, stops, completes nor reattaches
a session: the mounted Board, Sessions sidebar and Side panel (terminal,
final report or story review) stay as they were, and a covering panel stays
open. When the change hides the content holding the keyboard, the keyboard
moves to the selected perspective's choice.
