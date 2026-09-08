#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

snapshot_tree() {
  local root=$1

  (
    cd -- "${root}"
    find . -print | LC_ALL=C sort | while IFS= read -r path; do
      if [[ -L "${path}" ]]; then
        link_target=$(readlink -- "${path}")
        printf 'link %s -> %s\n' "${path}" "${link_target}"
      elif [[ -f "${path}" ]]; then
        printf 'file %s ' "${path}"
        shasum -- "${path}"
      elif [[ -d "${path}" ]]; then
        printf 'directory %s\n' "${path}"
      else
        printf 'other %s\n' "${path}"
      fi
    done
  ) | shasum
}

platform_skill_root() {
  local target=$1
  local platform=$2

  case "${platform}" in
    codex) printf '%s\n' "${target}/.agents/skills" ;;
    cursor) printf '%s\n' "${target}/.agents/skills" ;;
    claude) printf '%s\n' "${target}/.claude/skills" ;;
    *) return 1 ;;
  esac
}

assert_refused_unchanged() {
  local target=$1
  local platform=$2
  local expected_path=$3
  local force_arg=${4:-}
  local accepted=0
  local before_target output after_target
  local -a install_command=(
    bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}"
    --platform "${platform}"
  )

  before_target=$(snapshot_tree "${target}")
  if [[ -n "${force_arg}" ]]; then
    install_command+=("${force_arg}")
  fi
  if output=$("${install_command[@]}" 2>&1); then
    accepted=1
  fi
  if [[ ${accepted} -eq 1 ]]; then
    echo "FAIL: ${platform} installation accepted unsafe destination ${expected_path}." >&2
    exit 1
  fi
  [[ "${output}" == *'Unsafe destination'* ]]
  [[ "${output}" == *"${expected_path}"* ]]
  after_target=$(snapshot_tree "${target}")
  [[ "${after_target}" == "${before_target}" ]]
}

for platform in codex cursor claude; do
  for force_arg in '' --force; do
    target="${temporary_dir}/${platform}-${force_arg:-ordinary}-symlink-target"
    outside="${temporary_dir}/${platform}-${force_arg:-ordinary}-outside"
    skill_root=$(platform_skill_root "${target}" "${platform}")
    mkdir -p -- "$(dirname -- "${skill_root}")" "${outside}"
    printf '%s\n' 'Keep this outside tree byte-identical.' > "${outside}/sentinel.txt"
    ln -s -- "${outside}" "${skill_root}"
    before_outside=$(snapshot_tree "${outside}")

    assert_refused_unchanged "${target}" "${platform}" "${skill_root}" "${force_arg}"

    after_outside=$(snapshot_tree "${outside}")
    [[ "${after_outside}" == "${before_outside}" ]]
  done

  for managed_skill in dough-update dough-adr-awareness dough-product-backlog dough-story-decomposition dough-story-refinement dough-resplit-story dough-slice-planning dough-slice-plan-refinement; do
    for force_arg in '' --force; do
      target="${temporary_dir}/${platform}-${managed_skill}-${force_arg:-ordinary}-collision"
      skill_root=$(platform_skill_root "${target}" "${platform}")
      collision="${skill_root}/${managed_skill}"
      mkdir -p -- "${skill_root}"
      printf '%s\n' 'Keep this collision byte-identical.' > "${collision}"

      assert_refused_unchanged "${target}" "${platform}" "${collision}" "${force_arg}"
      if [[ "${managed_skill}" == dough-adr-awareness ]]; then
        [[ ! -e "${skill_root}/dough-update" ]]
      fi
    done
  done
  for collision_path in dough-story-decomposition/references dough-story-refinement/references/planning.md; do
    for force_arg in '' --force; do
      target="${temporary_dir}/${platform}-${force_arg:-ordinary}-${collision_path//\//-}"
      skill_root=$(platform_skill_root "${target}" "${platform}")
      collision="${skill_root}/${collision_path}"
      outside="${target}/outside"
      mkdir -p -- "$(dirname -- "${collision}")" "${outside}"
      printf '%s\n' 'Preserve outside content.' > "${outside}/sentinel"
      ln -s -- "${outside}" "${collision}"
      assert_refused_unchanged "${target}" "${platform}" "${collision}" "${force_arg}"
    done
  done
done

echo 'PASS: Codex and Cursor through their shared root, and Claude through its root, refuse symlinked skill roots and managed-path collisions before writes, with or without force.'
