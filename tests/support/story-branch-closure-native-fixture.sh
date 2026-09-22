#!/usr/bin/env bash
# Story Branch closure fixture with separate real observers and controlled CI.
# The fixture prepares targets and CI responses; the agent owns target transfer,
# integration, waiting, shutdown, and cleanup ordering.
# shellcheck disable=SC2034,SC2154,SC2312

story_closure_git() {
  local cwd=$1
  shift
  git -C "${cwd}" -c user.name='Story Closure Fixture' \
    -c user.email='story-closure@example.invalid' "$@"
}

story_closure_write_node() {
  local destination=$1 real_node=$2 real_node_q
  printf -v real_node_q '%q' "${real_node}"
  # shellcheck disable=SC2016
  printf '%s\n' \
    '#!/usr/bin/env bash' \
    'set -euo pipefail' \
    'printf "%s\n" "$*" >> "${STORY_CLOSURE_NODE_LOG}"' \
    "exec ${real_node_q} \"\$@\"" > "${destination}"
  chmod +x "${destination}"
}

story_closure_write_gh() {
  local destination=$1
  # shellcheck disable=SC2016
  printf '%s\n' \
    '#!/usr/bin/env bash' \
    'set -euo pipefail' \
    'printf "%s\n" "$*" >> "${STORY_CLOSURE_GH_LOG}"' \
    'if [[ " $* " != *" run list "* ]]; then' \
    '  jq -n '\''{attempt:1,status:"completed",conclusion:"success",url:"https://ci.invalid/run"}'\''' \
    'elif [[ " $* " == *" --branch exec/story "* ]]; then' \
    '  jq -n --arg sha "${STORY_CLOSURE_BRANCH_SHA}" '\''[{databaseId:11,attempt:1,headSha:$sha,headBranch:"exec/story",workflowName:"CI",event:"push",status:"completed",conclusion:"success",url:"https://ci.invalid/branch",createdAt:"2026-09-22T00:01:00Z"}]'\''' \
    'elif [[ -f ${STORY_CLOSURE_RELEASE} && -s ${STORY_CLOSURE_INTEGRATED_SHA_FILE} ]]; then' \
    '  candidate=$(cat "${STORY_CLOSURE_INTEGRATED_SHA_FILE}")' \
    '  jq -n --arg base "${STORY_CLOSURE_TRUNK_SHA}" --arg candidate "${candidate}" '\''[{databaseId:21,attempt:1,headSha:$base,headBranch:"main",workflowName:"CI",event:"push",status:"completed",conclusion:"success",url:"https://ci.invalid/trunk-base",createdAt:"2026-09-22T00:02:00Z"},{databaseId:22,attempt:1,headSha:$candidate,headBranch:"main",workflowName:"CI",event:"push",status:"completed",conclusion:"success",url:"https://ci.invalid/integrated",createdAt:"2026-09-22T00:03:00Z"}]'\''' \
    'else' \
    '  jq -n --arg base "${STORY_CLOSURE_TRUNK_SHA}" '\''[{databaseId:21,attempt:1,headSha:$base,headBranch:"main",workflowName:"CI",event:"push",status:"completed",conclusion:"success",url:"https://ci.invalid/trunk-base",createdAt:"2026-09-22T00:02:00Z"}]'\''' \
    'fi' > "${destination}"
  chmod +x "${destination}"
}

story_closure_wait_for() {
  local description=$1 command=$2 deadline=$((SECONDS + 420))
  until eval "${command}"; do
    if ((SECONDS >= deadline)); then
      printf 'error: timed out waiting for %s\n' "${description}" >&2
      return 1
    fi
    sleep 0.05
  done
}

story_closure_create_fixture() {
  local source_dir=$1 host=$2 root=$3 skill_root receipt real_node
  story_closure_origin="${root}/remote.git"
  story_closure_integration="${root}/integration"
  story_closure_workspace="${root}/owned"
  story_closure_storage="${root}/mailboxes"
  story_closure_release="${root}/release-trunk-ci"
  story_closure_integrated_sha_file="${root}/integrated-sha"
  story_closure_node_log="${root}/node-calls.log"
  story_closure_gh_log="${root}/gh-calls.log"
  story_closure_control_log="${root}/control.log"
  story_closure_cleanup_marker="${root}/cleanup"
  mkdir -p "${root}/bin"
  : > "${story_closure_node_log}"
  : > "${story_closure_gh_log}"
  : > "${story_closure_control_log}"

  git init --bare -q -b main "${story_closure_origin}"
  git init -q -b main "${story_closure_integration}"
  story_closure_git "${story_closure_integration}" remote add origin \
    "${story_closure_origin}"
  mkdir -p "${story_closure_integration}/.github/workflows" \
    "${story_closure_integration}/tests"
  printf 'base source\n' > "${story_closure_integration}/product.txt"
  printf '%s\n' '.agents/' '.claude/' '.codex/' \
    '.planning/execution-state.txt' > "${story_closure_integration}/.gitignore"
  printf '%s\n' 'name: CI' 'on: [push]' 'jobs:' '  check:' \
    '    runs-on: ubuntu-latest' '    steps:' '      - run: true' \
    > "${story_closure_integration}/.github/workflows/ci.yml"
  # shellcheck disable=SC2016 # Backticks are literal fixture guidance.
  printf '%s\n' \
    '# Fixture project guidance' '' \
    'The accepted product state keeps `trunk source` followed by `story source` in `product.txt`.' \
    'For this fixture, resource cleanup is `bash tests/closure-cleanup.sh`; run it only after both exact observers have stopped.' \
    > "${story_closure_integration}/AGENTS.md"
  # shellcheck disable=SC2016
  printf '%s\n' '#!/usr/bin/env bash' 'set -euo pipefail' \
    '[[ $(jq -r .status "${STORY_CLOSURE_BRANCH_MAILBOX}/result.json") =~ ^(stopped|finished)$ ]]' \
    'trunk=' \
    'for request in "${DOUGH_CI_MAILBOX_ROOT}"/*/request.json; do' \
    '  [[ -f ${request} ]] || continue' \
    '  [[ $(jq -r '\''.probe // false'\'' "${request}") == false ]] || continue' \
    '  [[ $(jq -r '\''.branch // ""'\'' "${request}") == main ]] || continue' \
    '  [[ -z ${trunk} ]] || exit 1' \
    '  trunk=${request%/request.json}' \
    'done' \
    '[[ -n ${trunk} ]]' \
    '[[ $(jq -r .status "${trunk}/result.json") =~ ^(stopped|finished)$ ]]' \
    'candidate=$(cat "${STORY_CLOSURE_INTEGRATED_SHA_FILE}")' \
    '[[ $(jq -r .state "${trunk}/coverage/${candidate}.json") == success ]]' \
    'git push -q origin --delete exec/story' \
    'printf "cleanup\n" >> "${STORY_CLOSURE_CONTROL_LOG}"' \
    ': > "${STORY_CLOSURE_CLEANUP_MARKER}"' \
    > "${story_closure_integration}/tests/closure-cleanup.sh"
  chmod +x "${story_closure_integration}/tests/closure-cleanup.sh"
  story_closure_git "${story_closure_integration}" add .
  story_closure_git "${story_closure_integration}" commit -q -m base
  story_closure_git "${story_closure_integration}" push -q origin main
  story_closure_base_sha=$(git -C "${story_closure_integration}" rev-parse HEAD)

  git clone -q "${story_closure_origin}" "${story_closure_workspace}"
  story_closure_git "${story_closure_workspace}" checkout -q -b exec/story
  printf 'story source\n' > "${story_closure_workspace}/product.txt"
  story_closure_git "${story_closure_workspace}" add product.txt
  story_closure_git "${story_closure_workspace}" commit -q -m 'final story closure'
  story_closure_branch_sha=$(git -C "${story_closure_workspace}" rev-parse HEAD)
  story_closure_git "${story_closure_workspace}" push -q origin exec/story

  printf 'trunk source\n' > "${story_closure_integration}/product.txt"
  story_closure_git "${story_closure_integration}" add product.txt
  story_closure_git "${story_closure_integration}" commit -q -m 'concurrent trunk source'
  story_closure_git "${story_closure_integration}" push -q origin main
  story_closure_trunk_sha=$(git -C "${story_closure_integration}" rev-parse HEAD)
  printf 'human pending\n' > "${story_closure_integration}/human.txt"
  story_closure_human_before=$(git -C "${story_closure_integration}" status --porcelain)

  bash "${source_dir}/install.sh" --target "${story_closure_workspace}" \
    --source "${source_dir}" --platform "${host}" > /dev/null
  skill_root="${story_closure_workspace}/.agents/skills/dough-execute-plan"
  [[ ${host} == claude ]] \
    && skill_root="${story_closure_workspace}/.claude/skills/dough-execute-plan"
  story_closure_launcher="${skill_root}/scripts/ci-mailbox.mjs"

  real_node=$(command -v node)
  story_closure_write_node "${root}/bin/node" "${real_node}"
  story_closure_write_gh "${root}/bin/gh"
  story_closure_old_path=${PATH}
  export PATH="${root}/bin:${PATH}"
  export DOUGH_CI_MAILBOX_ROOT="${story_closure_storage}"
  export STORY_CLOSURE_BRANCH_SHA="${story_closure_branch_sha}"
  export STORY_CLOSURE_TRUNK_SHA="${story_closure_trunk_sha}"
  export STORY_CLOSURE_RELEASE="${story_closure_release}"
  export STORY_CLOSURE_INTEGRATED_SHA_FILE="${story_closure_integrated_sha_file}"
  export STORY_CLOSURE_NODE_LOG="${story_closure_node_log}"
  export STORY_CLOSURE_GH_LOG="${story_closure_gh_log}"
  export STORY_CLOSURE_CONTROL_LOG="${story_closure_control_log}"
  export STORY_CLOSURE_CLEANUP_MARKER="${story_closure_cleanup_marker}"
  receipt=$(cd "${story_closure_workspace}" \
    && node "${story_closure_launcher}" start --execution owner/project exec/story 600000)
  story_closure_branch_mailbox=$(jq -r '.directory' <<< "${receipt#CI_OBSERVER }")
  export STORY_CLOSURE_BRANCH_MAILBOX="${story_closure_branch_mailbox}"
  (cd "${story_closure_workspace}" && node "${story_closure_launcher}" \
    register-push "${story_closure_branch_mailbox}" "${story_closure_branch_sha}") \
    > /dev/null
  story_closure_wait_for branch-coverage \
    "grep -q '\"state\":\"success\"' '${story_closure_branch_mailbox}/coverage/${story_closure_branch_sha}.json'"

  mkdir -p "${story_closure_workspace}/.planning"
  printf '%s\n' 'Execution mode: Story Branch Mode' \
    'Authorized integration target: owner/project main' \
    'Execution target: owner/project exec/story' \
    "Saved published final-closure tip: ${story_closure_branch_sha}" \
    "Execution observer mailbox: ${story_closure_branch_mailbox}" \
    "Observer launcher: ${story_closure_launcher}" \
    "Integration checkout: ${story_closure_integration}" \
    'Execution-branch CI: success; trunk integration not yet observed' \
    > "${story_closure_workspace}/.planning/execution-state.txt"
}

story_closure_cleanup_fixture() {
  export PATH=${story_closure_old_path}
  unset DOUGH_CI_MAILBOX_ROOT STORY_CLOSURE_BRANCH_SHA STORY_CLOSURE_TRUNK_SHA
  unset STORY_CLOSURE_RELEASE STORY_CLOSURE_INTEGRATED_SHA_FILE
  unset STORY_CLOSURE_NODE_LOG STORY_CLOSURE_GH_LOG STORY_CLOSURE_CONTROL_LOG
  unset STORY_CLOSURE_CLEANUP_MARKER STORY_CLOSURE_BRANCH_MAILBOX
}
