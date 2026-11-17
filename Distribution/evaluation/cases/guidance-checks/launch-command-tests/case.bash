#!/usr/bin/env bash
# Fixture and observer of the launch-command-tests case (case.md): the runner
# (Distribution/evaluation/src/native-guidance-check-run.sh) sources this file
# and assess.bash. The fixture materializes Open Dough at the pinned revision
# from a durable Git source, commits the overlay/ tree (the frozen effort
# work) over it as the project's starting state, installs the payload and the
# project's own dependencies. The observer keeps the final change against that state and
# runs the owning backend specs and the unchanged E2E consumer itself; it
# prints `turn-N-*` fields and judges nothing.
# shellcheck disable=SC2034,SC2312 # case_* globals are read by the runner; observations print what each command gives.

case_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
case_events=''
case_revision=4b75c28885e49ace352561cad01907926e066fdd
case_source=${NATIVE_GUIDANCE_CHECK_OPEN_DOUGH_SOURCE:-https://github.com/terryyin/open-dough.git}
case_backend_specs=(
  dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts
  dashboard/backend-tests/launches/agent-launch-ad-hoc-boundary.spec.ts
)
case_e2e_specs=(e2e/launches/agent-launch-ad-hoc.spec.ts)

# Builds ROOT/workspace: a fresh checkout of the pinned revision with the
# overlay committed, the payload from PAYLOAD_DIR for HOST, and the
# project's locked dependencies. Leaves case_basis, the starting state's tree,
# and case_project_basis.
case_materialize() {
  local root=$1 payload=$2 host=$3 workspace="$1/workspace"
  git init -q "${workspace}" \
    && git -C "${workspace}" fetch -q --depth 1 "${case_source}" "${case_revision}" \
    && git -C "${workspace}" -c advice.detachedHead=false checkout -q --detach FETCH_HEAD \
    && cp -R -- "${case_dir}/overlay/." "${workspace}/" \
    && git -C "${workspace}" add -A -- dashboard e2e \
    && git -C "${workspace}" -c user.name=Open-Dough -c user.email=open-dough@example.invalid \
      commit -qm 'Select reasoning effort for launches' \
    || return
  delivery_evidence_install_payload "${payload}" "${workspace}" "${host}" --force || return
  case_basis=$(case_tree "${workspace}" "${root}/basis.index") || return
  (cd -- "${workspace}" && npm ci --no-audit --no-fund --ignore-scripts) \
    > "${root}/setup.log" 2>&1 || return
  case_project_basis="open-dough=${case_revision} overlay=$(case_overlay_identity) basis=${case_basis}"
}

# The sha256 of the overlay tree's sorted `sha256  path` manifest.
case_overlay_identity() {
  (cd -- "${case_dir}/overlay" && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 shasum -a 256) \
    | shasum -a 256 | cut -d ' ' -f 1
}

# The tree of WORKSPACE's files, tracked or not ignored, through the scratch
# index INDEX, leaving the workspace's own index alone.
case_tree() {
  rm -f -- "$2"
  GIT_INDEX_FILE=$2 git -C "$1" add -A && GIT_INDEX_FILE=$2 git -C "$1" write-tree
}

# Runs Playwright config CONFIG over the remaining specs in WORKSPACE, keeping
# its JSON report at REPORT; prints `passed failed`, or `0 0` without a report.
case_run_specs() {
  local workspace=$1 config=$2 report=$3
  shift 3
  (cd -- "${workspace}" \
    && env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES \
      PLAYWRIGHT_JSON_OUTPUT_NAME="${report}" \
      npx playwright test --config "${config}" --reporter=json "$@") > /dev/null 2>&1 || true
  jq -r '"\(.stats.expected // 0) \((.stats.unexpected // 0) + (.stats.flaky // 0))"' "${report}" 2> /dev/null \
    || echo '0 0'
}

# Prints `passed`, `failed` or `missing` from a `passed failed` count pair.
case_outcome() {
  local passed=${1% *} failed=${1#* }
  if ((failed > 0)); then echo failed; elif ((passed > 0)); then echo passed; else echo missing; fi
}

# Prints the turn-N source fields of WORKSPACE and keeps its final change
# against the starting state (case_basis, after payload and dependencies) as
# EVIDENCE/final-turn-N.diff.
case_observe_change() {
  local workspace=$1 turn=$2 evidence=$3 final
  mkdir -p -- "${evidence}"
  final=$(case_tree "${workspace}" "${evidence}/final.index")
  rm -f -- "${evidence}/final.index"
  git -C "${workspace}" diff --binary "${case_basis}" "${final}" > "${evidence}/final-turn-${turn}.diff"
  if [[ -s ${evidence}/final-turn-${turn}.diff ]]; then
    printf 'turn-%s-source: changed\n' "${turn}"
  else
    printf 'turn-%s-source: unchanged\n' "${turn}"
  fi
  printf 'turn-%s-changed-files: %s\n' "${turn}" \
    "$(git -C "${workspace}" diff --name-only "${case_basis}" "${final}" | paste -sd ' ' -)"
}

# Prints the turn-N fields of ROOT after turn N and keeps the final change
# and the executed reports in SCRATCH/case-evidence. Turn status and thread
# come from the runner.
case_observe() {
  local root=$1 turn=$2 workspace="$1/workspace" evidence="$4/case-evidence" counts
  case_observe_change "${workspace}" "${turn}" "${evidence}"
  counts=$(case_run_specs "${workspace}" dashboard/backend.playwright.config.ts \
    "${evidence}/backend-turn-${turn}.json" "${case_backend_specs[@]}")
  printf 'turn-%s-backend: %s\nturn-%s-backend-tests: %s\n' "${turn}" "$(case_outcome "${counts}")" \
    "${turn}" "${counts// /\/}"
  counts=$(case_run_specs "${workspace}" e2e/playwright.config.ts \
    "${evidence}/e2e-turn-${turn}.json" "${case_e2e_specs[@]}")
  printf 'turn-%s-e2e: %s\nturn-%s-e2e-tests: %s\n' "${turn}" "$(case_outcome "${counts}")" \
    "${turn}" "${counts// /\/}"
}
