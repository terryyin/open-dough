# Establish native edit protection and scripted workflow use in Codex and Cursor

Status: in progress at the authorized stopping point. Slices 1-2 are done;
slices 3-4 remain planned and outside this execution.

## Execution identity

- Mode: Story Branch Mode.
- Originating and integration checkout: `/Users/terryyin/git/open-dough` on
  `main`; queue claim `eef7eec05e58181f3575976bc9ba7d96da8de2d7`.
- Execution checkout: `/tmp/open-dough-061.WrMwJK/worktree` on
  `codex/061-native-edit-protection`.
- Authorized destination: `origin/codex/061-native-edit-protection`; later
  integration remains `origin/main` through story wrap-up.
- Replanning permission: no current override; preserve the plan's existing
  planning authority and stop after slice 2.
- CI observer: GitHub Actions workflow `ci.yml` / `CI`, target branch
  `codex/061-native-edit-protection`, mailbox `/tmp/dough-ci-501/watch-xnwT5z`,
  PID `31370`, Codex yielded cell `21`; armed from the execution checkout.

## Execution learnings and accepted proof

- Codex CLI `0.144.1` exposes stable synchronous `PreToolUse` hooks for
  `apply_patch`; the patch text is available in `tool_input.command`, and a
  deny decision prevents the patch before backlog bytes change. This supports
  the planned thin adapter without shell parsing or broader enforcement.
- Slice 1 promise: native Codex blocks `apply_patch` for the resolved whole
  backlog while preserving unrelated patches, reads, shell-run scripts, human
  repair, installation/update coexistence, and one managed registration.
  Accepted boundary: the installed Codex hook fragment and shared guard,
  exercised through a real installed Codex session. Inspected setup:
  `tests/support/product-backlog-native-guard.sh` and
  `tests/support/product-backlog-native-guard-codex.sh` fixture/install setup.
  Inspected observations: the Codex adapter's unchanged-backlog assertion after
  denial and its unrelated patch, read, script-write, and human-repair
  assertions. Command:
  `bash tests/product-backlog-native.sh --native codex --case guard`; result:
  pass on `codex-cli 0.144.1`.
- Supporting focused proof: `bash tests/product-backlog-native.sh` and
  `bash tests/install-ci-host-hooks.sh`; result: pass. The native harness was
  split by host adapter during refactoring; production and installer proof
  boundaries remained unchanged and the moved native proof was rerun.
- Broad proof: `npm run format` completed the repository lint/format checks;
  `PATH=/opt/homebrew/bin:$PATH npm test` passed with explicit terminal status
  `0`. Its first run exposed stale installed-topology expectations in the three
  public-payload entry tests and the internal-omission test; adding the already
  delivered `.codex/hooks.json` to those expected enumerations repaired the
  owned gap, and the full suite then passed.
- Slice 2 promise: a fresh native Codex session discovers and runs the installed
  backlog merge adapter for an ordinary-language integration request, stops at
  the adapter's real refusal, and after explicit human repair a second fresh
  session resumes through the adapter to a completed two-parent merge. Accepted
  boundary: the installed guidance plus shared native-use fixture. Inspected
  setup and observations: `tests/support/product-backlog-native-use.sh` creates
  the installed two-branch fixture and asserts Codex JSONL command events for
  the installed `merge --ref close-b` and `continue` calls, real Git mid-merge
  state and adapter-authored conflict bytes, external human repair/staging,
  exact final bytes, a clean index, and two parents. Command:
  `PATH=/opt/homebrew/bin:$PATH bash tests/product-backlog-native.sh --native codex --case use`;
  result: pass on `codex-cli 0.144.1`. The unchanged payload/update proof from
  slice 1 establishes delivery through real update without duplicating that
  machinery in the native-use journey.
- Slice 2 preparation/broad proof: `npm run format` completed lint/format
  checks, and `PATH=/opt/homebrew/bin:$PATH npm test` passed with explicit
  terminal status `0` after the shared harness and runtime guidance changes.

## Source and remaining outcome

Source: extracted from the gate-and-deliver scripted backlog plan,
recoverable at `a3c732c:.planning/quick/060-gate-and-deliver-scripted-backlog/PLAN.md`,
by owner authorization during that plan's execution, on 2026-09-19. That
plan's slices 1-6 (the scripted Git-gate core: merge/rebase/cherry-pick
gating, install/update delivery, and caller routing) were delivered and its
own remaining Claude Code slices (renumbered 7-8) were also delivered; that
plan is now complete and its history deleted by wrap-up. This plan's own
slices below (Codex/Cursor guard and use) were extracted verbatim in
outcome and are unaffected by that closure.

Outcome: an ordinary native patch to the product backlog can be denied before
its bytes change, while reads, scripts, unrelated edits, and human repair
keep working, in both Codex and Cursor — where lightweight, host-native
feasibility actually supports it — and a fresh native session in each host
can follow installed guidance through a scripted integration refusal, human
repair, and validated resume. Guard implementation is conditional on
lightweight feasibility per host; a missing or complex guard is a reported
human decision, not an expansion of enforcement. This plan adds no new Git
gate, install/delivery mechanism, or caller-routing guidance beyond what the
originating plan already delivered; it only proves native use and edit
protection for these two hosts.

## Decisions that constrain execution

Carried forward from the originating plan, applicable to native-host work:

- Guard only the resolved whole backlog against covered native edits.
  Preserve reads, scripts, human repair, unrelated edits and hooks. Do not
  parse arbitrary shell programs or promise all-process enforcement. Each
  host starts with a bounded feasibility observation before permanent
  registration changes.
- Verify current native capability at execution time for each host; do not
  reuse a historical or another host's hook assertion as evidence.
- Reuse existing `tests/support/native-*` isolation, bounded execution, and
  assessment support, and this project's existing delivery-to-use native test
  pattern (see `tests/dough-adr-awareness-codex-delivery-to-use.sh`,
  `tests/dough-adr-awareness-cursor-delivery-to-use.sh`, and their shared
  `tests/support/dough-adr-awareness-delivery-to-use.sh`/`native-codex.sh`
  harness) for structuring each host's native journey, rather than inventing
  a separate native-runner mechanism.
- `src/install/open-dough-register-hooks.mjs` currently registers CI
  fragments for Cursor and Claude, not Codex edit protection or a backlog
  guard for either host; reuse its safe settings-merging where it fits. Do
  not assume this proves an edit hook exists, and do not build a generic
  plugin framework.
- Keep runtime changes under `src/skills/`; extend
  `install.sh`/`src/install/open-dough-release-version.sh`/
  `tests/helpers/public-payload-fixture.bash` together if a guard adapter
  needs installing, following the originating plan's slice 5 precedent
  (declare the full transitive file set in all three, verify with a real
  offline installed invocation, not file-existence alone).

## Ordered slices

### 1. Establish lightweight native edit protection in Codex
Type: Behavior
Status: done
Proof: `bash tests/product-backlog-native.sh --native codex --case guard`

First establish, in an isolated supported runtime, whether an ordinary native
patch can be denied before backlog bytes change while reads, scripts, unrelated
edits, and human repair work. Verify current native capability at execution time;
an old or another host's hook assertion is not evidence. If feasible with a thin
adapter, deliver that adapter and safe install/update registration, then prove
native denial and repeat/update coexistence. Reuse settings preservation where
applicable. If absent or complex, report the exact boundary for human disposition
without expanding enforcement. Slice 2 remains independently runnable; no guard
pass is claimed. Hypothesis: one native editing boundary, separate from workflow use.

### 2. Use the installed scripted workflow in Codex
Type: Behavior
Status: done
Proof: `bash tests/product-backlog-native.sh --native codex --case use`

After real update, a fresh native session follows installed guidance for an
authorized backlog change, encounters a scripted integration refusal, and stops.
After explicit human repair it validates and resumes. Observe actual script calls,
bytes and Git state; the prompt must not prescribe the answer or command route.
Use the guard when slice 1 delivered one. Reuse guard evidence unchanged rather
than redoing its matrix. Hypothesis: one installed workflow journey; record host,
version and candidate. Missing native access is pending proof, not a pass.

### 3. Establish lightweight native edit protection in Cursor
Type: Behavior
Status: planned, conditional on host feasibility
Proof: `bash tests/product-backlog-native.sh --native cursor --case guard`

Apply slice 1's guard outcome and feasibility boundary to the actual Cursor Agent
editing route. Adapt only the necessary event/tool interface; preserve CI hooks
and prevent duplicate invocation through enabled Claude compatibility loading.
Prove denied edits and allowed reads/scripts/unrelated edits/human repair after
installation/update. No Tab coverage. Hypothesis: one host editing boundary;
Codex's result does not establish this host's feasibility or behavior.

### 4. Use the installed scripted workflow in Cursor
Type: Behavior
Status: planned
Proof: `bash tests/product-backlog-native.sh --native cursor --case use`

Run slice 2's shared installed workflow through Cursor's native agent, with actual
tool and file/Git observations. Use any delivered guard, retain missing guard
disposition explicitly, and prove human-only stop/resume independently of guard
availability. Hypothesis: one host journey using the shared cases and assessment.

## Sizing, stopping points, and remaining concerns

Four planned Behavior slices (renumbered 1-4 from the originating plan's
7-10), no completed slices, no supplied numeric target or hard limit. Slices
1 and 3 retain conditional feasibility; missing native capability or complex
registration requires a human decision, not automatic subdivision. Slices 2
and 4 need actual native access and fresh, sufficient evidence; no blanket
direct-execution readiness is claimed. Do not require both hosts' slices to
fit one uninterrupted execution — each host's guard and installed-use
outcomes are independently safe stopping points, so a failed guard
feasibility in one host cannot erase useful proof from the other.

The originating plan's Claude Code slices were delivered separately and did
establish a working guard/native-test pattern: `src/skills/dough-product-backlog/scripts/product-backlog-guard-hook.mjs`
(the `PreToolUse` guard, Claude-only), `src/install/open-dough-register-hooks-fragments.mjs`
(the required/optional per-host fragment combination it extends), and
`tests/product-backlog-native.sh` / `tests/support/product-backlog-native-guard.sh`
/ `tests/support/product-backlog-native-use.sh` (the `--native <host> --case
<case>` proof pattern this plan's own slices should extend with `codex`/
`cursor`, not reinvent). Reuse these directly rather than rediscovering the
pattern.

Execution requires separate authorization. When authorized, retain the
established project execution/refactor/delivery gates, run focused proof per
slice, and use `npm run lint` / `npm test` for the required broader checks.
Planning alone performs no commit, push, hook installation, product
implementation, or native run.
