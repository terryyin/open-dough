#!/usr/bin/env bash
# Exercise the maintained setup entry point with controlled acquisition sources;
# no registry/browser download and no implementation copied into the fixture.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
node=$(command -v node)
script=${source_dir}/scripts/setup-native.mjs
mkdir -p -- "${temporary_dir}/bin" "${temporary_dir}/node_modules/playwright"
cp -- "${source_dir}/.node-version" "${temporary_dir}/.node-version"
printf '%s\n' '{"packages":{"node_modules/playwright":{"version":"1.63.0"}}}' > "${temporary_dir}/package-lock.json"
printf '%s\n' '{"version":"1.63.0"}' > "${temporary_dir}/node_modules/playwright/package.json"
cat > "${temporary_dir}/bin/npm" << 'NPM'
#!/bin/bash
printf '%s\n' "$*" > "${SOURCE_CALL}"
case ${SOURCE_BEHAVIOR} in
  failed) exit 23 ;;
  stalled) exec /bin/sleep 30 ;;
  interrupted)
    /bin/bash -c '/usr/bin/touch "${CHILD_READY}"; /bin/sleep 1; /usr/bin/touch "${LATE_WRITE}"' &
    wait
    ;;
esac
NPM
chmod +x "${temporary_dir}/bin/npm"
cat > "${temporary_dir}/node_modules/playwright/cli.js" << 'BROWSER'
const fs = require('node:fs');
fs.writeFileSync(process.env.SOURCE_CALL, process.argv.slice(2).join(' '));
if (process.env.SOURCE_BEHAVIOR === 'failed') process.exit(23);
if (process.env.SOURCE_BEHAVIOR === 'stalled') setTimeout(() => {}, 30000);
BROWSER

# A caller's normal success chain must never reach its test command on a setup
# failure. Fixtures supply only prerequisites/source responses.
refuse() {
  local name=$1 stage=$2 behavior=$3 diagnosis=$4 deadline=${5:-}
  deadline=${deadline:-$("${node}" -e 'console.log(Date.now()+180000)')}
  rm -f -- "${temporary_dir}/tests-started" "${temporary_dir}/source-call"
  if (cd -- "${temporary_dir}" \
    && PATH="${temporary_dir}/bin" SOURCE_BEHAVIOR="${behavior}" \
      SOURCE_CALL="${temporary_dir}/source-call" \
      OPEN_DOUGH_SETUP_DEADLINE_MS="${deadline}" \
      "${node}" "${script}" "${stage}" && /usr/bin/touch tests-started) \
    > "${temporary_dir}/${name}.log" 2>&1; then
    echo "FAIL: ${name} setup succeeded." >&2
    exit 1
  fi
  expect_in_log "${temporary_dir}/${name}.log" -F -- "${diagnosis}"
  expect_in_log "${temporary_dir}/${name}.log" -F -- 'rerun setup before running checks'
  if [[ -e ${temporary_dir}/tests-started ]]; then
    echo "FAIL: ${name} started tests after setup failure." >&2
    exit 1
  fi
}
refuse npm-failed npm failed 'npm source acquisition failed (23)'
mv -- "${temporary_dir}/bin/npm" "${temporary_dir}/bin/npm-hidden"
refuse npm-unavailable npm healthy 'npm source unavailable:'
mv -- "${temporary_dir}/bin/npm-hidden" "${temporary_dir}/bin/npm"
for stage in npm browser; do
  # A real wall deadline tests process termination, including source children.
  deadline=$("${node}" -e 'console.log(Date.now()+250)')
  started=${EPOCHREALTIME}
  refuse "${stage}-stalled" "${stage}" stalled "${stage} source stalled: acquisition deadline exceeded" "${deadline}"
  elapsed=$("${node}" -e "console.log(Number('${EPOCHREALTIME}')-Number('${started}'))")
  "${node}" -e "if (Number('${elapsed}') > 3) process.exit(1)"
done
refuse browser-failed browser failed 'browser source acquisition failed (23)'
printf '%s\n' '{"version":"1.62.0"}' > "${temporary_dir}/node_modules/playwright/package.json"
refuse browser-mismatch browser healthy 'Playwright prerequisite mismatch: locked 1.63.0, installed 1.62.0'
[[ ! -e ${temporary_dir}/source-call ]]
rm -- "${temporary_dir}/node_modules/playwright/package.json"
refuse browser-unavailable browser healthy 'locked Playwright prerequisite unavailable'
printf '%s\n' '{"version":"1.63.0"}' > "${temporary_dir}/node_modules/playwright/package.json"
printf '%s\n' '0.0.0' > "${temporary_dir}/.node-version"
refuse node-mismatch npm healthy 'Node prerequisite mismatch: selected 0.0.0'
[[ ! -e ${temporary_dir}/source-call ]]
cp -- "${source_dir}/.node-version" "${temporary_dir}/.node-version"
refuse expired npm healthy 'npm source acquisition deadline expired before launch' 1
[[ ! -e ${temporary_dir}/source-call ]]

# Successful calls use the locked CLI and npm's explicitly bounded fetches.
for stage in npm browser; do
  (cd -- "${temporary_dir}" && PATH="${temporary_dir}/bin" \
    SOURCE_CALL="${temporary_dir}/source-call" SOURCE_BEHAVIOR=healthy \
    "${node}" "${script}" "${stage}") > "${temporary_dir}/healthy-${stage}.log" 2>&1
  expect_in_log "${temporary_dir}/healthy-${stage}.log" -F -- "${stage} acquisition complete"
  case ${stage} in
    npm) expect_in_log "${temporary_dir}/source-call" -Fx -- 'ci --fetch-retries=0 --fetch-timeout=20000' ;;
    browser) expect_in_log "${temporary_dir}/source-call" -Fx -- 'install chromium' ;;
    *) exit 1 ;;
  esac
done

# Workflow owns the action bounds and exact cache identity; normal success
# gating (no continue-on-error/always) keeps suites behind all setup stages.
workflow=${source_dir}/.github/workflows/ci.yml
# shellcheck disable=SC2016 # Literal workflow expressions.
expect_in_log "${workflow}" -F -- 'key: playwright-chromium-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('\''package-lock.json'\'') }}'
expect_in_log "${workflow}" -F -- 'timeout-minutes: 1'
expect_in_log "${workflow}" -F -- 'node-version-file: .node-version'
expect_in_log "${workflow}" -F -- '180000'
expect_in_log "${workflow}" -F -- 'node scripts/setup-native.mjs npm'
expect_in_log "${workflow}" -F -- 'node scripts/setup-native.mjs browser'
if grep -Eq 'restore-keys:|continue-on-error:|--with-deps|if:.*always\(' "${workflow}"; then
  echo 'FAIL: CI weakens setup failure gating or uses incompatible browser recovery.' >&2
  exit 1
fi

# Interrupt the real entrypoint after its source has started a descendant.
# Neither an interrupted source nor its descendant may keep writing afterward.
for signal in INT TERM; do
  rm -f -- "${temporary_dir}/source-call" "${temporary_dir}/late-write" "${temporary_dir}/child-ready"
  (cd -- "${temporary_dir}" && exec env PATH="${temporary_dir}/bin" \
    SOURCE_CALL="${temporary_dir}/source-call" SOURCE_BEHAVIOR=interrupted \
    LATE_WRITE="${temporary_dir}/late-write" CHILD_READY="${temporary_dir}/child-ready" \
    "${node}" "${script}" npm) > "${temporary_dir}/interrupt-${signal}.log" 2>&1 &
  setup_pid=$!
  for ((attempt = 0; attempt < 100; attempt++)); do
    [[ -e ${temporary_dir}/child-ready ]] && break
    sleep 0.01
  done
  [[ -e ${temporary_dir}/child-ready ]]
  kill -"${signal}" "${setup_pid}"
  result=0
  wait "${setup_pid}" || result=$?
  case ${signal} in
    INT) [[ ${result} -eq 130 ]] ;;
    TERM) [[ ${result} -eq 143 ]] ;;
    *) exit 1 ;;
  esac
  expect_in_log "${temporary_dir}/interrupt-${signal}.log" -F -- "npm source acquisition interrupted (SIG${signal})"
  sleep 1.1
  if [[ -e ${temporary_dir}/late-write ]]; then
    echo "FAIL: ${signal} interruption left a setup descendant writing." >&2
    exit 1
  fi
done
