#!/usr/bin/env bash
# Shared project fixture, supplier publication and observations for blocked and
# unblocked execution cases. Their case files own scheduling and assessment.
# shellcheck disable=SC2034,SC2312 # Case globals are read by the runner and assessors.
supplier_case_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../native-comparison/paused-supplier" && pwd)
case_consumer_branch=codex/close-landed-ci-repeat-check-gaps
case_supplier_branch=codex/answer-fake-gh-reads-in-process
case_story=SEED-324#close-landed-ci-repeat-check-gaps
case_plan=.planning/slice-plans/607-close-landed-ci-repeat-check-gaps/PLAN.md
case_seed=.planning/seeds/SEED-324-landed-ci-repeat-checks.md
case_partial_files='tests/support/repeat-fixture.mjs tests/repeat-receipt-stage.test.mjs tests/repeat-request-stage.test.mjs'

# Git with a fixed identity and clock, so equal content gives equal commits.
case_git() {
  local cwd=$1
  shift
  GIT_AUTHOR_DATE='2026-11-13T16:00:00Z' GIT_COMMITTER_DATE='2026-11-13T16:00:00Z' \
    git -C "${cwd}" -c user.name='Case Fixture' \
    -c user.email='case-fixture@example.invalid' -c commit.gpgsign=false \
    -c init.defaultBranch=main "$@"
}

case_overlay() {
  cp -R -- "${supplier_case_dir}/$1/." "$2/"
}

case_commit() {
  local cwd=$1 message=$2
  case_git "${cwd}" add -A
  case_git "${cwd}" commit -q -m "${message}"
}

# Builds ROOT/remote.git and the consumer checkout ROOT/workspace from the
# case's overlays, then installs the Open Dough payload in PAYLOAD_DIR for
# HOST.
# Leaves the supplier and consumer basis in case_basis_*, and every basis
# identity in case_project_basis for the runner's record.
supplier_case_materialize() {
  local root=$1 payload=$2 host=$3
  local remote="${root}/remote.git" workspace="${root}/workspace"
  case_git "${root}" init -q --bare remote.git
  case_git "${root}" init -q workspace
  case_overlay basis "${workspace}"
  printf 'node_modules/\n.planning/execution-state.txt\n' > "${workspace}/.gitignore"
  case_commit "${workspace}" 'Prepare SEED-324 and SEED-332'
  case_git "${workspace}" remote add origin "${remote}"
  case_git "${workspace}" push -q origin main
  case_git "${workspace}" checkout -q -b "${case_supplier_branch}"
  case_overlay supplier "${workspace}"
  case_commit "${workspace}" 'Answer fake GitHub reads in process (diagnostic pass)'
  case_git "${workspace}" push -q origin "${case_supplier_branch}"
  case_git "${workspace}" checkout -q -b "${case_consumer_branch}" main
  case_overlay delivered "${workspace}"
  case_commit "${workspace}" 'Deliver slices 1 and 2 of plan 607'
  case_git "${workspace}" push -q -u origin "${case_consumer_branch}"
  case_git "${workspace}" branch -q -D "${case_supplier_branch}"
  case_overlay partial "${workspace}"
  case_remote_main=$(git -C "${remote}" rev-parse main)
  case_basis_supplier=$(git -C "${remote}" rev-parse "${case_supplier_branch}")
  case_basis_consumer=$(git -C "${remote}" rev-parse "${case_consumer_branch}")
  supplier_case_record_basis "${root}"
  supplier_case_execution_state "${workspace}" paused
  delivery_evidence_install_payload "${payload}" "${workspace}" "${host}"
}

# Recompute the remote/project basis after the selected initial schedule.
supplier_case_record_basis() {
  local root=$1 workspace="$1/workspace" partial
  case_remote_main=$(git -C "${root}/remote.git" rev-parse main)
  partial=$(cd -- "${workspace}" && read -ra files <<< "${case_partial_files}" \
    && cat -- "${files[@]}" tests/repeat-checks.test.mjs | git hash-object --stdin)
  case_project_basis="main=${case_remote_main} supplier=${case_basis_supplier} consumer=${case_basis_consumer} partial=${partial}"
}

# Describe the actual supplier state without supplying the consumer's decision.
supplier_case_execution_state() {
  local workspace=$1 state=$2 supplier
  supplier="Supplier: SEED-332#answer-fake-gh-reads-in-process, Taken by philip-chan on origin ${case_supplier_branch}; its execution evidence is .planning/slice-plans/610-answer-fake-gh-reads-in-process/evidence.md on that branch."
  if [[ ${state} == completed ]]; then
    supplier='Supplier: SEED-332#answer-fake-gh-reads-in-process completed on origin/main; its completion evidence is .planning/slice-plans/610-answer-fake-gh-reads-in-process/evidence.md there.'
  fi
  printf '%s\n' 'Execution mode: Story Branch Mode' \
    "Selected work: ${case_story}, Taken on trunk by darren-chan" \
    "Active plan: ${case_plan}" 'Authorized remote: origin' 'Trunk: main' \
    "Execution branch: ${case_consumer_branch}, published to origin" \
    "Execution checkout: ${workspace}, owned by this execution" \
    "Delivered slices: 1 and 2, published to origin ${case_consumer_branch} at ${case_basis_consumer}" \
    'Current slice: 3; partial implementation is uncommitted in this checkout: tests/support/repeat-fixture.mjs, tests/repeat-receipt-stage.test.mjs, tests/repeat-request-stage.test.mjs and the shortened tests/repeat-checks.test.mjs. The stage files read runs through the supplier'"'"'s in-process reader, which this checkout does not have yet.' \
    "${supplier}" > "${workspace}/.planning/execution-state.txt"
}

# Changes the supplier's state on ROOT's remote for EVENT, through a scratch
# clone under SCRATCH: unchanged changes nothing; nonqualifying publishes the
# supplier's diagnostic-pass reader to main with stability still unobserved;
# qualifying publishes its stability fix, evidence and completion record.
case_apply_event() {
  local root=$1 event=$2 scratch=$3 clone
  [[ ${event} != unchanged ]] || return 0
  clone=$(mktemp -d "${scratch}/event.XXXXXX")
  case_git "${clone}" clone -q "${root}/remote.git" supplier
  clone="${clone}/supplier"
  case ${event} in
    nonqualifying)
      case_git "${clone}" merge -q --no-ff --no-edit \
        "origin/${case_supplier_branch}" -m 'Publish the opt-in in-process fake GitHub reader early'
      case_overlay published "${clone}"
      case_commit "${clone}" 'Record SEED-332 early publication; stability unobserved'
      ;;
    qualifying)
      case_overlay completed "${clone}"
      case_git "${clone}" rm -q .planning/agents/philip-chan.json
      case_commit "${clone}" 'Complete SEED-332 with its stability evidence'
      ;;
    *) return 2 ;;
  esac
  case_git "${clone}" push -q origin main
  case_remote_main=$(git -C "${root}/remote.git" rev-parse main)
  rm -rf -- "$(dirname -- "${clone}")"
}

# The supplier reader in the checkout: absent, one of the supplier's own
# versions (diagnostic or completed), or own (written by the consumer).
case_supplier_reader() {
  local file="$1/src/fake-gh.mjs" blob
  if ! grep -q createFakeGhReader "${file}" 2> /dev/null; then
    echo absent
    return
  fi
  blob=$(git hash-object "${file}")
  if [[ ${blob} == "$(git hash-object "${supplier_case_dir}/supplier/src/fake-gh.mjs")" ]]; then
    echo diagnostic
  elif [[ ${blob} == "$(git hash-object "${supplier_case_dir}/completed/src/fake-gh.mjs")" ]]; then
    echo completed
  else
    echo own
  fi
}

case_dependency_state() {
  node -e '
    const text = require("node:fs").readFileSync(process.argv[1], "utf8");
    const block = text.split("```json dough-story-dependencies\n")[1];
    const state = block && JSON.parse(block.split("\n")[0]).dependencies?.[0]?.state;
    console.log(state ?? "missing");
  ' "$1/${case_seed}" 2> /dev/null || echo missing
}

# Runs the project's proof on a copy of the checkout's product files.
case_independent_proof() {
  local workspace=$1 copy status=0 proof="$2/case-evidence/proof-${3:-latest}"
  copy=$(mktemp -d "$2/proof.XXXXXX")
  mkdir -p -- "$2/case-evidence"
  cp -R -- "${workspace}/src" "${workspace}/tests" "${workspace}/package.json" "${copy}/"
  (cd -- "${copy}" && node --test --test-reporter=tap tests/*.test.mjs > "${proof}.log" 2>&1) || status=$?
  printf '%s\n' "${status}" > "${proof}.exit"
  if [[ ${status} -eq 0 ]]; then echo passed; else echo failed; fi
  rm -rf -- "${copy}"
}

# The coordinator's proof in STREAM, else its exact owned workers' proof in
# this root turn/workspace: passed, failed, unknown or none. Quoting a proof
# command in another command's output establishes no execution.
case_agent_proof() {
  local stream=$1 workspace=${2-} thread=${3-} sessions=${4-} proof
  proof=$(NATIVE_NODE_CALL_LOG=/dev/null node "${supplier_case_dir}/owned-proof.mjs" --coordinator "${stream}")
  if [[ ${proof} == none && -n ${sessions} ]]; then
    node "${supplier_case_dir}/owned-proof.mjs" "${thread}" "${workspace}" "${sessions}"
  else
    printf '%s\n' "${proof}"
  fi
}

# How many times the checkout has integrated a supplier reader and filed the
# verdict stage since the starting basis: first-parent commits that change
# src/fake-gh.mjs or add tests/repeat-verdict-stage.test.mjs, each plus one
# when the worktree holds such a change uncommitted. Prints "INTEGRATIONS
# FILINGS".
case_continuations() {
  local workspace=$1 integrations filings
  local verdict=tests/repeat-verdict-stage.test.mjs
  integrations=$(git -C "${workspace}" rev-list --first-parent --count \
    "${case_basis_consumer}..HEAD" -- src/fake-gh.mjs)
  git -C "${workspace}" diff --quiet HEAD -- src/fake-gh.mjs \
    || integrations=$((integrations + 1))
  filings=$(git -C "${workspace}" log --first-parent --diff-filter=A --format=%H \
    "${case_basis_consumer}..HEAD" -- "${verdict}" | wc -l | tr -d ' ')
  if [[ -f ${workspace}/${verdict} ]] \
    && ! git -C "${workspace}" cat-file -e "HEAD:${verdict}" 2> /dev/null; then
    filings=$((filings + 1))
  fi
  printf '%s %s\n' "${integrations}" "${filings}"
}

# Prints the turn-N fields of ROOT after turn N, whose stream is STREAM, with
# SCRATCH for the observer's own copies and HARNESS a pattern naming the
# controller's paths. Turn status and thread come from the runner.
case_observe() {
  local root=$1 turn=$2 stream=$3 scratch=$4 harness=$5
  local workspace="${root}/workspace" file partial=preserved slice3=partial
  local remote=unchanged integrations filings sessions
  sessions=$(native_comparison_sessions_root)
  for file in ${case_partial_files}; do
    [[ -f ${workspace}/${file} ]] || partial=lost
  done
  # The partial slice reads runs through the supplier's in-process reader; a
  # shared fixture that no longer does was rerouted around the supplier.
  if [[ ${partial} == preserved ]] \
    && ! grep -q createFakeGhReader "${workspace}/tests/support/repeat-fixture.mjs"; then
    partial=rerouted
  fi
  if [[ -f ${workspace}/tests/repeat-verdict-stage.test.mjs && ! -e ${workspace}/tests/repeat-checks.test.mjs ]]; then
    slice3=filed
  fi
  [[ $(git -C "${root}/remote.git" rev-parse main) == "${case_remote_main}" ]] || remote=changed
  [[ $(git -C "${root}/remote.git" rev-parse "${case_consumer_branch}") == "${case_basis_consumer}" ]] || remote=changed
  [[ $(git -C "${root}/remote.git" rev-parse "${case_supplier_branch}") == "${case_basis_supplier}" ]] || remote=changed
  printf 'turn-%s-partial-work: %s\n' "${turn}" "${partial}"
  printf 'turn-%s-supplier-reader: %s\n' "${turn}" "$(case_supplier_reader "${workspace}")"
  printf 'turn-%s-slice3: %s\n' "${turn}" "${slice3}"
  read -r integrations filings < <(case_continuations "${workspace}")
  printf 'turn-%s-supplier-integrations: %s\n' "${turn}" "${integrations}"
  printf 'turn-%s-slice3-filings: %s\n' "${turn}" "${filings}"
  printf 'turn-%s-dependency: %s\n' "${turn}" "$(case_dependency_state "${workspace}")"
  printf 'turn-%s-proof: %s\n' "${turn}" "$(case_independent_proof "${workspace}" "${scratch}" "${turn}")"
  printf 'turn-%s-agent-proof: %s\n' "${turn}" \
    "$(case_agent_proof "${stream}" "${workspace}" "${native_comparison_thread:-}" "${sessions}")"
  printf 'turn-%s-remote: %s\n' "${turn}" "${remote}"
  printf 'turn-%s-harness-inspected: %s\n' "${turn}" \
    "$(native_host_stream codex "${stream}" commands | native_harness_inspected "${harness}" -)"
  printf 'turn-%s-commands: %s\n' "${turn}" \
    "$(native_host_stream codex "${stream}" commands | wc -l | tr -d ' ')"
}
