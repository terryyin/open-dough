#!/usr/bin/env bash
# Owned-context publication journeys: a repository with no default checkout,
# only its Git directory and one retained owned worktree that trunk has moved
# past. startup-owned-context starts queued Story A in a new owned workspace;
# preparation-land refines queued Story C in the retained worktree and lands
# it with Dough Land. Fixture adoption, prompt, and observation dispatch;
# each journey's observer and assessor live in its own file. Sourced by the
# runner.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and runner globals.

git_publication_owned_context_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/support/git-publication-native-startup-owned-context.sh
# shellcheck disable=SC1091
source "${git_publication_owned_context_support_dir}/git-publication-native-startup-owned-context.sh"
# shellcheck source=tests/support/git-publication-native-preparation-land.sh
# shellcheck disable=SC1091
source "${git_publication_owned_context_support_dir}/git-publication-native-preparation-land.sh"

git_publication_owned_context_journey() {
  [[ $1 == startup-owned-context || $1 == preparation-land ]]
}

# Builds journey $3's fixture for host $2 from source $1 under parent $4. The
# installed guidance is already on trunk; the host runs in the retained
# worktree. Every push origin accepts is recorded.
git_publication_fixture_create_owned_context() {
  local source_dir=$1 host=$2 journey=$3 parent=$4 prepared
  prepared=$(node "${source_dir}/tests/support/git-publication-native-owned-context-fixture.mjs" \
    "${source_dir}" "${journey}" "${parent}" "${host}")
  git_publication_fixture_adopt_prepared "${prepared}"
  git_publication_fixture_integration=
  git_publication_owned_repository=$(jq -r .repository <<< "${prepared}")
  git_publication_owned_retained=$(jq -r .retained <<< "${prepared}")
  git_publication_owned_installed=$(jq -r .installed <<< "${prepared}")
  NATIVE_OWNED_WORKSPACE=${git_publication_fixture_workspace}
  NATIVE_OWNED_BRANCH=$(jq -r .branch <<< "${prepared}")
  NATIVE_OWNED_IDENTITY=$(jq -r .identity <<< "${prepared}")
  export NATIVE_OWNED_WORKSPACE NATIVE_OWNED_BRANCH NATIVE_OWNED_IDENTITY
  git_publication_record_pushes "${git_publication_fixture_origin}" \
    "${git_publication_fixture_root}"
  git_publication_owned_retained_before=$(
    git_publication_owned_capture "${git_publication_owned_retained}"
  )
}

# HEAD, branch, status, and staged and unstaged bytes of checkout $1.
git_publication_owned_capture() {
  git -C "$1" rev-parse HEAD
  git -C "$1" branch --show-current
  git -C "$1" status --porcelain
  git -C "$1" diff --cached
  git -C "$1" diff
}

git_publication_owned_context_prompt() {
  local workspace=${git_publication_fixture_workspace}
  case $1 in
    startup-owned-context)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance to execute queued Story A (${NATIVE_OWNED_IDENTITY}) in Trunk Mode. This project has no default checkout: its only checkout is the owned worktree ${git_publication_owned_retained}, where you are working. Preserve that worktree's existing local changes. The authorized owned execution workspace is the new path ${workspace} on new local branch ${NATIVE_OWNED_BRANCH}. Remote origin trunk is refs/heads/main. You have explicit authority to create that workspace and publish this claim to remote trunk. Your stable execution publisher ID is native-startup-owned-context. Follow the project's preparation gate before implementing Story A as a new feature.txt containing 'implemented'. Report the outcome."
      ;;
    preparation-land)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance to refine queued Story C (${NATIVE_OWNED_IDENTITY}). Prepare it in the owned preparation worktree ${workspace} on branch ${NATIVE_OWNED_BRANCH}, where you are working. This project has no default checkout. Story C's goal: a developer can export the release notes as plain text. Scope: one export command; formatting options are out of scope. Key example: exporting two notes prints two lines. Then keep the refined story: land that worktree on remote origin trunk refs/heads/main with Dough Land. You have explicit keep authority and authority to publish to remote trunk. Report the outcome."
      ;;
    *) return 2 ;;
  esac
}

git_publication_fixture_observe_owned_context() {
  case $1 in
    startup-owned-context) git_publication_observe_startup_owned_context "$@" ;;
    preparation-land) git_publication_observe_preparation_land "$@" ;;
    *) return 2 ;;
  esac
}

git_publication_assess_owned_context() {
  case $2 in
    startup-owned-context) git_publication_assess_startup_owned_context "$1" ;;
    preparation-land) git_publication_assess_preparation_land "$1" ;;
    *) return 2 ;;
  esac
}
