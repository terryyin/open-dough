#!/usr/bin/env bash
# Credential-free proof that the shared native host stream reader
# (tests/support/native-host-stream.mjs) reads real Claude, Codex, and Cursor
# output: every recorded stream in tests/fixtures/native-streams replays to its
# reviewed started commands, stream status, and response presence, including
# when cut mid-command. Replay proves the reader, not native behavior (ADR 0005
# section 2).
# shellcheck disable=SC2312 # Captured reader output is checked by value.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
replay="${source_dir}/tests/support/native-stream-replay.mjs"
reader="${source_dir}/tests/support/native-host-stream.mjs"
corpus="${source_dir}/tests/fixtures/native-streams"
work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT

# Every corpus entry replays as reviewed, and each host has entries.
node "${replay}"

# A weekly-limit stop is a complete stream in which no command started.
for attempt in \
  claude/publication/startup-story-branch/20260923T062305-679c \
  claude/publication/startup-resume/20260923T044643-3342; do
  stream="${corpus}/${attempt}/events.jsonl.gz"
  [[ $(node "${reader}" claude "${stream}" status) == complete ]]
  [[ -z $(node "${reader}" claude "${stream}" commands) ]]
  grep -Fq 'weekly limit' <(node "${reader}" claude "${stream}" response)
done

# A reader that fails to recognize one host's commands fails replay, naming
# that host's entries and no other host's. Each variant's example entry is
# named with the difference the broken reader shows.
expect_counterexample() {
  local variant=$1 host=$2 example=$3 output="${work_dir}/$1.out" status=0
  node "${replay}" --variant "${variant}" > "${output}" || status=$?
  if [[ ${status} -ne 1 ]]; then
    printf 'FAIL: replay through the %s reader exited %s, expected 1\n' \
      "${variant}" "${status}" >&2
    cat "${output}" >&2
    return 1
  fi
  if grep -v "^FAIL: ${host}/" "${output}" | grep -q .; then
    printf 'FAIL: the %s reader failed entries of other hosts\n' \
      "${variant}" >&2
    cat "${output}" >&2
    return 1
  fi
  if ! grep -Fq "FAIL: ${example}" "${output}"; then
    printf 'FAIL: the %s reader did not fail, naming it, %s\n' \
      "${variant}" "${example}" >&2
    cat "${output}" >&2
    return 1
  fi
}

# Reading Codex commands only from item completion loses a command still
# running when the stream ends.
expect_counterexample codex-completed-only codex \
  'codex/publication/startup-trunk/20260923T062909-023d/events: cut after its last started command: started command 19 of 19 is null'
# Dropping Cursor tool calls loses every Cursor command.
expect_counterexample cursor-without-tool-call cursor \
  'cursor/publication/startup-selected-source/20260923T062849-5692/events: started command 1 of 5 is null'
