#!/usr/bin/env bash
# shellcheck disable=SC2310,SC2312
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
  dough-adr-awareness/SKILL.md
  dough-product-backlog/SKILL.md
  dough-product-backlog/assets/claude-hooks-guard.json
  dough-product-backlog/assets/codex-hooks-guard.json
  dough-product-backlog/assets/cursor-hooks-guard.json
  dough-product-backlog/references/identity.md
  dough-product-backlog/references/merge-conflicts.md
  dough-product-backlog/scripts/product-backlog-add.mjs
  dough-product-backlog/scripts/product-backlog-adopt.mjs
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
  dough-product-backlog/scripts/product-backlog-git-rebase-aggregate.mjs
  dough-product-backlog/scripts/product-backlog-git-rebase.mjs
  dough-product-backlog/scripts/product-backlog-git-repository.mjs
  dough-product-backlog/scripts/product-backlog-guard-hook.mjs
  dough-product-backlog/scripts/product-backlog-home.mjs
  dough-product-backlog/scripts/product-backlog-identity.mjs
  dough-product-backlog/scripts/product-backlog-merge.mjs
  dough-product-backlog/scripts/product-backlog-order.mjs
  dough-product-backlog/scripts/product-backlog-place.mjs
  dough-product-backlog/scripts/product-backlog-placement.mjs
  dough-product-backlog/scripts/product-backlog-plan.mjs
  dough-product-backlog/scripts/product-backlog-refresh.mjs
  dough-product-backlog/scripts/product-backlog-refusal.mjs
  dough-product-backlog/scripts/product-backlog-report.mjs
  dough-product-backlog/scripts/product-backlog-request.mjs
  dough-product-backlog/scripts/product-backlog-source.mjs
  dough-product-backlog/scripts/product-backlog-store.mjs
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
  dough-story-refinement/references/planning.md
  dough-story-refinement/references/preparation-workspace.md
  dough-resplit-story/SKILL.md
  dough-slice-planning/SKILL.md
  dough-slice-planning/references/architectural-thinking.md
  dough-pfe/SKILL.md
  dough-slice-plan-refinement/SKILL.md
  dough-execute-plan/SKILL.md
  dough-execute-plan/assets/claude-hooks.json
  dough-execute-plan/assets/cursor-hooks.json
  dough-execute-plan/manuals/custom-ci.md
  dough-execute-plan/references/ci-monitor.md
  dough-execute-plan/references/ci-notify-codex.md
  dough-execute-plan/references/ci-notify-hosts.md
  dough-execute-plan/references/delegation.md
  dough-execute-plan/references/destructive-later-outcome-check.md
  dough-execute-plan/references/disposable-research.md
  dough-execute-plan/references/execution-decisions.md
  dough-execute-plan/references/execution-location.md
  dough-execute-plan/references/runtime-setup.md
  dough-execute-plan/references/trunk-publication.md
  dough-execute-plan/references/wrap-up.md
  dough-execute-plan/scripts/ci-command-adapter.mjs
  dough-execute-plan/scripts/ci-failures.mjs
  dough-execute-plan/scripts/ci-host-hook.mjs
  dough-execute-plan/scripts/ci-mailbox-location.mjs
  dough-execute-plan/scripts/ci-mailbox-store.mjs
  dough-execute-plan/scripts/ci-mailbox-worker-process.mjs
  dough-execute-plan/scripts/ci-mailbox.mjs
  dough-execute-plan/scripts/ci-observer-stream.mjs
  dough-execute-plan/scripts/ci-revisions.mjs
  dough-execute-plan/scripts/ci-runs.mjs
  dough-execute-plan/scripts/watch-ci-execution.mjs
  dough-execute-plan/scripts/watch-ci.mjs
  dough-post-change-refactor/SKILL.md
  dough-post-change-refactor/references/refactor-checks.md
  dough-test-optimization/SKILL.md
  dough-test-optimization/references/optimization-tactics.md
  dough-test-optimization/references/resolving-candidates.md
  dough-manual-testing/SKILL.md
  dough-manual-testing/references/exploration-workspace.md
  dough-execution-retrospective/SKILL.md
  dough-execution-retrospective/references/bounded-process-log.md
  dough-story-wrap-up/SKILL.md
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

if host_hook_fragments_present "${source_dir}"; then
  preflight_host_hook_destinations "${source_dir}" "${target}" || exit 1
fi

platforms=() destinations=() roots=() actions=()
while IFS=$'\t' read -r selected_platform destination; do
  root=$(dirname -- "${destination}")
  platforms+=("${selected_platform}")
  destinations+=("${destination}")
  roots+=("${root}")
  assert_safe_destination_root "${selected_platform}" "${root}" || exit 1
  existing=0
  for managed_file in "${managed_files[@]}"; do
    ! destination_has_managed_skill "${root}" "${managed_file}" || existing=1
    assert_no_managed_collision "${root}" "${managed_file}" || exit 1
  done
  current=0
  if [[ -f "${destination}/SOURCE" && -f "${destination}/VERSION" ]] \
    && [[ $(cat "${destination}/SOURCE") == "${recorded_source}" && $(cat "${destination}/VERSION") == "${version}" ]]; then current=1; fi
  for managed_file in "${managed_files[@]}"; do
    cmp -s "${source_dir}/src/skills/${managed_file}" "${root}/${managed_file}" || current=0
  done
  if [[ ${force} -eq 1 ]]; then
    actions+=(replace)
  elif [[ ${replace_verified} -eq 1 && ${current} -eq 1 ]]; then
    actions+=(skip)
  elif [[ ${replace_verified} -eq 1 ]]; then
    actions+=(replace)
  elif [[ ${existing} -eq 0 ]]; then
    actions+=(install)
  elif [[ ${current} -eq 1 ]]; then
    actions+=(skip)
  else
    echo "${selected_platform}: existing managed installation is edited, partial, or unverifiable. Use --force to explicitly reinstall." >&2
    exit 1
  fi
done < <(all_destinations_for "${target}")

needs_payload_writes=0
for action in "${actions[@]}"; do
  [[ "${action}" == skip ]] || needs_payload_writes=1
done
if host_hook_fragments_present "${source_dir}"; then
  preflight_host_hooks "${source_dir}" "${target}" || exit 1
fi

for index in "${!platforms[@]}"; do
  [[ ${actions[index]} == skip ]] && {
    echo "${platforms[index]}: already current; left unwritten."
    continue
  }
  destination=${destinations[index]}
  root=${roots[index]}
  [[ -z "${OPEN_DOUGH_TRACE:-}" ]] || printf 'install %s\n' "${destination}" >> "${OPEN_DOUGH_TRACE}"
  for managed_file in "${managed_files[@]}"; do
    mkdir -p -- "${root}/${managed_file%/*}"
  done
  [[ "${OPEN_DOUGH_INSTALL_FAULT:-}" != copy ]] || {
    printf '%s\n' partial-install > "${destination}/SKILL.md"
    report_incomplete_install "${platforms[index]}" 'Copy failed after replacement started.'
  }
  for managed_file in "${managed_files[@]}"; do cp -- "${source_dir}/src/skills/${managed_file}" "${root}/${managed_file}" || report_incomplete_install "${platforms[index]}" 'Copy failed after replacement started.'; done
  verification_failed=0
  for managed_file in "${managed_files[@]}"; do cmp -s "${source_dir}/src/skills/${managed_file}" "${root}/${managed_file}" || verification_failed=1; done
  [[ "${OPEN_DOUGH_INSTALL_FAULT:-}" != verify && ${verification_failed} -eq 0 ]] || report_incomplete_install "${platforms[index]}" 'Installed payload verification failed.'
  write_certified_records "${destination}" "${recorded_source}" "${version}" || report_incomplete_install "${platforms[index]}" 'Failed to write installation records after replacement started.'
  echo "${platforms[index]}: installed Open Dough guidance in ${root} (version ${version})."
done

if host_hook_fragments_present "${source_dir}"; then
  apply_host_hooks "${source_dir}" "${target}" || {
    if [[ ${needs_payload_writes} -eq 1 ]]; then
      echo "Hook registration failed after managed payload writes. Installed files may be incomplete. Recover with an explicit --force reinstall." >&2
    fi
    exit 1
  }
fi
