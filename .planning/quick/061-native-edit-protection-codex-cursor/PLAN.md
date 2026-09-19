# Establish native edit protection and scripted workflow use in Codex and Cursor

Status: planned. No execution has started or been authorized.

## Source and remaining outcome

Source: extracted from
[the gate-and-deliver scripted backlog plan](../060-gate-and-deliver-scripted-backlog/PLAN.md),
by owner authorization during that plan's execution, on 2026-09-19. That
plan's slices 1-6 (the scripted Git-gate core: merge/rebase/cherry-pick
gating, install/update delivery, and caller routing) are delivered; its
slices 7-10 below are unstarted and are extracted here verbatim in outcome,
so that plan can finish with only its Claude Code slices (renumbered 7-8
there). This plan's own slices 11-12 (Claude Code) are not part of this
extraction; they remain in the originating plan.

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
Status: planned, conditional on host feasibility
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
Status: planned
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

If the originating plan's Claude Code slices (delivered separately) establish
a working guard/native-test pattern this plan can reuse directly rather than
rediscovering it, prefer that reuse over independent invention — check that
plan's delivered evidence before starting this one.

Execution requires separate authorization. When authorized, retain the
established project execution/refactor/delivery gates, run focused proof per
slice, and use `npm run lint` / `npm test` for the required broader checks.
Planning alone performs no commit, push, hook installation, product
implementation, or native run.
