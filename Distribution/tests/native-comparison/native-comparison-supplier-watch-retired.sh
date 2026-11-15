#!/usr/bin/env bash
# A native supplier-watch request refuses through the real CLI before any
# host invocation. The symlink selects the native route; its target is a tripwire.
# shellcheck disable=SC2312 # The tripwire and result inventory are observable evidence.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
mkdir -p "${work}/bin" "${work}/clock"
mkfifo "${work}/clock/advance"
printf '#!/usr/bin/env bash\ntouch %q\nexit 87\n' "${work}/host-started" > "${work}/host"
chmod +x "${work}/host"
ln -s "${work}/host" "${work}/bin/codex"

status=0
PATH="${work}/bin:${PATH}" CODEX_HOME="${work}/codex-home" \
  NATIVE_COMPARISON_CONTROL_CLOCK="${work}/clock" \
  "${BASH}" "${source_dir}/Distribution/tests/native-comparison/native-comparison.sh" \
  --native codex --case supplier-watch --results-dir "${work}/results" \
  > "${work}/out" 2> "${work}/err" || status=$?
[[ ${status} -eq 1 ]]
grep -Fqx 'unstarted: supplier-watch native profile is retired; use the controlled diagnostic checks; no session started' \
  "${work}/out"
grep -Fqx 'result-path: none retained' "${work}/out"
[[ ! -e ${work}/host-started && ! -e ${work}/codex-home && ! -s ${work}/err ]]
[[ -z $(find "${work}/results" -type f -print -quit) ]]
