#!/usr/bin/env bash
# Credential-free proof that the shared native host stream reader
# (tests/support/native-host-stream.mjs) reads real Claude, Codex, and Cursor
# output: every recorded stream in tests/fixtures/native-streams replays to its
# reviewed started commands, stream status, and response presence, including
# when cut mid-command. Each retained publication attempt also replays its
# journey's stream fields and, where its observations carry today's schema,
# today's verdict. An accepted attempt joins the corpus through one command
# (native-stream-corpus-add.mjs) and replays once reviewed. A guard keeps host
# stream parsing inside that reader.
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

# An accepted paid attempt joins the corpus through one command, and replays
# once its draft expectation is reviewed. Retained attempts are rebuilt from
# corpus entries: the stream unzipped beside the retained provenance.
corpus_add="${source_dir}/tests/support/native-stream-corpus-add.mjs"
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/native-stream-corpus.bash
source "${source_dir}/tests/helpers/native-stream-corpus.bash"
one_shot=cursor/publication/one-shot-result/20260929T035401-179d
updated_use=codex/delivery/updated-use/20260908T034417-3228
retain_attempt "${one_shot}" cursor/publication/one-shot-result/20260929T120000-add1
retain_attempt "${updated_use}" codex/delivery/updated-use/20260929T120000-add2
# A publication journey without stream fields still replays its commands,
# status, and response; its substitute is a real stream retained under that
# journey's case.
fieldless=cursor/publication/publish-boundary/20260929T120000-add4
retain_attempt "${one_shot}" "${fieldless}"
sed 's|^case: .*|case: publication/publish-boundary|' "${corpus}/${one_shot}/record" \
  > "${work_dir}/results/${fieldless}/record"
# Cases of one segment (worktree preparation) and three (delivery evidence)
# join under their own segments.
one_segment=cursor/fresh-node/20260929T120000-add5
three_segments=cursor/delivery-evidence/claims/first-use/20260929T120000-add6
retain_attempt "${one_shot}" "${one_segment}"
sed 's|^case: .*|case: fresh-node|' "${corpus}/${one_shot}/record" \
  > "${work_dir}/results/${one_segment}/record"
retain_attempt "${one_shot}" "${three_segments}"
sed 's|^case: .*|case: delivery-evidence/claims/first-use|' "${corpus}/${one_shot}/record" \
  > "${work_dir}/results/${three_segments}/record"
round_trip="${work_dir}/corpus"
cp -R -- "${corpus}" "${round_trip}"
for attempt in cursor/publication/one-shot-result/20260929T120000-add1 \
  codex/delivery/updated-use/20260929T120000-add2 "${fieldless}" \
  "${one_segment}" "${three_segments}"; do
  node "${corpus_add}" --corpus "${round_trip}" "${work_dir}/results/${attempt}" \
    > "${work_dir}/add.out"
  if grep -q '^review:' "${work_dir}/add.out"; then
    printf 'FAIL: adding accepted %s reported disagreements\n' "${attempt}" >&2
    cat "${work_dir}/add.out" >&2
    exit 1
  fi
  grep -Fxq "added: ${round_trip}/${attempt}" "${work_dir}/add.out"
done
diff <(grep -Ev '^(# draft:|source:|command:)' "${round_trip}/${fieldless}/expected") - << 'FIELDLESS'
stream-status: complete
response: present
last-start-line: 312
verdict: not-replayable: publish-boundary has no stream fields
FIELDLESS
# The drafts match the reviewed expectations of the attempts they came from,
# apart from where the stream was retained.
for draft in "${one_shot}:cursor/publication/one-shot-result/20260929T120000-add1/expected" \
  "${updated_use}:codex/delivery/updated-use/20260929T120000-add2/update-expected" \
  "${updated_use}:codex/delivery/updated-use/20260929T120000-add2/use-expected"; do
  reviewed="${corpus}/${draft%%:*}/$(basename -- "${draft#*:}")"
  diff <(grep -v '^source:' "${reviewed}") \
    <(grep -Ev '^(source:|# draft:)' "${round_trip}/${draft#*:}")
done
# Where the reader disagrees with the retained observations, the command
# reports the field for review: 5692's count is the harness fault of example 1.
disagreeing=cursor/publication/startup-selected-source/20260929T120000-add3
retain_attempt cursor/publication/startup-selected-source/20260923T062849-5692 \
  "${disagreeing}"
node "${corpus_add}" --corpus "${round_trip}" "${work_dir}/results/${disagreeing}" \
  > "${work_dir}/add.out"
diff <(grep '^review:' "${work_dir}/add.out") - << 'REVIEW'
review: expected: startup-cli-count: retained 0, reader 1
REVIEW

# Once reviewed, an added attempt replays; a draft left unreviewed fails
# replay, named, as does its disagreeing field.
for draft in cursor/publication/one-shot-result/20260929T120000-add1/expected \
  codex/delivery/updated-use/20260929T120000-add2/{update,use}-expected \
  "${fieldless}/expected" "${one_segment}/expected" "${three_segments}/expected"; do
  grep -v '^# draft:' "${round_trip}/${draft}" > "${work_dir}/reviewed"
  mv -- "${work_dir}/reviewed" "${round_trip}/${draft}"
done
status=0
node "${replay}" --corpus "${round_trip}" > "${work_dir}/replay.out" || status=$?
[[ -f ${round_trip}/${three_segments}/events.jsonl.gz ]]
diff "${work_dir}/replay.out" - << REPLAY
FAIL: ${disagreeing}/events: expected is an unreviewed draft; review it, then delete its # draft: line
FAIL: ${disagreeing}/events: stream field startup-cli-count is 1, expected 0
REPLAY
[[ ${status} -eq 1 ]]

# An entry still holding a continued command's old double-spaced spelling
# fails replay, naming the entry and the command.
double_spaced="${work_dir}/double-spaced"
cp -R -- "${corpus}" "${double_spaced}"
sed 's|execution-start.mjs start --|execution-start.mjs start  --|' \
  "${corpus}/${one_shot}/expected" > "${double_spaced}/${one_shot}/expected"
status=0
node "${replay}" --corpus "${double_spaced}" > "${work_dir}/replay.out" || status=$?
[[ ${status} -eq 1 ]]
grep -Fq "FAIL: ${one_shot}/events: started command 4 of 13 is " "${work_dir}/replay.out"

# An attempt without a record, a complete stream, or a publication journey is
# refused, naming what is missing, and adds nothing.
retain_attempt "${one_shot}" no-record
rm -- "${work_dir}/results/no-record/record"
expect_refusal no-record 'no record'
retain_attempt "${one_shot}" truncated
head -n 20 "${work_dir}/results/truncated/events.jsonl" > "${work_dir}/head.jsonl"
mv -- "${work_dir}/head.jsonl" "${work_dir}/results/truncated/events.jsonl"
expect_refusal truncated 'stream events.jsonl is truncated, not complete'
retain_attempt "${one_shot}" publication-without-journey
sed 's|^case: .*|case: publication|' "${corpus}/${one_shot}/record" \
  > "${work_dir}/results/publication-without-journey/record"
expect_refusal publication-without-journey 'record names no publication/<journey> case: publication'
retain_attempt "${updated_use}" no-use-stream
rm -- "${work_dir}/results/no-use-stream/use-events.jsonl"
expect_refusal no-use-stream 'stream use-events.jsonl is missing'

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
