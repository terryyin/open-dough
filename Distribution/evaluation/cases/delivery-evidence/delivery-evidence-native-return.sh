#!/usr/bin/env bash
# Shared transport at the existing fixture/producer seam. Scenario owners state
# claims explicitly; only the installed clock records actual command results.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_return_clock=
delivery_evidence_return_records=()
delivery_evidence_return_rows=()

delivery_evidence_run_producer() {
  local workspace=$1 name=$2
  shift 2
  if [[ -z ${delivery_evidence_return_clock:-} ]]; then
    (cd -- "${workspace}" && "$@")
    return
  fi
  local evidence log status=0
  evidence=$(git -C "${workspace}" rev-parse --path-format=absolute --git-path open-dough/evidence)
  mkdir -p -- "${evidence}"
  log="${evidence}/${name}.log"
  delivery_evidence_return_records+=("${log}.run.json")
  (cd -- "${workspace}" && node "${delivery_evidence_return_clock}" run \
    --log "${log}" --exit-file "${log}.exit" -- "$@") > /dev/null || status=$?
  [[ ${status} -eq 0 ]] || return "${status}"
  cat -- "${log}"
  return "$(cat -- "${log}.exit")"
}

delivery_evidence_return_promise() {
  delivery_evidence_return_rows+=("$1")
}

delivery_evidence_write_return() {
  local workspace=$1 evidence report
  evidence=$(git -C "${workspace}" rev-parse --path-format=absolute --git-path open-dough/evidence)
  mkdir -p -- "${evidence}"
  report="${evidence}/implementation-report.md"
  cp -- "${workspace}/.planning/implementation-return.md" "${report}"
  {
    printf '# Returned implementation verdict\n\n'
    printf '%s\n' "${delivery_evidence_return_rows[@]}"
    printf '\nChanged paths (including uncommitted fixture inputs):\n'
    git -C "${workspace}" status --short
    printf '\nRun records:\n'
    printf -- '- %s\n' "${delivery_evidence_return_records[@]}"
    printf '\n%s\n' "${delivery_evidence_return_notes}"
    printf '\nFull report: %s\n' "${report}"
  } > "${workspace}/.planning/implementation-return.md"
  printf '\n---\n\n' >> "${report}"
  cat -- "${workspace}/.planning/implementation-return.md" >> "${report}"
}
