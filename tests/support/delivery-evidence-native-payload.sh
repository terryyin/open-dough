#!/usr/bin/env bash
# The Open Dough payload a delivery-evidence fixture installs: the candidate's,
# or, when delivery_evidence_payload_revision names a revision of the candidate
# repository, that revision's, for a baseline round under earlier guidance.
# shellcheck disable=SC2312

# Prints `candidate`, or the commit delivery_evidence_payload_revision names in
# SOURCE_DIR; fails for a revision that is not a commit there.
delivery_evidence_installed_payload() {
  local source_dir=$1
  if [[ -z ${delivery_evidence_payload_revision:-} ]]; then
    printf 'candidate\n'
    return
  fi
  git -C "${source_dir}" rev-parse -q --verify \
    "${delivery_evidence_payload_revision}^{commit}"
}

# Installs the payload from SOURCE_DIR into WORKSPACE for HOST.
delivery_evidence_install_payload() {
  local source_dir=$1 workspace=$2 host=$3 payload=$1
  if [[ -n ${delivery_evidence_payload_revision:-} ]]; then
    payload=$(mktemp -d)
    git -C "${source_dir}" archive "${delivery_evidence_payload_revision}" \
      | tar -x -C "${payload}"
  fi
  bash "${payload}/install.sh" --target "${workspace}" \
    --source "${payload}" --platform "${host}" > /dev/null
  [[ ${payload} == "${source_dir}" ]] || rm -rf -- "${payload}"
}
