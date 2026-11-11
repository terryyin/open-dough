# Slice 4 — published MakeMe integration and application

Continuation of the [partial return](slice-4-observations.md) at base
`837c307d2cb94afaa342fa4ce956a72d758c1d6e`, under Terry's explicit authorization.
G2's actual application proof is now supplied below for coordinator acceptance.
Coordinator retains plan/review state, independent refactoring, formatting,
commit, publication and final CI. Follow [AGENTS failure policy](../../../AGENTS.md#failing-and-flaky-tests).
No source-project release, rollout or separate MakeMe story completion is claimed.

## One integrated source and resolver

Read the published `origin/codex/apply-shared-makeme-rules-per-entry` revision
`3940c9d79` with `git show`. Imported only
`src/skills/dough-makeme/{SKILL.md,references/convention.md}`; no sibling worktree
or uncommitted files were inspected. The 49-line convention is byte-identical:
published and current Git blob `2291e792d09dd9c51f6cf8705760054a18503373`.
Its source attribution is that published MakeMe increment (earlier guide commit
`ec131e188`). The entrypoint retains its published description and adapts its
gate to this branch's existing common selection procedure and public command.

No sibling rule-specific parser, matcher, changed-path collector, bundle or
`select-makeme` API was imported. Existing declaration/membership/Git owners and
the generated local runtime are unchanged. Common selection now links explicitly
to the real MakeMe convention alongside the conditional browser convention.
Both MakeMe files are in the one assembled payload declaration. Ordinary
non-browser MakeMe applicability and all independent flags/diagnostics remain.
Missing selected guidance retains its unresolved/withheld-edit fallback.

This follows Accepted ADR 0002's one-owner/integration direction, ADR 0003's
source/declaration lifecycle, ADR 0004's complete standalone installation,
ADR 0005's actual native application and bounded reuse, and ADR 0006's shared
project-relative runtime source. No new architecture conflict was found.

## Domain setup opportunity and deterministic proof

New `both`, `makeme-only` and `neither` modes use the actual complete isolated
install/update fixture. Its older release now withholds both new guides; ordinary
update installs both guides and every declared dependency into both roots.
Only temporary fixture repositories receive tags/versions. Existing
on/off/refactor/installed default application and harness bytes are unchanged.

The new domain variant starts with an empty catalog. README documents the
project's existing item factory location and `library.replaceItems(...records)`
setup boundary. A fresh item builder has domain-named identity/title/relationship
operations and `.please()`; its completed values own their mutable state.
The runner clones seeded records. The legacy entry has a direct-control example.
The ordinary prompt is unchanged except the selected test path; it does not
name either skill, convention, builder requirement or expected abstraction.

P1, terminal session 17269, exit 0:

```sh
PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/test-entry-rules.test.mjs tests/support/test-entry-rules-installed.test.mjs tests/support/test-entry-rules-standalone.test.mjs tests/support/page-object-native-fixture.test.mjs tests/payload-declaration-links.sh tests/install-public-payload.sh tests/update-adds-new-payload-skill.sh src/skills/dough-execute-plan/scripts/consumer-trace-guidance.test.mjs
```

This renews source routing/reference closure, exact guide bytes, true/false/
omitted/non-boolean flags, overlap, custom membership, missing/malformed/unreadable
settings, generated correspondence and real installed operation without project
npm dependencies. The invalid values remain raw overrides outside the valid
IntentLocation builder. Cursor is the real install entry context for the installed
check; shared `.agents` and `.claude` roots both have full byte/record/preservation
assertions. Accepted repair-reader and slice 3 changed-source proof is reused;
no declaration grammar, Git collection, parser/matcher or TypeScript contract
changed. No full suite or unaffected watcher proof was repeated.

P2, terminal session 98339, exit 0:

```sh
PATH=/opt/homebrew/bin:$PATH caffeinate -s -i npm test -- tests/support/page-object-makeme-browser-proof.mjs
```

The control observes independent fresh builders/values and the explicit
Atlas-to-Boreal relationship. Mutating one completed value leaves the others
unchanged. A builder-arranged scenario passes with held-read/request evidence;
removing only the catalog setup fails Expected Atlas/Received empty. Thus fixed
harness records cannot supply a passing authored test. This is fixture proof,
not native MakeMe application. Actions, independent answers and deliberate
invalidity remain outside domain builders.

P3, terminal session 19845, exit 0, covers the later addition of the `neither`
fixture mode and renews default-fixture preservation without another native run:

```sh
PATH=/opt/homebrew/bin:$PATH npm test -- tests/support/page-object-makeme-fixture.test.mjs tests/support/page-object-native-fixture.test.mjs && bash -n tests/support/page-object-native-run.sh
```

The new installed fixture contract observes actual false/false settings, both
real guides present in both roots, and each installed selector returning both
sources off outside the project without project npm dependencies.

## Fresh native results

Maintained native adapters, writable isolation, owned supervision and stream
reader were unchanged. Each command ran once, sequentially, with the maintained
480-second deadline. All returned exit 0, outcome exited, stream complete.

```sh
PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash tests/support/page-object-native-run.sh claude both /tmp/page-object-307-slice4-claude-both
PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash tests/support/page-object-native-run.sh codex makeme-only /tmp/page-object-307-slice4-codex-makeme-only
PATH=/opt/homebrew/bin:$PATH caffeinate -s -i bash tests/support/page-object-native-run.sh claude neither /tmp/page-object-307-slice4-claude-neither
```

**Both:** session 59329; Claude Code 2.1.322. `calls.jsonl` call 3 reads actual
configuration (`makeMe:true,pageObjects:true`), both installed entrypoints and
both real conventions. Calls 4/5 author and run the scenario, each reporting
SCENARIO PASSED. The result builds Boreal, then Atlas `.relatedTo(boreal)` with
explicit identities/titles, completes both through the project factory and seeds
them through the owned setup boundary. It reuses LibraryPage/ItemPanel. Atlas,
Boreal and order remain literals at the caller, as do held-read synchronization,
the one-read assertion before release and exact two-read assertion after navigation.
Only the new browser scenario changes. Claude read the guides directly; it did
**not** invoke the selector or read the common procedure. This result proves its
actual useful guide application, not command compliance. P1 covers the both-flag
combination; the following fresh MakeMe-enabled result observes the mechanism.

**MakeMe only:** session 2995; codex-cli 0.167.1. Calls 2/3 read both lean gates
and the common selection procedure. Call 4 invokes installed
`.agents/skills/dough-execute-plan/scripts/test-entry-rules.mjs --project . --source
legacy/library.spec.mjs`, observing `makeMe:true,pageObjects:false`. Call 5 reads
only the MakeMe convention. It does not read the page-object convention. The
authored test builds explicit Boreal/Atlas values and their relationship through
the factory, while retaining direct scoped Playwright controls like the existing
legacy example. Literal expected titles, held Loading before release and the
exact `['atlas','boreal']` request array remain independent. Call 6 reports
SCENARIO PASSED; call 7 shows only the new legacy scenario. Startup initially
produced no events while its isolated state database grew; a bounded read-only
process sample is retained. It then completed inside the deadline, without retry,
adapter change or modifying the database. No failure/timeout was excused.

**Neither, with the new full catalog:** session 71004; Claude Code 2.1.322.
The page-object Skill gate is invoked. Call 3 reads the common procedure,
configuration and project support files; call 4 runs the installed `.claude`
selector and observes `makeMe:false,pageObjects:false`. No MakeMe or page-object
convention is read, including in the native tool/read records. The result uses
raw local records and direct legacy browser controls, preserving local practice;
it imports no project factory or UI object. Call 5 reports SCENARIO PASSED and
only the new legacy scenario. Reading the project's own factory file through
`support/*.mjs` is ordinary API inspection, not shared convention activation.

Each directory retains prompt, fixture/release/update logs, version, complete
events, calls/tools/reads, authored result and terminal classification.
Independent post-run comparison finds **348 declared payload paths per root**
byte-identical to each native project's isolated release, no project
`node_modules`, and the exact published MakeMe convention blob above. Each
`candidate.json` records the base, release commit, settings and 20 relevant
installed hashes. Native source releases are respectively `0d07a1ebb97f`,
`b21545f6ee8b` and `1da9bf343f7c`; these are fixture commits only.

## Independent controls, correspondence and disposition

Assessment session 71469 returned exit 0 after three sequential negative controls.
For each authored result, changed only the expected Boreal title to
`Wrong expected item`, ran the existing README scenario command, required exit 1
and meaningful Expected/Received text, then restored and byte-compared the
original in `finally`. Actual scenario commands were
`node run-tests.mjs browser/library.spec.mjs` for both and
`node run-tests.mjs legacy/library.spec.mjs` for each other project, executed
sequentially under `PATH=/opt/homebrew/bin:$PATH caffeinate -s -i node --input-type=module`
with the independent assessment supplied on stdin. Every `negative.txt` names Expected Wrong expected item,
Received Boreal. `independent-observations.json` records restoration, unchanged
tracked files and the authored hash:

- Both: `c4c211b7559b22f022c96b42894a07e76feec8a5aa67ac493664ee4799fc1e03`.
- MakeMe only: `91b6adba397a6bce0d9b46b615060a50ea33ef61bff0afb1a3f4480146da3a35`.
- Neither: `45daef0637eb53e5a17507325a3d00ff173bb28d148b9b3d2c9ea87516478b36`.

Application, harness, project settings, factory, installed guides and unrelated
guidance remain unchanged after each native task. No owned test/native process
remains. Pre-P2 host: AC 91%, lid open, memory free 54%, load 11.33/8.89/9.83.
Before both: AC 91%, memory 56%, load 15.40/10.24/10.26; before MakeMe-only:
AC 92%, memory 60%, load 25.84/14.48/11.85; before neither: AC 96%, memory 59%,
load 19.18/22.89/17.31. Competing work was ordinary builds/tests/VM activity;
CPU was modest at native launches. All expensive runs used AC `caffeinate -s -i`.
The observed 12:44:07–12:56:21Z window on 2026-11-11 has no sleep/wake in
`/tmp/page-object-307-slice4-makeme-sleep-events.txt` (latest event Nov 7).

G2 commitments 44/46/72 now have real guide application for both and MakeMe-only,
plus fresh neither under the new catalog. Selector results or harness repository
construction are not counted as that application. The unchanged page-only native
body/result, descriptions, gate mechanism and default fixture reuse accepted
slice 2/earlier slice 4 proof; there is no fresh page-only session with this new
catalog claim. Independent selection is renewed by P1 and the fresh false gate
by neither. Codex has fresh MakeMe-only use in `.agents`; Claude has fresh both/
neither use in `.claude`. Cursor remains skipped/unverified under Terry's
current-execution exception, with deterministic new-guide delivery covered by P1.
No all-host native matrix/pass, future waiver or separate story closure is claimed.

Trace final refresh 20868 after P3 (and earlier sessions 4875/93159), all exit 0,
used the installed `consumer-trace.mjs --checkout`
this checkout, `--base 837c307d2cb94afaa342fa4ce956a72d758c1d6e`, exact source/
installer/common-reference/native-fixture/test/document paths, and specific terms
`dough-makeme`, `createPageObjectMakeMeProject`, `makeMeProjectFiles`,
`library.replaceItems`. Exact invocation and all 815 dispositions are retained in
`/tmp/page-object-307-slice4-makeme-consumer-trace.md`: 27 run, 21 reused and
767 excluded, none blank. Semantic runtime/fixture and installer readers were
inspected; most other matches are generic SKILL/PLAN/convention filenames,
incidental identifiers, installed snapshots, records or unaffected independent
fixture/guard boundaries. This trace is impact evidence, not behavior proof.

`git diff --check` passed. Every owned file is below 250 lines. Source
VERSION/CHANGELOG/tags and real project opt-ins/local rules are untouched.
No managed installed copy was edited, no unrelated suite was converted, and no
generic registry/framework was added. Changes remain uncommitted for independent
refactoring and coordinator delivery/CI.

## Independent refactoring acceptance

Read-only review found no edit candidate or uncovered consumer. Preserved guide
blob and one shared selection/Git/payload owner; reused current 815 dispositioned
consumers and unchanged P1/P2/P3/native observations. No tests rerun because no
refactor edits. Fresh whitespace/size checks passed. REFACTOR COMPLETE.
