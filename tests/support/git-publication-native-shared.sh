#!/usr/bin/env bash
# Shared by publication journeys: adopting the coordinates a Node fixture
# script prints, recording what origin accepts, ordering run markers, reading
# the backlog and checkouts a session left, and listing the startup commands
# and command outputs a session ran. Sourced by the runner.
# shellcheck disable=SC2034,SC2312 # Runner-consumed globals; observations tolerate failed Git reads.

# Adopts prepared fixture JSON $1: {root, origin, integration, workspace, base}.
git_publication_fixture_adopt_prepared() {
  local prepared=$1
  git_publication_fixture_root=$(jq -r .root <<< "${prepared}")
  git_publication_fixture_origin=$(jq -r .origin <<< "${prepared}")
  git_publication_fixture_integration=$(jq -r .integration <<< "${prepared}")
  git_publication_fixture_workspace=$(jq -r .workspace <<< "${prepared}")
  git_publication_fixture_trunk_sha=$(jq -r .base <<< "${prepared}")
  git_publication_fixture_candidate_sha=
}

# Makes bare repository $1 append every `old new ref` line it accepts to
# $2/push.log, and leave the timestamped marker $2/claim-accepted at its first
# accepted trunk push.
git_publication_record_pushes() {
  local origin=$1 root=$2
  : > "${root}/push.log"
  cat > "${origin}/hooks/post-receive" << EOF
#!/bin/sh
while read -r old new ref; do
  printf '%s %s %s\n' "\${old}" "\${new}" "\${ref}" >> '${root}/push.log'
  if [ "\${ref}" = refs/heads/main ] && [ ! -e '${root}/claim-accepted' ]; then
    touch '${root}/claim-accepted'
  fi
done
EOF
  chmod +x "${origin}/hooks/post-receive"
}

# True when files $1, $2, ... all exist and their modification times never
# decrease.
git_publication_in_order() {
  node -e '
    const fs = require("fs");
    const times = process.argv.slice(1).map((path) => fs.statSync(path, { bigint: true }).mtimeNs);
    process.exit(times.every((time, index) => index === 0 || time >= times[index - 1]) ? 0 : 1);
  ' "$@" 2> /dev/null
}

# True when revision $2 of repository $1 lists identity $3 under Taken.
git_publication_lists_taken() {
  git -C "$1" show "$2:.planning/PRODUCT-BACKLOG.md" 2> /dev/null | awk -v identity="$3" '
    /^## Taken$/ { inside = 1; next }
    /^## / && inside { exit }
    inside && index($0, identity) { found = 1 }
    END { exit !found }'
}

# Checkouts bare repository $1 lists besides its own Git directory, sorted.
git_publication_other_checkouts() {
  git -C "$1" worktree list --porcelain 2> /dev/null | sed -n 's/^worktree //p' \
    | grep -Fvx "$1" | LC_ALL=C sort || true
}

# Prints true when $1 is still a bare repository Git directory, else false.
git_publication_repository_intact() {
  [[ $(git -C "$1" rev-parse --is-bare-repository 2> /dev/null) == true ]] \
    && echo true || echo false
}

# Distinct execution-start invocations transcript $1 shows, in any stream
# shape: each command with its line continuations joined, split at its
# command separators, without --help probes.
git_publication_transcript_start_commands() {
  # shellcheck disable=SC2016 # jq program, not shell expansion.
  jq -r '.. | objects | .command? // empty | strings
    | gsub("\\\\\n[ \t]*"; " ") | splits("&&|\\|\\||[;|\n]")
    | gsub("^[ \t]+|[ \t]+$"; "")' "$1" 2> /dev/null \
    | grep -F 'execution-start.mjs start' | grep -Fv -- '--help' | sort -u || true
}

# Every command output transcript $1 shows, in either stream shape.
git_publication_transcript_outputs() {
  jq -r 'select(.type == "item.completed" and .item.type == "command_execution") | .item.aggregated_output // empty' "$1" 2> /dev/null || true
  jq -r 'select(.type == "user") | .message.content[]? | select(.type == "tool_result") | (.content | if type == "string" then . else tostring end)' "$1" 2> /dev/null || true
  jq -r '.. | objects | .stdout? // empty | strings' "$1" 2> /dev/null || true
}
