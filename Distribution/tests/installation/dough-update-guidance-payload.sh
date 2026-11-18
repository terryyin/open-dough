#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
skill="${source_dir}/Distribution/src/skills/dough-update/SKILL.md"
guide="${source_dir}/docs/installation-and-updates.md"

# The guide's documented inspection lists the release-declared sources.
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
inspection="${temporary_dir}/inspect.sh"
awk '
  /^   ```bash$/ { if (!seen++) { printing = 1; next } }
  printing && /^   ```$/ { exit }
  printing { sub(/^   /, ""); print }
' "${guide}" > "${inspection}"
[[ -s "${inspection}" ]]
snapshot="${source_dir}" release_source="${source_dir}/Distribution/src" bash "${inspection}" > "${temporary_dir}/current-paths"
grep -Fxq "${source_dir}/Distribution/src/skills/dough-update/SKILL.md" "${temporary_dir}/current-paths"

# A release can add dependencies without a corresponding guide edit.
candidate="${temporary_dir}/candidate"
mkdir -p -- "${candidate}/Distribution/src" "${candidate}/src/install"
cp -R -- "${source_dir}/Distribution/src/skills" "${source_dir}/Distribution/src/install" "${candidate}/Distribution/src/"
cp -- "${source_dir}/src/install/open-dough-execution-payload.sh" "${candidate}/src/install/"
extra_path='dough-update/references/inspection-extra.md'
awk -v extra="${extra_path}" '
  { print }
  /^managed_files=\(/ { print "  " extra }
' "${source_dir}/install.sh" > "${candidate}/install.sh"
mkdir -p -- "${candidate}/Distribution/src/skills/${extra_path%/*}"
printf '%s\n' 'Additional release dependency to inspect.' > "${candidate}/Distribution/src/skills/${extra_path}"
snapshot="${candidate}" release_source="${candidate}/Distribution/src" bash "${inspection}" > "${temporary_dir}/candidate-paths"
grep -Fxq "${candidate}/Distribution/src/skills/${extra_path}" "${temporary_dir}/candidate-paths"
candidate_count=$(wc -l < "${temporary_dir}/candidate-paths")
current_count=$(wc -l < "${temporary_dir}/current-paths")
[[ ${candidate_count} -eq $((current_count + 1)) ]]
rm -- "${candidate}/Distribution/src/skills/${extra_path}"
if snapshot="${candidate}" release_source="${candidate}/Distribution/src" bash "${inspection}" > "${temporary_dir}/missing-output" 2>&1; then
  echo 'FAIL: documented inspection accepted a missing declared source.' >&2
  exit 1
fi
grep -Fxq "Missing declared payload source: ${candidate}/Distribution/src/skills/${extra_path}" "${temporary_dir}/missing-output"

# The updater's inspection boundary must permit every managed host-hook file.
actual_hook_settings=$(sed -n '/managed host-hook settings they register/{n;s/.*(//;s/).*//;s/[`,]//g;s/ and / /g;p;}' "${skill}")
expected_hook_settings=$(node --input-type=module -e '
  const { HOSTS } = await import(process.argv[1]);
  process.stdout.write(HOSTS.map((host) => host.relativePath).join(" "));
' "${source_dir}/Distribution/src/install/open-dough-register-hooks-fragments.mjs")
if [[ "${actual_hook_settings}" != "${expected_hook_settings}" ]]; then
  printf 'FAIL: updater permits host-hook settings %q; expected %q.\n' \
    "${actual_hook_settings}" "${expected_hook_settings}" >&2
  exit 1
fi
