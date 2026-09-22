#!/usr/bin/env bash
# Disposable Git fixtures for the publication native harness: bare origin,
# integration checkout with a pending human edit, and an owned workspace that
# holds the unpublished candidate. Sourced by the runner.
# shellcheck disable=SC2034,SC2249,SC2312 # Fixture globals are consumed by the runner.

git_publication_fixture_root=
git_publication_fixture_origin=
git_publication_fixture_integration=
git_publication_fixture_workspace=
git_publication_fixture_trunk_sha=
git_publication_fixture_candidate_sha=
git_publication_fixture_human_before=

git_publication_fixture_git() {
  local cwd=$1
  shift
  git -C "${cwd}" -c user.name='Publication Fixture' \
    -c user.email='publication-fixture@example.invalid' "$@"
}

git_publication_fixture_plant_human_edit() {
  local checkout=$1
  printf 'human index\n' > "${checkout}/human-staged.txt"
  git_publication_fixture_git "${checkout}" add human-staged.txt
  printf 'base\nhuman changed tracked file\n' > "${checkout}/trunk.txt"
  printf 'human working tree\n' > "${checkout}/human-unstaged.txt"
}

git_publication_fixture_capture_human() {
  local checkout=$1
  {
    printf 'staged:%s\n' "$(cat "${checkout}/human-staged.txt")"
    printf 'tracked:%s\n' "$(cat "${checkout}/trunk.txt")"
    printf 'untracked:%s\n' "$(cat "${checkout}/human-unstaged.txt")"
    printf 'status:%s\n' \
      "$(git -C "${checkout}" status --porcelain | tr '\n' '|')"
  }
}

git_publication_fixture_create_publish_boundary() {
  local parent=${1:-${TMPDIR:-/tmp}}
  local root
  root=$(mktemp -d "${parent}/git-pub-native.XXXXXX")
  git_publication_fixture_root=${root}
  git_publication_fixture_origin="${root}/remote.git"
  git_publication_fixture_integration="${root}/integration"
  git_publication_fixture_workspace="${root}/owned"

  git init --bare -b main "${git_publication_fixture_origin}" > /dev/null
  git init -b main "${git_publication_fixture_integration}" > /dev/null
  git_publication_fixture_git "${git_publication_fixture_integration}" \
    remote add origin "${git_publication_fixture_origin}"
  printf 'base\n' > "${git_publication_fixture_integration}/trunk.txt"
  git_publication_fixture_git "${git_publication_fixture_integration}" \
    add trunk.txt
  git_publication_fixture_git "${git_publication_fixture_integration}" \
    commit --quiet -m 'base trunk commit'
  git_publication_fixture_git "${git_publication_fixture_integration}" \
    push --quiet origin main
  git_publication_fixture_trunk_sha=$(
    git -C "${git_publication_fixture_integration}" rev-parse HEAD
  )

  git -C "${git_publication_fixture_origin}" clone --quiet \
    "${git_publication_fixture_origin}" "${git_publication_fixture_workspace}"
  git_publication_fixture_git "${git_publication_fixture_workspace}" \
    checkout --quiet -b exec/story
  printf 'increment\n' > "${git_publication_fixture_workspace}/increment.txt"
  git_publication_fixture_git "${git_publication_fixture_workspace}" \
    add increment.txt
  git_publication_fixture_git "${git_publication_fixture_workspace}" \
    commit --quiet -m 'verified increment'
  git_publication_fixture_candidate_sha=$(
    git -C "${git_publication_fixture_workspace}" rev-parse HEAD
  )

  git_publication_fixture_plant_human_edit \
    "${git_publication_fixture_integration}"
  git_publication_fixture_human_before=$(
    git_publication_fixture_capture_human \
      "${git_publication_fixture_integration}"
  )
}

git_publication_fixture_create_claim_race() {
  git_publication_fixture_create_publish_boundary "$@"
  # A competing writer already holds a distinct claim tip on origin/main.
  local rival
  rival=$(mktemp -d "${git_publication_fixture_root}/rival.XXXXXX")
  git -C "${git_publication_fixture_origin}" clone --quiet \
    "${git_publication_fixture_origin}" "${rival}"
  printf 'rival claim\n' > "${rival}/rival.txt"
  git_publication_fixture_git "${rival}" add rival.txt
  git_publication_fixture_git "${rival}" commit --quiet -m 'Take queued work: rival'
  git_publication_fixture_git "${rival}" push --quiet origin main
  rm -rf -- "${rival}"
}

git_publication_fixture_create_uncertain_recovery() {
  git_publication_fixture_create_publish_boundary "$@"
  # Candidate is already accepted; another writer then advances remote tip.
  git_publication_fixture_git "${git_publication_fixture_workspace}" \
    push --quiet origin \
    "${git_publication_fixture_candidate_sha}:refs/heads/main"
  local third
  third=$(mktemp -d "${git_publication_fixture_root}/third.XXXXXX")
  git -C "${git_publication_fixture_origin}" clone --quiet \
    "${git_publication_fixture_origin}" "${third}"
  printf 'their work\n' > "${third}/other-writer.txt"
  git_publication_fixture_git "${third}" add other-writer.txt
  git_publication_fixture_git "${third}" \
    commit --quiet -m "another writer's own increment"
  git_publication_fixture_git "${third}" push --quiet origin main
  rm -rf -- "${third}"
}

git_publication_fixture_install_skills() {
  local source_dir=$1
  local host=$2
  local target=$3
  bash "${source_dir}/install.sh" --target "${target}" \
    --source "${source_dir}" --platform "${host}" > /dev/null
}

git_publication_fixture_observe() {
  local journey=$1
  local authority=$2
  local stream_status=$3
  local transcript=${4-}
  local target_ref=refs/heads/main
  local remote_sha trunk_remote_sha human_after human_preserved ownership
  local remote_accepted maintenance containing_head_count exact_push_count
  local target_push_count forced_target_push_count integration_head_sha commands

  if [[ ${journey} == 'story-branch-increment' ]]; then
    target_ref=refs/heads/exec/story
  fi

  remote_sha=$(
    git ls-remote "${git_publication_fixture_origin}" "${target_ref}" \
      | awk '{print $1}'
  )
  trunk_remote_sha=$(
    git ls-remote "${git_publication_fixture_origin}" refs/heads/main \
      | awk '{print $1}'
  )
  integration_head_sha=$(
    git -C "${git_publication_fixture_integration}" rev-parse HEAD
  )
  human_after=$(
    git_publication_fixture_capture_human \
      "${git_publication_fixture_integration}"
  )
  if [[ ${human_after} == "${git_publication_fixture_human_before}" ]]; then
    human_preserved=true
  else
    human_preserved=false
  fi

  if [[ ${remote_sha} == "${git_publication_fixture_candidate_sha}" ]]; then
    remote_accepted=true
    ownership=owned
    maintenance=deferred
  elif git -C "${git_publication_fixture_workspace}" merge-base --is-ancestor \
    "${git_publication_fixture_candidate_sha}" "${remote_sha}" 2> /dev/null; then
    remote_accepted=true
    ownership=owned
    maintenance=deferred
  else
    remote_accepted=false
    ownership=absent
    maintenance=deferred
  fi

  containing_head_count=0
  commands=
  if [[ ${journey} == 'story-branch-increment' ]]; then
    containing_head_count=$(
      git --git-dir="${git_publication_fixture_origin}" for-each-ref \
        --contains "${git_publication_fixture_candidate_sha}" \
        --format='%(refname)' refs/heads | wc -l | tr -d ' '
    )
    commands=$(
      if [[ -n ${transcript} && -r ${transcript} ]]; then
        jq -r 'select(.type == "item.started") | .item | select(.type == "command_execution") | .command // empty' \
          "${transcript}" 2> /dev/null || true
      fi
    )
  fi
  exact_push_count=$(
    grep -Fo "${git_publication_fixture_candidate_sha}:refs/heads/exec/story" \
      <<< "${commands}" | wc -l | tr -d ' '
  )
  target_push_count=$(
    grep -F 'exec/story' <<< "${commands}" \
      | grep -Eo '(^|[[:space:]])push([[:space:]]|$)' \
      | wc -l | tr -d ' '
  )
  forced_target_push_count=$(
    grep -F 'exec/story' <<< "${commands}" \
      | grep -E '(^|[[:space:]])push([[:space:]]|$)' \
      | grep -Ec '(^|[[:space:]])(--force|-f)([=[:space:]]|$)' || true
  )

  case ${journey} in
    local-only)
      ownership=n/a
      maintenance=n/a
      ;;
    claim-race)
      # Rival tip still on remote: candidate was not accepted; ownership is foreign.
      if [[ ${remote_accepted} != 'true' ]]; then
        ownership=foreign
      fi
      ;;
  esac

  {
    printf 'journey: %s\n' "${journey}"
    printf 'authority: %s\n' "${authority}"
    printf 'stream-status: %s\n' "${stream_status}"
    printf 'remote-accepted: %s\n' "${remote_accepted}"
    printf 'remote-sha: %s\n' "${remote_sha}"
    printf 'target-ref: %s\n' "${target_ref}"
    printf 'trunk-remote-sha: %s\n' "${trunk_remote_sha}"
    printf 'candidate-sha: %s\n' "${git_publication_fixture_candidate_sha}"
    printf 'trunk-sha: %s\n' "${git_publication_fixture_trunk_sha}"
    printf 'integration-head-sha: %s\n' "${integration_head_sha}"
    printf 'candidate-containing-head-count: %s\n' "${containing_head_count}"
    printf 'exact-push-count: %s\n' "${exact_push_count}"
    printf 'target-push-count: %s\n' "${target_push_count}"
    printf 'forced-target-push-count: %s\n' "${forced_target_push_count}"
    printf 'human-edit-preserved: %s\n' "${human_preserved}"
    printf 'claim-ownership: %s\n' "${ownership}"
    printf 'maintenance-result: %s\n' "${maintenance}"
    printf 'workspace: %s\n' "${git_publication_fixture_workspace}"
    printf 'integration: %s\n' "${git_publication_fixture_integration}"
  }
}

git_publication_fixture_cleanup() {
  if [[ -n ${git_publication_fixture_root} &&
    -d ${git_publication_fixture_root} ]]; then
    rm -rf -- "${git_publication_fixture_root}"
  fi
  git_publication_fixture_root=
}
