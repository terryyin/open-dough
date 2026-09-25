#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
skill="${source_dir}/src/skills/dough-update/SKILL.md"
guide="${source_dir}/docs/installation-and-updates.md"

# The guide points to the release declaration and lists its sources before install.
# shellcheck disable=SC2016 # Match literal Markdown code spans.
grep -Fq '[`managed_files` declaration in `install.sh`](../install.sh)' "${guide}"
grep -Fq 'Read every listed file' "${guide}"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
inspection="${temporary_dir}/inspect.sh"
awk '
  /^   ```bash$/ { if (!seen++) { printing = 1; next } }
  printing && /^   ```$/ { exit }
  printing { sub(/^   /, ""); print }
' "${guide}" > "${inspection}"
[[ -s "${inspection}" ]]
snapshot="${source_dir}" bash "${inspection}" > "${temporary_dir}/current-paths"
grep -Fxq "${source_dir}/src/skills/dough-update/SKILL.md" "${temporary_dir}/current-paths"

# A release can add dependencies without a corresponding guide edit.
candidate="${temporary_dir}/candidate"
mkdir -p -- "${candidate}/src"
cp -R -- "${source_dir}/src/skills" "${source_dir}/src/install" "${candidate}/src/"
extra_path='dough-update/references/inspection-extra.md'
awk -v extra="${extra_path}" '
  { print }
  /^managed_files=\(/ { print "  " extra }
' "${source_dir}/install.sh" > "${candidate}/install.sh"
mkdir -p -- "${candidate}/src/skills/${extra_path%/*}"
printf '%s\n' 'Additional release dependency to inspect.' > "${candidate}/src/skills/${extra_path}"
snapshot="${candidate}" bash "${inspection}" > "${temporary_dir}/candidate-paths"
grep -Fxq "${candidate}/src/skills/${extra_path}" "${temporary_dir}/candidate-paths"
candidate_count=$(wc -l < "${temporary_dir}/candidate-paths")
current_count=$(wc -l < "${temporary_dir}/current-paths")
[[ ${candidate_count} -eq $((current_count + 1)) ]]
rm -- "${candidate}/src/skills/${extra_path}"
if snapshot="${candidate}" bash "${inspection}" > "${temporary_dir}/missing-output" 2>&1; then
  echo 'FAIL: documented inspection accepted a missing declared source.' >&2
  exit 1
fi
grep -Fxq "Missing declared payload source: ${candidate}/src/skills/${extra_path}" "${temporary_dir}/missing-output"

grep -Eq 'every (client |release )?payload source they declare' "${skill}"
grep -Eq 'release-declared (client |release )?payload paths' "${skill}"
grep -Fq 'payload skills may be added between releases' "${skill}"
grep -Fq 'payload declared by that recorded release' "${skill}"
grep -Fq 'Payload paths newly added by the release must be absent' "${skill}"
grep -Fq 'all installed payload paths' "${skill}"

# The updater's inspection boundary must permit every managed host-hook file.
actual_hook_settings=$(sed -n '/managed host-hook settings they register/{n;s/.*(//;s/).*//;s/[`,]//g;s/ and / /g;p;}' "${skill}")
expected_hook_settings=$(node --input-type=module -e '
  const { HOSTS } = await import(process.argv[1]);
  process.stdout.write(HOSTS.map((host) => host.relativePath).join(" "));
' "${source_dir}/src/install/open-dough-register-hooks-fragments.mjs")
if [[ "${actual_hook_settings}" != "${expected_hook_settings}" ]]; then
  printf 'FAIL: updater permits host-hook settings %q; expected %q.\n' \
    "${actual_hook_settings}" "${expected_hook_settings}" >&2
  exit 1
fi

if grep -Eq '(two|both) (declared client payload|managed files|installed payload)' \
  "${skill}" "${guide}"; then
  echo 'FAIL: client-payload guidance contains a stale fixed-cardinality boundary.' >&2
  exit 1
fi
