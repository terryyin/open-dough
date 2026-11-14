#!/usr/bin/env bash
# scripts/ci-container.sh states CI's Ubuntu and Node versions and the
# dashboard checks it runs; they agree with .github/workflows/ci.yml and the
# browser test group workflow it calls (Distribution/tests/ci-container.sh covers the
# script's own behavior).
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/expect-in-log.bash
source "${source_dir}/Distribution/tests/helpers/expect-in-log.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
script="${source_dir}/scripts/ci-container.sh"
workflow="${source_dir}/.github/workflows/ci.yml"
browser_workflow="${source_dir}/.github/workflows/browser-test-group.yml"

# Prints the value the script states once for NAME, without its quotes and
# across every line a quoted value spans.
stated() {
  awk -v prefix="readonly $1=" -v q="'" '
    !found && index($0, prefix) == 1 {
      found = 1
      $0 = substr($0, length(prefix) + 1)
      quoted = sub("^" q, "")
    }
    found && (!quoted || sub(q "$", "")) { print; exit }
    found { print }
  ' "${script}"
}
ubuntu_version=$(stated ubuntu_version)
node_version=$(cat -- "${source_dir}/.node-version")
if [[ -z ${ubuntu_version} || -z ${node_version} ]]; then
  echo 'FAIL: scripts/ci-container.sh does not state its Ubuntu and Node versions.' >&2
  exit 1
fi

# The diagnostic image uses the exact shared selection, not latest-v24.x.
# shellcheck disable=SC2016 # Literal source contract.
expect_in_log "${script}" -Fx -- 'node_version=$(cat -- "${source_dir}/.node-version")'
# shellcheck disable=SC2016 # Literal source contract.
expect_in_log "${script}" -F -- 'base=https://nodejs.org/dist/v${node_version}'

# Every job's runner and every Node setup in the workflows must agree.
sed -n 's/^[[:space:]]*runs-on:[[:space:]]*//p' "${workflow}" "${browser_workflow}" > "${temporary_dir}/runners"
sed -n 's/^[[:space:]]*run: bash scripts\/setup-ci-node\.sh[[:space:]]*//p' "${workflow}" "${browser_workflow}" > "${temporary_dir}/nodes"
expect_in_log "${temporary_dir}/runners" -Fx -- "ubuntu-${ubuntu_version}"
expect_in_log "${temporary_dir}/nodes" -Fx -- ".node-version"
if grep -vFx -- "ubuntu-${ubuntu_version}" "${temporary_dir}/runners" \
  || grep -vFx -- ".node-version" "${temporary_dir}/nodes"; then
  printf 'FAIL: ci.yml runs on a version other than ubuntu-%s and Node %s (above).\n' \
    "${ubuntu_version}" "${node_version}" >&2
  exit 1
fi

# The diagnostic image bootstraps system libraries on bare Ubuntu; native CI
# uses the runner's libraries and the locked local Playwright package. The
# diagnostic runs the workflow's type-check and every browser test group's
# command together. In CI the type-check belongs to lint so it cannot spend a
# shard's browser deadline, and each group's shard installs Chromium before
# running its group's command (ci.yml names each group's command).
# Keep the bootstrap explicit rather than removing --with-deps from the image.
dashboard_install=$(stated dashboard_install)
if [[ ${dashboard_install} != 'npx playwright install --with-deps chromium' ]]; then
  echo 'FAIL: scripts/ci-container.sh must bootstrap Chromium system dependencies.' >&2
  exit 1
fi
stated dashboard_steps | sed '1a\
node scripts/setup-native.mjs browser
' > "${temporary_dir}/stated-dashboard"
# shellcheck disable=SC2016 # Literal workflow shell.
if ! {
  awk '
    /^  [^ #]/ { job = $1; installed = 0; next }
    /^[[:space:]]*(- )?run:/ {
      sub(/^[[:space:]]*(- )?run:[[:space:]]*/, "")
      if ($0 == "node scripts/setup-native.mjs npm") installed = 1
      else if ($0 == "npm run typecheck:dashboard") {
        if (job != "lint:" || !installed) exit 1
        print
      }
    }
  ' "${workflow}" && awk '
    /^[[:space:]]*(- )?run:/ {
      sub(/^[[:space:]]*(- )?run:[[:space:]]*/, "")
      if ($0 == "node scripts/setup-native.mjs npm") installed = 1
      else if ($0 == "node scripts/setup-native.mjs browser" && installed) {
        browser = 1
        print
      }
    }
    browser && /^ +exec npm run "\$\{COMMAND\}"$/ { suite = 1 }
    END { if (!suite) exit 1 }
  ' "${browser_workflow}" && sed -n 's/^      command: /npm run /p' "${workflow}"
} > "${temporary_dir}/ci-dashboard" \
  || ! diff -- "${temporary_dir}/stated-dashboard" "${temporary_dir}/ci-dashboard" >&2; then
  echo 'FAIL: the workflow must type-check after npm ci in lint and install Chromium before each browser test group command in each shard.' >&2
  exit 1
fi
