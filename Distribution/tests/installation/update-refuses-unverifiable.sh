#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/public-payload-fixture.bash
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/release-fixture.bash
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
cd -- "${temporary_dir}"

helper="${source_dir}/Distribution/src/install/open-dough-release.sh"
fixture="${temporary_dir}/fixture.git"
# The shared "latest" release source in Distribution/tests/support/release-sources.mjs.
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${fixture}" latest
expected_source=$(cd -- "${fixture}" && pwd -P)
older_checkout="${temporary_dir}/release-0.1.2"
checkout_tagged_release "${fixture}" "${older_checkout}" 0.1.2

# The project's own origin remote: a release source whose 9.9.9 must never be
# read in place of the recorded source.
decoy="${temporary_dir}/client-origin.git"
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${decoy}" << 'JSON'
{"revisions": [{"name": "client remote decoy", "release": {
  "version": "9.9.9", "taggedAt": "2026-09-08T00:00:00",
  "marker": "payload-client-remote"}}]}
JSON

trace_file="${temporary_dir}/trace.log"
rm -f -- "${trace_file}"
export OPEN_DOUGH_TRACE="${trace_file}"

assert_ordinary_update_refuses_unwritten() {
  local label=$1
  local needle=$2
  local dest=$3
  local apply_tmp=$4
  shift 4
  local skill_root before after output
  local selected_path selected_mtime index
  local -a watched_paths=()
  local -a watched_mtimes=()

  skill_root=$(dirname -- "${dest}")
  for selected_path in \
    "${dest}/SKILL.md" \
    "${dest}/VERSION" \
    "${dest}/SOURCE" \
    "${skill_root}/dough-adr-awareness/SKILL.md"; do
    if [[ -f "${selected_path}" ]]; then
      watched_paths+=("${selected_path}")
      watched_mtimes+=("$(file_mtime "${selected_path}")")
    fi
  done
  before=$(snapshot_path_state "${unverifiable}")
  rm -rf -- "${apply_tmp}"
  mkdir -p -- "${apply_tmp}"
  : > "${trace_file}"
  if output=$(TMPDIR="${apply_tmp}" bash "${helper}" apply --target "${unverifiable}" \
    --platform cursor "$@" 2>&1); then
    echo "FAIL: ${label}: ordinary update must refuse an unverifiable installation." >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  if [[ "${output}" != *"${needle}"* ]]; then
    echo "FAIL: ${label}: expected refusal to mention: ${needle}" >&2
    printf '%s\n' "${output}" >&2
    exit 1
  fi
  [[ "${output}" == *'Outcome: refused; preserved the selected installation.'* ]]
  [[ "${output}" != *'Usage:'* ]]
  [[ "${output}" != *"${decoy}"* ]]
  [[ "${output}" != *'Installed: unknown'* ]]
  [[ "${output}" != *'updated from'* ]]
  if grep -q '^install ' "${trace_file}"; then
    echo "FAIL: ${label}: unverifiable ordinary update must not invoke the installer." >&2
    exit 1
  fi
  assert_owned_tmp_empty "${apply_tmp}" "${label}:"
  after=$(snapshot_path_state "${unverifiable}")
  if [[ "${after}" != "${before}" ]]; then
    echo "FAIL: ${label}: target contents changed during refusal." >&2
    exit 1
  fi
  for index in "${!watched_paths[@]}"; do
    selected_path=${watched_paths[${index}]}
    selected_mtime=$(file_mtime "${selected_path}")
    if [[ "${selected_mtime}" != "${watched_mtimes[${index}]}" ]]; then
      echo "FAIL: ${label}: mtime changed for ${selected_path}." >&2
      exit 1
    fi
  done
  assert_sentinels "${unverifiable}"
}

# Each case starts from the same clean older installation, installed once and
# copied (with its Git metadata, sentinels, and mtimes) before each case.
restore_clean_older_cursor() {
  rm -rf -- "${unverifiable}"
  cp -a -- "${clean_older_template}" "${unverifiable}"
}

unverifiable="${temporary_dir}/unverifiable project"
prepare_target "${unverifiable}"
git -C "${unverifiable}" init --quiet
git -C "${unverifiable}" remote add origin "${decoy}"
unverifiable_dest="${unverifiable}/.agents/skills/dough-update"
unverifiable_tmp="${temporary_dir}/unverifiable-tmp"
bash "${older_checkout}/install.sh" --target "${unverifiable}" \
  --source "${fixture}" --platform cursor > /dev/null
clean_older_template="${temporary_dir}/clean older template"
cp -a -- "${unverifiable}" "${clean_older_template}"

# The Cursor-hinted install also fills the sibling Claude root; an edit there
# must stop the ordinary update just as an entry-root change does.
unverifiable_claude_dest="${unverifiable}/.claude/skills/dough-update"
printf '%s\n' 'local managed edit' >> "${unverifiable_claude_dest}/SKILL.md"
assert_ordinary_update_refuses_unwritten \
  'edited managed file in the Claude root' \
  'ordinary update requires an unchanged installation' \
  "${unverifiable_claude_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
rm -f -- "$(dirname -- "${unverifiable_dest}")/dough-adr-awareness/SKILL.md"
assert_ordinary_update_refuses_unwritten \
  'missing managed file' \
  'ordinary update requires an unchanged installation' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
rm -f -- "${unverifiable_dest}/SOURCE"
assert_ordinary_update_refuses_unwritten \
  'missing source record' \
  'Missing installed source record' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
printf '%s\n%s\n' "${expected_source}" 'extra source line' > \
  "${unverifiable_dest}/SOURCE"
assert_ordinary_update_refuses_unwritten \
  'malformed source record' \
  'Malformed installed source record' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
rm -f -- "${unverifiable_dest}/VERSION"
assert_ordinary_update_refuses_unwritten \
  'missing version record' \
  'Missing installed version record' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
printf '%s\n' 'v0.1.1' > "${unverifiable_dest}/VERSION"
assert_ordinary_update_refuses_unwritten \
  'malformed version record' \
  'Malformed installed record' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
printf '%s\n' "${temporary_dir}/missing-source.git" > \
  "${unverifiable_dest}/SOURCE"
assert_ordinary_update_refuses_unwritten \
  'unavailable source' \
  'Failed to fetch tags' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
printf '%s\n' '0.1.3' > "${unverifiable_dest}/VERSION"
assert_ordinary_update_refuses_unwritten \
  'unavailable tag' \
  'No numeric release tag v0.1.3' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

restore_clean_older_cursor
printf '%s\n' '0.2.0' > "${unverifiable_dest}/VERSION"
assert_ordinary_update_refuses_unwritten \
  'recorded installation newer than the source' \
  'installed 0.2.0 is newer than source 0.1.10' \
  "${unverifiable_dest}" "${unverifiable_tmp}"

# The recorded 0.1.2 is tagged on a payload whose VERSION says 0.1.8.
mismatch="${temporary_dir}/mismatch.git"
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${mismatch}" << 'JSON'
{"revisions": [
  {"name": "tagged 0.1.2 with mismatched VERSION", "release": {
    "version": "0.1.2", "taggedAt": "2026-06-01T00:00:00",
    "marker": "payload-0.1.2"}, "files": {"VERSION": "0.1.8\n"}},
  {"name": "release 0.1.10", "release": {
    "version": "0.1.10", "taggedAt": "2020-01-01T00:00:00",
    "marker": "payload-0.1.10"}}
]}
JSON
restore_clean_older_cursor
mismatch_source=$(cd -- "${mismatch}" && pwd -P)
printf '%s\n' "${mismatch_source}" > "${unverifiable_dest}/SOURCE"
printf '%s\n' "${mismatch_source}" > "${unverifiable_claude_dest}/SOURCE"
assert_ordinary_update_refuses_unwritten \
  'baseline metadata mismatch' \
  'not falling back to another release or branch' \
  "${unverifiable_dest}" \
  "${unverifiable_tmp}"

git -C "${mismatch}" tag -d v0.1.2 > /dev/null
assert_ordinary_update_refuses_unwritten \
  'older recorded installation when the source has a single release' \
  'installed 0.1.2 is older than the supported update baseline (previous none, latest 0.1.10). Use --force' \
  "${unverifiable_dest}" "${unverifiable_tmp}"

# Even the current invoking root must wait for the sibling's baseline
# eligibility before fetching any baseline from the pinned source.
oldest_checkout="${temporary_dir}/release-0.1.1"
latest_checkout="${temporary_dir}/release-0.1.10"
checkout_tagged_release "${fixture}" "${oldest_checkout}" 0.1.1
checkout_tagged_release "${fixture}" "${latest_checkout}" 0.1.10
oldest_target="${temporary_dir}/oldest project"
prepare_target "${oldest_target}"
bash "${oldest_checkout}/install.sh" --target "${oldest_target}" \
  --source "${fixture}" --platform claude > /dev/null
restore_clean_older_cursor
bash "${latest_checkout}/install.sh" --target "${unverifiable}" \
  --source "${fixture}" --platform cursor --force > /dev/null
rm -rf -- "${unverifiable}/.claude/skills"
cp -a -- "${oldest_target}/.claude/skills" "${unverifiable}/.claude/skills"
touch -t 202001010000 -- "${unverifiable_claude_dest}/SKILL.md" \
  "${unverifiable_claude_dest}/VERSION" "${unverifiable_claude_dest}/SOURCE"
git_trace="${temporary_dir}/git-trace.json"
GIT_TRACE2_EVENT="${git_trace}" assert_ordinary_update_refuses_unwritten \
  'installed release older than the previous numeric tag' \
  'installed 0.1.1 is older than the supported update baseline (previous 0.1.2, latest 0.1.10). Use --force' \
  "${unverifiable_claude_dest}" "${unverifiable_tmp}" --checkout "${latest_checkout}"
[[ -s "${git_trace}" ]]
if grep -Fq '"fetch"' "${git_trace}"; then
  echo 'FAIL: an older sibling must refuse before any baseline fetch.' >&2
  exit 1
fi
