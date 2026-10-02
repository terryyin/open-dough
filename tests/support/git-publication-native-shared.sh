#!/usr/bin/env bash
# Shared by publication journeys: adopting the coordinates a Node fixture
# script prints, recording what origin accepts, ordering run markers, reading
# the backlog and checkouts a session left, reading a journey's
# stream-derived observation fields, and hashing the inputs a closing
# journey's evidence identity covers. Sourced by the runner.
# shellcheck disable=SC2034,SC2312 # Runner-consumed globals; observations tolerate failed Git reads.

# shellcheck source=tests/support/native-import-closure.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-import-closure.sh"

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

# True when revision $2 of repository $1 lists identity $3 under Taken. The
# backlog is read whole, so Git cannot die of SIGPIPE and fail the pipeline.
git_publication_lists_taken() {
  git -C "$1" show "$2:.planning/PRODUCT-BACKLOG.md" 2> /dev/null | awk -v identity="$3" '
    /^## Taken$/ && !done { inside = 1; next }
    /^## / && inside { inside = 0; done = 1 }
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

git_publication_stream_fields_cli="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-stream-fields.mjs"

# The observation fields journey $1 derives from host $2's stream $3 (plus
# command log $4 where the journey reads one), as `key: value` lines.
git_publication_stream_fields() {
  node "${git_publication_stream_fields_cli}" "$@"
}

# The value of key $2 among `key: value` lines $1.
git_publication_field_value() {
  sed -n "s/^$2: //p" <<< "$1" | head -n 1
}

# One input-hash line per input a closing journey exercises: Dough Land's
# guidance and the references it follows, then one per module in the command
# closure of Land's publication check and retirement command and the journey's other given `.mjs`
# commands, including the scripts those modules spawn.
git_publication_closing_input_hash_lines() {
  native_result_input_hash_lines \
    src/skills/dough-land/SKILL.md \
    src/skills/dough-land/references/completion-attention.md \
    src/skills/dough-land/references/dashboard-completion.md \
    src/skills/dough-manual-testing/references/exploration-workspace.md \
    src/skills/dough-execute-plan/references/maintain-default-checkout.md
  native_import_closure_input_hash_lines \
    src/skills/dough-land/scripts/queued-closure-check.mjs \
    src/skills/dough-land/scripts/worktree-retirement.mjs \
    src/skills/dough-execute-plan/scripts/dashboard-completion.mjs "$@"
}
