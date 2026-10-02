#!/usr/bin/env bash
# Exercise the workflow's maintained lint acquisition block with controlled
# sources. GNU timeout is supplied by the real Linux CI runner, not a fixture.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
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
    selected && running { print substr($0, 11) }
  ' "${workflow}"
}
extract_run 'Install shell lint tools' > "${temporary_dir}/acquire.bash"
extract_run 'Diagnose lint tool acquisition failure' > "${temporary_dir}/diagnose.bash"
[[ -s ${temporary_dir}/acquire.bash && -s ${temporary_dir}/diagnose.bash ]]
mkdir -- "${temporary_dir}/bin"
cat > "${temporary_dir}/bin/curl" << 'CURL'
#!/usr/bin/env bash
printf '%s\n' "$*" > "${SOURCE_CALL}"
case ${SOURCE_BEHAVIOR} in
  unavailable)
    echo 'controlled GitHub release source unavailable' >&2
    exit 7
    ;;
  stalled)
    sleep 4
    touch "${LATE_WRITE}"
    ;;
esac
CURL
chmod +x "${temporary_dir}/bin/curl"
for behavior in unavailable stalled expired; do
  rm -f -- "${temporary_dir}/source-call" "${temporary_dir}/late-write" "${temporary_dir}/tests-started"
  deadline=$(node -e 'console.log(Date.now()+1500)')
  [[ ${behavior} != expired ]] || deadline=1
  started=${EPOCHREALTIME}
  if PATH="${temporary_dir}/bin:${PATH}" SOURCE_BEHAVIOR="${behavior}" \
    SOURCE_CALL="${temporary_dir}/source-call" LATE_WRITE="${temporary_dir}/late-write" \
    OPEN_DOUGH_SETUP_DEADLINE_MS="${deadline}" SHELLCHECK_VERSION=0.11.0 SHFMT_VERSION=3.14.0 \
    bash -euo pipefail "${temporary_dir}/acquire.bash" > "${temporary_dir}/${behavior}.log" 2>&1; then
    touch "${temporary_dir}/tests-started"
    echo "FAIL: ${behavior} lint acquisition succeeded." >&2
    exit 1
  fi
  [[ ! -e ${temporary_dir}/tests-started ]]
  if bash -euo pipefail "${temporary_dir}/diagnose.bash" >> "${temporary_dir}/${behavior}.log" 2>&1; then
    echo 'FAIL: lint acquisition diagnostic passed instead of preserving failure.' >&2
    exit 1
  fi
  expect_in_log "${temporary_dir}/${behavior}.log" -F -- 'Infrastructure setup:'
  expect_in_log "${temporary_dir}/${behavior}.log" -F -- 'GitHub lint tool release acquisition failed'
  expect_in_log "${temporary_dir}/${behavior}.log" -F -- 'rerun setup before checks'
  case ${behavior} in
    unavailable)
      expect_in_log "${temporary_dir}/${behavior}.log" -F -- 'controlled GitHub release source unavailable'
      expect_in_log "${temporary_dir}/source-call" -F -- '--connect-timeout 5 --max-time 20 --retry 0'
      ;;
    expired)
      [[ ! -e ${temporary_dir}/source-call ]]
      expect_in_log "${temporary_dir}/${behavior}.log" -F -- 'lint tool acquisition deadline expired'
      ;;
    stalled)
      [[ -e ${temporary_dir}/source-call ]]
      node -e "if (Number('${EPOCHREALTIME}')-Number('${started}') > 4) process.exit(1)"
      sleep 4.1
      [[ ! -e ${temporary_dir}/late-write ]]
      ;;
    *) exit 1 ;;
  esac
done
