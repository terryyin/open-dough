# Browse a project's Gherkin test source in Intent

**Identity:** SEED-192#browse-test-purpose
**Source:** [Browse a project's test source in Intent](../../seeds/SEED-192-review-product-intent.md#browse-test-purpose)
**Source review:** [source-review.md](./source-review.md)

## Goal and scope

A developer opens Intent for Doughnut or Pygardon and reads a Cucumber feature,
found through the project's configured Gherkin locations, as its exact
published text, styled for reading. Scope, deferred promises, the read
restriction, and key examples 1–8 are the story's. Material exclusions: other
source kinds, syntax styling in Review changes, links to a file, scenario
parsing, search, detection, a settings editor, layout switching, and Proof
collection.

Assumptions: the dashboard has no dark appearance, so one light theme is enough.
Terry authorizes the configuration commits to Doughnut and Pygardon (slice 5).

## Current decisions

- **Setting.** `.planning/open-dough.json` gains
  `"intent": { "locations": [{ "path": "<folder>", "kind": "gherkin" }] }`.
  The kind is the one domain value that selects both the listed files
  (`gherkin` → `.feature`) and the Shiki grammar of the same name. A single
  supported-kinds table holds that extension; there is no other mapping.
  The setting's absence, a malformed setting, and an unreadable file stay
  distinct.
- **Reads.** Each read goes through the existing authenticated read boundary
  (`dashboard/server/authenticatedRead.ts`) at the revision already observed
  for the project, as a new read kind module beside `doneCatalogRead.ts`:
  - the settings plus each location's nested listing, using one
    `gh api repos/<r>/git/trees/<revision>%3A<path>?recursive=1` per location;
  - file text through the existing `file-at` read, admitted when that
    revision's configured locations contain the path, beside the existing
    `pathReachableFromRevision` rule.

  The pinned-text memo, the failure meanings, and `repositoryFileReads.ts` with
  `fileContentCache.ts` are reused. Story review's local `git` reads are not used.
- **Tree.** `reviewFileTree.ts` arranges any path-bearing item, and
  `StoryReviewFileTree.tsx`'s `FileTree` takes its file row from the caller.
  Review changes and Intent use the same arrangement and disclosure rows. Each
  keeps its own row content and count wording.
- **Styling.** Shiki 4.5.0, through `shiki/core` with
  `shiki/engine/javascript`. The Gherkin grammar and the `github-light` theme
  load on demand. `codeToTokens` returns lines that React renders beside the
  line numbers, with no injected HTML. One source-lines view renders whole-file
  text; Review changes adopting it is deferred.

## Decisive premises

| Premise | Consuming operation | Observation (2026-10-31) | Result |
| --- | --- | --- | --- |
| One request lists a location's nested files | Location listing (slice 2) | `gh api "repos/nerds-odd-e/doughnut/git/trees/<origin/main sha>%3Ae2e_test%2Ffeatures?recursive=1"` | 117 entries, 93 `.feature` blobs, `truncated: false`; the `main:e2e_test/features` form gives the same |
| A missing location and a file path have distinct answers | Empty/missing location state (slice 3) | The same request for `%3Ano_such_dir` and for `%3AREADME.md` | `404 Not Found`; `422 Invalid object requested` |
| Adding the `intent` key leaves existing settings readers unchanged | Doughnut/Pygardon publication (slice 5) | `readCiConfiguration` from `src/skills/dough-execute-plan/scripts/ci-project-configuration.mjs` on a scratch settings file containing `intent` | `{"workflow":"ci.yml"}`, the same as without it; the agent-profile reader only `JSON.parse`s the file |
| Shiki highlights Gherkin in this project's build and browser | Styling (slice 4) | A scratch entry outside the repository importing `shiki/core`, the JavaScript engine, `@shikijs/langs/gherkin` and `@shikijs/themes/github-light`, built with `vite@8.3.0` and loaded in the worktree's Playwright Chromium | Build: core 167 KB (56 KB gzip), Gherkin chunk 12 KB and theme chunk 11 KB loaded separately. Page: `Feature`, `Scenario`, and `Given ` tokens colored `#D73A49`, distinct from text |
| The real feature text tokenizes promptly | Styling (slice 4) | Node probe on Doughnut `e2e_test/features/cli/cli_notebook_lfs.feature` (170 lines, the largest feature) | Tokenized in about 22 ms |

The dashboard tests answer GitHub through `tests/support/fakeGitHub.ts` and
`tests/publishedOrigin.ts`. Those answer contents reads and single-folder
listings but not trees reads, so slice 2 adds a trees answer there. Projects in
the existing frame journeys publish no settings file, so their Intent shows
"not configured" from slice 2.

## Outside-in proof

| Promise | Owner | Observable proof |
| --- | --- | --- |
| Review changes' tree is unchanged | 1 | The story-review specs that use the file browser stay green (`story-review-file-moves`, `story-review-comparison`, and the specs found by the slice's consumer trace) |
| Example 1 without styling; examples 2, 3, 8; the read restriction | 2 | New Intent journey spec with fake origins for Doughnut-like and Pygardon-like projects: expanding folders and selecting a feature shows its exact text, line numbers and the observed short revision; snapshot PNGs are not listed; two locations; a project change replaces the content; Proof says none is available yet. A boundary spec refuses a `file-at` read outside the configured locations |
| Example 4 | 2 | The frame journeys' Intent expectation (`tests/intentPerspectivePage.ts`) becomes "no intent locations configured", naming the setting and file |
| Examples 5, 6, 7 and a failed or malformed settings read | 3 | Journey steps for a 404 location, a location with no `.feature` files, kind `typescript`, a failed file read with a working retry, and an unreadable settings file; other locations still browse |
| Example 1 styling; copied text is the source | 4 | Journey asserts keyword and step tokens carry a different color from plain text, the line text equals the source, and selection text excludes line numbers. A scratch edit that drops styling makes the color assertion fail |
| Examples 1 and 2 on the real projects | 5 | Doughnut and Pygardon trunks publish their locations; the developer-run dashboard (headless Playwright on the worktree's dev server) shows a real Doughnut `recall` feature and a Pygardon packaged feature styled at the observed revision; Terry evaluates |

## Slices

### 1. One file tree for review and Intent
Type: Structure
Status: done
Proof: The story-review file-browser specs stay green, and so do the unit checks of `reviewFileTree`.

The internal change makes `reviewFileTree` arrange any item that has a `path`,
and makes `FileTree` render a caller-supplied file row and count wording.
Review changes passes its existing row and "changed files" wording, so its
behavior is unchanged. This enables slice 2's Intent tree without a copy.

Accepted: `reviewFileTree` / `reviewFileOrder` are generic over `PathBearing`;
tree nodes are `Path*Node`; `FileTree` takes `renderFile` and `fileCountWords`;
Review changes wires `FileRow` and `changedFileWords`. Focused proof:
`boundary/story-review-folders.spec.ts` (5), `story-review-file-moves`,
`story-review-comparison`, `story-review-tree`, `story-review-tree-collapse`,
`story-review-line-counts`. Learning: dashboard Playwright paths are relative
to `dashboard/tests`.

### 2. Browse and read configured Gherkin source
Type: Behavior
Status: done
Proof: The new Intent journey spec, the boundary refusal spec, and the updated frame journeys, which run the consumers of `expectNotConfiguredIntent`: `development-intent-frame*.spec.ts`, `side-panel-content-replacement.spec.ts`. The consumer trace also covers `IntentPerspective` text, the read-boundary request kinds, and `GITHUB-REQUESTS.md`.

Behavior: A project publishes Gherkin locations, and the developer opens
Intent. The developer expands nested folders and selects a `.feature` file. Its
exact text appears with line numbers and the observed revision. Proof says none
is available yet. Changing project shows that project's locations. A project
without the setting shows the not-configured state.

Includes the new read kind, the location-contained `file-at` admission, the
fake-origin trees answer, Intent's tree and source pane, and updates to
`docs/dashboard-navigation.md#development-and-intent`,
`dashboard/PROJECT-CONFIGURATION.md` (the setting), and
`dashboard/GITHUB-REQUESTS.md` (when Intent reads).

Accepted: Intent locations via trees + `file-at` admission;
`IntentLocationTree` / plain `IntentSourceLines`; not-configured via
`expectNotConfiguredIntent`. Focused proof: `intent-gherkin-browse.spec.ts`,
`boundary/authenticated-read-intent-locations.spec.ts`,
`development-intent-frame*.spec.ts`, `side-panel-content-replacement.spec.ts`
(13). Learning: serial boundary cases need distinct pin revisions when settings
change under a shared PinnedTexts memo.

### 3. Distinguish unusable locations and failed reads
Type: Behavior
Status: planned
Proof: Journey steps for examples 5–7 and for the settings-read failure, each also showing that other locations still browse.

Behavior: A location is missing, holds no `.feature` files, names an
unsupported kind, a file read fails, or the settings cannot be read or parsed.
Intent shows that location's or file's own explanation, naming the path or
kind, and offers retry for a failed read. The remaining locations stay usable.

### 4. Style Gherkin source for reading
Type: Behavior
Status: planned
Proof: The journey's styling, line-text and copy assertions, plus the discriminating scratch edit.

Behavior: When a feature is selected, `Feature:`, `Scenario:`, step keywords,
tags, tables and strings appear styled with the light theme. Copying yields
the source, and line numbers stay outside the copied text. Styling arrives
without delaying the plain text: the text shows first if grammar loading is
slow, and stays plain with no error if loading fails.

Adds `shiki@4.5.0` as an exact devDependency, as the dashboard's other
dependencies are, and the shared source-lines view.

### 5. Publish Gherkin locations in Doughnut and Pygardon
Type: Behavior
Status: planned
Proof: A real-project observation with retained revisions, then Terry's evaluation.

Behavior: Doughnut's trunk publishes `e2e_test/features`, and Pygardon's
publishes `e2e_test/features` and `e2e_test/packaged/features`, each as
`gherkin`. The dashboard shows them as examples 1–2 describe.

Each project's change is a settings-only commit made in a fresh worktree of
that project and pushed to its trunk without force. Pushing these commits is
the outward step Terry authorized for this story.

## Concern evidence

Slice-plan refinement was not needed: each slice has one proof loop.
Slices 2–4 extend one model, the configured location and its kind, rather
than adding recognizers. Slice 1 is the only preparation, and it sits
immediately before the Behavior it enables. This review found no remaining
slice-specific concern.

## Story obligations

### G1. Other source kinds and file-selection patterns deferred
Reported: slice 1 — "Other source kinds and file-selection patterns"
Story clause: "Other source kinds and file-selection patterns"
Disposition: excluded "Other source kinds and file-selection patterns"
Commitment: 20, 31, 32

### G2. Review changes diff syntax styling deferred
Reported: slice 1 — "Syntax styling in Review changes diffs; the styling ability is chosen so it can serve them later."
Story clause: "Syntax styling in Review changes diffs; the styling ability is chosen so it can serve them later."
Disposition: excluded "Syntax styling in Review changes diffs; the styling ability is chosen so it can serve them later."
Commitment: 21, 33

### G3. Links or URLs to a selected file deferred
Reported: slice 1 — "Links or URLs to a selected file (owned by the optimization-candidate story)"
Story clause: "Links or URLs to a selected file (owned by the optimization-candidate story)"
Disposition: excluded "Links or URLs to a selected file (owned by the optimization-candidate story)"
Commitment: 22.1, 34

### G4. Scenario parsing or outline deferred
Reported: slice 1 — "scenario parsing or outline"
Story clause: "scenario parsing or outline"
Disposition: excluded "scenario parsing or outline"
Commitment: 22.2, 35

### G5. Search deferred
Reported: slice 1 — "search"
Story clause: "search"
Disposition: excluded "search"
Commitment: 22.3, 36

### G6. Automatic location detection deferred
Reported: slice 1 — "automatic location detection"
Story clause: "automatic location detection"
Disposition: excluded "automatic location detection"
Commitment: 22.4, 37

### G7. Settings editor deferred
Reported: slice 1 — "a settings editor"
Story clause: "a settings editor"
Disposition: excluded "a settings editor"
Commitment: 22.5, 38

### G8. Purpose/Proof layout switching deferred
Reported: slice 1 — "Purpose/Proof layout switching"
Story clause: "Purpose/Proof layout switching"
Disposition: excluded "Purpose/Proof layout switching"
Commitment: 22.6, 39

### G9. Proof collection deferred
Reported: slice 1 — "any Proof collection"
Story clause: "any Proof collection"
Disposition: excluded "any Proof collection"
Commitment: 22.7, 40
