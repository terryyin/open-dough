# Source review — SEED-166#handle-stale-worktree-bundles

**Launch:** Fresh general-purpose reviewer with only the selected story Goal,
Scope, key examples, constraints, and deferred/excluded text. No plan, return,
product, or proof. Input retained in the coordinator execution conversation
for this acceptance.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | When a developer starts or continues a dashboard agent in an existing worktree whose Open Dough installation differs from the main checkout’s, the product provides a compatible launch or a definite pre-launch recovery path (alternative outcomes; not both required for one case). | slice 2 | observed: incomplete path offers Update worktree and retry; success launches compatible path after apply (agent-launch-update-worktree-retry.spec.ts) |
| 2 | Compatible launch: if that worktree’s bundle already supports the needed capabilities, launch proceeds with that installation. | slice 1 | observed: agent-launch-workspace-reporting-support.spec.ts “compatible older install without landing launches and prepares reporting” — `kind: "launched"` with reporting command and no landingContext |
| 3 | Definite pre-launch recovery: if needed support is missing, the path updates that exact worktree and retries the retained start. | slice 2 | observed: updateWorktreeRetried applies release then Continue-equivalent resume launches one session |
| 4 | Do not diagnose which checkout is stale. | slice 1 | observed: incompleteReportingExplanation names the launch workspace and missing helper only (`launchWorkspaceReporting.ts`); Continue failure explanation contains helper path, not a stale-checkout diagnosis |
| 5 | Do not lose a published assignment. | slice 2 | observed: success keeps one Taken profile; refusal preserves kept start; no replacement claim |
| 6 | When the launch workspace is already known, before avoidable publication or native launch effects, check support in that workspace, not the main checkout’s bundle alone. | slice 1 | observed: `startedRun` early `knownLaunchWorkspace` + `missingReportingSupport` before `started()` (`launchRun.ts`); Continue test: no `claudeLaunchCalls`, definite `refused` |
| 6.1 | Selected host’s installed capabilities in that workspace | slice 1 | observed: `missingReportingSupport(host, folder)` via `installedSkillPath` (`launchWorkspaceReporting.ts`) |
| 6.2 | Required helper dependencies in that workspace | slice 1 | observed: landing present requires sibling `first-landing-expectation.mjs`; prep test refuses with that helper |
| 7 | Keep a compatible older installation usable when it already provides the needed support. | slice 1 | observed: without-landing install launches; `missingReportingSupport` undefined |
| 8 | Do not require a version match with the main checkout for ordinary use. | slice 1 | observed: check is helper presence only — no VERSION comparison in `launchWorkspaceReporting.ts` |
| 9 | Do not fetch release support for ordinary use. | slice 1 | observed: compatible-without-landing launch path does not invoke updater; proceeds with existing workspace helpers |
| 10 | When required support is missing before native launch, fail with a definite, actionable pre-launch explanation (not an uncaught helper-copy error; not an uncertain-session recovery state). | slice 1 | observed: Continue and fresh-start tests — `failed`/`refused`, explanation names helper and update guidance; not `may or may not have started`; not ENOENT |
| 11 | Preserve any assignment and start already kept. | slice 1 | observed: Continue keeps start (`keptStartOf` identity/workspace/branch); fresh incomplete keeps Taken profile and kept start |
| 12 | Offer Update worktree and retry | slice 2 | observed: Startup recovery UI button + POST /__agent-launch/update-worktree-and-retry |
| 12.1 | Runs the existing verified whole-payload release updater for that exact worktree | slice 2 | observed: applyReleaseToWorktree runs open-dough-release.sh apply --target <worktree> --platform <host> (worktreeReleaseApply.ts; fake apply log) |
| 12.2 | Then resumes the retained start | slice 2 | observed: after apply, continueRequest resumes same attempt id (worktreeUpdateRetry / agentLaunches) |
| 13 | Retained start after update preserves same story identity, assignment, workspace, and duplicate-session safeguards | slice 2 | observed: success journey same workspace + one Taken + one launch |
| 13.1 | Same story identity | slice 2 | observed: kept start identity queuedIdentity through incomplete; resume launches same story attempt |
| 13.2 | Same assignment | slice 2 | observed: takenProfiles length 1 after success |
| 13.3 | Same workspace | slice 2 | observed: resumed.record.start.workspace equals kept workspace |
| 13.4 | Same duplicate-session safeguards | slice 2 | observed: Continue-equivalent resume path (no second worktree / replacement) |
| 14 | Reuse the updater’s baseline checks, recorded release source, all-tool installation into both native skill roots, and refusal behavior | slice 2 | observed: apply uses existing helper only; both-roots unit proof; refusal without --force |
| 14.1 | Baseline checks | slice 2 | observed: real helper refusal path surfaces baseline/refusal text (refusal test) |
| 14.2 | Recorded release source | slice 2 | observed: helper apply uses recorded SOURCE path inside open-dough-release.sh (invoked, not reimplemented) |
| 14.3 | All-tool installation into both native skill roots | slice 2 | observed: worktree-release-apply.spec.ts installs both .agents/skills and .claude/skills |
| 14.4 | Refusal behavior | slice 2 | observed: refusal test — failed/refused, worktreeUpdateNeeded, no launch |
| 15 | Apply the same compatibility rules wherever Start, Continue, or retained session recovery consume installed helpers for execution, refinement, or unattached sessions | slice 1 | observed: `attemptRun`/`startedRun` shared path; `knownLaunchWorkspace` covers kept start workflows and ad-hoc kept session (`launchRun.ts`); reporting refusal in `reportingContext` for any host/folder |
| 15.1 | Execution | slice 1 | observed: execution Start/Continue boundary tests in agent-launch-workspace-reporting-support.spec.ts |
| 15.2 | Refinement | slice 1 | observed: same `startOf(request.workflow)` kept-start branch in `knownLaunchWorkspace` (workflow-generic) |
| 15.3 | Unattached sessions | slice 1 | observed: ad-hoc branch via `keptSessionStart` in `knownLaunchWorkspace` |
| 16 | Codex, Cursor, and Claude Code keep their native paths and existing start/recovery contracts | slice 1 | observed: helpers resolved only through existing `installedSkillPath`; no host-path rewrite; Claude boundary proof; Cursor/Codex share the same resolver |
| Q1 | Compatibility is capability/support-based in the launch workspace, not version parity with the main checkout. | slice 1 | observed: `launchWorkspaceReporting.ts` capability completeness comment and helper-presence checks |
| Q2 | Pre-launch capability/helper checks apply when the launch workspace is already known, and before avoidable publication or native launch effects. | slice 1 | observed: early check gated on `knownLaunchWorkspace` before `started()` |
| Q3 | Update is an explicit maintenance action (not background/automatic on every launch). | slice 2 | observed: only via explicit update-worktree-and-retry action; not on ordinary Start/Continue |
| Q4 | Updates use complete tagged releases under ADR 0003 and ADR 0004. | slice 2 | observed: whole-payload apply helper; no partial copy |
| Q5 | Automatic detection stays local to the machine and known workspace. | slice 1 | observed: check uses known workspace folder only; no remote staleness probe |
| Q6 | Workspace and update behavior stay inside existing workflow and updater boundaries under ADR 0008. | slice 2 | observed: dashboard invokes existing updater with --target worktree only |
| Q7 | After an unsuccessful update, retry does not launch. | slice 2 | observed: refusal test empty claudeLaunchCalls |
| Q8 | No automatic force reinstall overwrites local changes. | slice 2 | observed: apply argv never includes --force; refusal says No forced reinstall |
| Q9 | If replacement had already begun, the updater’s truthful incomplete-install recovery remains. | slice 2 | observed: refusal explanation preserves helper printed recovery text |
| E1 | Main on 0.3.74; retained refinement worktree on 0.3.73 lacks a newly required reporting helper → Start or Continue names that worktree’s missing support; does not throw an uncaught copy error; does not claim a session might have launched. | slice 1 | observed: Continue and fresh-start incomplete tests name `first-landing-expectation.mjs`, no uncertain wording, empty launch calls |
| E2 | Assignment already published; no native session launched → Update worktree and retry installs complete verified release in both native skill roots, then reuses retained assignment and worktree to launch one session — no replacement claim or workspace. | slice 2 | observed: successful apply then resume test |
| E3 | Compatible older bundle still supports needed capabilities → Start or Continue launches from that worktree without fetching release support and without requiring a version match with the main checkout. | slice 1 | observed: compatible-without-landing launch test |
| E4 | Edited or incomplete managed files, unverifiable baseline, unavailable release source, or updater failure → actionable explanation; retry does not launch; no automatic force; truthful incomplete-install recovery if replacement began. | slice 2 | observed: updater refusal test |
| X1 | Background upgrades on every launch. | | G-X1 |
| X2 | Partial helper-file copying as a substitute for a release update. | | G-X2 |
| X3 | Automatic forced updates. | | G-X3 |
| X4 | Resetting worktrees to the main checkout. | | G-X4 |
| X5 | Changes to story implementation or assignment ownership. | | G-X5 |
