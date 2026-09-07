#!/usr/bin/env bash
# shellcheck disable=SC2034 # native_codex_command is consumed by native_codex_run and the supervisor.

native_codex_command=()

native_codex_prepare() {
  local temporary_dir=$1
  native_codex_protected_source=${2:-}
  native_codex_proof_root=$(cd -- "${temporary_dir}" && pwd -P)
  native_codex_temporary_root=$(cd -- "${temporary_dir}/.." && pwd -P)
  native_codex_state_dir="${native_codex_proof_root}/codex-state"
  mkdir -p -- "${native_codex_state_dir}"

  local codex_command codex_executable
  codex_command=$(command -v codex)
  if [[ -L "${codex_command}" ]]; then
    # Real native Codex is a runtime symlink; walk to its package root for isolation.
    codex_executable=$(readlink "${codex_command}")
    native_codex_runtime_root=$(
      cd -- "$(dirname -- "${codex_executable}")/../../../.." && pwd -P
    )
    native_codex_isolate=1
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
  else
    # Non-symlink substitutes (cheap CI) must not require that layout or sandbox-exec.
    native_codex_isolate=0
  fi
}

native_codex_build_command() {
  local target=$1
  local output_file=$2
  local prompt=$3
  local transcript=${4:-}
  local inner=(
    codex exec --ephemeral --ignore-user-config
    -c "sqlite_home=\"${native_codex_state_dir}\""
    -c "log_dir=\"${native_codex_state_dir}\"" --skip-git-repo-check
    --sandbox danger-full-access
  )
  local sandbox_arguments

  if [[ -n ${transcript} ]]; then
    inner+=(--json)
  fi
  inner+=(-C "${target}" -o "${output_file}" "${prompt}")

  if [[ ${native_codex_isolate:-0} -eq 1 ]]; then
    sandbox_arguments=(
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
    native_codex_command=(
      sandbox-exec "${sandbox_arguments[@]}"
      -p "${native_codex_profile}"
      "${inner[@]}"
    )
  else
    native_codex_command=("${inner[@]}")
  fi
}

native_codex_run() {
  local transcript=${4:-}
  native_codex_build_command "$@"
  if [[ -n ${transcript} ]]; then
    "${native_codex_command[@]}" > "${transcript}"
    return
  fi
  "${native_codex_command[@]}"
}
