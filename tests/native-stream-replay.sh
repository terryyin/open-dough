#!/usr/bin/env bash
# Credential-free proof that the shared native host stream reader
# (tests/support/native-host-stream.mjs) reads real Claude, Codex, and Cursor
# output: every recorded stream in tests/fixtures/native-streams replays to its
# reviewed started commands, stream status, and response presence, including
# when cut mid-command. Each retained publication attempt also replays its
# journey's stream fields and, where its observations carry today's schema,
# today's verdict. A guard keeps host stream parsing inside that reader.
# Replay proves the harness, not native behavior (ADR 0005 section 2).
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

# A broken reader or stream-field function fails replay. Every failure it
# causes matches the pattern (only the broken host's entries, or only the
# changed field), and each example entry is named with the difference it shows.
expect_counterexample() {
  local variant=$1 pattern=$2 output="${work_dir}/$1.out" status=0 example
  shift 2
  node "${replay}" --variant "${variant}" > "${output}" || status=$?
  if [[ ${status} -ne 1 ]]; then
    printf 'FAIL: replay through the %s variant exited %s, expected 1\n' \
      "${variant}" "${status}" >&2
    cat "${output}" >&2
    return 1
  fi
  if grep -Ev "${pattern}" "${output}" | grep -q .; then
    printf 'FAIL: the %s variant failed beyond %s\n' "${variant}" "${pattern}" >&2
    cat "${output}" >&2
    return 1
  fi
  for example in "$@"; do
    if ! grep -Fq "FAIL: ${example}" "${output}"; then
      printf 'FAIL: the %s variant did not fail, naming it, %s\n' \
        "${variant}" "${example}" >&2
      cat "${output}" >&2
      return 1
    fi
  done
}

# Reading Codex commands only from item completion loses a command still
# running when the stream ends.
expect_counterexample codex-completed-only '^FAIL: codex/' \
  'codex/publication/startup-trunk/20260923T062909-023d/events: cut after its last started command: started command 19 of 19 is null'
# Dropping Cursor tool calls loses every Cursor command.
expect_counterexample cursor-without-tool-call '^FAIL: cursor/' \
  'cursor/publication/startup-selected-source/20260923T062849-5692/events: started command 1 of 5 is null'

# A stream-field function whose startup count differs from the reviewed one
# fails every publication attempt that counts startup calls, naming the field.
expect_counterexample startup-count-plus-one \
  '^FAIL: [a-z]+/publication/[a-z-]+/[0-9T]+-[0-9a-f]+/events: stream field startup-cli-count is ' \
  'cursor/publication/startup-selected-source/20260923T062849-5692/events: stream field startup-cli-count is 2, expected 1'
# A stream-field function that misses the admission call fails that field,
# and the verdict reassessed from it fails too.
expect_counterexample admit-unobserved \
  '^FAIL: cursor/publication/admission-investigation/20260929T035934-4301/events: ' \
  'cursor/publication/admission-investigation/20260929T035934-4301/events: stream field admit-cli-observed is false, expected true' \
  'cursor/publication/admission-investigation/20260929T035934-4301/events: verdict is fail / investigation started before its admission reached remote trunk, expected pass / accepted investigation was admitted to remote Taken before its first probe'

# Host streams are parsed only by the shared reader: every other file holding a
# host-event literal is a listed shape writer, and every listed writer holds one.
guard="${source_dir}/tests/support/native-stream-guard.mjs"
node "${guard}"

# The guard runs over a tree holding just the listed writers, plus one
# counterexample at a time, and must fail naming exactly that counterexample.
expect_guard_failure() {
  local tree=$1 expected=$2 output="${work_dir}/guard.out" status=0
  node "${guard}" --root "${tree}" > "${output}" || status=$?
  if [[ ${status} -ne 1 ]] || [[ $(cat "${output}") != "FAIL: ${expected}" ]]; then
    printf 'FAIL: the guard exited %s over %s, expected only FAIL: %s\n' \
      "${status}" "${tree}" "${expected}" >&2
    cat "${output}" >&2
    return 1
  fi
}
tree="${work_dir}/guard-tree"
git init -q "${tree}"
while IFS= read -r writer; do
  mkdir -p "${tree}/$(dirname -- "${writer}")"
  cp -- "${source_dir}/${writer}" "${tree}/${writer}"
done < <(node "${guard}" --writers)
node "${guard}" --root "${tree}"

# A new journey whose observation greps a Codex started event itself.
stray=tests/support/stray-journey-observe.sh
cat > "${tree}/${stray}" << 'STRAY'
#!/usr/bin/env bash
grep -c '"type":"item.started"' "$1"
STRAY
expect_guard_failure "${tree}" "${stray}:2: host-event literal item.started outside the shared reader; read the stream through tests/support/native-host-stream.mjs"
rm -- "${tree}/${stray}"

# A listed writer that no longer writes a host shape leaves the list stale.
stale=tests/native-run-workspace-isolation.sh
: > "${tree}/${stale}"
expect_guard_failure "${tree}" "${stale}: listed as a shape writer but holds no host-event literal; remove it from the list"
