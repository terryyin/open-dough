---
id: SEED-283
status: active
planted: 2026-11-09
scope: story
---

# Keep Done story Intent pinned to the landed result

<a id="keep-done-story-intent-pinned"></a>

### Keep Done story Intent pinned to the landed result

**Identity:** SEED-283#keep-done-story-intent-pinned
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/550-keep-done-story-intent-pinned/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"43744ea2e90d7bfb86aff3785d71aaba0330c82febb9e00e0c58fe9f43fe5b16","plan":"799ef61e1424bd44c75d0627659c2f1cc572aaae7cfb7c27c17c0e5c4b430d90"}}
```

**Goal.** A developer reviewing a Done story can see what the story changed
and the evidence for that change, even after the project has moved on. Today a
new commit on trunk can show a revision notice inside the Done story. Clicking
**Show latest** on **CI comparison** can dismiss the notice without changing
anything else the developer can see.

**Scope.**

- Use the Done story's published comparison and recorded evidence across
  **CI comparison**, **Changed tests**, and **Intent coverage**. Its test
  browser uses the baseline-to-landed-result changes and the test-source
  locations, inventory, and unchanged-file source at landing. Later trunk
  files, renames, deletions, and settings changes do not rewrite that view.
  Retain deleted and renamed story files and their original diffs, with the
  existing location-selection and outside-location explanation.
- Keep the project revision notice and **Show latest** in **Project Intent**,
  beside the project test browser they update. The Done story's three tabs
  contain no project revision notice or project refresh action. Visiting
  Project Intent, refreshing it, and returning preserves Selected story and
  its historical evidence and reading place.
- Show the revision currently represented by the Project Intent test browser,
  including when no file is selected. Keep that label after refresh even if
  the new commit changes only planning records. It advances when the new
  locations answer is successfully shown. While updating or after a failed
  update, keep the prior shown revision and reading, with the existing
  updating/failure feedback and Retry.
- Explain missing historical comparison, locations/source, CI proof, or saved
  coverage in the affected view. Distinguish reading, failed retrieval,
  absent evidence, and an explicit assessment result; preserve existing
  supported recovery. Each evidence source remains independently useful when
  another is unavailable.

**Required restrictions.** Never silently substitute current trunk's test
tree or evidence for an unavailable Done-story history: that would attribute
later project behavior to the completed story. An unavailable comparison is
not evidence of no test changes, and an absent assessment is not a negative
coverage result. A newer observed project revision is not the browser's shown
revision until its locations read is accepted; otherwise the label would
misstate what the developer is browsing.

**Scope limits.** This story does not change CI endpoint discovery, collection,
proof schemas, equivalent/later-build provenance rules, or the Intent Coverage
assessment process. Existing **Check again**, retries, and explicit CI fallback
explanations remain supported: a historical comparison does not freeze an
unfinished CI attempt or turn its measured revision into the source revision.
It does not add historical retention/migration or a new selection workflow.
The common Intent layout and comparison presentation remain
[SEED-282](https://github.com/terryyin/open-dough/blob/79714ba4e401efc9e826cd9bb95918c3589f6cfa/.planning/seeds/SEED-282-unify-intent-view-and-ci-proof.md#unify-intent-view-and-ci-proof)'s
work; that story is not a prerequisite.

**Key examples.**

- A story changes a test and lands with a configured test location → later
  trunk renames/deletes the test, adds another test, or removes that location
  from its settings → the Done story still shows its landing's locations and
  original changed-file diff; the later-only test does not enter its tree.
  An unchanged file reads the source from landing. CI comparison retains its
  story endpoints, and Intent coverage retains its saved assessment.
- A newer trunk revision is observed while any Done-story tab is open → all
  three tabs stay free of the project revision notice and **Show latest**.
  Visit Project Intent, apply that update, and return → the same story, file,
  Purpose/Proof choice, and reading place remain on its historical comparison.
- A Done story has an unrecoverable historical comparison, a failed historical
  locations read, or no saved assessment → the affected view says what is
  missing and offers recovery only where supported. Current trunk's tree does
  not stand in for the missing story view. Available CI or saved coverage
  remains readable independently.
- In **Project Intent**, a new trunk commit only updates a planning record.
  The developer updates the test browser → its visible browser revision label
  advances even though the test files look the same, and remains visible with
  no file selected. If that locations read fails, the old label and reading
  remain with Retry; a successful retry advances the label.

**UI and architecture.** Project freshness and historical story evidence have
different owners within the same Intent perspective. A revision label names
the project browser's shown source; story comparison endpoints and observed CI
proof keep their own provenance. Moving project refresh out of story tabs
removes an action whose effect would otherwise be invisible there, while the
existing Project Intent visit provides the way to update project reading.
Keep keyboard return and independent reading places; no new page, tab, layout,
or technology choice is needed.

Follow [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md),
[ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md),
and [ADR 0002, principles 2 and 5](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md).
Published Git and saved records own the evidence; browser reading state and
caches remain disposable. Reuse the existing story comparison, CI evidence,
saved coverage, and revision-keyed authenticated source readers. The existing
architecture supports this boundary; no Accepted-ADR conflict or exception was
identified.

**Investigation.** Local Chromium observations at
`c7e41e9e4abdd957e3b1117a1bba13d27749d1e6` reproduced a later-trunk-only test
in a Done story's tree, project refresh in all three story tabs, and an
unchanged story diff after applying a planning-only update. Removing current
settings then removed that story's test browser. Reading locations explicitly
at its completion still returned its historical files. Project refresh already
updates a selected file's revision caption; the missing feedback is the
browser-wide shown revision, including the no-file reading. These facts support
the existing scope; no outcome-changing premise remains unresolved. Detailed
observations and proof ownership belong in the associated plan.

**Maintained references.** [Intent](../../docs/dashboard-development-intent.md),
[story views](../../docs/dashboard-development-intent-story.md), and
[CI comparison](../../docs/dashboard-development-intent-ci-comparison.md).
