#!/usr/bin/env bash
# Credential-free Claude substitute: observe original inputs, never accept them.
# shellcheck disable=SC2154 # The public-entry test supplies RETURN_TRANSPORT_*.
set -euo pipefail
if [[ ${1:-} == --version ]]; then
  printf 'return-inputs-substitute\n'
  exit 0
fi
bash "${RETURN_TRANSPORT_SOURCE}/Distribution/evaluation/tests/delivery-evidence/support/delivery-evidence-return-observations.sh" \
  "${PWD}" "${RETURN_TRANSPORT_CASE}" "${RETURN_TRANSPORT_SCENARIO}" "${RETURN_TRANSPORT_LEGACY}" \
  > "${RETURN_TRANSPORT_RESULT}.diagnostic" 2>&1
printf 'observed\n' > "${RETURN_TRANSPORT_RESULT}"
printf '{"type":"result","result":"Observed the returned fixture inputs; acceptance was not performed."}\n'
