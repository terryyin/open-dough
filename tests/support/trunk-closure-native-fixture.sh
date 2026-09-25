#!/usr/bin/env bash
# Disposable Trunk Mode closure fixture with an independently released CI run.
# The observer is real; the fixture never writes coverage or terminal evidence.
# shellcheck disable=SC2034,SC2154,SC2312

trunk_closure_git() {
  local cwd=$1
  shift
  git -C "${cwd}" -c user.name='Trunk Closure Fixture' \
    -c user.email='trunk-closure@example.invalid' "$@"
}

trunk_closure_write_gh() {
  local destination=$1
  # shellcheck disable=SC2016 # Variables belong to the generated shim.
  printf '%s\n' \
    '#!/usr/bin/env bash' \
    'set -euo pipefail' \
    'printf "%s\n" "$*" >> "${TRUNK_CLOSURE_GH_LOG}"' \
    'if [[ " $* " == *" run list "* ]]; then' \
    '  if [[ ${TRUNK_CLOSURE_SCENARIO} == source && -f ${TRUNK_CLOSURE_RELEASE} ]]; then' \
    '    printf "%s\n" "${TRUNK_CLOSURE_CANDIDATE_SHA}" >> "${TRUNK_CLOSURE_GH_LOG}"' \
    '    jq -n --arg base "${TRUNK_CLOSURE_BASE_SHA}" --arg candidate "${TRUNK_CLOSURE_CANDIDATE_SHA}" '\''[{databaseId:1,attempt:1,headSha:$base,headBranch:"main",workflowName:"CI",event:"push",status:"completed",conclusion:"success",url:"https://ci.invalid/base",createdAt:"2026-09-22T00:00:00Z"},{databaseId:2,attempt:1,headSha:$candidate,headBranch:"main",workflowName:"CI",event:"push",status:"completed",conclusion:"success",url:"https://ci.invalid/candidate",createdAt:"2026-09-22T00:01:00Z"}]'\''' \
    '  else' \
    '    jq -n --arg base "${TRUNK_CLOSURE_BASE_SHA}" '\''[{databaseId:1,attempt:1,headSha:$base,headBranch:"main",workflowName:"CI",event:"push",status:"completed",conclusion:"success",url:"https://ci.invalid/base",createdAt:"2026-09-22T00:00:00Z"}]'\''' \
    '  fi' \
    'else' \
    '  jq -n '\''{attempt:1,status:"completed",conclusion:"success",url:"https://ci.invalid/run"}'\''' \
    'fi' > "${destination}"
  chmod +x "${destination}"
}

trunk_closure_write_node() {
  local destination=$1
  local real_node=$2
  local real_node_q
  printf -v real_node_q '%q' "${real_node}"
  # shellcheck disable=SC2016 # Variables belong to the generated shim.
  printf '%s\n' \
    '#!/usr/bin/env bash' \
    'set -euo pipefail' \
    'printf "%s\n" "$*" >> "${TRUNK_CLOSURE_NODE_LOG}"' \
    'if [[ " $* " == *" register-push "* ]]; then' \
    "  ${real_node_q} \"\$@\"" \
    '  status=$?' \
    '  [[ ${status} -eq 0 ]] && : > "${TRUNK_CLOSURE_REGISTERED}"' \
    '  exit "${status}"' \
    'fi' \
    "exec ${real_node_q} \"\$@\"" > "${destination}"
  chmod +x "${destination}"
}

trunk_closure_create_fixture() {
  local source_dir=$1
  local host=$2
  local scenario=$3
  local root=$4
  local skill_root receipt real_node
  trunk_closure_origin="${root}/remote.git"
  trunk_closure_integration="${root}/integration"
  trunk_closure_workspace="${root}/owned"
  trunk_closure_storage="${root}/mailboxes"
  trunk_closure_release="${root}/release-ci"
  trunk_closure_registered="${root}/registered"
  trunk_closure_node_log="${root}/node-calls.log"
  trunk_closure_gh_log="${root}/gh-calls.log"
  trunk_closure_control_log="${root}/control.log"
  trunk_closure_cleanup_marker="${root}/cleanup"
  mkdir -p "${root}/bin"
  : > "${trunk_closure_node_log}"
  : > "${trunk_closure_gh_log}"
  : > "${trunk_closure_control_log}"

  git init --bare -q -b main "${trunk_closure_origin}"
  git init -q -b main "${trunk_closure_integration}"
  trunk_closure_git "${trunk_closure_integration}" remote add origin \
    "${trunk_closure_origin}"
  mkdir -p "${trunk_closure_integration}/.github/workflows" \
    "${trunk_closure_integration}/tests"
  printf 'base\n' > "${trunk_closure_integration}/product.txt"
  printf '%s\n' \
    'name: CI' \
    'on:' \
    '  push:' \
    '    paths-ignore:' \
    "      - '.planning/**'" \
    'jobs:' \
    '  check:' \
    '    runs-on: ubuntu-latest' \
    '    steps:' \
    '      - run: true' \
    > "${trunk_closure_integration}/.github/workflows/ci.yml"
  # shellcheck disable=SC2016 # Variables belong to the fixture script.
  printf '%s\n' \
    '# Fixture project guidance' '' \
    'For this native fixture, non-destructive local resource cleanup is `bash tests/closure-cleanup.sh`. It validates that cleanup is safe and leaves an observable marker.' \
    > "${trunk_closure_integration}/AGENTS.md"
  # shellcheck disable=SC2016 # Variables belong to the fixture script.
  printf '%s\n' \
    '#!/usr/bin/env bash' \
    'set -euo pipefail' \
    'status=$(jq -r .status "${TRUNK_CLOSURE_MAILBOX}/result.json")' \
    '[[ ${status} == stopped || ${status} == finished ]]' \
    'printf "cleanup\n" >> "${TRUNK_CLOSURE_CONTROL_LOG}"' \
    ': > "${TRUNK_CLOSURE_CLEANUP_MARKER}"' \
    > "${trunk_closure_integration}/tests/closure-cleanup.sh"
  chmod +x "${trunk_closure_integration}/tests/closure-cleanup.sh"
  trunk_closure_git "${trunk_closure_integration}" add .
  trunk_closure_git "${trunk_closure_integration}" commit -q -m base
  trunk_closure_git "${trunk_closure_integration}" push -q origin main
  trunk_closure_base_sha=$(git -C "${trunk_closure_integration}" rev-parse HEAD)

  git clone -q "${trunk_closure_origin}" "${trunk_closure_workspace}"
  trunk_closure_git "${trunk_closure_workspace}" checkout -q -b exec/trunk
  mkdir -p "${trunk_closure_workspace}/.planning"
  if [[ ${scenario} == source ]]; then
    printf 'base\nfinal source closure\n' > "${trunk_closure_workspace}/product.txt"
  else
    printf 'final ignored-only closure\n' \
      > "${trunk_closure_workspace}/.planning/final-closure.md"
  fi
  trunk_closure_git "${trunk_closure_workspace}" add .
  trunk_closure_git "${trunk_closure_workspace}" commit -q -m 'final closure'
  trunk_closure_candidate_sha=$(git -C "${trunk_closure_workspace}" rev-parse HEAD)
  printf 'base\nhuman pending\n' > "${trunk_closure_integration}/product.txt"

  bash "${source_dir}/install.sh" --target "${trunk_closure_workspace}" \
    --source "${source_dir}" --platform "${host}" > /dev/null
  skill_root="${trunk_closure_workspace}/.agents/skills/dough-execute-plan"
  [[ ${host} == claude ]] \
    && skill_root="${trunk_closure_workspace}/.claude/skills/dough-execute-plan"
  trunk_closure_launcher="${skill_root}/scripts/ci-mailbox.mjs"

  real_node=$(command -v node)
  trunk_closure_write_node "${root}/bin/node" "${real_node}"
  trunk_closure_write_gh "${root}/bin/gh"
  trunk_closure_old_path=${PATH}
  export PATH="${root}/bin:${PATH}"
  export DOUGH_CI_MAILBOX_ROOT="${trunk_closure_storage}"
  export TRUNK_CLOSURE_BASE_SHA="${trunk_closure_base_sha}"
  export TRUNK_CLOSURE_CANDIDATE_SHA="${trunk_closure_candidate_sha}"
  export TRUNK_CLOSURE_SCENARIO="${scenario}"
  export TRUNK_CLOSURE_RELEASE="${trunk_closure_release}"
  export TRUNK_CLOSURE_REGISTERED="${trunk_closure_registered}"
  export TRUNK_CLOSURE_NODE_LOG="${trunk_closure_node_log}"
  export TRUNK_CLOSURE_GH_LOG="${trunk_closure_gh_log}"
  export TRUNK_CLOSURE_CONTROL_LOG="${trunk_closure_control_log}"
  export TRUNK_CLOSURE_CLEANUP_MARKER="${trunk_closure_cleanup_marker}"
  receipt=$(cd "${trunk_closure_workspace}" \
    && node "${trunk_closure_launcher}" start --execution owner/project main 600000)
  trunk_closure_mailbox=$(jq -r '.directory' <<< "${receipt#CI_OBSERVER }")
  export TRUNK_CLOSURE_MAILBOX="${trunk_closure_mailbox}"
  printf '%s\n' \
    'Execution mode: Trunk Mode' \
    'Authorized target: owner/project main' \
    "Final closure candidate: ${trunk_closure_candidate_sha}" \
    "Observer mailbox: ${trunk_closure_mailbox}" \
    "Observer launcher: ${trunk_closure_launcher}" \
    "Default checkout: ${trunk_closure_integration}" \
    'Applicable CI: pending' \
    > "${trunk_closure_workspace}/.planning/execution-state.txt"
}

trunk_closure_cleanup_fixture() {
  export PATH=${trunk_closure_old_path}
  unset DOUGH_CI_MAILBOX_ROOT TRUNK_CLOSURE_BASE_SHA
  unset TRUNK_CLOSURE_CANDIDATE_SHA TRUNK_CLOSURE_SCENARIO
  unset TRUNK_CLOSURE_RELEASE TRUNK_CLOSURE_REGISTERED
  unset TRUNK_CLOSURE_NODE_LOG TRUNK_CLOSURE_GH_LOG
  unset TRUNK_CLOSURE_CONTROL_LOG TRUNK_CLOSURE_CLEANUP_MARKER
  unset TRUNK_CLOSURE_MAILBOX
}
