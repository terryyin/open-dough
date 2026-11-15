#!/usr/bin/env bash
# Test-only recorder and login-shell shim counterexamples.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

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
  find "${source_dir}/Distribution/tests/support" "${source_dir}/Distribution/evaluation/src" \
    "${source_dir}/Distribution/evaluation/cases" -type f -name '*.sh' \
    -exec grep -ohE '\$\{harness\}/bin/[A-Za-z0-9_.-]+' {} + \
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
