#!/usr/bin/env bash
# Fixture and independently timed CI controller for execution/review native journeys.
# shellcheck disable=SC2034,SC2154,SC2312

ci_completion_wait_for() {
  local description=$1
  local command=$2
  local deadline=$((SECONDS + 120))
  until eval "${command}"; do
    if ((SECONDS >= deadline)); then
      printf 'error: timed out waiting for %s\n' "${description}" >&2
      return 1
    fi
    sleep 0.05
  done
}

ci_completion_stamp() {
  printf '%s %s\n' "$1" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    >> "${ci_completion_control_log}"
}

ci_completion_controller() {
  local scenario=$1
  local review_start="${ci_completion_project}/.planning/review-observation/start"
  local review_complete="${ci_completion_project}/.planning/review-observation/complete"
  # Agents may quote paths or bypass the PATH node shim; accept either log.
  local complete_seen="native_completion_seen '${ci_completion_node_log}' '${CI_COMPLETION_TRANSCRIPT:-/dev/null}' '${ci_completion_mailbox}' '${ci_completion_sha}'"
  case ${scenario} in
    pending | failure)
      ci_completion_wait_for review-start "test -f '${review_start}'" || return
      ci_completion_stamp review-start
      ci_completion_wait_for complete-start "${complete_seen}" || return
      ci_completion_stamp complete-start
      : > "${ci_completion_release}"
      ci_completion_stamp ci-release
      ;;
    ready)
      ci_completion_wait_for review-start "test -f '${review_start}'" || return
      ci_completion_stamp review-start
      : > "${ci_completion_release}"
      ci_completion_stamp ci-release
      ci_completion_wait_for terminal-coverage \
        "grep -Eq '\"state\":\"(success|failure)\"' '${ci_completion_mailbox}/coverage/${ci_completion_sha}.json'" || return
      ci_completion_stamp coverage-terminal
      ci_completion_wait_for review-complete "test -f '${review_complete}'" || return
      ci_completion_stamp review-complete
      ;;
    skip-retro)
      ci_completion_wait_for complete-start "${complete_seen}" || return
      ci_completion_stamp complete-start
      : > "${ci_completion_release}"
      ci_completion_stamp ci-release
      ;;
    *) return 2 ;;
  esac
}

ci_completion_create_fixture() {
  local source_dir=$1
  local host=$2
  local scenario=$3
  local root=$4
  local skill_root real_node real_node_q outcome outcome_json release_json root_json
  ci_completion_project="${root}/project"
  ci_completion_storage="${root}/mailboxes"
  ci_completion_release="${root}/release-ci"
  ci_completion_node_log="${root}/node-calls.log"
  ci_completion_control_log="${root}/control.log"
  mkdir -p "${ci_completion_project}/.planning/quick/001-finished" \
    "${ci_completion_project}/.planning/seeds" \
    "${ci_completion_project}/tests" "${root}/bin"
  : > "${ci_completion_node_log}"
  : > "${ci_completion_control_log}"

  git -C "${ci_completion_project}" init -q -b main
  git -C "${ci_completion_project}" config user.name 'CI Completion Fixture'
  git -C "${ci_completion_project}" config user.email fixture@example.invalid
  printf 'base\n' > "${ci_completion_project}/product.txt"
  git -C "${ci_completion_project}" add product.txt
  git -C "${ci_completion_project}" commit -q -m base
  printf 'base\ndelivered behavior\n' > "${ci_completion_project}/product.txt"
  printf '%s\n' \
    '# Completed execution source' '' \
    'Goal: retain the delivered behavior in product.txt.' \
    > "${ci_completion_project}/.planning/seeds/SEED-001.md"
  printf '%s\n' \
    '# Delivered execution' '' \
    'Status: executing; every planned slice is delivered.' '' \
    'Source: ../../seeds/SEED-001.md' '' \
    '## Slice 1' '' \
    'Status: done' '' \
    'Proof: product.txt contains the delivered behavior.' \
    > "${ci_completion_project}/.planning/quick/001-finished/PLAN.md"
  # shellcheck disable=SC2016 # Backticks are literal fixture guidance.
  printf '%s\n' \
    '# Fixture project guidance' '' \
    'For an enabled execution retrospective, run `bash tests/review-boundary.sh` once as the project focused review check. It observes the delivered product behavior and must not mutate it. Do not run this check when retrospective is explicitly skipped.' \
    > "${ci_completion_project}/AGENTS.md"
  # shellcheck disable=SC2016 # Shell expressions are literal fixture source.
  printf '%s\n' \
    '#!/usr/bin/env bash' \
    'set -euo pipefail' \
    'root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)' \
    'mkdir -p "${root}/.planning/review-observation"' \
    ': > "${root}/.planning/review-observation/start"' \
    'sleep 2' \
    'grep -Fq "delivered behavior" "${root}/product.txt"' \
    ': > "${root}/.planning/review-observation/complete"' \
    > "${ci_completion_project}/tests/review-boundary.sh"
  chmod +x "${ci_completion_project}/tests/review-boundary.sh"
  printf '%s\n' \
    '{"skipProcessRetrospective":true,"ciAdapter":["node",".planning/ci-adapter.mjs"]}' \
    > "${ci_completion_project}/.planning/open-dough.json"
  outcome=success
  [[ ${scenario} == failure ]] && outcome=failure
  release_json=$(jq -Rn --arg value "${ci_completion_release}" '$value')
  root_json=$(jq -Rn --arg value "${root}" '$value')
  outcome_json=$(jq -Rn --arg value "${outcome}" '$value')
  printf '%s\n' \
    "import { existsSync, watch } from 'node:fs';" \
    "let input = ''; for await (const chunk of process.stdin) input += chunk;" \
    'const request = JSON.parse(input);' \
    "if (request.operation === 'discover') {" \
    "  if (!existsSync(${release_json})) await new Promise(resolve => {" \
    "    const watcher = watch(${root_json}, () => { if (existsSync(${release_json})) { watcher.close(); resolve(); } });" \
    "    if (existsSync(${release_json})) { watcher.close(); resolve(); }" \
    '  });' \
    "  process.stdout.write(JSON.stringify({attempts:[{runId:'native-run',attemptId:'1',sha:process.env.CI_COMPLETION_SHA,outcome:${outcome_json},url:'https://ci.invalid/native'}]}));" \
    '} else {' \
    "  process.stdout.write(JSON.stringify({excerpt:'controlled native CI failure; repair authority is not supplied'}));" \
    '}' \
    > "${ci_completion_project}/.planning/ci-adapter.mjs"
  git -C "${ci_completion_project}" add .
  git -C "${ci_completion_project}" commit -q -m 'deliver completed execution fixture'
  ci_completion_sha=$(git -C "${ci_completion_project}" rev-parse HEAD)

  bash "${source_dir}/install.sh" --target "${ci_completion_project}" \
    --source "${source_dir}" --platform "${host}" > /dev/null
  skill_root="${ci_completion_project}/.agents/skills/dough-execute-plan"
  [[ ${host} == claude ]] \
    && skill_root="${ci_completion_project}/.claude/skills/dough-execute-plan"
  ci_completion_launcher="${skill_root}/scripts/ci-mailbox.mjs"

  real_node=$(command -v node)
  printf -v real_node_q '%q' "${real_node}"
  # shellcheck disable=SC2016 # Shell expressions are literal wrapper source.
  printf '%s\n' \
    '#!/usr/bin/env bash' \
    'printf "%s\\n" "$*" >> "${CI_COMPLETION_NODE_LOG}"' \
    'if [[ " $* " == *" complete-revision "* ]]; then sleep 1; fi' \
    "exec ${real_node_q} \"\$@\"" \
    > "${root}/bin/node"
  chmod +x "${root}/bin/node"
  ci_completion_old_path=${PATH}
  export PATH="${root}/bin:${PATH}"
  export CI_COMPLETION_NODE_LOG="${ci_completion_node_log}"
  export CI_COMPLETION_SHA="${ci_completion_sha}"
  export DOUGH_CI_MAILBOX_ROOT="${ci_completion_storage}"
  local receipt
  receipt=$(cd "${ci_completion_project}" \
    && node "${ci_completion_launcher}" start --execution owner/project exec/story 600000)
  ci_completion_mailbox=$(jq -r '.directory' <<< "${receipt#CI_OBSERVER }")
  (cd "${ci_completion_project}" \
    && node "${ci_completion_launcher}" register-push \
      "${ci_completion_mailbox}" "${ci_completion_sha}") > /dev/null
  printf '%s\n' \
    "Execution mode: Story Branch Mode" \
    "Published target: owner/project exec/story" \
    "Accepted revision: ${ci_completion_sha}" \
    "Observer mailbox: ${ci_completion_mailbox}" \
    'Applicable CI: pending' \
    > "${ci_completion_project}/.planning/execution-state.txt"
}

ci_completion_prompt_for() {
  local scenario=$1
  printf '%s' "Use \$dough-execute-plan from this project's installed Open Dough guidance to finish the already-delivered planned execution in .planning/quick/001-finished/PLAN.md. Treat .planning/execution-state.txt as the retained execution state. Do not implement new product behavior or invoke story wrap-up."
  if [[ ${scenario} == skip-retro ]]; then
    printf '%s' ' Explicitly skip the automatic retrospective for this execution.'
  elif [[ ${scenario} == failure ]]; then
    printf '%s' ' No authority is supplied to repair an external CI failure; preserve and report any unresolved failure truthfully.'
  fi
  printf '\n'
}
