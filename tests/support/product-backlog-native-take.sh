#!/usr/bin/env bash
# Fresh Claude Code proof that planned execution claims the queue through the
# installed product-backlog writer rather than constructing a Taken entry.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals cross the sourced harness.

# shellcheck source=tests/support/native-host-stream.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-host-stream.sh"

# shellcheck source=tests/support/product-backlog-native-take-fixture.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/product-backlog-native-take-fixture.sh"
# shellcheck source=tests/support/native-result-identity.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-result-identity.sh"
# shellcheck source=tests/support/native-import-closure.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-import-closure.sh"

take_write_evidence_inputs() {
  native_result_input_hash_lines \
    install.sh \
    tests/product-backlog-native.sh \
    tests/support/product-backlog-native-take.sh \
    tests/support/product-backlog-native-take-fixture.sh \
    tests/support/product-backlog-native-evidence.sh \
    tests/support/product-backlog-native-guard.sh \
    tests/support/native-host-stream.sh \
    tests/support/native-result-identity.sh \
    tests/support/native-import-closure.sh \
    tests/support/native-import-closure.mjs
  native_import_closure_input_hash_lines \
    tests/support/render-published-backlog.mjs \
    tests/support/native-host-stream.mjs \
    src/skills/dough-product-backlog/scripts/product-backlog.mjs
}

take_cleanup() {
  product_backlog_native_cleanup "$?" 'Claude Code take' 'native-take-*' \
    "${temporary_dir}"
}

# One `<tool>\t<command or path>` line per tool call in the Claude stream:
# `Bash` with each started command, then each other tool with the file it
# names.
take_extract_calls() {
  local transcript=$1
  local calls=$2
  {
    native_host_stream claude "${transcript}" commands \
      | jq -r '["Bash", .] | @tsv'
    native_host_stream claude "${transcript}" tools \
      | jq -r '[.name, (.input.file_path // .input.path // "")] | @tsv'
  } > "${calls}"
}

take_assert_installed_writer_call() {
  local calls=$1
  local call
  # The installed script path, quoted by the shell or not, then `take`.
  local take='\.claude/skills/dough-product-backlog/scripts/product-backlog\.mjs["'"'"']?[[:space:]]+["'"'"']?take([[:space:]"'"'"']|$)'
  while IFS= read -r call; do
    if [[ ${call} =~ ${take} ]] \
      && grep -Fq -- '--identity' <<< "${call}" \
      && grep -Fq -- "${take_identity}" <<< "${call}" \
      && grep -Fq -- '--plan' <<< "${call}" \
      && grep -Fq -- "${take_plan_from_backlog}" <<< "${call}"; then
      return 0
    fi
  done < "${calls}"
  echo 'FAIL: native transcript did not show one installed take operation with the selected identity and plan.' >&2
  return 1
}

take_assert_no_hand_write() {
  local calls=$1
  if grep -Fq 'record-state' "${calls}"; then
    echo 'FAIL: native take journey invoked record-state.' >&2
    return 1
  fi
  if grep -E '^(Edit|Write|MultiEdit|NotebookEdit)[[:space:]].*\.planning/PRODUCT-BACKLOG\.md' \
    "${calls}" > /dev/null; then
    echo 'FAIL: native take journey attempted to construct the backlog entry with a native edit tool.' >&2
    return 1
  fi
  if grep -E '^Bash[[:space:]].*(python|python3).*\.planning/PRODUCT-BACKLOG\.md' \
    "${calls}" > /dev/null \
    || grep -E '^Bash[[:space:]].*(>|>>)[[:space:]]*[^[:space:]]*\.planning/PRODUCT-BACKLOG\.md' \
      "${calls}" > /dev/null; then
    echo 'FAIL: native take journey attempted to construct the backlog entry with Python or shell redirection.' >&2
    return 1
  fi
}

take_assert_backlog() {
  local target=$1
  local parser="${target}/.claude/skills/dough-product-backlog/scripts/product-backlog-document.mjs"
  node --input-type=module - "${parser}" "${target}/${take_backlog_rel}" \
    "${take_identity}" "${take_plan_from_backlog}" << 'EOF'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const [, , parserPath, backlogPath, identity, plan] = process.argv;
const { parseBacklog } = await import(pathToFileURL(parserPath).href);
const document = parseBacklog(readFileSync(backlogPath, "utf8"));
const matches = document.entries.filter((entry) => entry.identity === identity);
assert.equal(matches.length, 1, "backlog should contain the selected identity once");
assert.equal(matches[0].list, "Taken", "selected story should be Taken");
assert.deepEqual(matches[0].plan, { label: "plan", target: plan });
EOF
}

take_run_native() {
  local source_dir=$1
  local target transcript output calls state_before evidence_inputs
  temporary_dir=$(mktemp -d)
  trap take_cleanup EXIT
  evidence_inputs="${temporary_dir}/native-take-inputs.txt"
  take_write_evidence_inputs > "${evidence_inputs}"
  target="${temporary_dir}/project"
  mkdir -p -- "${target}"
  take_write_fixture "${target}"

  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform claude > /dev/null
  guard_assert_registered "${target}" claude
  take_record_preparation "${target}"

  state_before="${temporary_dir}/native-take-story-before.md"
  cp -- "${target}/${take_seed_rel}" "${state_before}"
  git -C "${target}" init --quiet -b main
  git -C "${target}" -c user.name='Take fixture' \
    -c user.email='fixture@example.invalid' add -A
  git -C "${target}" -c user.name='Take fixture' \
    -c user.email='fixture@example.invalid' commit --quiet -m 'fixture: queued planned story'

  transcript="${temporary_dir}/native-take-transcript.jsonl"
  output="${temporary_dir}/native-take-output.md"
  calls="${temporary_dir}/native-take-calls.txt"
  (
    cd -- "${target}" || exit
    claude --print --dangerously-skip-permissions --no-session-persistence \
      --output-format stream-json --verbose \
      "Start the queued story ‘Publish the native claim’ using its resolved executable plan on the current branch. This acceptance check ends immediately after the backlog claim is made: do not stage, commit, publish, implement, or change the plan. Report what you did."
  ) > "${transcript}" 2> "${temporary_dir}/native-take-stderr.txt"
  native_host_stream claude "${transcript}" response > "${output}"
  take_extract_calls "${transcript}" "${calls}"

  take_assert_installed_writer_call "${calls}"
  take_assert_no_hand_write "${calls}"
  take_assert_backlog "${target}"
  if ! cmp -s -- "${state_before}" "${target}/${take_seed_rel}"; then
    echo 'FAIL: native take journey changed the canonical story-state block.' >&2
    return 1
  fi
  if [[ -n $(git -C "${target}" diff --cached --name-only) ]]; then
    echo 'FAIL: native take journey staged changes despite the bounded prompt.' >&2
    return 1
  fi

  native_tool_version=$(claude --version)
  printf 'Native tool version: %s\n' "${native_tool_version}"
  printf 'Candidate: %s\n' '.claude/skills/dough-product-backlog/scripts/product-backlog.mjs'
  cat -- "${evidence_inputs}"
  printf '%s\n' \
    'PASS: a fresh native Claude Code session received an ordinary-language planned-execution request and invoked the installed product-backlog.mjs take operation with the selected identity and plan.' \
    'PASS: the shared reader found exactly one Taken entry with its canonical plan link; no Python, shell redirection, or native edit tool constructed the entry.' \
    'PASS: the take journey did not call record-state and left the canonical story-state block byte-for-byte unchanged.'
}
