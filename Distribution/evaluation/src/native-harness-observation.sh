#!/usr/bin/env bash
# How the closure and execution-review native fixtures observe the agent from
# outside its fixture. Each fixture passes a harness directory apart from the
# project root the agent reads; the node wrapper, the node call log, and the
# fixture's own shims, logs, markers, and transcript live there. The fallback
# observer stop works from the mailbox alone, since the session may already
# have removed the worktree that holds the installed launcher.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=Distribution/evaluation/src/native-harness-login-shell.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/." && pwd)/native-harness-login-shell.sh"
# shellcheck source=Distribution/tests/helpers/private-request-owner.bash
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../tests/helpers" && pwd)/private-request-owner.bash"

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
# candidate source $2's in-process recorder. Whatever asks a fixture's gh shim
# asks it through a GitHub request owner of this harness's own.
# native_harness_restore undoes all and ends that owner.
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
  enter_private_request_owner
  native_harness_keep_login_path "${harness}"
  [[ ${host} == codex ]] || return 0
  cp -- "${source_dir}/Distribution/evaluation/src/native-node-call-recorder.mjs" "${harness}/bin/"
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
  leave_private_request_owner
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
    ' "file://${source_dir}/Distribution/src/skills/dough-execute-plan/scripts/ci-mailbox-complete.mjs" \
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
