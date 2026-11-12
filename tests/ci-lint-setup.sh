#!/usr/bin/env bash
# Exercise the lint job's acquisition script and the workflow's diagnostic
# with controlled sources. GNU timeout is supplied by the real Linux CI
# runner, not a fixture.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/wait-for.bash
source "${source_dir}/tests/helpers/wait-for.bash"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/process-state.bash
source "${source_dir}/tests/helpers/process-state.bash"
platform=$(uname -s)
if [[ ${platform} != Linux ]] || ! command -v timeout > /dev/null 2>&1; then
  # This is an unobserved boundary on macOS; first Linux CI owns its proof.
  exit 0
fi
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
workflow=${source_dir}/.github/workflows/ci.yml
extract_run() {
  awk -v name="$1" '
    /^      - name:/ { selected = ($0 == "      - name: " name); running = 0 }
    selected && /^        run: \|$/ { running = 1; next }
    selected && /^        run: / { print substr($0, 14); next }
    selected && running { print substr($0, 11) }
  ' "${workflow}"
}
acquire=${source_dir}/scripts/setup-lint-tools.sh
extract_run 'Install shell lint tools' > "${temporary_dir}/install.bash"
expect_in_log "${temporary_dir}/install.bash" -Fx -- 'bash scripts/setup-lint-tools.sh'
extract_run 'Diagnose lint tool acquisition failure' > "${temporary_dir}/diagnose.bash"
[[ -s ${temporary_dir}/diagnose.bash ]]
mkdir -- "${temporary_dir}/bin"
mkfifo -- "${temporary_dir}/stalled-download"
cat > "${temporary_dir}/bin/curl" << 'CURL'
#!/usr/bin/env bash
printf '%s\n' "$$" > "${SOURCE_PID}"
printf '%s\n' "$*" >> "${SOURCE_CALL}"
case ${SOURCE_BEHAVIOR} in
  fallback | wrong-version | unavailable | shfmt-unavailable)
    echo 'controlled GitHub release source returned HTTP 504' >&2
    exit 22
    ;;
  stalled)
    read -r _ < "${SOURCE_BLOCKER}"
    ;;
esac
CURL
cat > "${temporary_dir}/bin/docker" << 'DOCKER'
#!/usr/bin/env bash
case $1 in
  create)
    printf '%s\n' "$*" >> "${FALLBACK_CALL}"
    [[ ${SOURCE_BEHAVIOR} != unavailable ]] || exit 7
    if [[ ${SOURCE_BEHAVIOR} == shfmt-unavailable && ${!#} == docker.io/mvdan/shfmt@* ]]; then
      exit 7
    fi
    echo fixture-container
    ;;
  cp)
    case $2 in
      fixture-container:/bin/shellcheck)
        version='version: 0.11.0'
        [[ ${SOURCE_BEHAVIOR} != wrong-version ]] || version='version: 0.9.0'
        ;;
      fixture-container:/bin/shfmt) version=v3.14.1 ;;
      *) exit 1 ;;
    esac
    printf '#!/bin/sh\necho "%s"\n' "${version}" > "$3"
    chmod +x -- "$3"
    ;;
  rm) [[ $2 == fixture-container ]] ;;
  *) exit 1 ;;
esac
DOCKER
cat > "${temporary_dir}/bin/sudo" << 'SUDO'
#!/usr/bin/env bash
[[ $1 == install && $2 == -m && $5 == /usr/local/bin/* ]] || exit 1
install -m "$3" "$4" "${0%/*}/${5##*/}"
SUDO
chmod +x "${temporary_dir}/bin/"{curl,docker,sudo}
for behavior in fallback wrong-version unavailable shfmt-unavailable stalled expired; do
  rm -f -- "${temporary_dir}/source-call" "${temporary_dir}/source-pid" \
    "${temporary_dir}/fallback-call" "${temporary_dir}/bin/shellcheck" "${temporary_dir}/bin/shfmt"
  case ${behavior} in
    stalled) deadline=$(node -e 'console.log(Date.now()+1500)') ;;
    expired) deadline=1 ;;
    *) deadline=$(node -e 'console.log(Date.now()+180000)') ;;
  esac
  started=${EPOCHREALTIME}
  outcome=0
  PATH="${temporary_dir}/bin:${PATH}" SOURCE_BEHAVIOR="${behavior}" \
    SOURCE_CALL="${temporary_dir}/source-call" SOURCE_PID="${temporary_dir}/source-pid" \
    SOURCE_BLOCKER="${temporary_dir}/stalled-download" FALLBACK_CALL="${temporary_dir}/fallback-call" \
    OPEN_DOUGH_SETUP_DEADLINE_MS="${deadline}" SHELLCHECK_VERSION=0.11.0 SHFMT_VERSION=3.14.1 \
    bash "${acquire}" > "${temporary_dir}/${behavior}.log" 2>&1 || outcome=$?
  if [[ ${behavior} == fallback ]]; then
    if ((outcome != 0)); then
      cat "${temporary_dir}/${behavior}.log" >&2
      echo 'FAIL: pinned images did not recover lint setup after release failures.' >&2
      exit 1
    fi
    expect_in_log "${temporary_dir}/fallback-call" -Fx -- 'create --platform linux/amd64 docker.io/koalaman/shellcheck@sha256:b9389b73c8f26f710a7171cb7d8848a34a9c1e07a7865e727c9ec4ce99f9a83f'
    expect_in_log "${temporary_dir}/fallback-call" -Fx -- 'create --platform linux/amd64 docker.io/mvdan/shfmt@sha256:18eb2bf53e31591b63bfc55cce8ad82ff7fd0ed53f506f71726be4942928b999'
    expect_in_log "${temporary_dir}/${behavior}.log" -Fx -- 'version: 0.11.0'
    expect_in_log "${temporary_dir}/${behavior}.log" -Fx -- 'v3.14.1'
    continue
  fi
  if ((outcome == 0)); then
    echo "FAIL: ${behavior} lint acquisition succeeded." >&2
    exit 1
  fi
  [[ ! -e ${temporary_dir}/bin/shellcheck && ! -e ${temporary_dir}/bin/shfmt ]]
  if bash -euo pipefail "${temporary_dir}/diagnose.bash" >> "${temporary_dir}/${behavior}.log" 2>&1; then
    echo 'FAIL: lint acquisition diagnostic passed instead of preserving failure.' >&2
    exit 1
  fi
  expect_in_log "${temporary_dir}/${behavior}.log" -F -- 'Infrastructure setup:'
  expect_in_log "${temporary_dir}/${behavior}.log" -F -- 'shell lint tool acquisition failed'
  expect_in_log "${temporary_dir}/${behavior}.log" -F -- 'rerun setup before checks'
  case ${behavior} in
    wrong-version)
      expect_in_log "${temporary_dir}/${behavior}.log" -F -- 'ShellCheck did not match pinned version 0.11.0.'
      ;;
    unavailable)
      expect_in_log "${temporary_dir}/${behavior}.log" -F -- 'controlled GitHub release source returned HTTP 504'
      expect_in_log "${temporary_dir}/source-call" -F -- '--connect-timeout 5 --max-time 12 --retry 0'
      [[ -s ${temporary_dir}/fallback-call ]]
      ;;
    shfmt-unavailable)
      expect_in_log "${temporary_dir}/fallback-call" -F -- 'docker.io/mvdan/shfmt@sha256:'
      ;;
    expired)
      [[ ! -e ${temporary_dir}/source-call ]]
      expect_in_log "${temporary_dir}/${behavior}.log" -F -- 'lint tool acquisition deadline expired'
      ;;
    stalled)
      [[ -e ${temporary_dir}/source-call ]]
      node -e "if (Number('${EPOCHREALTIME}')-Number('${started}') > 4) process.exit(1)"
      wait_for 'the stalled lint tool source to stop' 10 \
        "! process_running '$(< "${temporary_dir}/source-pid")'"
      ;;
    *) exit 1 ;;
  esac
done
