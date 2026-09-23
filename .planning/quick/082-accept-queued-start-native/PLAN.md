# Verify native agents publish Taken before queued work begins

Status: in progress; paused on missing Claude resume proof. Slices 1 and 2 are accepted; slice 3 remains incomplete. No automatic retrospective runs for this incomplete execution.

Identity: `SEED-008#accept-queued-start-native-behavior`

Source: [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#accept-queued-start-native-behavior). On 2026-09-23 Terry confirmed reliable shared state as the most important next milestone for a useful dashboard and requested slice planning and refinement. That request authorized preparation; the subsequent `dough-execute-plan 82` instruction authorizes this execution, as recorded below.

## Goal and scope

The maintainer can judge whether the installed startup behavior makes agents in Codex, Cursor, and Claude Code confirm an owned Taken claim on remote trunk before project setup and the first implementation change. Refusal must stop unsafe starts; resume must retain ownership without a duplicate Take. Preserve selected source and unrelated local work. Both Trunk Mode and Story Branch Mode remain covered, with justified evidence reuse rather than a host/scenario matrix.

Accept the startup implementation introduced at `1a63c0c5045703006af621f785e81cf6301873d3` as carried by the actual candidate chosen for execution. The superseded-runner correction was delivered at `6f5d0ef` and closed at `f520217` while this plan was being prepared. Its plan and completion evidence are recoverable at `d10131b:.planning/quick/081-retire-legacy-claim-runner/PLAN.md`. Assess its effect on the chosen candidate before the final acceptance judgment; removing the duplicate runner does not automatically invalidate native behavior proof. Final acceptance must identify the intended resulting candidate and justify applicability to it.

No new startup feature, general agent-competence test, host mode, dashboard UI, ownership naming, CI automation, later publication caller migration, local checkout coordination, release/version change, or broad test-framework cleanup. The fixture's first implementation change is sufficient; full feature delivery and wrap-up are outside this acceptance. Real product failures route to a bounded correction, preserving evidence and leaving the affected acceptance pending. Only concrete assessment gaps may change the existing runner/fixture here.

## Existing solutions and decisions

Follow Accepted [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md): review reusable evidence first, assess native behavior independently per affected requirement and host, bound retries, and finish acceptance before releasing the affected behavior. [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md) distinguishes the selected source candidate from a released installed revision; this work creates no release or exception. The existing [North Star remote-publication topic](../../NORTH-STAR.md#remote-publication-and-default-checkout-ownership) keeps shared claim publication, local refresh, and CI coverage separate. ADR 0009 remains Proposed. No new architectural decision or North Star topic is needed.

PFE assessment: reuse the maintained publication-native journey, not the ADR discovery harness, dashboard fixtures, or a direct command invocation as a replacement for native behavior. Those alternatives own different promises.

| Responsibility | Existing owner and use |
| --- | --- |
| Installed startup and caller | `src/skills/dough-execute-plan/scripts/execution-start.mjs` and the skill's Take queued work section. Observe actual invocation and subsequent agent behavior. |
| Native launch and retention | `tests/git-publication-native.sh`, `tests/support/git-publication-native-{host,run,evidence}.sh`; select an explicit startup case and retain trace, version, candidate, and observations. The no-case host defaults run other publication journeys and are unsuitable here. |
| Real preconditions and observations | `tests/support/git-publication-native-startup-fixture.sh`; queued source, bare origin, pending human work, and setup markers. Ordinary startup does not pre-create the claim. Rival/resume fixtures intentionally establish prior claims and prove only the resumed decision. |
| Verdict and counterexamples | `tests/support/git-publication-native-startup-assess.sh`, `git-publication-native-counterexamples.sh`, and the default credential-free runner. Extend these only for the gaps assigned below. |
| Mechanical contracts | Actual CLI process tests `src/skills/dough-execute-plan/scripts/workspace-publication-startup-{race,recovery}.test.mjs` plus payload/caller checks. Reuse applicable results; these cannot establish native adoption. |

Historical accepted observations and gaps are recoverable from `ce77380fa796b04e70d1d9973f930ce54f5bacb2:.planning/quick/080-publish-startup-claims/PLAN.md` (slice 1 execution evidence and slice 2 accepted proof) and the source story. Those summaries guide recovery; they are not substitute transcripts or blanket acceptance. Recover available decisive artifacts from their recorded locations or Git. If a required observation cannot be recovered or justified, obtain fresh proof rather than upgrading the summary into a pass.

## Shared proof discipline

At execution entry, identify the candidate revision and any relevant uncommitted changes, actual installed payload, native runtime/version, adapter, prompt, fixture, and assessor. Use a stable candidate for selected runs. Review changes since historical proof by affected requirement; unrelated edits do not require rerunning accepted cases. Reconcile later candidate changes before final judgment.

For each slice record compact requirement/host judgments in this plan: fresh pass, justified reuse with decisive evidence, or unresolved with a reason. Give the literal command, inspected setup/observation locations, candidate/runtime, and actual result. Store original active artifacts under this plan's `evidence/` using the existing runner. Do not copy whole transcripts into the plan or add a parallel evidence registry. Integration proof and skill behavior stay distinct. Preserve active evidence until assessment and eventual wrap-up; ADR 0005 owns its later deletion with Git recovery.

Fresh prompts state the user's task and authority without giving the expected command sequence. Inspect complete native command/use traces and independent remote/local observations. Self-report, exit zero, static checks, another host's success, or quota refusal are insufficient. Check that claim ownership is current, not merely that an old publisher trailer appears somewhere in history.

Commands below run from the eventual owned execution checkout, using Bash 4+ as required by the repository. The existing native runner defaults to a 900-second deadline and 15-second termination grace; these are per-run bounds, not slice estimates. Attempt each selected unresolved case once, inspect the result, and retry only after a diagnosed cause or changed access condition. Do not poll quotas or rerun until green. A host access failure stops that host's dependent proof; independent evidence review or available-host work may continue. Missing host proof never completes its slice or the story.

## Ordered slices

### 1. Confirm ordinary startup publishes the shared claim before work

Type: Behavior
Status: done — accepted by coordinator.

Behavior: prepared queued work and authorized workspace/remote, with unrelated local edits -> a fresh agent follows installed guidance in either supported mode -> remote trunk confirms its owned Taken claim before setup and the first implementation change; local work survives even when checkout refresh is deferred.

Review Cursor ordinary Story Branch evidence for reuse. Resolve the Codex ordinary-startup gap and the tightened Claude ordinary-startup gap. The recorded Codex run published and ran setup but delegation failed (`no thread with id`); it is partial evidence, not a completed startup-to-first-change observation. The earlier Claude pass and later API-limit result need assessment against the current setup-order requirement. Do not add full implementation completion as an acceptance condition or silently waive a missing first-change observation.

Proof: use `publication/startup-trunk` and `publication/startup-story-branch`. Inspect installed invocation, remote Taken membership/provenance, remote target, setup and command markers, first implementation tool action, and exact human and selected-source preservation. Story Branch's claim must be on trunk, not only its execution branch. Reuse matching mechanical proof for safe/deferred local refresh; do not equate a deferred refresh with failed remote publication.

Concrete assessment gap: current `first-edit-after-claim` and setup order rely on final file mtimes. An early edit/setup followed by a later rewrite can pass that check. Combine the native tool trace and authoritative claim receipt with remote state; when ordering is not decisive, leave it unresolved. Add the smallest observation/assessor improvement only if needed for a reliable verdict, with an early-edit-then-rewrite counterexample. No generic event framework.

Selected commands, unless the exact requirement is covered by justified reuse:

```sh
bash tests/git-publication-native.sh --native codex --case publication/startup-trunk --results-dir .planning/quick/082-accept-queued-start-native/evidence
bash tests/git-publication-native.sh --native claude --case publication/startup-story-branch --results-dir .planning/quick/082-accept-queued-start-native/evidence
```

Only if Cursor reuse is insufficient, select its `publication/startup-story-branch` case through the same command. Run `bash tests/git-publication-native.sh` after any observation/assessor change; its substitute passes prove assessment logic, not native behavior. Execution results are recorded below.

Safe stopping point: each host's ordinary-startup obligation is accepted or its exact gap remains visible. Mark this slice done only when all its requirements have passing native evidence or justified reuse. Other startup promises remain owned by slices 2 and 3; ordinary startup alone does not complete acceptance.

#### Slice 1 evidence review (2026-09-23)

Candidate: `02108dfb28cabd05839c3aa16d820ce7d0fc33c7`, with unchanged product payload. All fresh runs launched before slice 2's harness edits, so their loaded startup fixture/assessor are the versions at that SHA. Their `record` input hashes are retention-time hashes: the later fresh Cursor/Codex records may identify slice 2's edited files rather than the shell functions already loaded at launch. This distinction does not affect the installed product.

Historical original artifacts were recovered from macOS `$TMPDIR` and copied unchanged under `evidence/<host>/publication/startup-story-branch/`. An initial lookup in Git, worktrees, and `/tmp` missed that host-specific directory; fresh Cursor and Claude runs had already started before the original artifacts were located. No retry was made.

- **Codex ordinary Trunk: fresh pass.** Command: `PATH=/opt/homebrew/bin:$PATH GIT_PUBLICATION_KEEP=1 bash tests/git-publication-native.sh --native codex --case publication/startup-trunk --results-dir .planning/quick/082-accept-queued-start-native/evidence`. Terminal exit 0, complete stream, Codex CLI `0.144.1`; artifacts in `evidence/codex/publication/startup-trunk/20260923T062909-023d/`. Full trace: startup invocation `events.jsonl:19`, published receipt 20, setup/applicable command 22/result 23, first feature file-change 26–27, successful content observation 29, and terminal event 57. The native host's delegation failure was followed by the installed single-interactive-slice fallback, so the first-change gap from the old run is actually resolved. Remote history independently confirms owned claim `3d9e0e2cc4e196489c4dad539f54b429001a8204` followed by implementation `8d15f6e2b438f64175d4c91d6708c5dec6e6c0b2` on main, with Taken retained. Source and human preservation checks pass. Later delivery/refactor behavior is beyond this startup-to-first-change acceptance. `remote-history.txt` records the independent bare-origin inspection.
- **Cursor ordinary Story Branch: fresh pass.** Command: `PATH=/opt/homebrew/bin:$PATH GIT_PUBLICATION_KEEP=1 bash tests/git-publication-native.sh --native cursor --case publication/startup-story-branch --results-dir .planning/quick/082-accept-queued-start-native/evidence`. Terminal exit 0. Runtime `2026.09.18-9a7762b`; original artifacts in `evidence/cursor/publication/startup-story-branch/20260923T062634-27de/`. Complete tool-use trace: installed startup invocation at `events.jsonl:193`, published receipt at line 196 (call `call-95b2f373-74e6-4baa-803d-c33f15bf1ffc-29`), setup and applicable command at line 213/result 214, first feature edit at line 334. Earlier actions only inspect files/state. Receipt and independent remote observations agree on owned claim `4e68f7b658477e45ddf30ac268aba3d3b9147e8d` on `refs/heads/main`. Independent fixture Git history has only base plus that claim on main; Taken membership, selected-source bytes, and staged/tracked/untracked human changes are preserved. Local refresh is deferred separately. Historical Cursor `20260923T040259-43b1` also has receipt 198, readiness gate 227, and first edit 265; it is retained as recovered evidence, not another fresh run.
- **Claude ordinary Story Branch: justified reuse.** Original artifacts in `evidence/claude/publication/startup-story-branch/20260923T035025-0152/`, Claude Code `2.1.280`, terminal native exit 0. Complete command/use trace discloses the actual installed caller at line 28, published receipt 126, remote verification 147, setup then applicable command 149, and first feature write 190. No earlier setup or implementation action occurs. Independent observations identify remote main exactly as published claim `d9857bde68be030e779b372975a4344d7cf8dfbc`, with owned Taken and exact human/source preservation. Thus the earlier missing `setup-after-claim` field does not leave order uncertain: the trace establishes it directly. The record's `bb509662` source revision is the then-current HEAD while the 080 payload was uncommitted; the observed installed caller matches the ordinary-start path delivered at `194617b`. Current caller changes add interrupted-recovery instructions and completion behavior; runtime extraction preserves the ordinary commit/publish/remote-confirm/receipt path, while subsequent behavior changes handle recovery and rejected publication. The superseded runner removed at `6f5d0ef` was not invoked in this trace. Marker durability and assessor changes improve observations without changing this observed ordering. Reuse covers ordinary startup only, not Claude resume or refusal on a different precondition. Fresh availability check command: `PATH=/opt/homebrew/bin:$PATH GIT_PUBLICATION_KEEP=1 bash tests/git-publication-native.sh --native claude --case publication/startup-story-branch --results-dir .planning/quick/082-accept-queued-start-native/evidence`. It ended exit 1 with the weekly-limit response, zero startup calls, and no setup/edit; retained in `20260923T062305-679c`. It supplies no new behavior proof and is not the basis of the reuse verdict.

Ordering judgments above combine complete native command/use traces, actual published receipts, and independent remote state, not final file mtimes. No slice 1 assessor change is needed for these conclusive observations. Fixtures supply prepared queued source, bare origin, unrelated local human changes, and setup-marker scripts; the native agent supplies startup and continuation. Independent remote/backlog and human/source inspections are retained in each fresh attempt's `preservation-review.txt`; successful fresh attempts also retain `remote-history.txt`. The three owned fresh disposable fixture roots were removed after terminal results and retention. Historical temporary artifacts and the execution checkout were preserved.

### 2. Confirm unsafe startup stops before setup or implementation

Type: Behavior
Status: done — accepted by coordinator.

Behavior: selected source differs from its published preparation, or a rival already owns the queued story -> native startup returns the appropriate refusal -> no setup or implementation begins, no unauthorized claim replaces the rival, and selected source and human content remain unchanged.

These are two reasons the same startup continuation is denied; keep one refusal rule with separate observations. Reuse the Claude selected-source refusal and Codex same-story rival results only where recovered evidence is sufficient. Assess coverage on every affected host without inferring Cursor's refusal behavior from another host or its ordinary-startup pass alone.

Proof: inspect refusal/conflict tool receipts, trace order, remote history and current ownership, unchanged source/human bytes, and absent setup/feature. The rival fixture plants a real rival claim before the native session, so it proves refusal on resume, not simultaneous native claim racing. Retain actual CLI-process race proof for the latter mechanical contract.

Concrete assessment gap: the selected-source branch currently rejects feature creation but does not assert setup absence. Add that assertion and a setup-after- refusal counterexample in the existing assessor suite. Check both marker and trace evidence; absence of a feature alone is insufficient. Inspect each setup and command marker separately: the current combined `setup-exists` is false when only one exists and therefore cannot prove neither ran. Preserve that distinction in the smallest observation change and its counterexample.

Run the credential-free assessor/counterexample command after that change:

```sh
bash tests/git-publication-native.sh
```

For an uncovered host/requirement, use the existing explicit case (substitute only the host identified by the evidence review):

```sh
bash tests/git-publication-native.sh --native claude --case publication/startup-selected-source --results-dir .planning/quick/082-accept-queued-start-native/evidence
bash tests/git-publication-native.sh --native codex --case publication/startup-claim-race --results-dir .planning/quick/082-accept-queued-start-native/evidence
```

These are conditional fresh commands, not a mandate to rerun the recorded passes. Preserve and assess native failures before routing an actual product defect to correction; never weaken the intended refusal to obtain a pass.

Safe stopping point: every affected host has a justified unsafe-start verdict and local preservation proof. Claim refusal can be accepted independently of the remaining successful-resume obligation; incomplete proof stays pending.

### 3. Confirm interrupted startup resumes the existing claim once

Type: Behavior
Status: pending — Codex/Cursor proof accepted; Claude resume remains unproved.

Behavior: this execution's claim was already accepted, and an independent writer advanced remote trunk -> a native agent resumes from retained workspace and publisher/candidate identity -> current owned Taken is confirmed through remote history, no second Take is made, and setup/implementation continue only afterward.

Reassess Codex retained-claim resume for reuse and resolve Claude resume, whose recorded attempt hit the weekly limit before the command ran. Assess Cursor's resume coverage explicitly and run it only for an unresolved host-specific gap. The pre-created accepted claim is the interruption precondition; do not claim that the resumed agent established ordinary initial publication.

Proof: inspect installed resumed receipt, current remote membership/ownership, retained candidate ancestry and unchanged unrelated work, then setup and first implementation action. Inspect claim commits and native calls to establish no second Take or redundant claim publication. Overall remote HEAD need not remain unchanged if the fixture's authorized implementation later publishes.

Concrete assessment gap: the native resume verdict currently checks containment and ownership but does not explicitly count claim commits. Use independent Git claim history and the native trace. Retain the fixture when needed with existing `GIT_PUBLICATION_KEEP=1`, inspect its reported paths, and preserve only required evidence before cleaning up that owned fixture. If reliable repeatable judgment needs it, extend the existing observer/assessor and add a duplicate-claim counterexample; one Taken row or one matched command alone is insufficient.

```sh
GIT_PUBLICATION_KEEP=1 bash tests/git-publication-native.sh --native claude --case publication/startup-resume --results-dir .planning/quick/082-accept-queued-start-native/evidence
```

Use the same selected case with Codex or Cursor only when reuse cannot cover their obligation. Run `bash tests/git-publication-native.sh` after changing its observation/assessment logic. Reuse real CLI recovery evidence for the shared mechanism; it does not replace host-native continuation evidence.

Safe stopping point: resumed ownership and non-duplication have an accepted judgment on every affected host. Reconcile the three slices' judgments against the final candidate and report acceptance only when none remain unresolved. This final reconciliation is the story's completion check, not another slice.

#### Slice 3 execution evidence (2026-09-23)

Result: Codex and Cursor resume are fresh passes accepted by the coordinator after inspecting receipt/order/history with exactly one claim. Claude remains pending; the weekly quota resets at 19:00 Asia/Singapore. This access failure is the only remaining host-proof obligation and supplies no acceptance. No slice-completion or whole-story acceptance is claimed.

Reviewed all four recovered resume attempts before selecting fresh runs. Original artifacts are retained under `evidence/recovered/{codex,claude}/publication/startup-resume/`. Codex `20260923T050549-3681` has a resumed receipt, setup before the first file change, and a four-commit Git trace with one Take. Earlier Codex attempts `20260923T045222-3e53` and `20260923T045824-4028` failed marker assessment; the latter trace deletes checkout-local setup/command markers. Their recorded source `cb447902` does not identify the uncommitted resume implementation actually present in the traces; the original fixture repositories are gone. This prevents an exact current-candidate reuse judgment. No Cursor resume proof was available. Select one fresh run for each unresolved available host, rather than accepting old summaries or inferring from ordinary startup.

Executed once each from the recorded execution checkout (900-second runner bound, `GIT_PUBLICATION_KEEP=1` for independent Git inspection):

```sh
GIT_PUBLICATION_KEEP=1 PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native cursor --case publication/startup-resume --results-dir .planning/quick/082-accept-queued-start-native/evidence
GIT_PUBLICATION_KEEP=1 PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native codex --case publication/startup-resume --results-dir .planning/quick/082-accept-queued-start-native/evidence
```

Both commands reached terminal exit 0, complete native streams, and passing assessment. Candidate `02108dfb28cabd05839c3aa16d820ce7d0fc33c7` includes the superseded-runner correction. Runs started after slice 2's observer/assessor changes were stable; later counterexample-only edits do not change their runtime inputs. The installed skill, CLI, operation, and recovery module match current source bytes, recorded with hashes in each `git-inspection.txt`.

| Host | Native result and decisive observations |
| --- | --- |
| Codex CLI 0.144.1 | `evidence/codex/publication/startup-resume/20260923T063055-65d4/`: complete 55-line `events.jsonl`; installed invocation and resumed receipt at line 14, setup and applicable command at 17, first feature file add at 23. Independent `git-inspection.txt` establishes base → owned claim `df9dd40` → independent advance `3c21c21` → feature-only increment `867ed6f`. Current Taken membership, most recent backlog-changing claim publisher, ancestry, and exactly one Take agree. |
| Cursor agent 2026.09.18-9a7762b | `evidence/cursor/publication/startup-resume/20260923T062850-117d/`: complete 413-line `events.jsonl`; installed skill read at 25, resumed receipt at 162, setup/applicable command at 196, first feature edit at 295. Independent `git-inspection.txt` establishes base → owned claim `e42c2f7` → independent advance `1021058` → implementation `59be512`. Current Taken membership, latest backlog-changing claim provenance, ancestry, and exactly one Take agree. |
| Claude Code | Recovered `20260923T044643-3342` exited 1 on weekly quota before any startup call. Slice 1's fresh `20260923T062305-679c` confirms the same current access failure. No resume retry was attempted. Native ownership confirmation and continuation remain unproved. |

For both passing hosts, inspected every native command/edit action across the complete trace: no setup, implementation, separate Take, or claim push precedes the resumed receipt. Subsequent publication contains the implementation only. The fixture intentionally pre-created the accepted claim and independent later commit; it does not prove ordinary initial publication. `observations.txt` independently confirms candidate containment, setup/command presence, source and human-work preservation. Git inspection retains actual claim history and current backlog bytes, not only an old publisher trailer or a matched command count. Exact staged/unstaged human diffs are preserved; deferred local refresh is separate from remote success. No new observer framework or product change was needed for this manual native judgment.

The shared CLI race/recovery prerequisite is covered by the coordinator's passing 10-test run of `PATH=/opt/homebrew/bin:$PATH node --test src/skills/dough-execute-plan/scripts/workspace-publication-startup-race.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-recovery.test.mjs`. It supports the mechanical mechanism, not missing Claude behavior. After retaining Git outputs, native traces, hashes, and observations, both owned resume fixture repositories were removed. The execution worktree is retained.

## Proof ownership and execution gates

| Source promise | Owning slice and decisive boundary |
| --- | --- |
| Installed native adoption, both modes, remote trunk before setup/first change | 1: ordinary native trace plus independent remote and timing evidence. |
| Selected-source/rival refusal before work | 2: refused native continuation, no setup/edit, and preserved remote ownership. |
| Resume without another Take | 3: native continuation plus current ownership, ancestry, and claim-commit inspection. |
| Preserve human work and selected source | All three: before/after bytes and observed native actions in their respective journey. |
| Remote success separate from local refresh | 1, retained by 3: receipt/state plus matching safe/deferred-refresh mechanical proof. |
| Requirement-specific evidence on all hosts, truthful missing proof | Each owning slice records its host judgments; 3 closes the combined assessment. |

Use the installed execution workflow's workspace/claim, independent post-change refactor, proof review, selective format, commit and delivery/CI gates. Native fixtures use disposable repositories and installed candidate skills; do not update this repository's managed installed copies by hand. Existing `npm ci` and tool dependencies apply in the execution checkout if needed. Focus tests on changed boundaries; broaden only for an actual affected caller or required execution/CI gate. Product behavior fixes are not silently absorbed into this acceptance-only scope.

Three bounded Behavior slices, with no standalone evidence-inventory or harness infrastructure slice. No project numeric slice target or hard limit was supplied. Native latency and availability are execution risks; the bounded run policy does not promise completion within one deadline. Reassess scope before pursuing a new harness architecture, host integration repair, or repeated failed attempts.

## Refinement and preparation context

Three Behavior slices remain: new shared claim, denied continuation, and retained-claim resume. Each owns its verdict and safe pause. Refusal reasons share one rule; host-specific slices would repeat it. Marker separation, trace-based first-edit ordering, and duplicate-claim inspection belong to their respective slices. There is no standalone evidence or harness slice, sizing exception, new scope, or planning blocker. Access failures leave affected proof pending while independent work may continue; final acceptance requires every obligation and a reconciled candidate.

The earlier preparation workspace used this same path/branch from `b6ea5af87ebd6ec23b8c3d5cccfe6aa0919e7aa5`; Terry authorized its keep to main and cleanup. That workspace was removed before this execution. Preparation itself ran no native acceptance. Execution authority and the new workspace identity follow.

## Execution identity (2026-09-23)

Terry authorized execution with `dough-execute-plan 82`. Story Branch Mode; this session created `/Users/terryyin/git/open-dough-worktrees/082-accept-queued-start-native` on `codex/082-accept-queued-start-native` from fetched `ef47e24d5b82c2cebdd411ed41583f4975bb4cb7`. The earlier preparation workspace was already removed. Originating/integration checkout: `/Users/terryyin/git/open-dough`. Claim `02108dfb28cabd05839c3aa16d820ce7d0fc33c7` was confirmed on `origin/refs/heads/main` before setup. Increments target `origin/refs/heads/codex/082-accept-queued-start-native`. Default-checkout refresh is deferred: no exclusive owner established, and concurrent unrelated work appeared there. Its index, content, and local commits are preserved.

`npm ci` succeeded without lockfile changes; installed backlog `read-state` succeeded from this checkout. Homebrew Bash is required, supplied with `PATH=/opt/homebrew/bin:$PATH`; the system Bash is 3.2. No active Git commit hooks exist. Formatting is limited to affected file types using the repository's Prettier/shfmt settings; Markdown-only claim changes need no formatter. No numeric slice target/hard limit was supplied. Existing planning authority is retained; no new scope is authorized.

Native candidate starts at `02108dfb28cabd05839c3aa16d820ce7d0fc33c7`; the claim only changes backlog membership. Candidate payload remains the source revision from `ef47e24`. Managed installed copies in this repository are not edited. ADR 0005 requires native evidence per affected requirement and tool; ADR 0003 keeps candidate testing distinct from a release.

CI uses GitHub Actions `ci.yml`, display name `CI`, repository `terryyin/open-dough`, target `codex/082-accept-queued-start-native`. Codex observer: coordinator `082`, mailbox `/tmp/dough-ci-501/watch-ETOtAY`, PID `31921`, session `49639`, yielded cell `14`, runtime under this execution checkout's `.agents/skills/dough-execute-plan`. The trunk claim has `pendingCi: unobserved`; the branch observer does not cover it.

Mechanical prerequisite observation: `PATH=/opt/homebrew/bin:$PATH node --test src/skills/dough-execute-plan/scripts/workspace-publication-startup-race.test.mjs src/skills/dough-execute-plan/scripts/workspace-publication-startup-recovery.test.mjs` passed 10/10 on the execution candidate. Inspected `createQueuedTrunk`, real `startProcess` calls, held-first-push release, same-story ownership assertions, selected-source refusal after an independent change, and lost-response/later- descendant recovery assertions. The tests assert remote membership and unique publisher claim counts, and distinguish accepted publication from deferred maintenance. This proves the CLI mechanics, not native host continuation.

## Slice 2 execution evidence (2026-09-23)

Coordinator accepted this slice's proof for this increment. `git-publication-native-startup-fixture.sh` now reports `.setup-ran` and `.command-ran` independently as `setup-exists` and `command-exists`. `git-publication-native-startup-assess.sh` requires explicit absence of both for either refusal. Successful startup still requires both and their order. Counterexamples cover either single marker and missing observations for both refusal reasons, plus a real selected-source fixture with each marker alone through the actual observer. The synthetic refusal receipt supplies only the test precondition; this credential-free proof does not establish native behavior.

Focused proof: `PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh` passed to terminal exit 0 after the observer-boundary checks were added. The observations are `run_assessor_counterexamples`' refusal marker loop and single-marker fixture block; substitute suites also passed. No product skill, startup operation, installed managed copy, or native adapter was changed.

### Requirement and host judgments

These judgments concern the shared denied-continuation rule: a refused startup must not run setup or implementation. Selected-source and rival receipts are separate mechanical rejection reasons, not different native continuation protocols. Each host below actually receives a rejection and stops. This is representative coverage per host, not inference from another host's success and not a claim that all six host/reason combinations were freshly run.

- **Claude Code: justified reuse.** Original artifacts recovered unchanged in `evidence/claude/publication/startup-selected-source/20260923T040305-58dd/`. Runtime `2.1.280 (Claude Code)`, source checkout revision `bb509662` with then-uncommitted candidate. Actual installed caller is disclosed at `events.jsonl:16`; lines 62–63 show the installed `execution-start.mjs start` invocation and `source-refused` receipt for unpublished selected story bytes. All tool actions were inspected: reads and the refusal command, no setup, command, edit, or subsequent mutation. The independent observations retain unchanged remote `35a6df0033611445056d9a6c66f490ffcb3cf544`, no Taken/feature, and preserved human/source bytes. Its old combined marker alone is not used to establish setup absence; the complete trace establishes neither script ran. The original fixture was already deleted. No fresh Claude run occurred.
- **Codex: justified reuse.** Original artifacts recovered unchanged in `evidence/codex/publication/startup-claim-race/20260923T044628-0585/`. Runtime `codex-cli 0.144.1`, source checkout revision `cb447902` with then-uncommitted candidate. Installed caller at `events.jsonl:5` matches the current startup/refusal instruction including retained recovery. Line 18 discloses the actual conflict branch; line 22 records the installed retained start returning `conflict`, `ownership: other`, publisher `rival`, provenance `7eeedda060492c76b4d477e04d04b34de231a340`. That is the independent observed remote tip, Taken belongs to the rival, and the stopped candidate is absent from remote ancestry. All tool actions were inspected: no setup/command or edits; line 25 checks feature absence and retained local state. Human and selected-source observations are preserved. The fixture was already deleted; old combined markers are supplemented by the complete trace, not relabeled.
- **Cursor: fresh manual pass; automated assessor false negative retained.** Command: `GIT_PUBLICATION_KEEP=1 PATH=/opt/homebrew/bin:$PATH bash tests/git-publication-native.sh --native cursor --case publication/startup-selected-source --results-dir .planning/quick/082-accept-queued-start-native/evidence`. Runtime `2026.09.18-9a7762b`, candidate `02108dfb28cabd05839c3aa16d820ce7d0fc33c7` with only the above harness changes. Artifacts: `evidence/cursor/publication/startup-selected-source/20260923T062849-5692/`. Native process completed with exit 0; wrapper exited 1 because its literal command matcher misses the quoted script path (`execution-start.mjs" start`) and its receipt extractor lacks Cursor's structured shell result. The raw automated fail remains unchanged. `events.jsonl:250` is the exact multiline installed invocation; line 251 is its matching structured shell failure, exit 1, stdout `source-refused`, `implemented: false`. Only five shell calls occur (lines 103, 135, 250, 281, 311); all except startup are read-only and all other tools inspect files or discover tooling. No setup or edit occurs. Separate observer signals show both markers absent, no feature/workspace, unchanged remote `5554dec769e1338498e6dbe8e77f75c25652c470`, no Taken, and preserved human/source bytes. Independent inspection of retained Git confirms only the base commit and queued A/B; both markers and workspace are absent (`independent-inspection.txt`). No retry or parser expansion was needed.

Historical applicability is based on disclosed installed behavior, not the source-revision label alone. Claude's refusal paragraph is unchanged; the added resume paragraph does not affect this unretained selected-source refusal. Codex's current conflict branch adds recovery fields and prior retained-source validation without changing the observed stop decision. Startup operation files have no diff between accepted `1a63c0c` and the current candidate; 081 removed the legacy runner, not this installed boundary. Historical original records remain intact; manual judgments supplement their narrower recorded signals. The shared mechanism's process proof remains distinct from these native stops.

Coordinator independently verified Cursor's selected-source refusal remote `5554dec769e1338498e6dbe8e77f75c25652c470`, absent markers/workspace, and then removed only the owned fixture root `/private/var/folders/65/16p4k5qj42qg7l46k2j0nhj40000gn/T/tmp.MTAYXOi9xh/startup-selected-source.th0aVe/workspace-claim-NPnye9`. Session 77404 reached terminal result; no native watch was created. Raw artifacts remain intact. Overall acceptance awaits Claude resume, final candidate reconciliation, and delivery; no automatic retrospective is due while incomplete.

## Delivery boundary

Independent `dough-post-change-refactor` returned `REFACTOR COMPLETE`: no harness refactor needed; plan compacted in place, original evidence unchanged. Accepted proof boundaries remain valid. Selective `shfmt -w -i 2 -ci -bn -sr -- tests/support/git-publication-native-counterexamples.sh tests/support/git-publication-native-startup-assess.sh tests/support/git-publication-native-startup-fixture.sh`, matching ShellCheck, and `git diff --check` passed. ShellCheck requested quoting the literal `other='command'`; that mechanical correction changes no behavior. No generator applies, and no full CI suite was run locally.

The intended resulting product candidate still has the startup payload of `02108dfb28cabd05839c3aa16d820ce7d0fc33c7`; this increment changes only assessment, plan, and retained evidence. Remaining work is one Claude `publication/startup-resume` observation after access returns, then final combined acceptance and normal completion/review. Preserve Taken, this worktree/branch, and proof. The current stop does not authorize retries before changed access, release, wrap-up, or automatic retrospective.
