#!/usr/bin/env bash
# Controlled proof sequences for delivery-evidence/scheduling, run through the
# fixture's own product commands in a populated workspace. Each sequence makes
# the same implementation and extraction edits; only which proof runs happen,
# on which state, and the stated outcome differ. They are controlled replays of
# the retained stylesheet-extraction case, never native proof. The substitute
# host (native-agent-proof-scheduling.sh) replays them through the native
# runner; the credential-free suite observes them directly.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_scheduling_sequences='corrected baseline dropped-final stale-pre-move invocation-only partial-suite broken-consumer no-targeted'

# The requested change: the action row's markup, its rules appended to the
# one stylesheet (now over the line limit), and a focused test of the row.
delivery_evidence_scheduling_implement() {
  local workspace=$1
  delivery_evidence_scheduling_write_project_card "${workspace}" with-actions
  delivery_evidence_scheduling_append_action_rules "${workspace}"
  cat >> "${workspace}/tests/project-card.test.mjs" << 'EOF'

test('project card renders the compact action row after the title', () => {
  const html = renderProjectCard(project);
  assert.match(html, /<\/h2><div class="project-actions"><button class="project-action" type="button">Rename<\/button><button class="project-action" type="button">Archive<\/button><\/div>/);
});
EOF
}

# The refactor's move: the project actions block leaves dashboard.css for its
# own stylesheet. With LINK=linked, index.html links it; unlinked leaves a
# broken stylesheet consumer.
delivery_evidence_scheduling_extract() {
  local workspace=$1 link=$2 css="$1/styles/dashboard.css"
  sed -n '/^\/\* Project actions \*\/$/,$p' "${css}" \
    > "${workspace}/styles/project-actions.css"
  sed -i.bak '/^\/\* Project actions \*\/$/,$d' "${css}"
  # Drop the blank line left before the moved block.
  sed -i.bak -e ':a' -e '/^\n*$/{$d;N;ba' -e '}' "${css}"
  rm -f -- "${css}.bak"
  if [[ ${link} == linked ]]; then
    sed -i.bak 's|^\(    <link rel="stylesheet" href="styles/dashboard.css">\)$|\1\
    <link rel="stylesheet" href="styles/project-actions.css">|' \
      "${workspace}/index.html"
    rm -f -- "${workspace}/index.html.bak"
  fi
}

delivery_evidence_scheduling_outcome() {
  local workspace=$1 status=$2
  mkdir -p -- "${workspace}/.planning"
  printf '# Acceptance outcome\n\n1. %s: compact project action row (evidence: %s)\n' \
    "${status}" "the proof-run log" > "${workspace}/.planning/acceptance-outcome.md"
}

# Runs controlled SEQUENCE in WORKSPACE through its product commands.
delivery_evidence_scheduling_play() {
  local workspace=$1 sequence=$2 link=linked
  local focused=(tests/project-card.test.mjs tests/stylesheets.test.mjs)
  [[ ${sequence} != broken-consumer ]] || link=unlinked
  (
    cd -- "${workspace}" || exit
    delivery_evidence_scheduling_implement "${workspace}"
    if [[ ${sequence} != no-targeted ]]; then
      bin/test.sh "${focused[@]}" > /dev/null
    fi
    case ${sequence} in
      baseline | stale-pre-move) bin/suite.sh > /dev/null ;;
      *) ;;
    esac
    delivery_evidence_scheduling_extract "${workspace}" "${link}"
    bin/format.sh > /dev/null
    case ${sequence} in
      corrected | baseline | no-targeted) bin/suite.sh > /dev/null ;;
      invocation-only)
        bin/suite.sh --test-name-pattern='^no such test$' > /dev/null
        ;;
      partial-suite)
        bin/suite.sh --test-name-pattern='^project card' > /dev/null
        ;;
      broken-consumer) bin/suite.sh > /dev/null || true ;;
      *) ;;
    esac
    delivery_evidence_scheduling_outcome "${workspace}" Accepted
  )
}

# Builds a fixture for SEQUENCE under PARENT, plays it, and writes its
# observation to OUT. The fixture is left at delivery_evidence_workspace.
delivery_evidence_scheduling_observe_sequence() {
  local sequence=$1 parent=$2 out=$3 root
  root="${parent}/${sequence}"
  delivery_evidence_root=${root}
  delivery_evidence_workspace=$(
    delivery_evidence_scheduling_fresh_workspace "${parent}" "${sequence}"
  )
  delivery_evidence_scheduling_play "${delivery_evidence_workspace}" "${sequence}"
  : > "${root}/events.jsonl"
  : > "${root}/response.md"
  delivery_evidence_scheduling_observe stylesheet-extraction \
    "${delivery_evidence_workspace}" "${root}/response.md" \
    "${root}/events.jsonl" > "${out}"
}

# Builds a populated fixture at PARENT/NAME/workspace and prints its path.
delivery_evidence_scheduling_fresh_workspace() {
  local workspace="$1/$2/workspace"
  mkdir -p -- "${workspace}"
  git init -q -b main "${workspace}"
  delivery_evidence_scheduling_populate_fixture "${workspace}" \
    stylesheet-extraction
  printf '%s\n' "${workspace}"
}

# Fails with MESSAGE unless the last proof-log line of WORKSPACE holds TEXT.
delivery_evidence_scheduling_expect_logged() {
  local workspace=$1 text=$2 message=$3
  if ! tail -n 1 "$(delivery_evidence_scheduling_log_path "${workspace}")" \
    | grep -Fq -- "${text}"; then
    printf 'FAIL: %s\n' "${message}" >&2
    return 1
  fi
}

# Product-command checks on fixture state: the implemented change foreseeably
# breaks the line limit while its focused proof passes, the extraction
# restores the limit and keeps the suite passing, and the stylesheet consumer
# fails when the extracted stylesheet is left unlinked.
run_delivery_evidence_scheduling_product_checks() {
  local work=$1 workspace status
  workspace=$(delivery_evidence_scheduling_fresh_workspace "${work}" moved)
  delivery_evidence_scheduling_implement "${workspace}"
  status=0
  (cd -- "${workspace}" && bin/check-size.sh 2> /dev/null) || status=$?
  if [[ ${status} -ne 1 ]]; then
    echo 'FAIL: the implemented stylesheet is not over the line limit' >&2
    return 1
  fi
  (cd -- "${workspace}" \
    && bin/test.sh tests/project-card.test.mjs tests/stylesheets.test.mjs > /dev/null)
  delivery_evidence_scheduling_expect_logged "${workspace}" \
    'kind=targeted' 'focused proof was not logged'
  delivery_evidence_scheduling_expect_logged "${workspace}" \
    'stylesheet-files=1 linked=styles/dashboard.css size-ok=false exit=0 passed=6 failed=0' \
    'focused proof did not observe the six focused tests on the pre-move state'
  delivery_evidence_scheduling_extract "${workspace}" linked
  (cd -- "${workspace}" && bin/check-size.sh && bin/suite.sh > /dev/null)
  delivery_evidence_scheduling_expect_logged "${workspace}" \
    'kind=suite' 'the suite run was not logged'
  delivery_evidence_scheduling_expect_logged "${workspace}" \
    'stylesheet-files=2 linked=styles/dashboard.css,styles/project-actions.css size-ok=true exit=0 passed=7 failed=0' \
    'the suite did not observe all seven tests on the extracted state'

  workspace=$(delivery_evidence_scheduling_fresh_workspace "${work}" unlinked)
  delivery_evidence_scheduling_implement "${workspace}"
  delivery_evidence_scheduling_extract "${workspace}" unlinked
  status=0
  (cd -- "${workspace}" && bin/test.sh tests/stylesheets.test.mjs > /dev/null) \
    || status=$?
  if [[ ${status} -eq 0 ]]; then
    echo 'FAIL: the stylesheet consumer passed an unlinked extraction' >&2
    return 1
  fi
  delivery_evidence_scheduling_expect_logged "${workspace}" \
    'exit=1 passed=1 failed=1 names=every linked stylesheet exists;every rendered class is styled by a linked stylesheet' \
    'the stylesheet consumer did not log its failing observation'
}
