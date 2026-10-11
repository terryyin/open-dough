#!/usr/bin/env bash
# Manual-only native feasibility probe for background CI failure wakeup: can a
# non-AI process hand one identified input to the ORIGINAL native session after
# its turn ended, and what happens while that session is busy or waiting.
# No test runner starts it (scripts/test-jobs.sh skips tests/support), and it
# reaches a real host only with an explicit --native HOST.
#
# Usage (Bash 5 first on PATH; ROOT is a private directory outside any
# repository, which keeps the fixture project, logs, and ledger):
#   probe.sh [--root ROOT]                      unpaid prefix: binaries, options,
#                                               listing, fixture trust
#   probe.sh --native claude --root ROOT STEP…  one host step
# Unpaid steps:
#   observe [SESSION_ID [TOKEN]]   the host's listing, and that session's transcript
#   logs|stop|rm SHORT_ID          the host's own command on an owned session
#   screen SHORT_ID                what attaching shows, pressing nothing
#   gh-stand-in                    a `gh` and request owner root for a session's shell
# Paid steps, each ONE model turn recorded in ROOT/ledger.tsv (MODE is a
# --permission-mode value, or `inherit` for the developer's own setting):
#   start-print MODE PROMPT [OPTION…]      a session that exits after its turn
#   start-interactive MODE ACTION…         a terminal session (actions: the PTY helper's)
#   start-bg MODE NAME PROMPT [OPTION…]    a background session, as the dashboard starts one
#   deliver-print SESSION_ID TEXT [OPTION…]  claude -p TEXT --resume SESSION_ID
#   deliver-bg SESSION_ID TEXT [OPTION…]     claude --bg --resume SESSION_ID TEXT
#   deliver-attach SHORT_ID ACTION…          types into `claude attach SHORT_ID`, e.g.
#                                            quiet:3000 text:TEXT sleep:500 key:enter sleep:3000
#
# The route each delivery step takes, as run on Claude Code 2.1.296:
#   probe.sh --native claude --root ROOT start-interactive manual quiet:3000 \
#     key:down key:enter quiet:3000 'text:PROMPT' key:enter sleep:5000 quiet:6000 \
#     text:/exit key:enter sleep:2500     (key:down key:enter accepts the fixture's trust prompt)
#   probe.sh --native claude --root ROOT deliver-print SESSION_ID 'notice TOKEN'
#   probe.sh --native claude --root ROOT start-bg manual NAME PROMPT --allowedTools 'Bash(./task.sh)'
#   probe.sh --native claude --root ROOT stop SHORT_ID
#   probe.sh --native claude --root ROOT deliver-bg SESSION_ID 'notice TOKEN'
#   probe.sh --native claude --root ROOT observe SESSION_ID TOKEN
# A background session continues under its own id only when deliver-bg passes
# no OPTION and the session is stopped; otherwise the host starts a copy.
#
# Budget: PROBE_BUDGET paid steps per ROOT (default 16), smallest model
# (PROBE_MODEL, default haiku), tiny prompts; a spent budget refuses the step.
# Isolation: every session runs in ROOT/project; a step acts only on a session
# ROOT/owned names, so no session of the developer's is resumed, attached,
# stopped, or removed; no "most recent" selector is used. The variables that
# bind a process to the Claude Code session running this probe are cleared.
# Transcripts stay where the host wrote them.
# shellcheck disable=SC2016,SC2310,SC2312
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
support="${source_dir}/tests/support"
budget=${PROBE_BUDGET:-16}
model=${PROBE_MODEL:-haiku}
native='' root=''
while (($#)); do
  case $1 in
    --native) native=$2 && shift 2 ;;
    --root) root=$2 && shift 2 ;;
    *) break ;;
  esac
done

fail() {
  printf 'FAIL: %s\n' "$*" >&2
  exit 1
}

# What binds a child process to the session this probe itself runs in.
session_bound=(CLAUDECODE CLAUDE_CODE_SESSION_ID CLAUDE_CODE_CHILD_SESSION
  CLAUDE_CODE_ENTRYPOINT CLAUDE_CODE_MESSAGING_SOCKET CLAUDE_CODE_MESSAGING_TOKEN
  CLAUDE_CODE_EXECPATH CLAUDE_CODE_SESSION_ATTENDED CLAUDE_JOB_DIR CLAUDE_PID
  CLAUDE_EFFORT AI_AGENT)
unbound() {
  local name cleared=()
  for name in "${session_bound[@]}"; do cleared+=(-u "${name}"); done
  env "${cleared[@]}" "$@"
}

# run LABEL paid|unpaid COMMAND…: runs it in the fixture project with stdin
# closed, keeps its output under ROOT/logs, and records it in the ledger.
run() {
  local label=$1 cost=$2 sequence started status=0
  shift 2
  if [[ ${cost} == paid ]]; then
    local spent
    spent=$(grep -c $'\tpaid\t' "${root}/ledger.tsv" || true)
    ((spent < budget)) || fail "the budget of ${budget} paid steps is spent"
  fi
  sequence=$(printf '%02d' "$(($(wc -l < "${root}/ledger.tsv") + 1))")
  run_output="${root}/logs/${sequence}-${label}"
  started=$(date -u +%FT%TZ)
  (cd -- "${root}/project" && unbound "$@") \
    > "${run_output}.out" 2> "${run_output}.err" < /dev/null || status=$?
  printf '%s\t%s\t%s\t%s\texit=%s\t%s\n' "${sequence}" "${cost}" "${started}" \
    "$(date -u +%FT%TZ)" "${status}" "$(printf '%q ' "$@")" >> "${root}/ledger.tsv"
  printf '== %s %s (%s) exit=%s\n' "${sequence}" "${label}" "${cost}" "${status}"
  head -c 6000 "${run_output}.out"
  head -c 2000 "${run_output}.err" >&2
}

prepare_root() {
  [[ -n ${root} ]] || root=$(mktemp -d "${TMPDIR:-/tmp}/ci-wakeup-probe-XXXXXX")
  mkdir -p "${root}/project" "${root}/logs"
  touch "${root}/ledger.tsv" "${root}/owned"
  root=$(cd -- "${root}" && pwd -P)
  if git -C "${root}" rev-parse --show-toplevel > /dev/null 2>&1; then
    fail "${root} is inside a repository; name a private root outside any"
  fi
  [[ -d ${root}/project/.git ]] || git init -q "${root}/project"
}

own() { printf '%s\n' "$@" >> "${root}/owned"; }
owned() {
  grep -qxF -- "$1" "${root}/owned" || fail "$1 is not a session this probe started"
}
mode_option() {
  [[ $1 == inherit ]] || printf '%s\n%s\n' --permission-mode "$1"
}

claude_prefix() {
  local option
  printf 'claude: %s\n' "$(command -v claude || echo missing)"
  unbound claude --version
  for option in --bg --resume --fork-session --session-id --input-format \
    --permission-mode --print attach logs stop rm agents; do
    unbound claude --help | grep -q -- "${option}" \
      && printf 'offered: %s\n' "${option}" || printf 'NOT offered: %s\n' "${option}"
  done
  printf 'fixture: %s\ntrust recorded for it or a parent: ' "${root}/project"
  node -e 'const [file, fixture] = process.argv.slice(1);
    const { projects = {} } = JSON.parse(require("fs").readFileSync(file, "utf8"));
    console.log(Object.entries(projects).some(([folder, { hasTrustDialogAccepted }]) =>
      hasTrustDialogAccepted && (fixture + "/").startsWith(folder + "/")));' \
    "${HOME}/.claude.json" "${root}/project"
  run listing unpaid claude agents --json --all --cwd "${root}/project"
}

# The short id a background start printed, and its session id from the listing.
claude_own_background() {
  local short
  short=$(sed -E 's/\x1b\[[0-9;]*m//g' "${run_output}.out" \
    | sed -nE 's/^.*backgrounded[^·]*· *([A-Za-z0-9-]+).*$/\1/p' | head -1)
  [[ -n ${short} ]] || return 0
  own "${short}"
  unbound claude agents --json --all --cwd "${root}/project" \
    | node -e 'const listed = JSON.parse(require("fs").readFileSync(0, "utf8"));
      const found = listed.find(({ id }) => id === process.argv[1]);
      if (found) console.log(found.sessionId);' "${short}" >> "${root}/owned"
  printf 'owned: %s\n' "$(tail -2 "${root}/owned" | tr '\n' ' ')"
}

claude_transcript() {
  find "${HOME}/.claude/projects" -name "$1.jsonl" -not -path '*/subagents/*' | head -1
}

claude_step() {
  local step=${1:-} id modes=()
  (($#)) && shift
  case ${step} in
    observe)
      run listing unpaid claude agents --json --all --cwd "${root}/project"
      [[ -n ${1:-} ]] || return 0
      owned "$1"
      id=$(claude_transcript "$1")
      [[ -n ${id} ]] || fail "no transcript for $1"
      node "${support}/background-ci-wakeup-native-transcript.mjs" "${id}" "${@:2}"
      ;;
    logs | stop | rm)
      owned "$1"
      run "${step}" unpaid claude "${step}" "$1"
      ;;
    screen)
      owned "$1"
      run screen unpaid node "${support}/background-ci-wakeup-native-pty.mjs" \
        "${root}/project" "${root}/logs/screen-$1-$(date +%s).txt" quiet:3000 -- claude attach "$1"
      ;;
    gh-stand-in)
      mkdir -p "${root}/gh"
      printf '%s\n' '#!/usr/bin/env bash' \
        'printf "%s\n" "$*" >> "$(dirname -- "$0")/calls.log"' \
        '[[ $1 != auth ]] || { printf secret-probe; exit 0; }' \
        'printf "HTTP/2.0 200 OK\r\n\r\n%s" '\''{"id":7001,"name":"CI","path":".github/workflows/ci.yml","state":"active"}'\' \
        > "${root}/gh/gh"
      chmod +x "${root}/gh/gh"
      printf 'DOUGH_GITHUB_REQUEST_OWNER_ROOT=%s PATH=%s:$PATH node %s workflow owner/repo\n' \
        "$(mktemp -d /tmp/ghr-XXXXXX)" "${root}/gh" \
        "${source_dir}/src/skills/dough-execute-plan/scripts/ci-github-diagnostic.mjs"
      ;;
    start-print)
      id=$(uuidgen | tr '[:upper:]' '[:lower:]')
      own "${id}"
      mapfile -t modes < <(mode_option "$1")
      run start-print paid claude -p "$2" --session-id "${id}" --model "${model}" \
        "${modes[@]}" --output-format stream-json --verbose "${@:3}"
      printf '\nsession: %s\n' "${id}"
      ;;
    start-interactive)
      id=$(uuidgen | tr '[:upper:]' '[:lower:]')
      own "${id}"
      mapfile -t modes < <(mode_option "$1")
      run start-interactive paid node "${support}/background-ci-wakeup-native-pty.mjs" \
        "${root}/project" "${root}/logs/interactive-${id}.txt" "${@:2}" \
        -- claude --session-id "${id}" --model "${model}" "${modes[@]}"
      printf 'session: %s\n' "${id}"
      ;;
    start-bg)
      mapfile -t modes < <(mode_option "$1")
      run start-bg paid claude --bg --name "$2" --model "${model}" "${modes[@]}" "$3" "${@:4}"
      claude_own_background
      ;;
    deliver-print)
      owned "$1"
      run deliver-print paid claude -p "$2" --resume "$1" --model "${model}" \
        --output-format stream-json --verbose "${@:3}"
      ;;
    deliver-bg)
      owned "$1"
      run deliver-bg paid claude --bg --resume "$1" "$2" "${@:3}"
      claude_own_background
      ;;
    deliver-attach)
      owned "$1"
      run deliver-attach paid node "${support}/background-ci-wakeup-native-pty.mjs" \
        "${root}/project" "${root}/logs/attach-$1-$(date +%s).txt" "${@:2}" \
        -- claude attach "$1"
      ;;
    *) fail "unknown claude step '${step}'; see the usage at the top of this file" ;;
  esac
}

prepare_root
printf 'root: %s\n' "${root}"
case ${native} in
  '') claude_prefix ;;
  claude) claude_step "$@" ;;
  *) fail "no probe for host '${native}' yet; only claude was run" ;;
esac
