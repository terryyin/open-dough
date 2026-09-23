#!/usr/bin/env bash
# Disposable project fixture for delivery-evidence/selection acceptance.
# Supplies repository, required promises, candidate changes, and a misleading
# implementation return. Does not name the selection gap or pre-accept.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/delivery-evidence-selection-native-scenario-content.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/delivery-evidence-selection-native-scenario-content.sh"

delivery_evidence_selection_root=
delivery_evidence_selection_workspace=
delivery_evidence_selection_scenario=
delivery_evidence_selection_claimed=
delivery_evidence_selection_initial=

delivery_evidence_selection_git() {
  local cwd=$1
  shift
  git -C "${cwd}" -c user.name='Delivery Evidence Fixture' \
    -c user.email='delivery-evidence@example.invalid' "$@"
}

delivery_evidence_selection_create_fixture() {
  local source_dir=$1
  local host=$2
  local scenario=$3
  local parent=$4
  local root workspace
  root=$(mktemp -d "${parent}/desel.XXXXXX")
  workspace="${root}/workspace"
  mkdir -p -- "${workspace}"
  delivery_evidence_selection_root=${root}
  delivery_evidence_selection_workspace=${workspace}
  delivery_evidence_selection_scenario=${scenario}

  git init -b main "${workspace}" > /dev/null
  delivery_evidence_selection_write_tests "${workspace}" "${scenario}"
  delivery_evidence_selection_write_promises_and_return "${workspace}" "${scenario}"
  delivery_evidence_selection_install_test_logger "${workspace}"
  delivery_evidence_selection_plant_initial_selection "${workspace}" "${scenario}"
  # Uncommitted candidate change the return claims to cover.
  case ${scenario} in
    zero-test)
      printf 'merge-direction:ready\n' > "${workspace}/product.txt"
      ;;
    *)
      printf '%s\n' \
        'summary:ready' \
        'empty-groups:ready' \
        'initial-read-failure:ready' \
        > "${workspace}/product.txt"
      ;;
  esac
  delivery_evidence_selection_git "${workspace}" add \
    tests lib .planning/slice-promises.md bin
  delivery_evidence_selection_git "${workspace}" \
    commit --quiet -m 'baseline with tests'
  # Leave product.txt, the misleading return, and selection log uncommitted.
  bash "${source_dir}/install.sh" --target "${workspace}" \
    --source "${source_dir}" --platform "${host}" > /dev/null
}

delivery_evidence_selection_cleanup() {
  if [[ -n ${delivery_evidence_selection_root:-} &&
    -z ${GIT_PUBLICATION_KEEP:-} ]]; then
    rm -rf -- "${delivery_evidence_selection_root}"
  fi
}
