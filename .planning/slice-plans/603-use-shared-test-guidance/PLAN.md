# Use shared MakeMe and page-object guidance

**Identity:** SEED-329#use-shared-test-guidance
**Source:** [Use shared MakeMe and page-object guidance](../../seeds/SEED-329-use-shared-test-guidance.md#use-shared-test-guidance)
**Source review:** [source-review.md](source-review.md)

## Goal and scope

A maintainer authoring or refactoring this project's tests resolves MakeMe and
page-object conventions through the installed shared skills and the matching
Intent entry. Local documentation supplies the project's APIs, harness boundaries
and pilot evidence without repeating the shared conventions.

Update `AGENTS.md`, `tests/test-data-architecture.md`,
`dashboard/tests/writing-journeys.md` and `.planning/open-dough.json`. Close the
discovered selection gap for runner-scheduled Node tests in `tests/` and
`tests/support/`. Preserve the five location path identities, browser opt-ins,
local builder/harness knowledge and dashboard pilot evidence.

No test conversion, builder change, shared skill edit, installer/update change,
release or host adaptation belongs to this story. SEED-300 owns dashboard
page-object refactoring. Guidance routing grants no wider fluent adoption.

## Architecture and existing solutions

- **Reuse:** installed `dough-makeme` and `dough-page-objects` both use
  `dough-execute-plan/references/test-entry-rules.md` and its standalone selector.
  Their entrypoints and conventions match the corresponding `src/skills/`
  sources byte-for-byte at this preparation's revision. Remove local generic
  convention prose instead of creating another selector or convention owner.
- **Change the existing declaration:** replace the `tests` location's legacy
  `kind`/`include` with `sources` declarations: shell `*.sh`, and JavaScript
  `*.test.mjs` plus `support/*.test.mjs`; retain `makeMe: true`. This is the
  existing supported grammar. The other four entries retain their declarations.
  Intent keys locations by path; its header shows source patterns instead of a
  single kind, and the matched declaration supplies the file's syntax hint.
- **Keep local construction knowledge:** `tests/support/makeMe.mjs`, shell-to-Node
  setup, JSDoc/production typing, native runtime-import closure, persisted/live
  distinctions, encoders, harness lifecycle and domain API examples stay in
  `tests/test-data-architecture.md`. Remove the repeated generic builder,
  defaults, invalid-input and independent-expectation rules by linking their
  shared owner. Keep synchronization, clocks and cleanup guidance intact.
- **Keep local pilot knowledge:** the journey guide's three pilot journeys,
  object-set machinery, observations between phases, evaluation links,
  measurements, rename/failure experiments and wider-adoption decision stay
  available. Add shared-skill routing and distinguish that local pilot machinery
  from the selected convention; do not turn it into a universal requirement.
- Helper-only work identifies the selected consuming test paths before applying
  its guidance. `storyCardPages.ts` and `release-source.mjs` themselves remain
  outside entry membership; their folders do not establish opt-in. This keeps
  selection honest while guiding support work for an enabled test.
- Follow [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  for one authoritative rule home, [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md)
  for released installed copies, and [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md)
  for proportionate behavior proof. Do not hand-edit installed skill copies or
  add routine per-host discovery checks. Existing North Star topics concern
  dashboard runtime architecture; this change needs no new direction or ADR.
- Expected edit sizes at preparation: `AGENTS.md` 144 lines, data guide 231,
  journey guide 250, configuration 47. None already exceeds 250. Remove overlap
  rather than add parallel prose. If the journey guide needs more room, extract
  its complete pilot discussion along its existing heading into one linked local
  guide, preserving the full evidence and incoming references; do not trim the
  evidence or split at arbitrary line counts.

## Outside-in proof ownership

| Story promise | Slice | Observable proof |
| --- | --- | --- |
| Selected browser specs receive both shared conventions | 1 | Run the installed selector for the browser and frontend paths in the selection matrix below; follow the revised links into both shared conventions |
| All five entries keep MakeMe, independently of browser guidance | 1 | Installed selector matrix plus enumeration of scheduled Node and shell sources; backend, shell and skill sources have page objects off |
| Previously unmatched scheduled Node tests select MakeMe | 1 | Current configuration returns MakeMe on for all paths expanded from `tests/node-test-files`, including the two root/support examples and intended new paths |
| Shell setup still reaches project builders through Node helpers | 1 | Walk `tests/compare-payload.sh` → `tests/support/release-source.mjs` → repository/release builders, and `tests/install-ci-host-hooks.sh` → `tests/helpers/host-hooks-fixture.bash` → `host-hook-scenarios.mjs` → settings builder |
| Helpers follow the selected consuming test without false membership | 1 | Matrix shows helper paths unmatched; revised guidance identifies consuming tests. Walk selected `side-panel-content-replacement.spec.ts` into `storyCardPages.ts`: locator ownership stays there, held responses and independent expectations stay in the spec |
| Local APIs, harness constraints and pilot evidence survive | 1 | Review the documentation diff against the retained-knowledge list above; open the preserved evaluation links and trace the same three pilot journeys |
| Mixed entry retains location identity and source syntax | 1 | Read the changed `tests` declaration through Intent's shared matcher: shell hint for `tests/install.sh`, JavaScript for both Node examples; path remains `tests` |

## Ordered slices

### 1. Resolve shared conventions for maintained tests through their Intent entries

Type: Behavior
Status: done
Proof: the selection matrix, full scheduled-source enumeration and syntax
observations match the table above; the representative guidance walks retain
the project's local knowledge; the focused checks below pass.

Precondition: a maintainer starts test or supporting-helper work from the local
guidance. Trigger: they resolve the intended test source paths. Result: the
matching entry selects the installed shared conventions, including scheduled
Node tests previously missed by the `tests` entry, and the local guides provide
the project construction boundary and retained pilot context.

- Make the mixed-source configuration change and replace local convention
  restatements with repository-relative links to the installed skills. Leave
  unrelated timeout, sleep, failure and synchronization rules intact.
- Keep support-file routing tied to consuming test paths. Keep the local pilot
  discussion and its wider-adoption boundary; perform no test conversions.
- Review the final local documents for contradictory or unconditional leftover
  convention rules, broken links and lost project-specific information.
- One cohesive proof loop covers configuration and guidance: deliver them
  together so the blanket rule never disappears with the known selection gap
  still open. No preparatory Structure or independent second outcome is needed.

Accepted proof (2026-11-12): the installed selector matrix matched every row
below; all 618 scheduled sources (533 Node, 85 shell) selected MakeMe with page
objects off; `sourceEntryOfRepositoryPath` gave `tests/install.sh` the shell
hint and both Node examples the javascript hint under location `tests`; the
four focused checks, `git diff --check` and lint passed. Per-commitment
observations are in [source-review.md](source-review.md). The journey guide
was at 250 lines, so its pilot section moved verbatim (heading level only)
into `dashboard/tests/fluent-side-panel-pilot.md`; incoming anchors in
SEED-300, SEED-301 and plan 582 were retargeted. Terry approved a file-size
exception covering only that one link change in the 874-line SEED-300 seed;
its reorganization stays with SEED-300's own refinement.

## Selection matrix and local gates

Run `node .agents/skills/dough-execute-plan/scripts/test-entry-rules.mjs
--project "$PWD"` with repeated `--source` arguments for:

| Source | MakeMe | Page objects |
| --- | --- | --- |
| `dashboard/tests/navigation/side-panel-content-replacement.spec.ts` | true | true |
| `dashboard/frontend-tests/intent-project-scope-history-recovery.spec.ts` | true | true |
| `dashboard/backend-tests/intent/authenticated-read-intent-selection.spec.ts` | true | false |
| `tests/install.sh` | true | false |
| `src/skills/dough-land/scripts/queued-closure-check.test.mjs` | true | false |
| `tests/makeme-selection.test.mjs` | true | false |
| `tests/support/repository-description.test.mjs` | true | false |
| `tests/new-shared-guidance.test.mjs` (intended path) | true | false |
| `tests/support/new-shared-guidance.test.mjs` (intended path) | true | false |
| `tests/support/release-source.mjs` | false | false |
| `dashboard/tests/storyCardPages.ts` | false | false |

Expand the actual globs in `tests/node-test-files` and `tests/*.sh`, pass every
scheduled source to that same installed command (bounded batches are fine), and
confirm MakeMe on and page objects off for all of them. Read the `tests` entry
through `sourceEntryOfRepositoryPath` from
`src/skills/dough-makeme/scripts/intent-location-selection.mjs` to observe the
shell/JavaScript hints; this is the matcher Intent itself consumes.

```sh
PATH="/opt/homebrew/bin:$PATH" npm test -- tests/makeme-selection.test.mjs tests/makeme-selection-configuration.test.mjs tests/support/test-entry-rules.test.mjs tests/support/test-entry-rules-compatibility.test.mjs
git diff --check
```

These existing checks cover source declarations, independent rule flags and the
shared selection boundary. No new automated prose test or full browser run is
needed for routing links and changing this project's declaration; representative
behavior review observes the promised guidance use, and no runtime/test code or
harness changes. Reassess proof if implementation changes that boundary. Use the
execution workflow's refactoring, commit, review, delivery and CI repair gates.
Trace changed guidance/configuration consumers with the installed
`consumer-trace.mjs --base HEAD`; disposition each result by its actual use.

**Local gate:** use the maintained
[macOS sleep guard](../../../tests/local-test-resources.md#machine-sleep-on-macos)
for any long run: start fully awake; on AC use `caffeinate -s -i`; on battery
plug in or keep the lid open under `caffeinate -i` and inspect sleep logs.
The focused checks above are short. Never wait for wall-clock time, use
`test.slow()` or broaden timeout overrides.

The [failing and flaky test policy](../../../AGENTS.md#failing-and-flaky-tests)
applies as written and accompanies every delegation and repair handoff.

## Decisive premises and observations

Observed on 2026-11-12 in this preparation's owned workspace at
`11a63e662bc7bf0db52f1a29a2451db438bc26e3`. Scratch configuration changes were
restored byte-for-byte before preparation record writes. No test source changed.

| Premise | Consuming operation and observed form | Result and remainder |
| --- | --- | --- |
| Existing declarations leave scheduled Node tests unmatched | Expanded the real `tests/node-test-files` globs and `tests/*.sh`; ran the installed selector in this checkout against all paths | 533 Node files and 85 shell files; 206 Node files had MakeMe off; all page-object flags off |
| Existing mixed-source syntax closes the gap without changing the other entries | Scratch-applied the exact `sources` declaration above to this checkout's `.planning/open-dough.json`; reran the installed CLI against all 618 scheduled sources and the full representative matrix | All 618 selected MakeMe, none selected page objects; browser/frontend kept both flags, backend kept MakeMe only; intended Node paths selected; helper paths remained unmatched |
| Intent retains the right syntax for the changed entry | With the same scratch declaration, called `sourceEntryOfRepositoryPath` on the actual configured entry for `tests/install.sh` and both root/support Node examples; traced IntentBrowser's consumption of its hint and path key | Shell hint for the shell check, JavaScript for both Node tests; same `tests` location identity. No header code change is needed |
| Representative existing selection proof runs here | Ran the exact four-file `npm test` command above through the maintained runner with Homebrew Bash first on PATH | Exit 0. This validates the proof route; the scratch selector observations establish the changed local configuration's result |
| Local pilot evidence fits the guidance ownership change | Walked `side-panel-content-replacement.spec.ts` through its page objects and independent held-response/assertion boundaries; compared shared source and installed entrypoints/conventions | Existing pilot evidence remains applicable: no spec, helper, convention or runtime behavior changes. The final documentation's routing and preservation are observed during slice 1 |

## Current decisions and preparation review

- One common rule: the selected test entry owns convention applicability; local
  guides own concrete APIs and harness facts. Helper paths do not independently
  gain opt-in through folder proximity.
- The mixed-source declaration preserves the existing `tests` location instead
  of creating a parallel entry or a new matching rule.
- No blocking supplier dependency, pre-Take human decision or trunk-only action
  was identified. Execution authority remains with a later instruction.
- Slice-plan refinement was not needed: one bounded Behavior slice, one
  configuration-and-guidance proof loop, with no remaining slice-specific
  concern identified.
