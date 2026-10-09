# Keep reported gaps owned through the story's remaining slices

**Identity:** SEED-125#keep-reported-gaps-owned
**Source:** [refined story](../../seeds/SEED-125-story-gap-acceptance.md#keep-reported-gaps-owned).
**Prepared:** 2026-10-09, planning only, in this established worktree,
on `claude/keep-reported-gaps-owned-through-the-story-s-rem`, assigned to `jacked-chan`.
Publication target `origin/main`; integration checkout `/Users/terryyin/git/open-dough`.

## Goal and boundaries

In planned execution, every gap, loss, or interim behavior an implementation
return names becomes a structured story obligation in the active plan, and an
installed script checks those entries against the story and the slices.
A plan-scoped remark or a free-text learning can no longer close one.
Only these close it: sufficient proof, the story's own exclusion, a recorded
owner change, or the receiving slice's proof.

In scope, from the story: the plan's obligation entries and their seven
dispositions; the installed check script (delegation listing, slice-commit
refusals, completion refusal); interim re-reading at dependent slices;
replanning and quick-to-planned carry; the execution guidance that uses them;
payload declaration; automated replay-fixture proof; a developer-run host
replay.

Material exclusions, from the story:

- A dashboard view of obligations, a general history system, and unrelated
  planning or refactor changes.
- Automated judgment of whether a gap contradicts the goal. The script checks
  structure and verbatim story quotes; the coordinator's reading stays a
  judgment, recorded where the script and the retrospective see it.
- Migration of existing plans. A plan without the section has no obligations.
- Single-slice quick execution keeps its same-slice return rule without a
  plan.
- Rewording the released Accept proof rule or adding a reminder beside it.
  Its text changes only where the record replaces it.

## Published baseline and integration context

Origin was fetched at `a4c1913e` (`origin/main`). The highest allocated plan
there is `282-dashboard-suite-stable-under-load`; `283-keep-reported-gaps-owned`
was free immediately before this write. No North Star topic governs execution
acceptance records. ADR 0003 (payload declaration on promotion) and ADR 0006
(write for the executing agent) apply; no Accepted ADR conflicts. This plan
adds no North Star topic.

## Existing solutions and selected approach

PFE, within the product:

- **Reuse** `readPlanSlices` (`dough-product-backlog/scripts/product-backlog-plan-reader.mjs`)
  for slice numbers and `planned`/`done` status. It already ignores fenced
  examples and is shared by CLI and dashboard. Do not write a second slice
  parser.
- **Reuse** `readHome` (`dough-product-backlog/scripts/product-backlog-home-reader.mjs`)
  for the story's own section (`region`) from the plan's `**Source:**` link.
  Verbatim quote checks run against that region only, never the plan or a
  sibling story.
- **New** `dough-execute-plan/scripts/story-obligations.mjs`: a reader for the
  plan's `## Story obligations` section plus a CLI with `list` and `check`.
  Execute-plan scripts already import product-backlog modules by
  `../../dough-product-backlog/scripts/`, and both reused modules are already
  in `install.sh`'s `managed_files`.
- **Change** the execution guidance, not a new skill: `delegation.md` (carry
  the listing), `wrap-up.md` Accept proof and Deliver step 5 (record entries,
  run `check` before commit), `finish-or-stop.md` (run `check` before the
  completion record), `planning.md` (plan section format; replanning moves
  entries), `oversized-slice.md` (quick attempt carries reported gaps).

Entry format, one `###` entry per obligation under `## Story obligations`:

```markdown
### G1. Holdings panel omits the source
Reported: slice 4 — "The Holdings page panel (`HoldingsExitSettingsResults.tsx`) renders the same response but does not show the source."
Story clause: "Each signal and exit row names that source"
Disposition: return
```

Dispositions: `return`; `receiving slice <N>`; `interim until slices <N>, …`;
`excluded "<story quote>"`; `owner changed "<story quote>"`;
`no user cost "<goal quote>": <reason>`; `proved by slice <N>: <proof location>`.

## Current decisions

- Established execution: Story Branch, this worktree, branch `codex/keep-reported-gaps-owned-through-the-story-s-rem`, publisher `dashboard-territory.local-open-dough`, agent `dbs-chan`.
  Claim `f3c18be67af7ae97f30df57c1e720e087ad2d30c` accepted on `origin/main`; starting revision `48ffeb9f0564382092b30b5caf3ac91f500b783f`. Checkout existed before this session.
  Integration checkout `/Users/terryyin/git/open-dough`; increments publish to this execution branch on `origin`. Planning authority permits within-story refinement; no numeric hard limit supplied.
  Latest accepted increment before slice 4: `ce0aaa3caed8325e839e40c13417dc30a2f9ed3b`, same remote execution branch; its CI run 37888897589 passed.
- Setup passed here: official Node 24.21.0, locked npm/browser acquisition, `node scripts/setup-native.mjs check`, Chromium 153.0.8010.12.
  Inherited `NODE_ENV=production` initially omitted dev dependencies; acquisition succeeded with `NODE_ENV=development`.
  Command prefix: `PATH=/tmp/open-dough-node-24.21.0/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:$PATH`.
- CI: verified GitHub push workflow `ci.yml`, repository `terryyin/open-dough`, target this execution branch. Old observer `/tmp/dough-ci-501/watch-Hk4eD4` stopped with zero unread events and confirmed process exit. Resumed Codex observer cell 5, session 74052, directory `/tmp/dough-ci-501/watch-P07DWx`, PID 339, coordinator `dbs-chan`.
  Runtime `.agents/skills/dough-execute-plan` here. The earlier trunk claim is unobserved by this branch observer; delivery registers increments.

- **Every named gap gets an entry, judged against the story.** Each entry
  needs a `Story clause:` quote that must appear in the story's section. The
  script cannot judge the gap, but it makes the coordinator read the story
  instead of the plan (ODF-139).
- **Quotes match after whitespace normalization.** Seeds wrap lines, so
  matching collapses runs of whitespace (including line breaks) and ignores
  Markdown emphasis markers. Matching is still verbatim word for word; it is
  not fuzzy.
- **Interim closes only by proof or a return.** Earlier dependent slices may
  be done while an interim stays open. The last slice it names cannot be
  marked done while it is open, and completion is refused.
- **`check` is the gate, not a hook.** The coordinator runs it before a slice
  commit and before the execution-complete record, as it runs other
  installed entry points. It reports one JSON line and exits non-zero on a
  refusal. No Git hook is added.
- **Host replay authorized:** developer instructed “run slice 4” on 2026-10-10. Three isolated Claude Code sessions use the existing native supervisor's 3,600-second default per case; preparation/coverage/assessment/confirmation split 10/60/20/10. The free fixture proof remains accepted; native prompts carry historical context without expected answers.

## Decisive premises and observations

| Premise | Consumed by | Observation | Result |
| --- | --- | --- | --- |
| `readPlanSlices` returns each slice's index and `planned`/`done` status and ignores fenced examples | Slices 1–2 | Read `product-backlog-plan-reader.mjs`: `sliceHeading` `### N. name`, `statusLine` `planned|done`, `unfencedLines`; it is exported and used by `execution-completion-record-guidance.test.mjs`. | Confirmed. |
| `readHome(source, href)` yields the story section's line region from a seed link | Slice 1 quote checks | Read `product-backlog-home-reader.mjs:143`: returns `document.lines` and `region` from `regionFor(lines, relative, anchor)`. | Confirmed. |
| Execute-plan scripts may import product-backlog modules, and both are installed | Slice 3 payload | `grep` finds five execute-plan scripts importing `../../dough-product-backlog/scripts/`; `install.sh:58` and `:65` declare `product-backlog-home-reader.mjs` and `product-backlog-plan-reader.mjs`. | Confirmed. |
| A new `src/skills/*/scripts/*.test.mjs` runs in the suite without registration | Slices 1–3 proof | `tests/node-test-files` holds `src/skills/*/scripts/*.test.mjs`; `scripts/test-jobs.sh` schedules each match. | Confirmed. |
| A new installed script must be added to `managed_files`, and guidance links must reach declared files | Slice 3 | ADR 0003's Promoted row; commit `493187cc` added `applicable-candidate-proof.mjs` with its `install.sh` line; `tests/payload-declaration-links.sh` checks every relative link in declared Markdown against `managed_files`. | Confirmed. |
| Seed story text wraps across lines, so a raw substring check fails on real quotes | Decision on normalization | The SEED-125 story section in this workspace wraps every sentence at about 78 columns. | Confirmed. |
| The three replay sources are recoverable locally | Slices 1–2 fixtures; slice 4 | `git cat-file -t` in `~/git/pygardon` for `a4673f7b6` and `f93f2014b`, and in `~/git/doughnut` for `0662bac730`: all `commit`. Plan 303 at `a4673f7b6` links `SEED-078-…#story-auto-trading-same-basis`. Execution read the seed: its clause is "Each signal and exit row names that source"; "Holding exit settings name their source." is plan-only. | Confirmed with corrected authoritative quote. Fixtures copy the decisive story sentences and return quotes into this repository; tests never read the other repositories. |
| A coordinator given the guidance and script records and acts on the obligations | Story evaluation | Only a native host run observes it, and those cost money. | Bounded by slice 4, developer-run, after the free proof. |

## Outside-in proof ownership

| Promise (story example) | Owning slice | Proof |
| --- | --- | --- |
| False plan scope refused (1) | 1 | `story-obligations.test.mjs`: plan-303 fixture with `excluded "The slice only asked for the Auto Trading Holdings section."` → `check --slice 4` refuses `quote-not-in-story`; with `return`, marking slice 4 done refuses `open-obligation`. |
| Learning is no disposition (4) | 1 | Plan-280 fixture: entry with `Disposition: learning` or none → refused `no-disposition`. |
| Genuine exclusion stays excluded (5) | 1 | Story fixture with "excludes the release cache budget remedy"; `excluded` quoting it → `check` passes with slice done and at completion. |
| Owner change (6) | 1 | `owner changed` quoting changed seed text passes; quoting text absent from the story refuses. Earlier done slices stay done. |
| Receiving slice carried and enforced (2) | 2 | Plan-296 fixture: `list --slice 8` prints the slice 6 obligation; slice 8 `done` with it open refuses; removing slice 8 refuses `dangling-receiving-slice`. |
| Interim made unsafe later (3) | 2 | Plan-008 fixture: `list --slice 3` includes the open interim; marking the last named slice done refuses; `check --completion` refuses while open; changing it to `return` in slice 3 keeps it open. |
| Guidance and script agree; payload installs it | 3 | `story-obligations-guidance.test.mjs` parses the documented entry example with the script reader and finds the `list`/`check` steps in delegation, wrap-up, and finish-or-stop. `tests/payload-declaration-links.sh` and `tests/install-public-payload.sh` pass. |
| Actual host response (evaluation) | 4 | Developer-run native host replay of examples 1–3; observations recorded in this plan. |

## Ordered slices

### 1. A slice cannot be committed while a reported gap lacks a story-backed disposition
Type: Behavior
Status: done
Accepted: `node --test src/skills/dough-execute-plan/scripts/story-obligations*.test.mjs tests/support/product-backlog-plan-reader.test.mjs tests/support/product-backlog-plan-reader-bold.test.mjs tests/support/product-backlog-plan-completion.test.mjs` — 28 passed. CLI assertions reject false scope, learning-only gaps, absent story quotes, invalid ownership and malformed records; genuine exclusions/owner changes pass. Fixtures supply records only. Independent refactor shared fence visibility and split test cases; inspected boundaries remain unchanged. Refactor agent ran an early formatter contrary to coordinator ownership; coordinator retained delivery formatting.
Proof: `node --test src/skills/dough-execute-plan/scripts/story-obligations*.test.mjs`
with fixtures from plans 303, 280, and a genuine-exclusion story; each
refusal asserts its reason code and the named entry.

Behavior: A plan has `## Story obligations` entries and a `**Source:**` link
to its story → `node story-obligations.mjs check --plan <PLAN.md>` reads the
entries, the slices (through `readPlanSlices`), and the story section
(through `readHome`) → it refuses, naming the entry and reason, for: no or
unknown disposition; a `Story clause`, `excluded`, `owner changed`, or
`no user cost` quote not in the story section; a `receiving slice` that is
not a remaining planned slice; a `done` slice holding an open `return` or
`receiving slice` entry. Otherwise it prints `ok: true` with the entry count.
A plan without the section passes with zero entries.

### 2. Obligations reach the slices that receive or depend on them, and completion waits for them
Type: Behavior
Status: done
Accepted: `npm test -- src/skills/dough-execute-plan/scripts/story-obligations*.test.mjs tests/support/product-backlog-plan-reader.test.mjs tests/support/product-backlog-plan-reader-bold.test.mjs tests/support/product-backlog-plan-completion.test.mjs tests/support/product-backlog-home-reader.test.mjs` passed. Cross-slice/completion/interim-return CLI assertions inspect full listings, dropped recipients/dependencies, final dependency by plan order, every open completion refusal, and proved closure preserving earlier done slices. Refactor shared the done-or-committing predicate; the obligation suite passed again. Converting an interim to return updates `Reported`'s slice to the current owner and retains the reported text/story clause; slice 3 must document this.
Proof: `npm test -- src/skills/dough-execute-plan/scripts/story-obligations*.test.mjs`, with fixtures from plans 296 and 008:
`list --slice 8` and `list --slice 3` output, the last-dependent-slice
refusal, the dangling refusal after slice 8 is removed, and
`check --completion` refusing while a `return`, `receiving slice`, or
`interim` entry is open.

Behavior: `list --plan <PLAN.md> --slice <N>` prints, as one JSON result,
the entries slice N receives and the open interims naming it, each with its
reported text and story clause, for the delegation to carry. `check` also
refuses when the last slice an open interim names is marked done.
`check --completion` refuses while any `return`, `receiving slice`, or
`interim` entry is open.

### 3. Execution guidance records gaps as obligations and runs the check
Type: Behavior
Status: done
Accepted: `npm test -- src/skills/dough-execute-plan/scripts/story-obligations*.test.mjs src/skills/dough-execute-plan/scripts/ci-completion-lifecycle-guidance.test.mjs src/skills/dough-execute-plan/scripts/execution-increment-delivery.test.mjs src/skills/dough-execute-plan/scripts/ci-supported-host-contract.test.mjs src/skills/dough-execute-plan/scripts/execution-completion-record-guidance.test.mjs src/skills/dough-execute-plan/scripts/shared-checkout-writers-guidance.test.mjs src/skills/dough-manual-testing/scripts/workspace-ownership-lifecycle.test.mjs tests/payload-declaration-links.sh tests/install-public-payload.sh tests/install.sh tests/install-refuses-unsafe-topology.sh tests/story-payload-update.sh tests/execution-payload-update.sh tests/install-repeat-force-public-payload.sh tests/install-all-tools.sh tests/install-omits-internal.sh tests/update-adds-new-payload-skill.sh tests/update-refuses-unverifiable.sh tests/update-force-restores-latest.sh tests/update-removes-dropped-files.sh tests/update-skip-verified.sh tests/pin-and-inspect.sh` passed. Generic example adjustment rechecked guidance, links, public install, story and execution update checks. Reader/CLI assertions prove documented format and refusals; static tests prove boundary wiring only. Example 1 walkthrough reads actual seed, refuses plan-only exclusion and open return, requires corrected Holdings panel proof. Independent refactor: none, no rerun. Native follow-through remains slice 4.
Proof: new `story-obligations-guidance.test.mjs` (documented entry example
parses with the script reader; `delegation.md`, `wrap-up.md`, and
`finish-or-stop.md` name the `list` and `check` steps at their points);
`npm test -- tests/payload-declaration-links.sh tests/install-public-payload.sh`;
the check-only commit lint hook. Behavior review per `AGENTS.md`: walk example 1
through the edited Accept proof.

Behavior: The executing coordinator reads its guidance:
- Delegation passes the slice's `list` result as slice promises.
- Accept proof records each named gap as an entry. This replaces the
  sentences that today say a learning or out-of-scope remark does not accept
  it, rather than adding beside them.
- Deliver step 5 runs `check` before the commit, and a refusal blocks it.
- Finish-or-stop runs `check --completion` before the execution-complete
  record.
- `planning.md` documents the section and requires replanning to move
  entries.
- `oversized-slice.md` carries a quick attempt's reported gaps into the new
  plan.
- `install.sh` declares `story-obligations.mjs`.
The focused `story-obligations.md` reference owns the format/dispositions; it and `story-obligation-reader.mjs` are also declared. Planning links that home instead of duplicating it.
Wording follows ADR 0006: no maintainer vocabulary.

### 4. A native host coordinator keeps the three replayed gaps owned (developer-run)
Type: Behavior
Status: done
Accepted: 2026-10-10, Claude Code 2.1.296, configured default `claude-opus-5-5`, installed payload `ce0aaa3caed8325e839e40c13417dc30a2f9ed3b`; three isolated projects, five accepted native calls, all exit 0/complete success. Actual Skill invocations, installed reference reads, native plan writes, CLI outputs and written handoffs were inspected; response-only claims were not accepted.
Proof command: existing `native_run_owned` supervisor (3,600 seconds per case, 15-second grace), `claude --print --dangerously-skip-permissions --output-format stream-json --verbose --session-id <UUID> <prompt>`; later stages use `--resume <same UUID>`. Installer: `bash install.sh --target <scratch project> --source <this checkout> --platform claude`; decisive installed payload bytes matched source.

- 303, session `3534f2f4-1f24-46f0-a93b-bcb600b32802`: native G1 `return`, actual `check --plan .planning/PLAN.md --slice 4` refused `open-obligation`/exit 1; correction handoff requires the omitted panel's source and rendered proof. Slice 4 stays planned, earlier proof retained.
- 296, session `58bbd47a-9474-41b0-bea1-91880ff4babe`: native `receiving slice 8`; slice 6 check passed, completion refused. Same-session continuation runs `list --slice 8` and writes a handoff carrying full G1, live-fault terminal state, previous usable data and next daily occurrence proof. Gate 8 refusal remains owned by free tests; no implementation agent was launched.
- 008, session `7cfdeea8-410f-486b-bca0-765abd3d8bd7`: native `interim until slices 2, 3`; gate 1 passed, completion refused, list 2 included the interim. Later wrong-result facts caused direct plan re-reading, original text/clause retained, owner 3 `return`, and actual gate 3 refusal/exit 1. Earlier done slices 1–2 stayed accepted. No pre-conversion list 3 is claimed.

Two initial 296/008 attempts kept current-slice returns open but lacked retained acceptance/ownership and full story constraints; diagnosed fixture corrections preceded fresh sessions, not guidance edits. Slice 8's expanded lifecycle text represents the archived `(slice 8)` ownership, not a verbatim archived plan; the replay proves retained ownership carry, not spontaneous deferral from the incomplete first fixture.
008's handoff also offered hiding Record until Stop finished; that alternative is not accepted as a product solution against the story's no-rejection constraint. Only the observed ownership, re-reading and gate outcomes are accepted. No product source changed; spent artifacts were deleted after acceptance under ADR 0005, and all native/supervisor processes ended. Independent refactor: none; accepted boundaries unchanged.

Behavior: Given the recorded return text of plans 303 (slice 4), 296
(slice 6 → 8), and 008 (slice 1 → 3), the coordinator records `return`,
`receiving slice 8` carried into slice 8's delegation, and an interim
returned at slice 3. None is filed as a learning or accepted against the plan.
This slice changes no product file unless it shows a guidance defect. In that
case, the fix is recorded here and the replay of that example is repeated.

## Story obligations

### G1. Native coordinator follow-through remains unproved
Reported: slice 3 — "Native coordinator follow-through remains unproved and belongs to developer-run slice 4; no paid host launch was started."
Story clause: "The executing-host replay of those cases, observing the coordinator record and act on each obligation, is a manual, developer-run check because host runs cost money."
Disposition: proved by slice 4: accepted native coordinator observations above

## Verification and sizing

- Slices 1 and 2 are pure Node over text fixtures, each one proof loop well
  under an hour; the focused command is the single test file.
- Slice 3 is guidance and declaration; its focused checks are the guidance
  test and the two payload shell checks (seconds each). The full shell suite
  is not a local gate; CI runs it on publication.
- The check-only lint hook at each commit; checks use `npm test -- <paths>` per `tests/README.md` rather than invoking checks directly.
- Slice 4's paid host runs were authorized and accepted; no further native run is needed.
- Wrap-up records the response commits and, once released, the first
  containing release on ODF-139, ODF-156, and ODF-185, per the story's
  completion criterion.

## Preparation review

Each slice owns one proof loop on a shared disposition model; no refinement concern remained. Actual host follow-through is bounded by developer-run slice 4 after the free proof.
CI run [37887952132](https://github.com/terryyin/open-dough/actions/runs/37887952132), attempt 1, on `9ab257c1` failed Cursor working-screen input and held-client shutdown assertions. Recovery paths are unchanged here; baseline run 37855736413 already failed working recovery, though its precise failure differed. Active harness writer `ruuf-chan`, SEED-123, independently has the same `endHeldClient:57` shutdown failure in run 37888054794. Preserve coordination; precise product-versus-harness causes/ownership remain unresolved. No dashboard repair or CI waiver was made.
