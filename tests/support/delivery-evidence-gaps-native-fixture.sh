#!/usr/bin/env bash
# Disposable project fixture for delivery-evidence/gaps acceptance.
# Supplies readiness/requeue product, independent happy-path proof, and a
# return that records a required gap as learning while treating delivery as
# ready — or sufficient current proof. Does not name the acceptance decision.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/delivery-evidence-gaps-native-scenario-content.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/delivery-evidence-gaps-native-scenario-content.sh"

delivery_evidence_gaps_root=
delivery_evidence_gaps_workspace=
delivery_evidence_gaps_scenario=

delivery_evidence_gaps_git() {
  local cwd=$1
  shift
  git -C "${cwd}" -c user.name='Delivery Evidence Fixture' \
    -c user.email='delivery-evidence@example.invalid' "$@"
}

delivery_evidence_gaps_create_fixture() {
  local source_dir=$1
  local host=$2
  local scenario=$3
  local parent=$4
  local root workspace
  root=$(mktemp -d "${parent}/degaps.XXXXXX")
  workspace="${root}/workspace"
  mkdir -p -- "${workspace}"
  delivery_evidence_gaps_root=${root}
  delivery_evidence_gaps_workspace=${workspace}
  delivery_evidence_gaps_scenario=${scenario}

  git init -b main "${workspace}" > /dev/null
  delivery_evidence_gaps_write_baseline_revision "${workspace}"
  delivery_evidence_gaps_git "${workspace}" add lib tests
  delivery_evidence_gaps_git "${workspace}" \
    commit --quiet -m 'baseline readiness admission with happy-path proof'

  delivery_evidence_gaps_write_promises_and_return "${workspace}" \
    "${scenario}"
  bash "${source_dir}/install.sh" --target "${workspace}" \
    --source "${source_dir}" --platform "${host}" > /dev/null
}

delivery_evidence_gaps_cleanup() {
  if [[ -n ${delivery_evidence_gaps_root:-} &&
    -z ${GIT_PUBLICATION_KEEP:-} ]]; then
    rm -rf -- "${delivery_evidence_gaps_root}"
  fi
}
