#!/usr/bin/env bash
# Disposable project fixture for delivery-evidence/consumers acceptance.
# Supplies a two-revision contract change, stale exclusion, producer proof,
# incompatible stand-in, and an unchanged unrelated-boundary control. Does not
# name the missed consumer or pre-accept.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/delivery-evidence-consumers-native-scenario-content.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/delivery-evidence-consumers-native-scenario-content.sh"

delivery_evidence_consumers_root=
delivery_evidence_consumers_workspace=
delivery_evidence_consumers_scenario=

delivery_evidence_consumers_git() {
  local cwd=$1
  shift
  git -C "${cwd}" -c user.name='Delivery Evidence Fixture' \
    -c user.email='delivery-evidence@example.invalid' "$@"
}

delivery_evidence_consumers_create_fixture() {
  local source_dir=$1
  local host=$2
  local scenario=$3
  local parent=$4
  local root workspace
  root=$(mktemp -d "${parent}/deconsumers.XXXXXX")
  workspace="${root}/workspace"
  mkdir -p -- "${workspace}"
  delivery_evidence_consumers_root=${root}
  delivery_evidence_consumers_workspace=${workspace}
  delivery_evidence_consumers_scenario=${scenario}

  git init -b main "${workspace}" > /dev/null
  delivery_evidence_consumers_write_baseline_revision "${workspace}"
  delivery_evidence_consumers_git "${workspace}" add \
    lib e2e tests .planning/prior-consumer-assessment.md
  delivery_evidence_consumers_git "${workspace}" \
    commit --quiet -m 'baseline one-arg factory with matching E2E stand-in'

  # Second revision / uncommitted candidate: scenario overlay. Leave the
  # implementation return and any contract edits uncommitted for acceptance.
  delivery_evidence_consumers_write_promises_and_return "${workspace}" \
    "${scenario}"
  bash "${source_dir}/install.sh" --target "${workspace}" \
    --source "${source_dir}" --platform "${host}" > /dev/null
}

delivery_evidence_consumers_cleanup() {
  if [[ -n ${delivery_evidence_consumers_root:-} &&
    -z ${GIT_PUBLICATION_KEEP:-} ]]; then
    rm -rf -- "${delivery_evidence_consumers_root}"
  fi
}
