#!/usr/bin/env bash

native_codex_prepare() {
  local temporary_dir=$1
  native_codex_protected_source=${2:-}
  native_codex_proof_root=$(cd -- "${temporary_dir}" && pwd -P)
  native_codex_temporary_root=$(cd -- "${temporary_dir}/.." && pwd -P)
  native_codex_state_dir="${native_codex_proof_root}/codex-state"
  mkdir -p -- "${native_codex_state_dir}"

  local codex_command codex_executable
  codex_command=$(command -v codex)
  codex_executable=$(readlink "${codex_command}")
  native_codex_runtime_root=$(
    cd -- "$(dirname -- "${codex_executable}")/../../../.." && pwd -P
  )
  native_codex_profile='(version 1)
(allow default)
(deny file-write*)
(allow file-write* (subpath (param "PROOF_ROOT")))
(allow file-write* (subpath (param "TEMP_ROOT")))
(allow file-write* (subpath (param "CODEX_RUNTIME_ROOT")))
(allow file-write* (literal "/dev/null"))
(allow file-write* (literal "/dev/ptmx"))
(allow file-write* (regex #"^/dev/ttys[0-9A-Za-z]+$"))'
  if [[ -n ${native_codex_protected_source} ]]; then
    native_codex_profile+=$'\n(deny file-write* (subpath (param "PROTECTED_SOURCE")))'
  fi
  native_codex_profile+=$'\n(deny file-write* (subpath (param "PROTECTED_SKILLS")))
(deny file-write* (subpath (param "PROTECTED_WORKTREES")))
(deny file-write* (subpath (param "PROTECTED_PACKAGES")))
(deny file-write* (subpath (param "PROTECTED_PLUGINS")))
(deny file-write* (literal (param "PROTECTED_CONFIG")))'
}

native_codex_run() {
  local target=$1
  local output_file=$2
  local prompt=$3
  local transcript=${4:-}
  local sandbox_arguments=(
    -D "PROOF_ROOT=${native_codex_proof_root}"
    -D "TEMP_ROOT=${native_codex_temporary_root}"
    -D "CODEX_RUNTIME_ROOT=${native_codex_runtime_root}"
  )

  if [[ -n ${native_codex_protected_source} ]]; then
    sandbox_arguments+=(
      -D "PROTECTED_SOURCE=${native_codex_protected_source}"
    )
  fi
  sandbox_arguments+=(
    -D "PROTECTED_SKILLS=${native_codex_runtime_root}/skills"
    -D "PROTECTED_WORKTREES=${native_codex_runtime_root}/worktrees"
    -D "PROTECTED_PACKAGES=${native_codex_runtime_root}/packages"
    -D "PROTECTED_PLUGINS=${native_codex_runtime_root}/plugins"
    -D "PROTECTED_CONFIG=${native_codex_runtime_root}/config.toml"
  )
  local command=(
    sandbox-exec "${sandbox_arguments[@]}"
    -p "${native_codex_profile}"
    codex exec --ephemeral --ignore-user-config
    -c "sqlite_home=\"${native_codex_state_dir}\""
    -c "log_dir=\"${native_codex_state_dir}\"" --skip-git-repo-check
    --sandbox danger-full-access
  )
  if [[ -n ${transcript} ]]; then
    command+=(--json)
  fi
  command+=(-C "${target}" -o "${output_file}" "${prompt}")

  if [[ -n ${transcript} ]]; then
    "${command[@]}" > "${transcript}"
    return
  fi
  "${command[@]}"
}
