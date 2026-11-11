# Slice 1 partial observations

Base: 80d20ed9ec7b3df11566ac354bb29ef3065f3989, owned worktree codex/apply-shared-page-object-rules-per-entry. No commit/publication performed by implementation agent.

Candidate skill SHA256: 14de3267b5e2e589381cfa3f8aa02143b939360e2a879cf950c75aef92346d3c.
Convention SHA256: ab47c78ffa62cd7c6e8c10846f6ed3307db40b782c79b63fd2526d38af857129.

## Cheap maintained proof

Command: `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/support/page-object-native-fixture.test.mjs tests/support/page-object-native-browser-proof.mjs`
Terminal result: pass (exit 0).

- `page-object-native-fixture.test.mjs`, `the native fixture installs one candidate in each existing host layout with distinct entries`: creates projects through createPageObjectProject, asserts .agents for Codex/Cursor and .claude for Claude, exact gate/convention bytes, enabled browser versus disabled legacy.
- `the fresh opted-out fixture has no enabled entry`: asserts both flags false in an independent described project.
- `page-object-native-browser-proof.mjs`, `the native browser fixture preserves held reads and expected/actual diagnostics`: actual Chromium + local HTTP library; controlScenario asserts held read received, loading before release, first ['atlas'] observation, explicit Atlas then Boreal titles, final ['atlas','boreal']; successful SCENARIO PASSED output. Replaces only expected Boreal with Wrong expected item; requires nonzero exit and both wrong expected title and actual Boreal in stderr. Restores/removes disposable fixtures through teardown.
- Setup: makeMe.aRepository + makeMe.anIntentLocation + makeMe.intentSettings; exact proposed flag values are inputs under proof outside builder. Harness runtime imports the selected checkout's locked @playwright/test, not a copied/symlinked dependency tree. This is not standalone installer proof.

## Initial enabled native observations

The first enabled prompt supplies the requested Atlas→Boreal behavior, held read, loading and exact read order. It also says `Keep the expected item names in the scenario.` That latter sentence cues one convention clause. The implementation agent removed it from subsequent prompts. These original runs establish discovery, actual convention loading, owner reuse and running behavior; independent expectation-visibility proof is qualified and renewed by the clean enabled observation below.

### Codex

Command: `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash tests/support/page-object-native-run.sh codex on /tmp/page-object-307-codex-on`
Version: codex-cli 0.167.1. Exit0, outcome exited, stream complete.
Evidence: /tmp/page-object-307-codex-on/events.jsonl, calls.jsonl, project/browser/library.spec.mjs.
Reader: node tests/support/native-host-stream.mjs codex <stream> commands/calls.
Actual reads: SKILL.md; .planning/open-dough.json; references/convention.md; LibraryPage/ItemPanel and held-read source.
Authored run exports run({page,assert}), uses new LibraryPage(page).open(), openItem('Atlas'), heldRead.started, showsLoading(), independent request ['atlas'] assertion before release, showsItem('Atlas'), followRelatedItem(), showsItem('Boreal'), independent final request assertion, finally cleanup.
Native first browser command failed EPERM creating Playwright's default OS temporary directory under isolation. Agent diagnosed and ran the unchanged scenario with TMPDIR=/tmp; output SCENARIO PASSED, exit0. This temporary-environment failure is resolved for future probe commands by binding TMPDIR inside the owned artifact root; no isolation bypass or application change.
Independent negative control: replace only authored showsItem('Boreal') with showsItem('Wrong expected item'), run node run-tests.mjs browser/library.spec.mjs outside native wrapper, require nonzero plus expected Wrong expected item and actual Boreal, then restore exact original. /tmp/page-object-307-codex-on/negative-control.log records the discriminating failure.

### Claude Code

Command: `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash tests/support/page-object-native-run.sh claude on /tmp/page-object-307-claude-on`
Version: 2.1.321 (Claude Code). Exit0, outcome exited, stream complete.
Evidence: /tmp/page-object-307-claude-on/events.jsonl, calls.jsonl, tools.jsonl, project/browser/library.spec.mjs.
Actual Skill(dough-page-objects) activation and its injected gate body occur in the native stream; reads config and convention. Authored LibraryPage→ItemPanel handoff, explicit titles, independent held read/loading/release/request observations, finally cleanup. Native command output SCENARIO PASSED with reported exit=0. No other tracked fixture changes.

### Cursor

Command: `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash tests/support/page-object-native-run.sh cursor on /tmp/page-object-307-cursor-on`
Version: 2026.11.10-731fb78. Exit1, outcome incomplete, stream missing.
Evidence: /tmp/page-object-307-cursor-on/stderr.log and result.txt.
Exact failure: `Error: Authentication required. Please run 'cursor agent login' first, or set CURSOR_API_KEY environment variable.`
No inference, discovery, convention application or useful outcome observed. No authentication changes or unchanged retry performed. This unavailable native use gates dependent slices2–4 under the plan. Coordinator owns the developer credential handoff.

## Consumer effect

New Proposed candidate only; no production selector, parser, execution/refactor caller, installer, config opt-in or managed installation changed. Existing-consumer trace: /tmp/page-object-307-consumer-trace.md (installed consumer-trace.mjs with base above and terms dough-page-objects/pageObjects/page-object-native). Existing names matched are basename/generic-symbol references and do not import or activate this new proposed candidate/harness. New harness consumers are createPageObjectProject→projectFiles/MakeMe/materializeLocalCheckout, fixture-layout tests, explicit browser control and manual paid wrapper; proved by commands above. Default node-test-files glob discovers only the cheap *.test.mjs, leaving the explicitly selected browser proof outside shell CI's no-Chromium boundary. tests/native-page-objects.md documents the distinction. Final shared runtime/selector/caller/installer boundaries remain slices2–4, unproved and unimplemented.

## Fresh opted-out native observation

Command: `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash tests/support/page-object-native-run.sh codex off /tmp/page-object-307-codex-off`
Version codex-cli0.167.1. Exit0, outcome exited, stream complete.
Evidence: /tmp/page-object-307-codex-off/events.jsonl, calls.jsonl, project/legacy/library.spec.mjs.
The fresh project has both flags false, a different native thread, and no enabled-entry work before this task. Actual commands read SKILL.md and .planning/open-dough.json, then inspect existing fixture code without loading references/convention.md. Native-authored legacy scenario uses direct locators, held read, loading/Atlas/Boreal assertions, final independent request count and finally cleanup. `node run-tests.mjs legacy/library.spec.mjs` reports SCENARIO PASSED. The initial prompt's visibility cue does not affect the unchanged applicability boundary; coordinator accepted reuse for gating and did not require a second opted-out matrix run.

## Clean ordinary-authoring renewal

Command: `PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i bash tests/support/page-object-native-run.sh claude on /tmp/page-object-307-claude-clean-on`
Version2.1.321 (Claude Code), exit0, outcome exited, stream complete.
Clean prompt contains the requested behavior and test run only; it names neither skill nor convention and does not tell the agent to keep values visible or use page objects.
Independent stream shows Skill(dough-page-objects), injected gate body, configuration read, conditional convention read, and Write of browser/library.spec.mjs. The actual authored scenario uses LibraryPage/ItemPanel with caller-visible Atlas/Boreal values and handoff order, separate heldAtlas.started/loading/request assertions/release, then final request assertion. `node run-tests.mjs browser/library.spec.mjs` output is SCENARIO PASSED and exit=0. No other tracked project changes. This renews the shared convention's independent expectation-visibility observation; unchanged Codex discovery/gating/useful-result and negative-control boundaries are retained rather than rerun as a matrix.

Each native artifact directory now has candidate-hashes.json covering actual installed guidance, prompt, settings, version, result and authored scenario. After all native commands reached terminal exit, removed only their private Codex startup SQLite caches (not evidence, no live process) to avoid keeping irrelevant backfilled session state. Native event streams and authored results remain inspectable.

Overall: incomplete only for Cursor's native discovery/useful-outcome requirement; dependent slices2–4 remain stopped. No story scope or activation mechanism changed. No commits, pushes, slice status changes, formatting, refactor pass, or hook-owned lint run by implementation agent.

## Explicit execution exception

2026-11-11, Terry: "skip the cursor test this time". The Cursor native authoring
probe remains skipped/unverified; continuation is authorized for this execution.
Deterministic Cursor delivery proof and all other promises remain required. This
is no default for other work. Existing successful native observations are reused
while candidate guidance, fixture and covered boundaries correspond.

## Execution context

- Established start: Jane-chan, `SEED-307#apply-shared-page-object-rules-per-entry`,
  publisher `dashboard-territory.local-open-dough`, Story Branch Mode.
- Owned existing linked worktree:
  `/Users/terryyin/git/open-dough/.worktrees/apply-shared-page-object-rules-per-entry`,
  branch `codex/apply-shared-page-object-rules-per-entry`. Originating and execution
  checkout are this worktree; default integration checkout is
  `/Users/terryyin/git/open-dough`. Authorized trunk is `origin/main`.
- Starting revision `2599c7a5db27aac64c5923b592b7f5b66079d348`; accepted claim and
  initial candidate `80d20ed9ec7b3df11566ac354bb29ef3065f3989`. Claim is on trunk;
  claim CI is unobserved. Increment target is origin's execution branch.
- Setup: exact Node `v24.21.0`, checkout-local `npm ci` succeeded with unchanged
  lockfile; `PATH="/opt/homebrew/bin:$PATH" npm test -- tests/payload-declaration-links.sh`
  passed. System Bash 3.2 was refused before checks; use Homebrew Bash 5 on PATH.
  Selective formatter is `npm run format`; pre-commit is check-only staged lint
  and dashboard typecheck for staged scripts.
- CI: GitHub Actions, verified `ci.yml` (workflow 351271804, display name CI).
  Coordinator `jane-chan-307`, yielded cell `g213:14`, session 87922,
  directory `/tmp/dough-ci-501/watch-8WvOcw`, PID 64572; runtime is this checkout's
  `.agents/skills/dough-execute-plan`. Observer covers the execution branch.
- No numeric slice budget or exception supplied. Existing planned refinement
  authority remains; no explicit overrun replanning override was supplied.
- Expensive-proof decision, 2026-11-11, this macOS host: AC power, 45% free memory,
  load averages 19.79/14.37/11.37, competing SEED-287 browser proof with two workers.
  Run native authoring probes sequentially, one host/session at a time, under
  `caffeinate -s -i`; implementation agent owns each terminal result. Native
  duration/authentication are unproved. Reconsider on changed load, launch or
  resource failure, or before another expensive attempt. Preserve other worktrees.

## Current execution boundary

Slice 1 is awaiting independent refactoring and delivery, with proof retained in
[native observations](native-observations.md). Slice 1 proof is accepted under the explicit Cursor exception; independent
refactoring has finished. Delivery remains pending; no execution-complete record,
retrospective or wrap-up has run. Proposed skill
and native harness changes remain uncommitted in this worktree. No execution
increment was published; retained published base is still the claim SHA above.

- Codex enabled and fresh opted-out native tasks completed with actual gate/config
  reads; enabled loaded the convention and reused owners, opted-out did not load
  it and kept direct browser mechanics. The authored positive passed; the wrong
  expected item failed with meaningful expected/actual diagnostics.
- Clean ordinary-authoring Claude task activated the skill, read configuration and
  convention, reused LibraryPage/ItemPanel, retained visible Atlas/Boreal order
  and independent held-read/request observations, and passed the scenario.
  Initial positive prompts included an unnecessary visibility cue; clean Claude
  renews that affected shared boundary. Other unchanged Codex observations remain
  accepted for their own boundaries, not as proof of Cursor.
- Cursor version `2026.11.10-731fb78` exited 1 before authoring:
  `Authentication required. Please run 'cursor agent login' first, or set
  CURSOR_API_KEY environment variable.` No retry or credential change occurred.
  Terry explicitly waived this Cursor native probe on 2026-11-11: "skip the cursor
  test this time". It remains skipped/unverified, not passed; deterministic Cursor
  delivery checks and other work retain their requirements.
- Cheap fixture and explicit browser-control proof passed through the maintained
  runner. Browser proof is explicitly selected, outside default Node discovery
  because shell CI jobs do not install Chromium. Native fixture copying is no
  claim of installer or standalone runtime proof.
- Acceptance freshness check: unchanged source/plan at pinned trunk
  `b757e243d27f803e43b3b3c28fea3f612634639c`, base
  `80d20ed9ec7b3df11566ac354bb29ef3065f3989`. Incoming commits concern CI entry
  navigation and mobile backlog priority; named MakeMe sibling is not integrated.
  No incoming sibling implementation needs reconciliation at this boundary.
- Observer stop confirmed for `/tmp/dough-ci-501/watch-8WvOcw`: status stopped,
  coverage ended, pending CI unobserved, unread events 0. No increment was
  published or registered. Resume may rearm after verifying the old process ended.
- All implementation-owned commands ended and private native watchdogs retired.
  Resumed at the same HEAD/branch with unchanged locked dependency state and a
  passing fixture command. Prior observer process ended; new observer coordinator
  `jane-chan-307`, cell `g230:3`, session 51876, directory
  `/tmp/dough-ci-501/watch-qLujG5`, PID 34832. Preserve the prior proof and finish
  slice 1 before 2–4. Do not repeat the Take.


## Preparation investigation

Observed 2026-11-11: Donut `4e328b86ead11bf711ec84071a34bd7170effa9e` supplies
fluent handoffs and focused mechanics in `.agents/skills/e2e-authoring/SKILL.md`.
Open Dough `1c470849e` keeps independent evidence and limits its cue pilot to three
journeys. Its parser drops both proposed flags; direct membership still works.
Recommend MakeMe's conditional skill and callers. Local pointers retain routing
maintenance; generated host rules add activation/coexistence machinery. Borrow
scoped-policy binding: entries select subjects, flags select conventions, consumers
share one resolver. Routing does not prove application. The strongest doubt is
fluent syntax hiding causal order or expectations: native proof must inspect useful
results. Discovery remains a hypothesis bounded by an early execution probe.


## Independent refactoring acceptance

`refactor_1` completed its read-only pass after the cohesive record reorganization.
Only the native wrapper prompt was deduplicated; both on/off prompt byte outputs
match the pre-refactor source. Bash syntax and whitespace passed. Candidate
guidance, fixture and observed native scenarios did not change; proof is reused.
Proof and both consumer dispositions: `/tmp/page-object-307-refactor-proof.md`,
`/tmp/page-object-307-refactor-consumer-trace.md`. Marker: REFACTOR COMPLETE.
