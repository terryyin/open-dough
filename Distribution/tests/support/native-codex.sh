#!/usr/bin/env bash
# shellcheck disable=SC2034 # native_codex_command is consumed by native_codex_run and the supervisor.

native_codex_command=()
# Extra `codex exec` options a caller selects explicitly, such as
# `-m MODEL -c model_reasoning_effort="high"`; empty keeps the host defaults.
native_codex_settings=()
# TCP ports no command of the session may connect to, on any address, such as
# a developer's live database that a case must not reach; the sandbox denies
# them when native_codex_prepare found real Codex.
native_codex_denied_ports=()

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
; A JVM attach handshake: HotSpot keeps it in the per-user temporary
; directory whatever TMPDIR says (Mockito self-attaches this way).
(allow file-write* (regex #"^/private/var/folders/[^/]+/[^/]+/T/\.(attach_pid[0-9]+|java_pid[0-9]+(\.tmp)?)$"))
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
    local port
    for port in "${native_codex_denied_ports[@]}"; do
      native_codex_profile+=$'\n'"(deny network-outbound (remote ip \"*:${port}\"))"
    done
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
  local bypass_hook_trust=${5:-}
  local inner=(
    codex exec --ignore-user-config
    -c "sqlite_home=\"${native_codex_state_dir}\""
    -c "log_dir=\"${native_codex_state_dir}\"" --skip-git-repo-check
    --sandbox danger-full-access "${native_codex_settings[@]}"
  )

  if [[ -n ${transcript} ]]; then
    inner+=(--json)
  fi
  if [[ -n ${bypass_hook_trust} ]]; then
    inner+=(--dangerously-bypass-hook-trust)
  fi
  inner+=(-C "${target}" -o "${output_file}" "${prompt}")
  native_codex_wrap "${inner[@]}"
}

# Continues saved thread THREAD with PROMPT as a JSON stream, under the same
# state, sandbox and settings as native_codex_build_command; `codex exec
# resume` takes no -C, so the caller starts it in the thread's workspace.
native_codex_build_resume_command() {
  local thread=$1
  local output_file=$2
  local prompt=$3
  native_codex_wrap codex exec resume --ignore-user-config \
    -c "sqlite_home=\"${native_codex_state_dir}\"" \
    -c "log_dir=\"${native_codex_state_dir}\"" --skip-git-repo-check \
    -c 'sandbox_mode="danger-full-access"' "${native_codex_settings[@]}" \
    --json -o "${output_file}" "${thread}" "${prompt}"
}

# Sets native_codex_command to the codex command line "$@", inside the
# write-restricting sandbox when native_codex_prepare found real Codex.
native_codex_wrap() {
  local sandbox_arguments
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
      "$@"
    )
  else
    native_codex_command=("$@")
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
