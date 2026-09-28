# Run worktree workflows from remote history

## Source and authority

- **Identity:** SEED-008#same-machine-merge-queue.
- **Source:** [refined story](../../seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue).
- **Authority:** Terry's 2026-09-28 instruction repurposes and refines this story,
  then authorizes slice planning after the ADR and scope check. It does not
  authorize implementation, Take, release, or landing this preparation draft.
- **Preparation workspace:** `/Users/terryyin/.codex/worktrees/origin-based-refinement/open-dough`,
  branch `codex/origin-based-refinement`, created by this preparation from
  `8a0bfe380d25c2eecc718cbb13c1a347883bf858` on fetched `origin/main`.
  Its Preparing assignment is Honoka-chan, allocation
  `cd0bb6440e736b8bb8e43a7c941208be60447469`.
- **Local integration checkout:** `/Users/terryyin/git/open-dough`; it is not
  the preparation publication destination.
- **Retained preparation target:** `origin`, `refs/heads/main`. Keep uses the
  installed preparation disposition; it is not inferred from writing this plan.

## Outcome and boundaries

Owned-worktree preparation, execution, landing, and wrap-up derive shared inputs
and acceptance from the authorized remote branch. A developer's default
checkout can be absent, stale, dirty, or divergent without supplying or vetoing
those inputs. After accepted trunk publication, a supplied eligible checkout
may advance safely. Refresh and retirement do not infer acceptance from local
branch movement.

Retain the project's actual remote/branch, claim and agent identity rules,
owned-workspace resume and preservation, preparation disposition, protected
branch requirements, Story Branch history preservation, setup, and applicable
CI completion. Explicit current-checkout work uses its existing local or push
authority without automated checkout ownership. Admission and carried edits
remain deliberately supplied owned inputs, not implicit default-checkout input.

The bare-like analogy defines workflow independence. Repository conversion,
new bare-repository provisioning/hosting, coordination locks or leases,
owner registries, schedulers, background catch-up, new branch modes, new CI
lifecycles, and a second publication engine are excluded. Source changes belong
in `src/skills/`; installed managed guidance is updated only from a release.

## Architecture and existing solutions

The ADR index and all ten in-file statuses agree: 0000–0006 are Accepted;
0007–0009 are Proposed. No supersession or status ambiguity was found.

- [ADR 0000](../../../docs/adrs/0000-use-adrs-accepted.md) keeps feature design
  and delivery in their existing homes; this story requires no new ADR.
- [ADR 0002](../../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
  requires continuous shared integration and one representation of each
  conceptual solution. Preserve the shared publisher and local preservation
  responsibility; do not duplicate them inside Land and wrap-up.
- [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md)
  requires standalone complete payloads and project-owned context.
- [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md) separates
  deterministic mechanism checks from native guidance evidence and release
  acceptance. Existing fixture success is not native behavior proof.
- [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
  requires one shared behavioral source and instructions written for the agent's
  established project. Link shared rules from each caller.

No new conflict or Accepted-ADR amendment is needed. At Terry's request, this
preparation draft aligns Proposed
[ADR 0009](../../../docs/adrs/0009-git-branching-and-integration.md) and
[ADR 0008](../../../docs/adrs/0008-project-dashboard-domain-and-architecture.md)
with remote-based startup, the shared remote-first lifecycle, and optional
checkout refresh. Both retain Proposed status and their other advice topics.
Runtime guidance and detailed visibility/design records still need alignment
during the corresponding behavioral changes. The existing
ADR 0007/0002 disagreement about delayed Story Branch integration is not decided
or expanded by this plan.

Follow [North Star: Remote history and optional local refresh](../../NORTH-STAR.md#remote-history-and-optional-local-refresh).
PFE outcome: change the existing source reader, workspace selection, optional
maintenance, publisher callers, and retirement owners. Startup already has a
production command and shared publication helpers. Land links the shared
publication contract and owns reviewed-worktree disposition; its
`dough-land-test-fixtures.mjs` models Git mechanics rather than executing an
agent's skill use. Wrap-up reuses publication and Land's refresh/retirement
guidance, and its shipped closure helpers preserve CI and before/final cleanup
obligations. Cohesion permits these distinct workflow duties; it does not
require one large orchestration or a new Land command.

## Observed premises

Observed on this preparation's unchanged product revision
`cd0bb6440e736b8bb8e43a7c941208be60447469`, on 2026-09-28:

| Premise | Literal observation and result | Consequence |
| --- | --- | --- |
| Queued source is read from remote, but local versions can veto it. | Read `execution-source.mjs:205–302` and `workspace-publication-startup-source-cases.mjs:58–94`; `unpublishedSources` examines HEAD/index/worktree and the test expects `source-refused` for each layer. | Slice 1 changes that veto while retaining remote readiness and authority checks. |
| Workspace selection already fetches remote; startup conflates its required integration path with refresh. | Read `workspace-publication-select.mjs:67–129`, `execution-start-request.mjs`, and `execution-start-maintenance.mjs`; selection uses fetched trunk, request requires distinct integration/workspace paths, maintenance refreshes integration. | Slice 3 separates repository access from optional checkout maintenance rather than inventing another selector. |
| Preparation announcements already reconcile the owned workspace against remote; initial preparation guidance defaults to current local revision. | Read `preparation-assignment-start.mjs:114–165`, `preparation-workspace.md` and `exploration-workspace.md`; announcement fetches/fast-forwards, while the shared lifecycle uses the caller's verified base or current revision. | Slice 2 changes the preparation caller's ordinary base; it retains explicit exploration/owned-input semantics. |
| Land and wrap-up already have suitable shared responsibilities. | `rg -n 'publishExecutionIncrement|refreshDefaultCheckout|closeOrRetainWorkspace|removeExecutionResources|declaredOwnerRefusal' src/skills -g '*.mjs' -g '!*.test.mjs' -g '!*-fixtures.mjs' -g '!*-cases.mjs'`; read Land's skill, its fixture, and `closure-publication.mjs`, `closure-candidate-settlement.mjs`, `closure-resources.mjs`. Closure helpers are declared in `install.sh`; Land's fixture requires defaultCheckout, and closure refresh/cleanup still use integration/default paths. | Slices 4–5 extend the shared owners and update actual callers plus their mechanical models. |
| Current-checkout delivery still gates on declared owner tokens. | Read `current-branch-publication.mjs:38–47,88–110` and `current-branch-publication.test.mjs`; one test expects a rival token to prevent an otherwise explicit operation. | Slice 6 removes that policy prerequisite while retaining authority and owned-path preservation. |
| Existing high-level mechanical boundaries are usable. | Ran the baseline command below: 42 tests passed, zero failed, in 30.2 s. Assertions inspect remote refs, local bytes, claims, and resource retention. | Extend those boundaries; passing the old rejection expectations is a baseline, not proof of the new behavior. |
| Git supports worktree management without a default working tree, including last-worktree retirement. | Two isolated Python/stdlib fixtures used Git 2.50.1: `git init --bare`, `git remote add origin`, `git fetch origin refs/heads/main:refs/remotes/origin/main`, `git worktree add -b owned <path> origin/main`, commit, `git push origin HEAD:refs/heads/main`, then fetch and `git merge-base --is-ancestor <candidate> origin/main`. The last-worktree fixture retained `git rev-parse --path-format=absolute --git-common-dir`, set upstream to `origin/main`, and ran `git worktree remove <path>` plus `git branch -d owned` from that surviving Git directory. Acceptance remained inspectable after retirement; both temporary fixtures were removed. | Slices 4–5 retain a usable management context before removing their own worktree. This primitive observation does not claim the current startup/skills already support omission. |
| Plan allocation and sizing context are known. | Initial preparation found highest allocation 138 and wrote draft 139. Before landing, fetched trunk contained another story's plan 139; all-ref history confirmed 139 as the highest allocation and destination 140 was absent. No active plan for this identity exists. No project slice target/hard limit was supplied. | Publish this plan as 140; size through cohesive behavior and one proof loop, without invented timing limits. |

Baseline command:

```sh
node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs \
  src/skills/dough-story-refinement/scripts/dough-land.test.mjs \
  src/skills/dough-story-refinement/scripts/dough-land-rerun.test.mjs \
  src/skills/dough-story-wrap-up/scripts/closure-publication.test.mjs \
  src/skills/dough-story-wrap-up/scripts/closure-publication-refresh.test.mjs \
  src/skills/dough-execute-plan/scripts/current-branch-publication.test.mjs
```

## Proof ownership

| Final-state promise | Owning slice and decisive observation |
| --- | --- |
| Published selected source governs startup despite different local copies; missing/unready remote preparation still refuses. | 1: real installed startup CLI; independently inspect remote claim, owned workspace source, setup and first delivery, and unchanged local HEAD/index/bytes. |
| Fresh preparation drafts against fetched trunk; resumed owned drafts are preserved. | 2: representative skill journey from stale invocation through workspace selection, Preparing announcement, actual first draft write, and explicit retained-result publication. A fixture pre-created at remote HEAD does not prove selection. |
| Startup/preparation work without a supplied default checkout and retain legitimate Git/ownership context. | 3: actual startup and preparation commands from owned repository context through claim/announcement, usable setup, first edit and its next publication; refresh omission is explicit. |
| Land accepts remotely before optional refresh and retires only contained owned resources, including the last worktree. | 4: Land mechanical cases plus representative skill behavior; inspect origin acceptance, preserved supplied checkout or omitted refresh, safe management context, and idempotent rerun. |
| Wrap-up shares that remote/local contract while preserving history recovery, CI, Story Branch history, and interruption handling. | 5: before/final cleanup publications, actual remote containment and applicable completion receipt/shutdown before cleanup; no second publisher or refresh policy. |
| Explicit current-checkout work needs no ownership tokens and never gains push authority or includes unrelated content. | 6: local-only and push-authorized deliveries with omitted tokens; compare remote refs, staged/unstaged bytes, branch and worktree identity, and exact committed paths. |
| Named remote/trunk and remote story destinations remain project-owned. | 1, 3–5: retain existing alternate-remote/trunk startup control; extend adopted caller observations to a non-default authorized destination where hard-coded main/origin currently participates. |
| Guidance, runtime, and installed dependencies form one coherent cross-tool payload. | Every affected slice: behavior review and affected payload checks below; native requirement ownership follows the release rule below. |

## Ordered slices

### 1. Queued startup follows published preparation
Type: Behavior
Status: done

Behavior: Remote has ready queued preparation while a default checkout contains
different selected-source versions → invoke installed startup → publish the
claim and execute the published source in an owned workspace without changing
or adopting those local copies. Missing, changed/unready remote preparation,
competing claim, or absent publication authority still refuses usefully.

Change the existing published-source reader and its queued/continued-source
consumers; remove the default-checkout veto rather than weakening published
readiness. Preserve explicit admission and carried inputs. Align startup/source
guidance and native assessors that currently require local-source refusal.

Proof: Extend `workspace-publication-startup-source-cases.mjs` and the plan-source
cases, using `workspace-publication.test.mjs` as the stable installed CLI entry.
Continue the successful result through existing setup and first-delivery cases;
inspect origin and all three local layers independently. Run the affected
admission/continuation suites when the shared reader changes. Safe stop: queued
startup is independent of local copies, with the original remote gates intact.

Accepted proof: `node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs`
(30 pass) observes, through the installed start CLI, that different selected
story/plan copies in the default checkout's worktree, index, and a local commit
leave the published sources in the owned workspace, a remote Taken claim,
setup plus first managed delivery, and deep-equal local state before and after
(`workspace-publication-startup-local-copy-cases.mjs`). Remote-readiness,
unlisted-identity, fetch, authority, and plan-link refusals still pass. The
admission/startup/one-shot/preparation consumer suites (80 pass) cover the
shared reader; admission keeps reading its deliberate local drafts.

Learnings: a local commit ahead of trunk reports startup maintenance
`stopped`/`diverged` while the accepted claim stands. The credential-free
`tests/git-publication-native.sh` failed only when launched directly with
macOS Bash 3.2 first on `PATH`; through `scripts/test.sh` with Bash 5 first on
`PATH`, as `tests/README.md` requires, it passes like CI. Native
guidance proof for the changed `startup-selected-source` journey remains a
release obligation under ADR 0005.

### 2. Preparation begins at current remote trunk
Type: Behavior
Status: done

Behavior: A fresh refinement/planning invocation begins in a stale developer
checkout → select its owned preparation workspace, announce Preparing, and make
the first draft write → draft on freshly fetched trunk while preserving the
developer's files. A related/resumed preparation reuses its verified owned draft.

Supply the remote base through existing preparation selection and shared
workspace lifecycle guidance. Keep explicit local dependency/exploration inputs
and reused workspace preservation distinct. Do not redefine all exploration
as published-only. Align maintained preparation/publication design text for this
changed behavior and check consistency with Proposed ADR 0009's updated
starting-point description.

Proof: Extend preparation publication/assignment cases for remote source and
preservation; use a representative native guidance journey for actual workspace
selection, not only a mechanically prebuilt fixture. Continue that first draft
through existing keep/release/Land with established authority. Commands include
`node --test src/skills/dough-story-refinement/scripts/preparation-publication.test.mjs`
and affected `preparation-assignment-*.test.mjs`. Safe stop: fresh preparation
has the remote baseline while continuation and unpublished disposition retain
their existing owners.

Accepted proof: `node --test src/skills/dough-story-refinement/scripts/preparation-assignment-remote-base.test.mjs`
(2 pass; both fail on 9597bf61). Through the installed `start` command with a
new workspace path and `--branch`, a stale developer checkout (local commit,
staged and unstaged edits) and an advanced remote yield an owned workspace at
fetched trunk, the announcement on that tip, a draft on the published story,
`continued` reuse of that draft on resume, and release plus Land model landing
exactly the draft; developer bytes stay deep-equal throughout. Refused
requests create no workspace or branch. Preparation, assignment, one-shot, and
installed-entry regressions (39 pass) plus `story-payload-update.sh` and
`payload-declaration-links.sh` pass.

Learnings: `preparation-assignment.mjs start` now owns selection for a queued
story's new workspace (`preparation-assignment-trunk.mjs`); unqueued
preparation still selects its base from guidance only. Native proof of an
agent selecting and drafting remains a release obligation.

### 3. Owned workspace startup needs only repository context
Type: Behavior
Status: done

Behavior: Valid owned repository context and installed guidance exist, with no
default checkout supplied → start queued/one-shot/admitted execution or announce
preparation → resolve the authorized remote, select/reuse the owned workspace,
publish the required claim/assignment, and continue with usable project setup and
owned edits. Local refresh is not applicable rather than a setup failure.

Separate the required Git context from optional default-checkout maintenance in
the existing request, selection, assignment, and receipt owners. Reuse an owned
worktree or common Git directory where appropriate; retain explicit workspace
authority and identity checks. Admission takes only its deliberate owned inputs;
do not invent an origin-mode flag, role registry, or a new clone/setup lifecycle.
Update affected direct consumers and shipped dependencies in the same slice.

Proof: Extend installed startup CLI journeys and preparation-assignment command
journeys with default omission, then consume their results through setup, first
owned edit, and ordinary publication. Exercise a valid existing owned context
without creating a gratuitous second checkout. Preserve invalid repository,
remote, missing authority, and mismatched resume refusal. Run
`workspace-publication.test.mjs`, affected one-shot/admission suites and
`preparation-assignment-*.test.mjs`; update candidate installation checks.
Safe stop: startup/preparation have no mandatory default-checkout path, while
Land/wrap-up still await adoption in slices 4–5.

Accepted proof: `node --test src/skills/dough-execute-plan/scripts/workspace-publication.test.mjs`
(33 pass) and `workspace-publication-admission.test.mjs` use `ownedWorktreeOnly`
(a bare repository whose only worktree is the owned one; the default checkout is
deleted). Without `--integration`, installed startup publishes and resumes the
claim with `created: false` and maintenance `not applicable`, runs setup and a
first managed delivery there; one-shot prepares without publishing; admission
takes only published content; invalid repository, remote, workspace, and
authority refuse without changes. `preparation-assignment-owned-context.test.mjs`
announces, continues, and stages release from an owned worktree alone. All five
new cases fail on 80ab5df2. Startup/admission/one-shot (69), preparation (28),
shared-maintenance callers (18), and payload checks pass.

Learnings: `--integration` is now optional; omitted, the owned worktree supplies
repository access and must already exist, so creating a new workspace still
needs a supplied default checkout. `refreshDefaultCheckout` returns
`not applicable` without a checkout for slices 4–5 to reuse. A reused owned
workspace must still equal clean fetched trunk; a merely behind host worktree is
refused rather than advanced, unchanged by this slice.

CI repair (run 36381588951, 600f5f45): `workspace-publication-race.test.mjs`
still passed only `integration` to `selectOwnedWorkspace`, which now reads
`repository`, so Git ran in the runner's own repository; re-wrapped guidance
broke three `workspace-ownership-lifecycle.test.mjs` regexes. The repair supplies
`repository`, makes selection stop with `setup-failed` when it is missing, and
tolerates line breaks; `node --test` on those two files plus startup and
preparation suites passes (48) with no leaked branches.

### 4. Land publishes and retires without a default checkout
Type: Behavior
Status: planned

Behavior: A reviewed owned worktree is ready, with a clean/stale, dirty,
unexpected, or absent default checkout → Land → origin accepts the candidate
first; one shared optional refresh operation reports its separate result and
contained session-owned resources retire safely. Unconfirmed publication or a
real conflict preserves all recovery resources; a rerun never republishes an
already accepted candidate.

Extend the existing maintenance owner to handle omission and operational failure
without throwing away accepted publication. Keep checkout-aware fast-forward
and preservation checks, and avoid access tokens as refresh prerequisites.
Retain repository management context before retirement, including when Land
removes the last owned worktree. Align Land, preparation keep/retirement, test
models, and affected publisher/maintenance callers so they consume the same
responsibilities. Add a new runtime entry only if existing owners cannot expose
the needed responsibility; a fixture imitation alone is insufficient proof.

Proof: Extend `dough-land.test.mjs` and `dough-land-rerun.test.mjs` through accepted
remote history and actual safe cleanup for default omission, failed refresh,
named targets, and last-worktree retirement. Preserve reused-worktree and
unpublished-content controls. Run `publication-checkout-maintenance.test.mjs`
for the shared policy and a representative installed Land guidance journey.
Safe stop: Land and preparation keep use the cohesive remote lifecycle; wrap-up
retains its existing gates until slice 5 adopts the same responsibility.

### 5. Wrap-up completes through the same remote lifecycle
Type: Behavior
Status: planned

Behavior: Completed execution has recoverable before-cleanup and final-closure
candidates, with optional default checkout → wrap up → publish through the
existing shared remote contract, observe the applicable accepted revision and
shutdown, then retire contained owned resources. Missing/default refresh failure
cannot erase remote acceptance or block otherwise eligible cleanup.

Adopt slice 4's shared maintenance/management responsibilities in closure
publication, candidate settlement and cleanup; parameterize actual remote/target
where required. Preserve Story Branch published history and the existing target
transition, without deciding its timing policy. Preserve observer ownership and
the before-cleanup publication boundary. Align wrap-up/publication guidance,
visibility requirements and publication design with the selected optional-checkout
model. Check consistency with the updated Proposed ADRs 0008/0009; keep their
statuses and unrelated dashboard scope unchanged.

Proof: Extend closure publication, refresh, resume, cleanup and Story Branch
integration suites at their outer workflow boundaries. Observe remote revisions,
preserved default bytes, required completion receipt/shutdown, cleanup and
idempotent resume with no default or refresh failure. Run affected
`closure-*.test.mjs` suites plus Land/shared maintenance regressions, and reuse
the controlled native closure harness for invalidated skill behavior. Safe stop:
Land and wrap-up share publication/recovery/refresh/retirement meanings while
their own review, recovery-history and CI gates remain intact.

### 6. Explicit current-checkout edits need only their own authority
Type: Behavior
Status: planned

Behavior: A developer explicitly selects the current checkout and authorizes a
bounded local edit or publication → deliver without declaring checkout-owner
tokens → commit only authorized paths, preserve unrelated edits, and push only
when separately authorized. The checkout/branch remains the selected one.

Remove automated exclusive-access requirements from the current-checkout caller
and its guidance. Retain genuine unsafe-state/ownership-of-content checks and
normal Git operation failures; omission of coordination tokens is not omission
of work or push authority. Remove remaining abandoned coordination promises from
affected context without adding an alternative coordination mechanism.

Proof: Update `current-branch-publication.test.mjs` and
`closure-current-branch.test.mjs` to prove omitted-token local-only and
push-authorized behavior, exact owned commits, unchanged unrelated staged and
unstaged bytes, no unauthorized remote change, and no branch/worktree switch.
Walk one representative explicit-current-checkout guidance use. Safe stop: the
developer's checkout remains an explicitly selected playground, while all six
slices' remote-worktree behavior is complete.

## Delivery checks and proof limits

Each slice includes implementation, caller guidance, focused proof, and cleanup
for its one outcome. Required structures stay inside the behavior they enable;
no preparatory framework or tests-only slice is selected. Use independent
post-change refactoring and ordinary managed delivery when execution is later
authorized. Run applicable project checks after edits; preserve existing commit
hooks and authority. No numeric timing exception or override is granted here.

Use `bash tests/payload-declaration-links.sh`, affected
`tests/execution-payload-update.sh`, `tests/story-payload-update.sh`, and
`tests/product-backlog-payload-update.sh` when their declared runtime/guidance
dependencies change; candidate installation must work in both physical roots,
with Codex/Cursor sharing `.agents/skills/` and Claude using `.claude/skills/`.
Do not hand-synchronize this repository's installed managed copies. Existing
integration-mechanism evidence may be reused when its covered boundary remains
unchanged; this does not prove the new source-selection or default-omission rule.

Native guidance proof must show the actual invocation and next consuming action,
not exit zero or a fixture supplying the chosen base/cleanup. Extend the existing
publication/preparation/closure harness only for invalidated obligations. Assess
each affected requirement per host using fresh proof or justified reuse, avoiding
a routine full Cartesian matrix. No fresh native result is claimed by this plan.
Under ADR 0005, functional implementation may complete with native obligations
tracked in separate acceptance work, but affected behavior cannot be released
without that proof. The existing SEED-053 stories cover their explicitly bounded
premise/one-shot cases; do not silently expand them to cover this change.

## Concern review

No blocking scope or slice-specific concern was identified in this review.
The six boundaries each retain usable progress and one cohesive proof loop;
they exercise a common rule of remote authority plus optional local maintenance.
Shared code/prose and all changed consumers must converge on that rule, rather
than accumulating caller-specific policies. Repository-context and retirement
feasibility were observed in isolated Git probes; actual product adoption and
new guidance proof are owned by the slices above, not claimed as already green.
Readiness is recorded through the canonical preparation recorder after reviewing
the completed story and plan. That assessment supplies no execution authority.
