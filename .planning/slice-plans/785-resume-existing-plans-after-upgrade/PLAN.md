# Resume an existing plan after upgrading Open Dough

**Identity:** SEED-425#resume-existing-plans-after-upgrade
**Source:** [Resume an existing plan after upgrading Open Dough](../../seeds/SEED-425-resume-existing-plans-after-upgrade.md#resume-existing-plans-after-upgrade)
**Source review:** [Installed execution workflow review](source-review.md)

## Current decisions

Use the canonical story and its amendments, accepted candidate evidence and the plan's ordinary Story obligations. Carry only facts the next executor needs. Use Git for recovery of old records. Execution of plan 607, release publication and client rollout have their own owners.

## Decisive premises

Preparation on 2026-11-23 used the source candidate based on `88999346d`. Its obligation CLI refused the legacy headers in plans 607 and 692. With the header removed in scratch, `list --slice 2` passed for 692. Its real converted plan passed that listing and `check --planned-completion` still refused pending slice 2. Plan 607 has 89 historical rows. With the header removed in scratch, `list --slice 3` refused G7 and G8 because their former story quote is absent from the amended story. G1–G6 are open returns. G9 has a recorded disposition. C074 and C088 name final CI and landing. Recover the inputs from the [prior plan directory](https://github.com/terryyin/open-dough/tree/88999346d263df2003faae7785af4994e999df14/.planning/slice-plans/607-close-landed-ci-repeat-check-gaps).

The installer derives ownership from release-tag declarations. The existing previous-release fixture exercises dropped paths in both roots and protects a neighboring project file. The remaining proof is the real retired-path set combined with a partially delivered plan. Use disposable tags and project directories for that comparison.

## Execution context

Story Branch Mode, publisher `dashboard-territory.local-open-dough`, agent Anri-chan. The established Take `d68555025490de459cf4cb30f961dbde202e91cc` is on `origin/main` and `origin/codex/resume-an-existing-plan-after-upgrading-open-dou`. The owned checkout is `.worktrees/resume-an-existing-plan-after-upgrading-open-dou`, based on `1a1e22a0bc4f4e5231c9ad558f3fbd2b4fa16ac4`. The installed v0.3.111 workflow coordinates delivery. Candidate checks use the source payload or a disposable installation of it.

Codex CI observer `anri-seed425` watches `terryyin/open-dough`, branch `codex/resume-an-existing-plan-after-upgrading-open-dou`, GitHub `ci.yml` push workflow 351271804. Mailbox `/tmp/dough-ci-501/watch-YDhPWl`, PID 11255, stream 69003, cell `g358:12`. The story branch observer does not cover the Take on trunk.

## Ordered slices

### 1. Resume the landed CI correction with its unfinished work visible
Type: Behavior
Status: done

Read plan 607, the complete amended story, the handoff and the archived observations. Reconcile the actual G7/G8 behavior and proof against the current unchanged-behavior promise. Preserve each genuinely outstanding obligation and both final delivery conditions in the plan. Remove the retired file and its link once the handoff accounts for the remaining work. Preserve the current status of the underlying story.

**Proof.** Run the candidate obligation CLI on plan 607. Listing slice 3 must name G1–G6 without malformed quotes. Slice 3 and planned completion must refuse the still-open work. Verify the two completed slices and both final delivery conditions against the archived input. Verify the first uncompleted slice and the backlog identity through the normal project reader. Estimated 7–12 active minutes.

Accepted: The candidate CLI lists G1–G6 for slice 3 and refuses slice 3, regular completion and planned completion. The project reader reports slice 3 as next and keeps SEED-324 queued and not ready. Both delivered phone observations and G7–G9's qualified proof match the archived record. Final trunk CI and integration remain due. Plan 692 lists slice 2 with three qualifying watches outstanding. Eight targeted distribution checks and the Chromium story-readiness case passed. Records-only refactor disposition.

### 2. Resume a previous-release project through its normal update
Type: Behavior
Status: done

Install v0.3.111 into a disposable client with both supported skill roots and a copy of the pre-conversion plan. Update through the normal released-source installer against a locally tagged candidate. Inspect its output and both managed roots, plus the user's pre-existing plan and evidence. Exercise the transition message, apply the plan-only conversion from slice 1 and resume via the installed CLI. Use existing installer ownership and plan-reading routines. Remove any leftover compatibility code whose removal preserves this previous-release journey. Leave the small transition refusal in place if a supported legacy plan could otherwise appear complete.

**Proof.** Verify all retired modules and guides disappear, neighboring project files and outstanding obligations survive, and a fresh plan needs only its usual proof. Repeat the update and inspect the unchanged plan. Exercise a still-linked plan before claiming it can be accepted. Use the existing dropped-files install fixture and one representative upgrade run. Estimated 8–14 active minutes.

Accepted: A disposable v0.3.112 tag of candidate `9cff32a6a456cc47e143496f108284c28c736ce1` upgraded the genuine v0.3.111 installation. Both roots reported nine removed managed paths and matched the tagged payload. Project planning files and six neighboring unmanaged files kept their bytes and modification times. Both installed CLIs refused a still-linked legacy plan, then listed G1–G6 for the converted plan and refused its completion. An otherwise complete legacy plan with a pending CI owner justified keeping the transition refusal. The repeat update made no writes, and an ordinary fresh plan passed with its accepted slice proof. The dropped-files fixture and five focused execution and closure checks passed, including 29 Node cases. The experiment followed [ADR 0003](../../../docs/adrs/0003-tagged-release-versioning-accepted.md), [ADR 0004](../../../docs/adrs/0004-client-installation-and-update-accepted.md), [ADR 0005](../../../docs/adrs/0005-cross-tool-validation-accepted.md), and [ADR 0006](../../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md). Records-only refactor disposition.

## Local gate and readiness

Run targeted obligation and installation checks. Apply the [failure policy](../../../Distribution/src/skills/dough-execute-plan/references/failure-policy.md). For a long run on macOS, start fully awake on AC under `caffeinate -s -i`. On battery, plug in or keep the lid open with `caffeinate -i` and inspect the sleep log afterwards. [Machine sleep on macOS](../../../Distribution/tests/local-test-resources.md#machine-sleep-on-macos)

Each slice has one observable resume outcome. The identified stale quotes have a bounded reconciliation in slice 1. The upgrade experiment uses local fixtures and requires no external publication. No further refinement concerns identified.

## Story obligations
