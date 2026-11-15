#!/usr/bin/env bash
# Shared context setup and installed-payload preflight.
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Callers own shared fixture globals.

skill_root_for() {
  case $1 in
    codex) printf '%s\n' '.agents/skills' ;;
    cursor) printf '%s\n' '.agents/skills' ;;
    claude) printf '%s\n' '.claude/skills' ;;
    *) return 2 ;;
  esac
}

# Fixture (temporary_dir), agent workspace, and stream artifacts use separate
# roots so a native command that removes dirname(--workspace) cannot unlink the
# transcript or the verify fixture before classify/decode/snapshots.
temporary_dir=$(mktemp -d)
agent_root=
artifact_root=
transcript=
output_file=
native_stderr=
finish() {
  local status=$?
  if ((status != 0)); then
    [[ -z ${transcript} || ! -f ${transcript} ]] || cat "${transcript}" >&2
    [[ -z ${output_file} || ! -f ${output_file} ]] || cat "${output_file}" >&2
  fi
  rm -rf -- "${temporary_dir}"
  [[ -z ${agent_root} ]] || rm -rf -- "${agent_root}"
  [[ -z ${artifact_root} ]] || rm -rf -- "${artifact_root}"
  exit "${status}"
}
trap finish EXIT

# The selected run's adopter under <root>, installed from <candidate> for <host>.
build_context_adopter() {
  prepare_installed_adr_awareness_target "$1/adopter" "$2" "$3"
}

candidate="${temporary_dir}/candidate"
fixture_cache_fill context-candidate "${candidate}" \
  build_current_tagged_release_fixture
candidate_build=${fixture_cache_built}
version=$(cat "${candidate}/VERSION")
tag="v${version}"
source_commit=$(git -C "${candidate}" rev-parse HEAD)
source_before=$(snapshot_path_state "${candidate}")

assert_fresh_install() {
  local checked_platform=$1
  local checked_target=$2
  local checked_skill_root

  checked_skill_root=$(skill_root_for "${checked_platform}")
  # shellcheck disable=SC2154 # Assigned by the sourced public-payload fixture.
  assert_tagged_payload_matches "${candidate}" "${tag}" \
    "${checked_target}/${checked_skill_root}"
  [[ $(cat "${checked_target}/${checked_skill_root}/dough-update/VERSION") == "${version}" ]]
  grep -Fq 'Do not require policies for situations absent from the current request.' \
    "${checked_target}/${checked_skill_root}/dough-adr-awareness/SKILL.md"
}
