#!/usr/bin/env bash
# Credential-free proof of the guard that keeps native assessor rejected cases
# in the helper: outside it, no test states a rejected case, so this tree
# passes. The stray fixture suite fails, naming each such line and leaving its
# allowed shapes alone.
# shellcheck disable=SC1091,SC2310,SC2312 # Sourced guard; its verdicts are tested.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=tests/support/native-assessor-counterexample-guard.sh
source "${source_dir}/tests/support/native-assessor-counterexample-guard.sh"

work=$(mktemp -d)
finish() {
  rm -rf -- "${work}"
}
trap finish EXIT

cd -- "${source_dir}"
mapfile -t guarded < <(native_assessor_counterexample_guard_files)
if ! native_assessor_counterexample_guard "${guarded[@]}"; then
  echo 'FAIL: rejected cases outside the helper; state each through tests/support/native-assessor-counterexample.sh' >&2
  exit 1
fi

# Expects the guard of files "$@", read from the current directory, to fail
# naming exactly the `FILE:LINE what` lines on standard input.
expect_guard_fails() {
  local want got
  want=$(cat)
  if got=$(native_assessor_counterexample_guard "$@"); then
    printf 'FAIL: guard passed %s\n' "$*" >&2
    exit 1
  fi
  got=$(sed -E 's/^FAIL: ([^:]*:[0-9]+): ([^:]*): .*/\1 \2/' <<< "${got}")
  if [[ ${got} != "${want}" ]]; then
    printf 'FAIL: guard of %s named:\n%s\nwant:\n%s\n' "$*" "${got}" \
      "${want}" >&2
    exit 1
  fi
}
stray=tests/support/native-assessor-counterexample-stray-suite.sh
expect_guard_fails "${stray}" << EOF
${stray}:9 calls a removed rejection primitive
${stray}:11 calls a removed rejection primitive
${stray}:12 negates an assessor call
${stray}:13 tests an assessor call expecting a rejection
${stray}:17 fails the check when an assessor passes
${stray}:18 expects a rejection verdict outside the helper
${stray}:19 tests a verdict expecting a rejection
${stray}:23 expects a rejection verdict outside the helper
EOF

# A JavaScript test asserting a rejection of an assessor exported by a file
# that declares signals; the declaring file itself is its definition.
mkdir "${work}/js"
cat > "${work}/js/toy-assess.mjs" << 'JS'
// assessor-signal: stream stream-status
export function assessToy(observation) {
  return { status: observation.complete ? "pass" : "fail" };
}
JS
cat > "${work}/js/toy.test.mjs" << 'JS'
import { assessToy } from "./toy-assess.mjs";
const verdict = assessToy({ complete: false });
assert.equal(verdict.status, "fail");
JS
cd -- "${work}"
expect_guard_fails js/toy-assess.mjs js/toy.test.mjs << 'EOF'
js/toy.test.mjs:3 expects a rejection verdict outside the helper
EOF
