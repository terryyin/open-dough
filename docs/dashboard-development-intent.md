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
syntax styling at the observed revision, and says no Proof is available for
it yet. A location that
is missing, holds no `.feature` files, or names an unsupported kind says so
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
