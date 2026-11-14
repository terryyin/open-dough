#!/usr/bin/env bash
# Exercise the maintained setup entry point with controlled acquisition sources;
# no registry/browser download and no implementation copied into the fixture.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/expect-in-log.bash
source "${source_dir}/Distribution/tests/helpers/expect-in-log.bash"
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/wait-for.bash
source "${source_dir}/Distribution/tests/helpers/wait-for.bash"
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/process-state.bash
source "${source_dir}/Distribution/tests/helpers/process-state.bash"
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
printf '%s\n' "$*" "NPM_CONFIG_AUDIT=${NPM_CONFIG_AUDIT:-} NPM_CONFIG_FUND=${NPM_CONFIG_FUND:-}" > "${SOURCE_CALL}"
case ${SOURCE_BEHAVIOR} in
  failed) exit 23 ;;
  stalled) exec /bin/sleep 30 ;;
  interrupted)
    /bin/bash -c 'printf "%s\n" "$$" > "${CHILD_READY}"; /bin/sleep 1; /usr/bin/touch "${LATE_WRITE}"' &
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
  # It leaves a loaded machine time to reach the launch, and still ends well
  # before the fixture's 30-second stall.
  deadline=$("${node}" -e 'console.log(Date.now()+2000)')
  started=${EPOCHREALTIME}
  refuse "${stage}-stalled" "${stage}" stalled "${stage} source stalled: acquisition deadline exceeded" "${deadline}"
  elapsed=$("${node}" -e "console.log(Number('${EPOCHREALTIME}')-Number('${started}'))")
  "${node}" -e "if (Number('${elapsed}') > 6) process.exit(1)"
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
mv -- "${temporary_dir}/.node-version" "${temporary_dir}/node-version-hidden"
refuse node-selection-missing check healthy 'selected Node unavailable; run from the repository root with .node-version'
mv -- "${temporary_dir}/node-version-hidden" "${temporary_dir}/.node-version"
refuse expired npm healthy 'npm source acquisition deadline expired before launch' 1
[[ ! -e ${temporary_dir}/source-call ]]

# Check uses Playwright's launch boundary; a missing browser/library must stop
# the caller's success chain without acquiring a replacement behind its back.
cat > "${temporary_dir}/node_modules/playwright/index.js" << 'CHECK'
exports.chromium = { launch: async () => {
  if (process.env.SOURCE_BEHAVIOR === 'failed') throw new Error('missing fixture browser');
  if (process.env.SOURCE_BEHAVIOR === 'stalled') {
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  return { version: () => 'fixture-locked-browser', close: async () => {} };
} };
CHECK
refuse check-missing check failed 'Chromium prerequisite unavailable: missing fixture browser'
validation_deadline=$("${node}" -e 'console.log(Date.now()+2000)')
refuse check-stalled check stalled 'Chromium prerequisite validation stalled: deadline exceeded' "${validation_deadline}"
printf '%s\n' '{"packages":{"node_modules/playwright":{"version":"1.62.0"}}}' > "${temporary_dir}/package-lock.json"
refuse check-lock-change check healthy 'Playwright prerequisite mismatch: locked 1.62.0, installed 1.63.0'
[[ ! -e ${temporary_dir}/source-call ]]
printf '%s\n' '{"packages":{"node_modules/playwright":{"version":"1.63.0"}}}' > "${temporary_dir}/package-lock.json"
# Success paths must not inherit CI's shared setup deadline from GITHUB_ENV;
# that wall clock expires while later suite shards still run this fixture.
healthy_deadline=$("${node}" -e 'console.log(Date.now()+180000)')
(cd -- "${temporary_dir}" && OPEN_DOUGH_SETUP_DEADLINE_MS="${healthy_deadline}" \
  SOURCE_BEHAVIOR=healthy "${node}" "${script}" check) \
  > "${temporary_dir}/healthy-check.log" 2>&1
expect_in_log "${temporary_dir}/healthy-check.log" -F -- 'Native prerequisites: Chromium fixture-locked-browser'

# Successful calls use the locked CLI and npm's explicitly bounded fetches.
for stage in npm browser; do
  healthy_deadline=$("${node}" -e 'console.log(Date.now()+180000)')
  (cd -- "${temporary_dir}" && PATH="${temporary_dir}/bin" \
    OPEN_DOUGH_SETUP_DEADLINE_MS="${healthy_deadline}" \
    SOURCE_CALL="${temporary_dir}/source-call" SOURCE_BEHAVIOR=healthy \
    "${node}" "${script}" "${stage}") > "${temporary_dir}/healthy-${stage}.log" 2>&1
  expect_in_log "${temporary_dir}/healthy-${stage}.log" -F -- "${stage} acquisition complete"
  case ${stage} in
    npm)
      expect_in_log "${temporary_dir}/source-call" -Fx -- 'ci --fetch-retries=0 --fetch-timeout=20000'
      expect_in_log "${temporary_dir}/source-call" -Fx -- 'NPM_CONFIG_AUDIT=false NPM_CONFIG_FUND=false'
      ;;
    browser) expect_in_log "${temporary_dir}/source-call" -Fx -- 'install chromium' ;;
    *) exit 1 ;;
  esac
done

# A failed release download must fall back to a verified, exact-version Node.
if command -v timeout > /dev/null; then
  node_fixture=${temporary_dir}/ci-node
  mkdir -p "${node_fixture}/bin" "${node_fixture}/runner"
  cp "${source_dir}/.node-version" "${node_fixture}/.node-version"
  version=$(< "${node_fixture}/.node-version")
  archive=node-v${version}-linux-x64
  mkdir -p "${node_fixture}/${archive}/bin"
  printf '#!/bin/bash\nprintf "v%s\\n"\n' "${version}" > "${node_fixture}/${archive}/bin/node"
  chmod +x "${node_fixture}/${archive}/bin/node"
  (cd "${node_fixture}" && tar -cJf "${archive}.tar.xz" "${archive}" \
    && sha256sum "${archive}.tar.xz" > SHASUMS256.txt)
  cat > "${node_fixture}/bin/curl" << 'CURL'
#!/usr/bin/env bash
url=${!#}
case ${url} in
  */versions-manifest.json)
    printf '[{"version":"%s","files":[{"platform":"linux","arch":"x64","download_url":"https://github.com/actions/node-versions/releases/download/fixture/node.tar.gz"}]}]\n' "${FIXTURE_VERSION}"
    ;;
  https://github.com/actions/node-versions/releases/download/*)
    echo 'controlled GitHub release HTTP 504' >&2
    exit 22
    ;;
  https://nodejs.org/dist/*) cp "${FIXTURE_SOURCE}/${url##*/}" "${@: -2:1}" ;;
  *) exit 99 ;;
esac
CURL
  chmod +x "${node_fixture}/bin/curl"
  ci_node() {
    FIXTURE_VERSION=${version} FIXTURE_SOURCE="${node_fixture}" \
      GITHUB_PATH="${node_fixture}/path" RUNNER_TEMP="${node_fixture}/runner" RUNNER_TOOL_CACHE='' \
      OPEN_DOUGH_NODE_DEADLINE_MS="$1" PATH="${node_fixture}/bin:${PATH}" \
      bash "${source_dir}/scripts/setup-ci-node.sh" "${node_fixture}/.node-version"
  }
  ci_node '' > "${node_fixture}/setup.log" 2>&1
  expect_in_log "${node_fixture}/setup.log" -F -- 'controlled GitHub release HTTP 504'
  expect_in_log "${node_fixture}/setup.log" -F -- "Using Node v${version} from nodejs.org."
  expect_in_log "${node_fixture}/path" -Fx -- "${node_fixture}/runner/node-official/bin"
  rm -- "${node_fixture}/path"
  # shellcheck disable=SC2310 # ci_node returns the external installer status.
  if ci_node 1 > "${node_fixture}/expired.log" 2>&1; then
    echo 'FAIL: expired hosted Node setup succeeded.' >&2
    exit 1
  fi
  expect_in_log "${node_fixture}/expired.log" -F -- 'Node acquisition deadline expired before download'
  [[ ! -e ${node_fixture}/path ]]
  printf 'corrupt\n' >> "${node_fixture}/${archive}.tar.xz"
  # shellcheck disable=SC2310 # ci_node returns the external installer status.
  if ci_node '' > "${node_fixture}/corrupt.log" 2>&1; then
    echo 'FAIL: hosted Node setup accepted an invalid archive.' >&2
    exit 1
  fi
  expect_in_log "${node_fixture}/corrupt.log" -F -- "${archive}.tar.xz: FAILED"
  [[ ! -e ${node_fixture}/path ]]
fi

# Both workflows own action bounds, cache identity and browser failure gating.
cat -- "${source_dir}"/.github/workflows/{ci,browser-test-group}.yml > "${temporary_dir}/workflows.yml"
workflow=${temporary_dir}/workflows.yml
# shellcheck disable=SC2016 # Literal workflow expressions.
expect_in_log "${workflow}" -F -- 'key: playwright-chromium-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles('\''package-lock.json'\'') }}'
expect_in_log "${workflow}" -F -- 'timeout-minutes: 1'
expect_in_log "${workflow}" -F -- 'bash scripts/setup-ci-node.sh .node-version'
expect_in_log "${workflow}" -F -- '60000'
expect_in_log "${workflow}" -F -- '180000'
expect_in_log "${workflow}" -F -- 'node scripts/setup-native.mjs npm'
expect_in_log "${workflow}" -F -- 'node scripts/setup-native.mjs browser'
expect_in_log "${workflow}" -F -- "!cancelled() && steps.playwright-cache.outcome == 'failure'"
# shellcheck disable=SC2016 # Literal runner variable.
expect_in_log "${workflow}" -F -- 'PLAYWRIGHT_BROWSERS_PATH=${RUNNER_TEMP}/playwright-chromium'
if grep -Eq 'restore-keys:|--with-deps|if:.*always\(' "${workflow}" \
  || ! awk '
    /^ *- name:/ { cache = ($0 ~ /name: Cache Playwright Chromium$/) }
    /continue-on-error:/ { count++; if (!cache || $0 !~ /continue-on-error: true$/) exit 1 }
    END { if (count != 1) exit 1 }
  ' "${workflow}"; then
  echo 'FAIL: CI weakens setup failure gating or uses incompatible browser recovery.' >&2
  exit 1
fi

# Interrupt the real entrypoint after its source has started a descendant.
# Neither an interrupted source nor its descendant may keep writing afterward.
for signal in INT TERM; do
  rm -f -- "${temporary_dir}/source-call" "${temporary_dir}/late-write" "${temporary_dir}/child-ready"
  interrupt_deadline=$("${node}" -e 'console.log(Date.now()+180000)')
  (cd -- "${temporary_dir}" && exec env PATH="${temporary_dir}/bin" \
    OPEN_DOUGH_SETUP_DEADLINE_MS="${interrupt_deadline}" \
    SOURCE_CALL="${temporary_dir}/source-call" SOURCE_BEHAVIOR=interrupted \
    LATE_WRITE="${temporary_dir}/late-write" CHILD_READY="${temporary_dir}/child-ready" \
    "${node}" "${script}" npm) > "${temporary_dir}/interrupt-${signal}.log" 2>&1 &
  setup_pid=$!
  # node→setup→stub→descendant can exceed 1s under CI load.
  wait_for 'the setup source descendant to start' 5 "[[ -s '${temporary_dir}/child-ready' ]]"
  descendant=$(< "${temporary_dir}/child-ready")
  kill -"${signal}" "${setup_pid}"
  result=0
  wait "${setup_pid}" || result=$?
  case ${signal} in
    INT) [[ ${result} -eq 130 ]] ;;
    TERM) [[ ${result} -eq 143 ]] ;;
    *) exit 1 ;;
  esac
  expect_in_log "${temporary_dir}/interrupt-${signal}.log" -F -- "npm source acquisition interrupted (SIG${signal})"
  # A surviving descendant ends only by writing late; once it is gone, any
  # late write has already happened.
  wait_for "the ${signal}-interrupted setup descendant to stop" 5 "! process_running '${descendant}'"
  if [[ -e ${temporary_dir}/late-write ]]; then
    echo "FAIL: ${signal} interruption left a setup descendant writing." >&2
    exit 1
  fi
done
