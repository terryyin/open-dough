#!/usr/bin/env bash
# How the closure and execution-review native fixtures observe the agent from
# outside its fixture. Each fixture passes a harness directory apart from the
# project root the agent reads; the node wrapper, the node call log, and the
# fixture's own shims, logs, markers, and transcript live there. The fallback
# observer stop works from the mailbox alone, since the session may already
# have removed the worktree that holds the installed launcher.
# shellcheck disable=SC2034,SC2154,SC2312

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
# node-calls.log, through a node wrapper first on PATH. Codex (host $3) runs
# each command in a login shell whose profile may rebuild PATH without that
# wrapper, so there node also records its own calls through candidate source
# $2's in-process recorder. native_harness_restore undoes both.
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
}

# Fixture fallback: stops every observer in mailbox storage $2 the session
# left running, through candidate source $1's mailbox stop bound to the
# checkout each mailbox recorded, and appends each receipt to $3, which
# exists only when a stop was needed.
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
      const { root } = JSON.parse(readFileSync(`${directory}/request.json`, "utf8"));
      process.stdout.write(`${JSON.stringify(await stopMailbox(directory, { root }))}\n`);
    ' "file://${source_dir}/src/skills/dough-execute-plan/scripts/ci-mailbox-complete.mjs" \
      "${directory}" >> "${forced_stop_file}" || return
  done
}

# A node call reaches the log once, through the PATH wrapper or, where a
# Codex-shaped login shell dropped that wrapper, through the in-process
# recorder; other hosts load no recorder; restore leaves PATH and NODE_OPTIONS
# as they were.
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
}
