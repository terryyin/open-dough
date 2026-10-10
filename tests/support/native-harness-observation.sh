#!/usr/bin/env bash
# How the closure and execution-review native fixtures observe the agent from
# outside its fixture. Each fixture passes a harness directory apart from the
# project root the agent reads; the node wrapper, the node call log, and the
# fixture's own shims, logs, markers, and transcript live there. The fallback
# observer stop works from the mailbox alone, since the session may already
# have removed the worktree that holds the installed launcher.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/native-harness-login-shell.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-harness-login-shell.sh"

# Writes to $1 a node wrapper that appends each call to $NATIVE_NODE_CALL_LOG
# and then runs real node $2 in its own process.
native_harness_write_node() {
  local destination=$1 real_node_q
  printf -v real_node_q '%q' "$2"
  # shellcheck disable=SC2016 # Variables belong to the generated shim.
  printf '%s\n' \
    '#!/usr/bin/env bash' \
    'set -euo pipefail' \
    'printf "%s\n" "$*" >> "${NATIVE_NODE_CALL_LOG}"' \
    'export NATIVE_NODE_WRAPPED_PID=$$' \
    "exec ${real_node_q} \"\$@\"" > "${destination}"
  chmod +x "${destination}"
}

# Records node calls into ${native_harness_node_log}, harness directory $1's
# node-calls.log, through a node wrapper first on PATH, and keeps $1/bin, where
# fixtures also put shims such as gh, first in the agent's zsh login shell.
# Codex (host $3) runs each command in a login shell whose profile may rebuild
# PATH without that wrapper, so there node also records its own calls through
# candidate source $2's in-process recorder. native_harness_restore undoes all.
native_harness_observe_node() {
  local harness=$1 source_dir=$2 host=$3 real_node
  real_node=$(command -v node)
  native_harness_node_log="${harness}/node-calls.log"
  mkdir -p "${harness}/bin"
  : > "${native_harness_node_log}"
  native_harness_write_node "${harness}/bin/node" "${real_node}"
  native_harness_old_path=${PATH}
  native_harness_old_node_options=${NODE_OPTIONS-}
  native_harness_recording=false
  export PATH="${harness}/bin:${PATH}"
  export NATIVE_NODE_CALL_LOG=${native_harness_node_log}
  native_harness_keep_login_path "${harness}"
  [[ ${host} == codex ]] || return 0
  cp -- "${source_dir}/tests/support/native-node-call-recorder.mjs" "${harness}/bin/"
  native_harness_recording=true
  export NODE_OPTIONS="${NODE_OPTIONS:+${NODE_OPTIONS} }--import=file://${harness}/bin/native-node-call-recorder.mjs"
}

native_harness_restore() {
  export PATH=${native_harness_old_path}
  if [[ ${native_harness_recording} == true ]]; then
    export NODE_OPTIONS=${native_harness_old_node_options}
    [[ -n ${NODE_OPTIONS} ]] || unset NODE_OPTIONS
  fi
  unset NATIVE_NODE_CALL_LOG
  native_harness_release_login_path
}

# Fixture fallback: stops every observer in mailbox storage $2 the session
# left running, through candidate source $1's mailbox stop bound to the
# checkout identity each mailbox recorded, and appends each receipt to $3,
# which exists only when a stop was needed.
native_harness_stop_observers() {
  local source_dir=$1 storage=$2 forced_stop_file=$3 directory
  for directory in "${storage}"/*; do
    [[ -f ${directory}/request.json && ! -f ${directory}/result.json ]] \
      || continue
    # shellcheck disable=SC2016 # Node source, not shell expansion.
    node --input-type=module -e '
      import { readFileSync } from "node:fs";
      const [module, directory] = process.argv.slice(1);
      const { stopMailbox } = await import(module);
      const { identity } = JSON.parse(readFileSync(`${directory}/request.json`, "utf8"));
      process.stdout.write(`${JSON.stringify(await stopMailbox(directory, { root: identity }))}\n`);
    ' "file://${source_dir}/src/skills/dough-execute-plan/scripts/ci-mailbox-complete.mjs" \
      "${directory}" >> "${forced_stop_file}" || return
  done
}

# A node call reaches the log once, through the PATH wrapper or, where a
# Codex-shaped login shell dropped that wrapper, through the in-process
# recorder; other hosts load no recorder; restore leaves PATH and NODE_OPTIONS
# as they were. Every shim the fixtures write stays first in the agent's login
# shell under a profile that puts decoys first and one that rebuilds PATH; a
# harness without native_harness_keep_login_path fails naming each shim and
# profile.
run_native_harness_counterexamples() {
  local work real_node path_before=${PATH} options_before=${NODE_OPTIONS-unset}
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  real_node=$(command -v node)
  native_harness_observe_node "${work}/codex" "${source_dir}" codex
  PATH=${path_before} bash -c '"$1" -e "" direct-call && "$2" -e "" wrapped-call' \
    _ "${real_node}" "${work}/codex/bin/node"
  native_harness_restore
  [[ $(grep -c 'direct-call' "${work}/codex/node-calls.log") == 1 ]]
  [[ $(grep -c 'wrapped-call' "${work}/codex/node-calls.log") == 1 ]]
  [[ ${PATH} == "${path_before}" && ${NODE_OPTIONS-unset} == "${options_before}" ]]
  [[ -z ${NATIVE_NODE_CALL_LOG-} ]]
  native_harness_observe_node "${work}/claude" "${source_dir}" claude
  [[ ${NODE_OPTIONS-unset} == "${options_before}" ]]
  PATH=${path_before} bash -c '"$1" -e "" direct-call && "$2" -e "" wrapped-call' \
    _ "${real_node}" "${work}/claude/bin/node"
  native_harness_restore
  [[ $(grep -c 'direct-call' "${work}/claude/node-calls.log") == 0 ]]
  [[ $(grep -c 'wrapped-call' "${work}/claude/node-calls.log") == 1 ]]
  native_harness_login_counterexample "${work}"
}

# Names of the shims the native fixtures write into their harness bin, read
# from every harness-bin path the support sources spell, so a new shim is
# checked without a list to keep; files such as the node recorder are skipped.
native_harness_shim_names() {
  grep -ohE '\$\{harness\}/bin/[A-Za-z0-9_.-]+' "${source_dir}"/tests/support/*.sh \
    | sed 's|.*/||' | grep -v '\.' | sort -u
}

# Sets up harness $1 as a closure fixture does, observing node and then
# writing each other shim in $2...
native_harness_setup_with_shims() {
  local harness=$1 name
  shift
  native_harness_observe_node "${harness}" "${source_dir}" codex
  for name in "$@"; do
    [[ -e ${harness}/bin/${name} ]] && continue
    printf '%s\n' '#!/usr/bin/env bash' > "${harness}/bin/${name}"
    chmod +x "${harness}/bin/${name}"
  done
}

# The same harness, set up without native_harness_keep_login_path.
native_harness_setup_without_login_path() {
  native_harness_setup_with_shims "$@"
  native_harness_release_login_path
}

# The user profiles the login-shell check writes: one putting decoys first and
# one rebuilding PATH.
native_harness_login_profiles=(decoy-prepend rebuilt-path)

# Under each user profile in work directory $2, sets up a harness through
# setup function $1 with shims $3... and prints a FAIL line for each shim the
# emulated login shell resolves elsewhere; fails when any line was printed.
native_harness_check_login_shims() {
  local setup=$1 work=$2 kind profile harness name found failed=0
  shift 2
  for kind in "${native_harness_login_profiles[@]}"; do
    profile="${work}/${kind}/profile"
    harness="${work}/${kind}/harness"
    if [[ ${kind} == decoy-prepend ]]; then
      native_harness_write_decoy_profile "${profile}" "$@"
    else
      native_harness_write_rebuilt_profile "${profile}"
    fi
    local -x ZDOTDIR=${profile}
    "${setup}" "${harness}" "$@"
    for name in "$@"; do
      found=$(native_harness_login_shell "command -v ${name}" || true)
      [[ ${found} == "${harness}/bin/${name}" ]] && continue
      printf 'FAIL: %s profile: the login shell resolved shim %s to %s\n' \
        "${kind}" "${name}" "${found:-nothing}" >&2
      failed=1
    done
    native_harness_restore
    [[ ${ZDOTDIR} == "${profile}" ]]
  done
  return "${failed}"
}

native_harness_login_counterexample() {
  local work=$1 path_before=${PATH} options_before=${NODE_OPTIONS-unset}
  local zdotdir_before=${ZDOTDIR-unset} kind name errors
  local -a names
  mapfile -t names < <(native_harness_shim_names)
  [[ " ${names[*]} " == *' node '* ]] || {
    printf 'FAIL: fixture shim names not found (got: %s)\n' "${names[*]}" >&2
    return 1
  }
  native_harness_check_login_shims native_harness_setup_with_shims \
    "${work}/kept" "${names[@]}"
  if errors=$(native_harness_check_login_shims \
    native_harness_setup_without_login_path "${work}/unkept" "${names[@]}" 2>&1); then
    printf 'FAIL: a harness without the login path kept every shim\n' >&2
    return 1
  fi
  for kind in "${native_harness_login_profiles[@]}"; do
    for name in "${names[@]}"; do
      [[ ${errors} == *"FAIL: ${kind} profile: the login shell resolved shim ${name} to "* ]] || {
        printf 'FAIL: unnamed lost shim %s under %s profile:\n%s\n' \
          "${name}" "${kind}" "${errors}" >&2
        return 1
      }
    done
  done
  [[ ${PATH} == "${path_before}" && ${NODE_OPTIONS-unset} == "${options_before}" ]]
  [[ ${ZDOTDIR-unset} == "${zdotdir_before}" ]]
}
