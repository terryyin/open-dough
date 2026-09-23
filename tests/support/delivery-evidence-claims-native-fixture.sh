#!/usr/bin/env bash
# Disposable project fixture for delivery-evidence/claims acceptance.
# Supplies repository, required promises, candidate changes, and a misleading
# or substantiated implementation return. Does not name the claim gap or
# pre-accept.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/delivery-evidence-claims-native-scenario-content.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/delivery-evidence-claims-native-scenario-content.sh"

delivery_evidence_claims_root=
delivery_evidence_claims_workspace=
delivery_evidence_claims_scenario=

delivery_evidence_claims_git() {
  local cwd=$1
  shift
  git -C "${cwd}" -c user.name='Delivery Evidence Fixture' \
    -c user.email='delivery-evidence@example.invalid' "$@"
}

delivery_evidence_claims_create_fixture() {
  local source_dir=$1
  local host=$2
  local scenario=$3
  local parent=$4
  local root workspace
  root=$(mktemp -d "${parent}/declaims.XXXXXX")
  workspace="${root}/workspace"
  mkdir -p -- "${workspace}"
  delivery_evidence_claims_root=${root}
  delivery_evidence_claims_workspace=${workspace}
  delivery_evidence_claims_scenario=${scenario}

  git init -b main "${workspace}" > /dev/null
  delivery_evidence_claims_write_promises_and_return "${workspace}" "${scenario}"
  delivery_evidence_claims_git "${workspace}" add \
    lib tests .planning/slice-promises.md
  delivery_evidence_claims_git "${workspace}" \
    commit --quiet -m 'baseline with source-link product'
  # Leave the implementation return uncommitted for acceptance.
  bash "${source_dir}/install.sh" --target "${workspace}" \
    --source "${source_dir}" --platform "${host}" > /dev/null
}

delivery_evidence_claims_cleanup() {
  if [[ -n ${delivery_evidence_claims_root:-} &&
    -z ${GIT_PUBLICATION_KEEP:-} ]]; then
    rm -rf -- "${delivery_evidence_claims_root}"
  fi
}
