#!/usr/bin/env bash
# apply --checkout refuses a pinned checkout whose shipped directory drifted
# from its tag, by an untracked path or edited managed bytes, before ordinary or
# forced apply writes, for marked directory-format and list-era tags alike; the
# clean list-era tag applies.
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

# The shared "latest" list-era release source in release-sources.mjs.
listed="${temporary_dir}/listed.git"
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${listed}" latest
marked="${temporary_dir}/marked.git"
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${marked}" << 'JSON'
{"revisions": [{"name": "directory 0.3.0", "release": {"version": "0.3.0",
  "taggedAt": "2026-11-01T00:00:00", "marker": "payload-0.3.0",
  "declaration": "directory"}}]}
JSON

case_number=0

# Applies the drifted pinned checkout ordinarily and by force; each refuses
# naming the drifted path and leaves its target unchanged.
assert_drift_refused() {
  local fixture=$1 checkout=$2 drifted=$3 force target before after output
  for force in '' --force; do
    case_number=$((case_number + 1))
    target="${temporary_dir}/target ${case_number}"
    prepare_target "${target}"
    before=$(snapshot_path_state "${target}")
    if output=$(bash "${checkout}/Distribution/src/install/open-dough-release.sh" apply \
      --url "${fixture}" --target "${target}" --platform cursor \
      --checkout "${checkout}" ${force:+"${force}"} 2>&1); then
      echo "FAIL: apply ${force} --checkout must refuse drift at ${drifted}." >&2
      exit 1
    fi
    [[ "${output}" == *'differs from its tagged shipped directory'* ]]
    [[ "${output}" == *"Distribution/src/skills/${drifted}"* ]]
    after=$(snapshot_path_state "${target}")
    [[ "${after}" == "${before}" ]]
    assert_sentinels "${target}"
  done
}

# Drifts a fresh pinned checkout of each tag both ways, then restores it.
for fixture_version in "${listed}:0.1.10" "${marked}:0.3.0"; do
  fixture=${fixture_version%:*}
  checkout="${temporary_dir}/checkout ${fixture_version##*:}"
  checkout_tagged_release "${fixture}" "${checkout}" "${fixture_version##*:}"
  skills="${checkout}/Distribution/src/skills"

  printf 'candidate\n' > "${skills}/dough-update/untracked-candidate.md"
  assert_drift_refused "${fixture}" "${checkout}" dough-update/untracked-candidate.md
  rm -- "${skills}/dough-update/untracked-candidate.md"

  printf 'local edit\n' >> "${skills}/dough-update/SKILL.md"
  assert_drift_refused "${fixture}" "${checkout}" dough-update/SKILL.md
  git -C "${checkout}" checkout --quiet -- Distribution/src/skills
done

# The restored list-era checkout is clean and applies its tagged payload.
clean_target="${temporary_dir}/clean target"
prepare_target "${clean_target}"
output=$(bash "${temporary_dir}/checkout 0.1.10/Distribution/src/install/open-dough-release.sh" apply \
  --url "${listed}" --target "${clean_target}" --platform cursor \
  --checkout "${temporary_dir}/checkout 0.1.10")
[[ "${output}" == *'Outcome: installed 0.1.10'* ]]
assert_payload "${clean_target}/.agents/skills/dough-update" 0.1.10 payload-0.1.10
assert_payload "${clean_target}/.claude/skills/dough-update" 0.1.10 payload-0.1.10
assert_sentinels "${clean_target}"
