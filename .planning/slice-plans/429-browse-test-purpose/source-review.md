# Source review: SEED-192#browse-test-purpose

Launch: fresh general-purpose reviewer, no conversation inheritance, no
repository reads. Input: Goal, Scope (required behavior, deferred promises,
required restrictions, boundary assumptions), and Key examples 1–8 from
`.planning/seeds/SEED-192-review-product-intent.md#browse-test-purpose` only.
No plan, return, product, or proof was supplied.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer reviewing Doughnut’s or Pygardon’s product intent can open Intent, find a Cucumber feature in the project’s configured Gherkin locations, and read its exact published source, styled for reading, without opening an editor. | slice 5 | |
| 2 | This work tests whether explicit project-owned locations make real test source easy to find. | slice 5 | |
| 3 | This work replaces the frame’s forthcoming notice with the first Purpose reader. | slice 2 | observed: intentPerspectivePage.ts expectNotConfiguredIntent + IntentPerspective browse/read |
| 4 | Usefulness compared with the editor workflow stays Terry’s judgment. | slice 5 | |
| 5 | A project lists its intent locations in its repository’s `.planning/open-dough.json`, each a repository folder and an explicit source kind. | slice 2 | observed: PROJECT-CONFIGURATION.md intent.locations; intent-gherkin-browse publishes settings |
| 6 | This story supports the `gherkin` kind, whose files are `.feature` files. | slice 2 | observed: authenticated-read-intent-locations lists only .feature; PNG omitted in journey |
| 7 | Execution adds Gherkin locations to Doughnut (`e2e_test/features`) and Pygardon (`e2e_test/features`, `e2e_test/packaged/features`) and publishes them on their trunks. | slice 5 | |
| 8 | Intent reads the configuration, folder contents, and file text at the one revision the dashboard already observes for the selected project, and names that revision beside the source. | slice 2 | observed: intent-gherkin-browse “at revision …” beside source |
| 9 | No local checkout or running session is needed for that published, pinned reading. | slice 2 | observed: authenticated intent locations + file-at via fake published origin |
| 10 | Each location shows its nested folders and Gherkin files in a collapsible tree arranged as Review changes arranges its files. | slice 2 | observed: IntentPerspective FileTree + recall nest in intent-gherkin-browse |
| 11 | Files outside the kind (for example Doughnut’s tracked snapshot PNGs) are not listed. | slice 2 | observed: intent-gherkin-browse no recall.png control |
| 12 | Selecting a file shows its whole exact text with line numbers and Gherkin syntax styling. | slice 4 | |
| 13 | Styling only aids reading: copying the text yields the source, and nothing depends on color to be understood. | slice 4 | |
| 14 | The selected file’s Proof truthfully says no Proof is available yet. | slice 2 | observed: intent-gherkin-browse Proof region “No Proof is available for this file yet” |
| 15.1 | Distinct state: no configured locations says what happened and names the setting or location involved. | slice 2 | observed: expectNotConfiguredIntent names intent.locations and .planning/open-dough.json |
| 15.2 | Distinct state: a location with no Gherkin files at the revision says what happened and names the setting or location involved. | slice 3 | observed: intent-gherkin-unusable empty/missing by path; boundary marks no-features |
| 15.3 | Distinct state: an unsupported kind says what happened and names the setting or location involved. | slice 3 | observed: intent-gherkin-unusable “Kind typescript is not yet supported.” |
| 15.4 | Distinct state: a failed read says what happened and names the setting or location involved; a failed read can be retried. | slice 3 | observed: intent-gherkin-unusable failed file-at alert + Retry |
| 16 | Project change shows the newly selected project’s locations and source. | slice 2 | observed: intent-gherkin-browse Doughnut→Pygardon replaces trees/text |
| 17 | Reads stay limited to paths inside the configured locations of the observed revision’s configuration: the local read boundary is not an open repository proxy. | slice 2 | observed: authenticated-read-intent-locations refuses file-at outside locations |
| 18 | The dashboard has no dark appearance today, so one light styling theme suffices. | slice 4 | |
| 19 | Terry authorizes the configuration commits to Doughnut and Pygardon as part of this story’s publication and evaluation. | slice 5 | |
| 20 | Other source kinds and file-selection patterns are deferred. |  | G1 |
| 21 | Syntax styling in Review changes diffs is deferred; the styling ability is chosen so it can serve them later. |  | G2 |
| 22.1 | Links or URLs to a selected file are deferred. |  | G3 |
| 22.2 | Scenario parsing or outline is deferred. |  | G4 |
| 22.3 | Search is deferred. |  | G5 |
| 22.4 | Automatic location detection is deferred. |  | G6 |
| 22.5 | A settings editor is deferred. |  | G7 |
| 22.6 | Purpose/Proof layout switching is deferred. |  | G8 |
| 22.7 | Any Proof collection is deferred. |  | G9 |
| 23 | Find and read a feature: Doughnut `e2e_test/features` → expand `recall` → select a feature → exact text, line numbers, styled keywords, observed revision; snapshot PNGs not listed. | slice 5 | |
| 24 | Several locations: Pygardon two `gherkin` locations → both trees; packaged feature text. | slice 5 | |
| 25 | Project change: Doughnut feature → select Pygardon → trees/text replaced; nothing selected until a file is chosen. | slice 2 | observed: intent-gherkin-browse project-change step |
| 26 | Not configured: no intent locations → says so, names setting and file; no empty tree. | slice 2 | observed: expectNotConfiguredIntent; development-intent-frame*.spec.ts |
| 27 | Empty or missing location: no `.feature` files or path missing → says so by path; other locations still browse. | slice 3 | observed: intent-gherkin-unusable; usable location still selects |
| 28 | Unsupported kind `typescript` → says kind not yet supported, naming it; other locations still browse. | slice 3 | observed: intent-gherkin-unusable typescript step |
| 29 | Read failure → source pane says could not be read and offers retry; tree stays usable. | slice 3 | observed: intent-gherkin-unusable Retry restores text |
| 30 | No Proof yet: with a file selected → Proof says no Proof available yet, without implying pass, failure, or absence of tests. | slice 2 | observed: intent-gherkin-browse Proof region; not pass/fail/absence wording |
| 31 | Other source kinds beyond `gherkin` are out of scope for this story. |  | G1 |
| 32 | File-selection patterns other than those implied by configured Gherkin locations are out of scope. |  | G1 |
| 33 | Review changes diff syntax styling is out of scope. |  | G2 |
| 34 | Links/URLs to a selected file are out of scope here. |  | G3 |
| 35 | Scenario parsing or outline is out of scope. |  | G4 |
| 36 | Search is out of scope. |  | G5 |
| 37 | Automatic location detection is out of scope. |  | G6 |
| 38 | A settings editor is out of scope. |  | G7 |
| 39 | Purpose/Proof layout switching is out of scope. |  | G8 |
| 40 | Any Proof collection is out of scope. |  | G9 |
| 41 | Reading is not an open repository proxy; only paths inside configured locations of the observed revision’s configuration. | slice 2 | observed: pathContainedInIntentLocations + boundary refuse outside |

## Slice 1 acceptance comparison

| Id / promise | Source-expected | Actual observation | Owner |
| --- | --- | --- | --- |
| Shared path-bearing tree (plan Structure; enables 10) | Review changes arrangement reusable over any path-bearing item; Review changes behavior unchanged | `reviewFileTree` is generic over `PathBearing`; `FileTree` takes `renderFile` and `fileCountWords`; Review changes passes `FileRow` and `changedFileWords`; unit outline and file-browser journeys stay green | slice 1 (structure); Intent tree owed by 10 → slice 2 |

No source commitment is allocated to slice 1; its accepted boundary is the
unchanged Review changes tree plus the shared arrangement API.

## Slice 2 acceptance comparison

| Id / promise | Source-expected | Actual observation | Owner |
| --- | --- | --- | --- |
| 3, 5, 6, 8–11, 14, 15.1, 16, 17, 25, 26, 30, 41 | Intent browse/read without styling; not-configured; read restriction | Journey + boundary + frame specs green as listed in observations | slice 2 |
| 12, 13, 23 styling | Styled keywords / copy | Deferred | slice 4 |
| 15.2–15.4, 27–29 | Empty/missing, unsupported, failed read | intent-gherkin-unusable + boundary settings/location problems | slice 3 |
| settings unreadable/malformed | Distinct from not-configured | intent-gherkin-unusable settings test + boundary | slice 3 |
| 1, 2, 7, 23–24 real projects | Trunk publication + evaluation | Deferred | slice 5 |
