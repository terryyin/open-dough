#!/usr/bin/env bash
# Queued startup fixture and its Git/runtime observations. Sourced by fixture.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture globals.

git_publication_fixture_create_startup() {
  local source_dir=$1 journey=$2 parent=$3
  local prepared
  prepared=$(node --input-type=module -e '
    const { createQueuedTrunk, readyContributing } = await import(process.argv[1]);
    const fixture = await createQueuedTrunk({ contributing: readyContributing, durableCommandEvidence: true, parent: process.argv[2] });
    process.stdout.write(JSON.stringify({ root: fixture.fixture, origin: fixture.origin, integration: fixture.integration, trunk: fixture.trunkSha }));
  ' "file://${source_dir}/src/skills/dough-execute-plan/scripts/workspace-publication-fixtures.mjs" "${parent}")
  git_publication_fixture_root=$(jq -r .root <<< "${prepared}")
  git_publication_fixture_origin=$(jq -r .origin <<< "${prepared}")
  git_publication_fixture_integration=$(jq -r .integration <<< "${prepared}")
  git_publication_fixture_trunk_sha=$(jq -r .trunk <<< "${prepared}")
  git_publication_fixture_workspace="${git_publication_fixture_root}/native-execution"
  git_publication_fixture_candidate_sha=
  git_publication_fixture_startup_mode=trunk
  [[ ${journey} == *story-branch* ]] && git_publication_fixture_startup_mode=story-branch
  cat > "${git_publication_fixture_origin}/hooks/post-receive" << EOF
#!/bin/sh
while read -r old new ref; do
  if [ "\${ref}" = refs/heads/main ]; then
    if [ ! -e "${git_publication_fixture_root}/claim-accepted" ]; then
      touch "${git_publication_fixture_root}/claim-accepted"
    fi
  fi
done
EOF
  chmod +x "${git_publication_fixture_origin}/hooks/post-receive"
  git_publication_fixture_plant_human_edit "${git_publication_fixture_integration}"
  if [[ ${journey} == startup-selected-source ]]; then
    sed 's/Execute A\./Changed locally after preparation./' \
      "${git_publication_fixture_integration}/.planning/seeds/A.md" \
      > "${git_publication_fixture_integration}/.planning/seeds/A.next"
    mv -- "${git_publication_fixture_integration}/.planning/seeds/A.next" \
      "${git_publication_fixture_integration}/.planning/seeds/A.md"
  fi
  git_publication_fixture_selected_before=$(shasum -a 256 \
    "${git_publication_fixture_integration}/.planning/seeds/A.md" | awk '{print $1}')
  git_publication_fixture_human_before=$(
    git_publication_fixture_capture_human "${git_publication_fixture_integration}"
  )
  if [[ ${journey} == startup-claim-race || ${journey} == startup-resume ]]; then
    local start_cli="${source_dir}/src/skills/dough-execute-plan/scripts/execution-start.mjs"
    local receipt
    if [[ ${journey} == startup-claim-race ]]; then
      mkdir -p "${git_publication_fixture_root}/hooks"
      cat > "${git_publication_fixture_root}/hooks/pre-push" << 'EOF'
#!/bin/sh
echo 'interrupted before push' >&2
exit 1
EOF
      chmod +x "${git_publication_fixture_root}/hooks/pre-push"
      git -C "${git_publication_fixture_integration}" config core.hooksPath \
        "${git_publication_fixture_root}/hooks"
    fi
    receipt=$(node "${start_cli}" start \
      --integration "${git_publication_fixture_integration}" \
      --workspace "${git_publication_fixture_workspace}" \
      --branch exec/native-startup --identity 'SEED-A#a' \
      --publisher-id "native-startup-${journey}" --mode trunk \
      --remote origin --target main --push-authorized --workspace-authorized) || true
    git_publication_fixture_candidate_sha=$(jq -r '.candidateSha // .recovery.candidateSha' <<< "${receipt}")
    git_publication_fixture_starting_sha=$(jq -r '.startingRevision // .recovery.startingRevision' <<< "${receipt}")
    if [[ ${journey} == startup-claim-race ]]; then
      git -C "${git_publication_fixture_integration}" config --unset core.hooksPath
      node "${start_cli}" start \
        --integration "${git_publication_fixture_integration}" \
        --workspace "${git_publication_fixture_root}/rival" \
        --branch exec/rival --identity 'SEED-A#a' \
        --publisher-id rival --mode trunk --remote origin --target main \
        --push-authorized --workspace-authorized > /dev/null
    else
      git clone -q "${git_publication_fixture_origin}" \
        "${git_publication_fixture_root}/later"
      git -C "${git_publication_fixture_root}/later" config user.name Later
      git -C "${git_publication_fixture_root}/later" config user.email later@example.test
      printf 'later\n' > "${git_publication_fixture_root}/later/later.txt"
      git -C "${git_publication_fixture_root}/later" add later.txt
      git -C "${git_publication_fixture_root}/later" commit -qm 'later independent advance'
      git -C "${git_publication_fixture_root}/later" push -q origin HEAD:main
    fi
  fi
}

git_publication_fixture_observe_startup() {
  local journey=$1 stream_status=$2 transcript=$3
  local remote_sha remote_backlog message human_after human_preserved
  local source_after source_preserved feature_exists first_edit_after_claim
  local startup_calls setup_exists command_exists setup_after_claim claim_owned taken_on_remote
  local refusal_receipt conflict_receipt command_outputs
  remote_sha=$(git ls-remote "${git_publication_fixture_origin}" refs/heads/main | awk '{print $1}')
  remote_backlog=$(git --git-dir="${git_publication_fixture_origin}" show \
    "${remote_sha}:.planning/PRODUCT-BACKLOG.md")
  message=$(git --git-dir="${git_publication_fixture_origin}" log -1 --format=%B "${remote_sha}")
  human_after=$(git_publication_fixture_capture_human "${git_publication_fixture_integration}")
  human_preserved=false
  [[ ${human_after} == "${git_publication_fixture_human_before}" ]] && human_preserved=true
  source_after=$(shasum -a 256 \
    "${git_publication_fixture_integration}/.planning/seeds/A.md" | awk '{print $1}')
  source_preserved=false
  [[ ${source_after} == "${git_publication_fixture_selected_before}" ]] && source_preserved=true
  taken_on_remote=false
  if awk '
    /^## Taken$/ { inside = 1; next }
    /^## / && inside { exit }
    inside && /SEED-A#a/ { found = 1 }
    END { exit !found }
  ' <<< "${remote_backlog}"; then taken_on_remote=true; fi
  claim_owned=false
  if git --git-dir="${git_publication_fixture_origin}" log --format=%B "${remote_sha}" \
    | grep -Fq "Claim-Publisher: native-startup-${journey}"; then claim_owned=true; fi
  feature_exists=false
  [[ -f ${git_publication_fixture_workspace}/feature.txt ]] && feature_exists=true
  setup_exists=false
  [[ -f ${git_publication_fixture_root}/.setup-ran ]] && setup_exists=true
  command_exists=false
  [[ -f ${git_publication_fixture_root}/.command-ran ]] && command_exists=true
  setup_after_claim=false
  if [[ ${setup_exists} == true && ${command_exists} == true && -f ${git_publication_fixture_root}/claim-accepted ]]; then
    if node -e '
      const fs = require("fs");
      const [claim, setup, command] = process.argv.slice(1).map((path) => fs.statSync(path, { bigint: true }).mtimeNs);
      process.exit(setup >= claim && command >= setup ? 0 : 1);
    ' "${git_publication_fixture_root}/claim-accepted" \
      "${git_publication_fixture_root}/.setup-ran" \
      "${git_publication_fixture_root}/.command-ran"; then
      setup_after_claim=true
    fi
  fi
  first_edit_after_claim=false
  if [[ -f ${git_publication_fixture_root}/claim-accepted &&
    -f ${git_publication_fixture_workspace}/feature.txt ]]; then
    if node -e 'const fs=require("fs");process.exit(fs.statSync(process.argv[2],{bigint:true}).mtimeNs>=fs.statSync(process.argv[1],{bigint:true}).mtimeNs?0:1)' \
      "${git_publication_fixture_root}/claim-accepted" \
      "${git_publication_fixture_workspace}/feature.txt"; then
      first_edit_after_claim=true
    fi
  fi
  startup_calls=$(jq -r 'select(.type == "item.started" and .item.type == "command_execution") | .item.command // empty' \
    "${transcript}" 2> /dev/null | grep -Fc 'execution-start.mjs start' || true)
  if [[ ${startup_calls} -eq 0 ]]; then
    startup_calls=$(jq -r '.. | objects | .command? // empty' "${transcript}" 2> /dev/null \
      | sort -u | grep -Fc 'execution-start.mjs start' || true)
  fi
  refusal_receipt=false
  conflict_receipt=false
  command_outputs=$(
    jq -r 'select(.type == "item.completed" and .item.type == "command_execution" and
      ((.item.command // "") | contains("execution-start.mjs start"))) |
      .item.aggregated_output // empty' "${transcript}" 2> /dev/null || true
    jq -rs '
      [.[] | select(.type == "assistant") | .message.content[]? |
        select(.type == "tool_use" and ((.input.command // "") | contains("execution-start.mjs start"))) | .id] as $ids |
      .[] | select(.type == "user") | .message.content[]? |
      select(.type == "tool_result" and (.tool_use_id as $id | $ids | index($id))) |
      .content
    ' "${transcript}" 2> /dev/null || true
  )
  if grep -Eq '^\{"ok":false,"status":"source-refused"' <<< "${command_outputs}"; then
    refusal_receipt=true
  fi
  if grep -Eq '^\{"ok":false,"status":"conflict"' <<< "${command_outputs}"; then
    conflict_receipt=true
  fi
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  printf 'startup-cli-count: %s\n' "${startup_calls}"
  printf 'remote-sha: %s\n' "${remote_sha}"
  printf 'trunk-sha: %s\n' "${git_publication_fixture_trunk_sha}"
  printf 'taken-on-remote: %s\n' "${taken_on_remote}"
  printf 'claim-owned: %s\n' "${claim_owned}"
  printf 'candidate-sha: %s\n' "${git_publication_fixture_candidate_sha}"
  local candidate_contained=false
  if [[ -n ${git_publication_fixture_candidate_sha} ]] \
    && git --git-dir="${git_publication_fixture_origin}" merge-base --is-ancestor \
      "${git_publication_fixture_candidate_sha}" "${remote_sha}" 2> /dev/null; then
    candidate_contained=true
  fi
  printf 'candidate-contained: %s\n' "${candidate_contained}"
  printf 'rival-owned: %s\n' "$(grep -Fq 'Claim-Publisher: rival' <<< "$(git --git-dir="${git_publication_fixture_origin}" log --format=%B "${remote_sha}")" && echo true || echo false)"
  printf 'human-edit-preserved: %s\n' "${human_preserved}"
  printf 'selected-source-preserved: %s\n' "${source_preserved}"
  printf 'feature-exists: %s\n' "${feature_exists}"
  printf 'setup-exists: %s\n' "${setup_exists}"
  printf 'command-exists: %s\n' "${command_exists}"
  printf 'setup-after-claim: %s\n' "${setup_after_claim}"
  printf 'startup-refusal-observed: %s\n' "${refusal_receipt}"
  printf 'startup-conflict-observed: %s\n' "${conflict_receipt}"
  printf 'first-edit-after-claim: %s\n' "${first_edit_after_claim}"
  printf 'workspace: %s\n' "${git_publication_fixture_workspace}"
  printf 'integration: %s\n' "${git_publication_fixture_integration}"
}
