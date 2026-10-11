# A GitHub request owner endpoint of a check's own, for a check whose
# processes ask GitHub through a `gh` stand-in
# (src/skills/dough-execute-plan/scripts/github-requests.mjs): no other check's
# owner, nor this machine's real one, answers them.
# shellcheck shell=bash
private_request_owner_fixtures="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)/src/skills/dough-execute-plan/scripts/github-request-owner-test-fixtures.mjs"

# Points this shell's processes at a new root, short enough for the owner's
# socket path, keeping the root they were given before.
enter_private_request_owner() {
  private_request_owner_before=${DOUGH_GITHUB_REQUEST_OWNER_ROOT-}
  DOUGH_GITHUB_REQUEST_OWNER_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/ghr-XXXXXX")
  export DOUGH_GITHUB_REQUEST_OWNER_ROOT
}

# Ends every owner at that root, waits until each is gone, removes the root,
# and gives this shell's processes back the root they had.
leave_private_request_owner() {
  local root=${DOUGH_GITHUB_REQUEST_OWNER_ROOT}
  if [[ -n ${private_request_owner_before} ]]; then
    export DOUGH_GITHUB_REQUEST_OWNER_ROOT=${private_request_owner_before}
  else
    unset DOUGH_GITHUB_REQUEST_OWNER_ROOT
  fi
  node -e 'import(process.argv[1]).then((fixtures) => fixtures.endRequestOwners(process.argv[2]))' \
    "${private_request_owner_fixtures}" "${root}"
}
