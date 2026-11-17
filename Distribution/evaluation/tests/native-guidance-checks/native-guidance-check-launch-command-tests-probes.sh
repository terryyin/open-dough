#!/usr/bin/env bash
# Purpose: each probe of the launch-command-tests case (case-probes.bash)
# edits B's real product files as case.md describes and restores them byte
# for byte, in a stand-in workspace holding the overlay's files; a probe whose
# edit no longer applies reports `unapplied`. Which specs the probes turn red
# or leave green is the case's reference qualification (case.md).
# shellcheck disable=SC1091,SC2154,SC2312 # Sourced case globals; checks read what each command gives.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../../.." && pwd)
case_path="${source_dir}/Distribution/evaluation/cases/guidance-checks/launch-command-tests"
source "${case_path}/case.bash"
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT

workspace="${work}/workspace"
cp -R -- "${case_path}/overlay" "${workspace}"
git init -q "${workspace}"
git -C "${workspace}" add -A
git -C "${workspace}" -c user.name=Case -c user.email=case@example.invalid commit -qm basis

# Probe NAME's change to WORKSPACE holds each LINE as an added line, and the
# restore leaves no change.
expect_probe() {
  local name=$1 line
  shift
  [[ $(case_probe_apply "${workspace}" "${name}" "${work}/saved") == edited ]]
  git -C "${workspace}" diff > "${work}/${name}.diff"
  for line in "$@"; do
    if ! sed -n 's/^+ *//p' "${work}/${name}.diff" | grep -Fqx -- "${line}"; then
      echo "FAIL: probe ${name} did not add ${line}" >&2
      exit 1
    fi
  done
  case_probe_restore "${workspace}" "${work}/saved"
  [[ -z $(git -C "${workspace}" status --porcelain) ]]
}
expect_probe perturbation 'defaultEffort: "high",' \
  '"--bg", ...(effort === undefined ? [] : ["--effort", effort]),'
[[ $(grep -c -- '^-.*\.\.\.(effort === undefined' "${work}/perturbation.diff") == 1 ]]
expect_probe fault-name 'name.replace(" · Ad hoc", ""),'
expect_probe fault-instruction '...(instruction === undefined ? ["go"] : [instruction]),'
expect_probe fault-default '? { ...identified, effort: "low" }'

# An edit that no longer matches B's file is reported, and nothing stays.
sed -i.bak 's/defaultEffort: "medium"/defaultEffort: "low"/' "${workspace}/dashboard/src/hostDescription.ts"
rm -- "${workspace}/dashboard/src/hostDescription.ts.bak"
git -C "${workspace}" -c user.name=Case -c user.email=case@example.invalid commit -qam 'other default'
[[ $(case_probe_apply "${workspace}" perturbation "${work}/saved") == unapplied ]]
case_probe_restore "${workspace}" "${work}/saved"
[[ -z $(git -C "${workspace}" status --porcelain) ]]
