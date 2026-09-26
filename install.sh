#!/usr/bin/env bash
# shellcheck disable=SC2034,SC2310,SC2312
# SC2034: force, replace_verified, and version are read by install_declared_payload.
set -euo pipefail
original_pwd=$(pwd -P)
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck disable=SC1091
source "${source_dir}/src/install/open-dough-platform.sh"
# shellcheck disable=SC1091
source "${source_dir}/src/install/open-dough-register-hooks.sh"
usage() {
  echo "Usage: $0 --target <project> --source <url-or-path> [--platform <codex|cursor|claude>] [--force]" >&2
  exit 1
}
target=''
recorded_source=''
platform=codex
force=0
replace_verified=0
while [[ $# -gt 0 ]]; do
  case $1 in
    --target)
      [[ $# -ge 2 ]] || usage
      target=$2
      shift 2
      ;;
    --source)
      [[ $# -ge 2 ]] || usage
      recorded_source=$2
      shift 2
      ;;
    --platform)
      [[ $# -ge 2 ]] || usage
      platform=$2
      shift 2
      ;;
    --force)
      force=1
      shift
      ;;
    # Internal apply handoff: its caller verified every managed baseline first.
    --replace-verified)
      replace_verified=1
      shift
      ;;
    --version | --tag | --release) refuse_requested_version ;;
    *)
      looks_like_version_request "$1" && refuse_requested_version
      usage
      ;;
  esac
done
[[ -n "${target}" && -n "${recorded_source}" ]] || usage
destination_for /dev/null "${platform}" > /dev/null
if [[ "${recorded_source}" == /* && -d "${recorded_source}" ]]; then
  recorded_source=$(cd -- "${recorded_source}" && pwd -P)
elif [[ -d "${original_pwd}/${recorded_source}" ]]; then recorded_source=$(cd -- "${original_pwd}/${recorded_source}" && pwd -P); fi
[[ -d "${target}" ]] || {
  echo "Client project directory does not exist: ${target}" >&2
  exit 1
}
target=$(cd -- "${target}" && pwd -P)
managed_files=(
  dough-update/SKILL.md
  dough-bug-fixing/SKILL.md
  dough-bug-fixing/scripts/retained-artifacts.mjs
  dough-adr-awareness/SKILL.md
  dough-product-backlog/SKILL.md
  dough-product-backlog/assets/claude-hooks-guard.json
  dough-product-backlog/assets/codex-hooks-guard.json
  dough-product-backlog/assets/cursor-hooks-guard.json
  dough-product-backlog/references/identity.md
  dough-product-backlog/references/merge-conflicts.md
  dough-product-backlog/references/record-preparation.md
  dough-product-backlog/scripts/product-backlog-add.mjs
  dough-product-backlog/scripts/product-backlog-adopt.mjs
  dough-product-backlog/scripts/product-backlog-agent-profile.mjs
  dough-product-backlog/scripts/product-backlog-combine.mjs
  dough-product-backlog/scripts/product-backlog-complete.mjs
  dough-product-backlog/scripts/product-backlog-direction.mjs
  dough-product-backlog/scripts/product-backlog-document.mjs
  dough-product-backlog/scripts/product-backlog-git-aggregate.mjs
  dough-product-backlog/scripts/product-backlog-git-candidate.mjs
  dough-product-backlog/scripts/product-backlog-git-cherry-pick-aggregate.mjs
  dough-product-backlog/scripts/product-backlog-git-cherry-pick-stop.mjs
  dough-product-backlog/scripts/product-backlog-git-cherry-pick.mjs
  dough-product-backlog/scripts/product-backlog-git-cli.mjs
  dough-product-backlog/scripts/product-backlog-git-driver.mjs
  dough-product-backlog/scripts/product-backlog-git-merge.mjs
  dough-product-backlog/scripts/product-backlog-git-operation-state.mjs
  dough-product-backlog/scripts/product-backlog-git-rebase-aggregate.mjs
  dough-product-backlog/scripts/product-backlog-git-rebase.mjs
  dough-product-backlog/scripts/product-backlog-git-repository.mjs
  dough-product-backlog/scripts/product-backlog-guard-hook.mjs
  dough-product-backlog/scripts/product-backlog-home-reader.mjs
  dough-product-backlog/scripts/product-backlog-home.mjs
  dough-product-backlog/scripts/product-backlog-identity.mjs
  dough-product-backlog/scripts/product-backlog-merge.mjs
  dough-product-backlog/scripts/product-backlog-order.mjs
  dough-product-backlog/scripts/product-backlog-place.mjs
  dough-product-backlog/scripts/product-backlog-placement.mjs
  dough-product-backlog/scripts/product-backlog-plan-reader.mjs
  dough-product-backlog/scripts/product-backlog-plan.mjs
  dough-product-backlog/scripts/product-backlog-refresh.mjs
  dough-product-backlog/scripts/product-backlog-refusal.mjs
  dough-product-backlog/scripts/product-backlog-report.mjs
  dough-product-backlog/scripts/product-backlog-request.mjs
  dough-product-backlog/scripts/product-backlog-source.mjs
  dough-product-backlog/scripts/product-backlog-store.mjs
  dough-product-backlog/scripts/product-backlog-story-purpose.mjs
  dough-product-backlog/scripts/product-backlog-story-state-assessment.mjs
  dough-product-backlog/scripts/product-backlog-story-state-basis.mjs
  dough-product-backlog/scripts/product-backlog-story-state-block.mjs
  dough-product-backlog/scripts/product-backlog-story-state-command.mjs
  dough-product-backlog/scripts/product-backlog-story-state-home.mjs
  dough-product-backlog/scripts/product-backlog-story-state-preparation.mjs
  dough-product-backlog/scripts/product-backlog-story-state.mjs
  dough-product-backlog/scripts/product-backlog-take.mjs
  dough-product-backlog/scripts/product-backlog-usage.mjs
  dough-product-backlog/scripts/product-backlog-version.mjs
  dough-product-backlog/scripts/product-backlog-work.mjs
  dough-product-backlog/scripts/product-backlog.mjs
  dough-maintain-findings/SKILL.md
  dough-story-decomposition/SKILL.md
  dough-story-decomposition/references/problem-decomposition.md
  dough-story-decomposition/references/seed-format.md
  dough-story-refinement/SKILL.md
  dough-story-refinement/references/executable-proof.md
  dough-story-refinement/references/planning.md
  dough-story-refinement/references/preparation-assignment.md
  dough-story-refinement/references/preparation-disposition.md
  dough-story-refinement/references/preparation-workspace.md
  dough-story-refinement/scripts/preparation-assignment.mjs
  dough-story-refinement/scripts/preparation-assignment-abandon.mjs
  dough-story-refinement/scripts/preparation-assignment-lost-workspace.mjs
  dough-story-refinement/scripts/preparation-assignment-ownership.mjs
  dough-story-refinement/scripts/preparation-assignment-release.mjs
  dough-story-refinement/scripts/preparation-assignment-start.mjs
  dough-land/SKILL.md
  dough-resplit-story/SKILL.md
  dough-slice-planning/SKILL.md
  dough-slice-planning/references/architectural-thinking.md
  dough-pfe/SKILL.md
  dough-slice-plan-refinement/SKILL.md
  dough-execute-plan/SKILL.md
  dough-execute-plan/assets/claude-hooks.json
  dough-execute-plan/assets/cursor-hooks.json
  dough-execute-plan/manuals/custom-ci.md
  dough-execute-plan/references/admit-accepted-work.md
  dough-execute-plan/references/ci-completion-wait.md
  dough-execute-plan/references/ci-monitor.md
  dough-execute-plan/references/ci-notify-codex.md
  dough-execute-plan/references/ci-notify-hosts.md
  dough-execute-plan/references/delegation.md
  dough-execute-plan/references/destructive-later-outcome-check.md
  dough-execute-plan/references/disposable-research.md
  dough-execute-plan/references/execution-decisions.md
  dough-execute-plan/references/execution-location.md
  dough-execute-plan/references/finish-or-stop.md
  dough-execute-plan/references/maintain-default-checkout.md
  dough-execute-plan/references/oversized-slice.md
  dough-execute-plan/references/publication-rebase-conflict.md
  dough-execute-plan/references/publish-the-candidate.md
  dough-execute-plan/references/runtime-setup.md
  dough-execute-plan/references/trunk-publication.md
  dough-execute-plan/references/wrap-up.md
  dough-execute-plan/scripts/ci-command-adapter.mjs
  dough-execute-plan/scripts/applicable-candidate-proof.mjs
  dough-execute-plan/scripts/ci-checkout-runtime.mjs
  dough-execute-plan/scripts/ci-direct-entry.mjs
  dough-execute-plan/scripts/ci-failures.mjs
  dough-execute-plan/scripts/ci-host-bridge.mjs
  dough-execute-plan/scripts/ci-host-hook.mjs
  dough-execute-plan/scripts/ci-mailbox-await.mjs
  dough-execute-plan/scripts/ci-mailbox-change-watch.mjs
  dough-execute-plan/scripts/ci-mailbox-complete.mjs
  dough-execute-plan/scripts/ci-mailbox-json-file.mjs
  dough-execute-plan/scripts/ci-mailbox-location.mjs
  dough-execute-plan/scripts/ci-mailbox-match.mjs
  dough-execute-plan/scripts/ci-mailbox-revision-coverage.mjs
  dough-execute-plan/scripts/ci-mailbox-store.mjs
  dough-execute-plan/scripts/ci-mailbox-worker-process.mjs
  dough-execute-plan/scripts/ci-mailbox.mjs
  dough-execute-plan/scripts/ci-observer-stream.mjs
  dough-execute-plan/scripts/ci-path-applicability.mjs
  dough-execute-plan/scripts/ci-revision-applicability-classification.mjs
  dough-execute-plan/scripts/ci-repair-stash.mjs
  dough-execute-plan/scripts/ci-revisions.mjs
  dough-execute-plan/scripts/ci-runs.mjs
  dough-execute-plan/scripts/ci-workflow-path-policy.mjs
  dough-execute-plan/scripts/current-branch-publication.mjs
  dough-execute-plan/scripts/execution-increment-delivery.mjs
  dough-execute-plan/scripts/execution-increment-observation.mjs
  dough-execute-plan/scripts/execution-increment-publication.mjs
  dough-execute-plan/scripts/execution-increment-resume.mjs
  dough-execute-plan/scripts/execution-start.mjs
  dough-execute-plan/scripts/agent-assignments.mjs
  dough-execute-plan/scripts/execution-start-agent.mjs
  dough-execute-plan/scripts/execution-start-maintenance.mjs
  dough-execute-plan/scripts/execution-start-operation.mjs
  dough-execute-plan/scripts/execution-start-recovery.mjs
  dough-execute-plan/scripts/execution-start-receipt.mjs
  dough-execute-plan/scripts/execution-start-request.mjs
  dough-execute-plan/scripts/execution-start-source.mjs
  dough-execute-plan/scripts/execution-source.mjs
  dough-execute-plan/scripts/execution-admission-source.mjs
  dough-execute-plan/scripts/execution-worktree-preparation-readiness-gate.mjs
  dough-execute-plan/scripts/history-preserving-publication.mjs
  dough-execute-plan/scripts/maintain-default-checkout.mjs
  dough-execute-plan/scripts/owned-suffix-reconciliation.mjs
  dough-execute-plan/scripts/publication-resume.mjs
  dough-execute-plan/scripts/publication-git.mjs
  dough-execute-plan/scripts/publication-test-fixtures.mjs
  dough-execute-plan/scripts/watch-ci-execution.mjs
  dough-execute-plan/scripts/watch-ci.mjs
  dough-execute-plan/scripts/workspace-agent-authorship.mjs
  dough-execute-plan/scripts/workspace-publication-ownership.mjs
  dough-execute-plan/scripts/workspace-publication-push.mjs
  dough-execute-plan/scripts/workspace-publication-select.mjs
  dough-post-change-refactor/SKILL.md
  dough-post-change-refactor/references/refactor-checks.md
  dough-test-optimization/SKILL.md
  dough-test-optimization/references/optimization-tactics.md
  dough-test-optimization/references/resolving-candidates.md
  dough-manual-testing/SKILL.md
  dough-manual-testing/references/exploration-workspace.md
  dough-execution-retrospective/SKILL.md
  dough-execution-retrospective/references/bounded-process-log.md
  dough-execution-retrospective/references/process-finding-recording.md
  dough-story-wrap-up/SKILL.md
  dough-story-wrap-up/scripts/closure-candidate-settlement.mjs
  dough-story-wrap-up/scripts/closure-publication.mjs
  dough-story-wrap-up/scripts/closure-resources.mjs
)
for managed_file in "${managed_files[@]}"; do [[ -f "${source_dir}/src/skills/${managed_file}" ]] || {
  echo "Client payload is incomplete: missing ${managed_file}" >&2
  exit 1
}; done
release_helper="${source_dir}/src/install/open-dough-release.sh"
[[ -f "${release_helper}" ]] || {
  echo "This installer requires src/install/open-dough-release.sh in the source checkout." >&2
  exit 1
}
version=$(bash "${release_helper}" validate-checkout "${source_dir}")
# shellcheck disable=SC1091
# shellcheck source=src/install/open-dough-install-payload.sh
source "${source_dir}/src/install/open-dough-install-payload.sh"
install_declared_payload
