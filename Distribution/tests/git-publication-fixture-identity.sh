#!/usr/bin/env bash
# Credential-free proof that each Git publication fixture family's evidence
# identity names the inputs that build its fixtures, changes when they change,
# and fails without a record when one cannot be read.
# shellcheck disable=SC2310,SC2312 # Predicates in conditions; pipefail covers the captured identity records.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT

identity_source="${work_dir}/identity-source"
identity_out="${work_dir}/identity-hashes"
mkdir -p -- "${identity_source}" "${identity_out}"
node "${source_dir}/Distribution/tests/support/native-identity-source.mjs" "${source_dir}" "${identity_source}"
# A newly sourced, tracked installer helper must enter every family's identity
# without another edit to its input list.
installer_probe=Distribution/src/install/open-dough-identity-probe.sh
printf '# installer identity probe\n' > "${identity_source}/${installer_probe}"
# shellcheck disable=SC2016 # Keep the sourced helper path literal in the scratch script.
printf '\nsource "$(dirname -- "${BASH_SOURCE[0]}")/open-dough-identity-probe.sh"\n' \
  >> "${identity_source}/Distribution/src/install/open-dough-install-entry.sh"
git -C "${identity_source}" add -- "${installer_probe}"
families=(startup admission one-shot owned-context)
fixture_helper=Distribution/tests/support/repositoryTestData.mjs
escalation=Distribution/tests/support/git-publication-native-one-shot-escalation-fixture.mjs
# The real writers owned-context journeys run: one advances the origin, the
# other leaves only the retained worktree.
other_writer=Distribution/src/skills/dough-execute-plan/scripts/publication-test-fixtures.mjs
owned_worktree=Distribution/src/skills/dough-execute-plan/scripts/default-checkout-test-fixtures.mjs
identity_failures=0

# Whether input-hash lines FILE list INPUT.
lists_input() {
  awk -v input="$2" '$3 == input { found = 1 } END { exit !found }' "$1"
}

# Prints family $1's evidence identity from the scratch source, under the
# caller's errexit setting.
# shellcheck disable=SC2030 # Each identity runs in its own scratch subshell.
family_identity() {
  (
    source_dir=${identity_source}
    # shellcheck disable=SC2034 # Read by the sourced identity writer.
    native_case_host=codex
    # shellcheck disable=SC1091
    source "${identity_source}/Distribution/tests/support/git-publication-native-run.sh"
    git_publication_write_evidence_identity "$1"
  )
}
# Writes each family identity's input-hash lines to DIR/FAMILY.
capture_family_hashes() {
  mkdir -p -- "$1"
  for family in "${families[@]}"; do
    family_identity "${family}" | grep '^input-hash: ' > "$1/${family}"
  done
}
capture_family_hashes "${identity_out}/baseline"

# Each family identifies the helpers its fixture reaches and the installer
# inputs that put the guidance in its fixture.
installer_inputs=$(git -C "${identity_source}" ls-files -- Distribution/src/install 'src/install/*-payload.sh')
installer_inputs+=' install.sh VERSION CHANGELOG.md
  Distribution/src/skills/dough-update/SKILL.md
  Distribution/src/skills/dough-execute-plan/assets/claude-hooks.json
  Distribution/src/skills/dough-product-backlog/assets/codex-hooks-guard.json'
family_inputs=(
  "startup|${installer_inputs} ${fixture_helper}
  Distribution/tests/support/git-publication-native-startup-fixture.mjs
  Distribution/tests/support/repository-fixture.mjs
  Distribution/tests/support/queued-repository.mjs
  Distribution/tests/support/startup-command-files.mjs
  Distribution/src/skills/dough-execute-plan/scripts/execution-start.mjs"
  "admission|${installer_inputs} ${fixture_helper}
  Distribution/tests/support/git-publication-native-admission-fixture.mjs
  Distribution/tests/support/repository-fixture.mjs
  Distribution/tests/support/queued-repository.mjs
  Distribution/tests/support/startup-command-files.mjs
  Distribution/src/skills/dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs
  Distribution/src/skills/dough-execute-plan/scripts/execution-start.mjs"
  "one-shot|${installer_inputs} ${fixture_helper}
  Distribution/tests/support/git-publication-native-one-shot-fixture.mjs
  Distribution/tests/support/repository-fixture.mjs
  Distribution/tests/support/queued-repository.mjs
  Distribution/tests/support/startup-command-files.mjs
  Distribution/src/skills/dough-execute-plan/scripts/one-shot-queued-repository.mjs
  ${escalation}"
  "owned-context|${installer_inputs} ${fixture_helper}
  Distribution/tests/support/git-publication-native-owned-context-fixture.mjs
  Distribution/tests/support/repository-fixture.mjs
  Distribution/tests/support/queued-repository.mjs
  Distribution/tests/support/startup-command-files.mjs
  ${owned_worktree} ${other_writer}"
)
for entry in "${family_inputs[@]}"; do
  for input in ${entry#*|}; do
    if ! lists_input "${identity_out}/baseline/${entry%%|*}" "${input}"; then
      printf 'FAIL: %s evidence identity omits fixture input %s.\n' \
        "${entry%%|*}" "${input}" >&2
      identity_failures=1
    fi
  done
done

# The one-shot fixture carries its generated project's source as data: its
# closure traces, and never follows the imports written inside that source.
if ! grep -Fq 'from "../src/notes.mjs"' "${identity_source}/${escalation}"; then
  printf 'FAIL: %s no longer carries the generated notes source this check covers.\n' \
    "${escalation}" >&2
  identity_failures=1
fi
closure_status=0
node "${identity_source}/Distribution/tests/support/native-import-closure.mjs" "${identity_source}" \
  Distribution/tests/support/git-publication-native-one-shot-fixture.mjs \
  > "${identity_out}/one-shot-closure" 2> "${identity_out}/one-shot-closure.err" \
  || closure_status=$?
if ((closure_status)) || ! grep -qx "${escalation}" "${identity_out}/one-shot-closure" \
  || grep -q 'src/notes\.mjs$' "${identity_out}/one-shot-closure"; then
  printf 'FAIL: one-shot fixture closure exited %s, or followed generated source:\n' \
    "${closure_status}" >&2
  cat "${identity_out}/one-shot-closure" "${identity_out}/one-shot-closure.err" >&2
  identity_failures=1
fi

# Fixture-only inputs keep their sensitivity proof here. The shared native
# identity check changes every listed src/ input for every family.
sensitivity_inputs=("${fixture_helper}" "${escalation}")
mkdir -p -- "${identity_out}/unchanged"
for input in "${sensitivity_inputs[@]}"; do
  cp -- "${identity_source}/${input}" "${identity_out}/unchanged/${input//\//_}"
done
printf '\n// changed fixture input\n' >> "${identity_source}/${fixture_helper}"
sed 's|// Lists the notes in the configured notes directory\.|// Lists every note in the configured notes directory.|' \
  "${identity_out}/unchanged/${escalation//\//_}" > "${identity_source}/${escalation}"
for input in "${sensitivity_inputs[@]}"; do
  if cmp -s "${identity_out}/unchanged/${input//\//_}" "${identity_source}/${input}"; then
    printf 'FAIL: the scratch change to %s left it unchanged.\n' "${input}" >&2
    identity_failures=1
  fi
done
capture_family_hashes "${identity_out}/fixture-changed"
for input in "${sensitivity_inputs[@]}"; do
  cp -- "${identity_out}/unchanged/${input//\//_}" "${identity_source}/${input}"
done
for family in "${families[@]}"; do
  for input in "${sensitivity_inputs[@]}"; do
    [[ ${input} != "${escalation}" || ${family} == one-shot ]] || continue
    baseline_hash=$(awk -v input="${input}" '$3 == input { print $2 }' \
      "${identity_out}/baseline/${family}")
    changed_hash=$(awk -v input="${input}" '$3 == input { print $2 }' \
      "${identity_out}/fixture-changed/${family}")
    if [[ -z ${baseline_hash} || ${baseline_hash} == "${changed_hash}" ]]; then
      printf 'FAIL: %s evidence identity hash for %s: %s before, %s after its change.\n' \
        "${family}" "${input}" "${baseline_hash:-unlisted}" "${changed_hash:-unlisted}" >&2
      identity_failures=1
    fi
  done
done

# Every family identity fails, even for a caller with errexit disabled, when
# a required input it traces through imports or reads from the installer's
# declaration is missing; it never prints a partial identity as complete.
for input in "${fixture_helper}" "${installer_probe}" Distribution/src/skills/dough-execute-plan/assets/claude-hooks.json; do
  mv -- "${identity_source}/${input}" "${identity_out}/removed"
  for family in "${families[@]}"; do
    identity_status=$(
      set +e
      family_identity "${family}" > "${identity_out}/missing-input" 2> /dev/null
      echo "$?"
    )
    if [[ ${identity_status} == 0 || -s ${identity_out}/missing-input ]]; then
      printf 'FAIL: %s evidence identity succeeded or printed a partial identity without %s.\n' "${family}" "${input}" >&2
      identity_failures=1
    fi
  done
  mv -- "${identity_out}/removed" "${identity_source}/${input}"
done

# A journey retains its record with its family's identity. Without a required
# input, a caller that captures the journey's status with errexit disabled
# sees it fail with no record, and the run's artifacts stay for diagnosis.
# Only the fixture, host session and observation are stand-ins.
# Runs startup journey startup-trunk from the scratch source with errexit
# disabled, retaining into results directory $1. Prints its exit status and
# assessment status.
# shellcheck disable=SC2034,SC2154,SC2329 # Stand-ins replace the sourced runner's steps and globals.
retained_journey() {
  (
    set +e
    # shellcheck disable=SC1091
    source "${identity_source}/Distribution/tests/support/git-publication-native-run.sh"
    native_case_results_dir=$1
    git_publication_create_fixture_for() {
      git_publication_fixture_root=$2
      git_publication_fixture_integration=$2
    }
    git_publication_fixture_install_skills() { :; }
    git_publication_fixture_capture_human() { :; }
    git_publication_prompt_for() { printf 'stand-in prompt\n'; }
    git_publication_run_native_command() {
      native_run_stream_status=complete
      native_run_outcome=exited
      printf '{}\n' > "${transcript}"
    }
    git_publication_fixture_observe_startup() { printf 'journey: %s\n' "$1"; }
    git_publication_assess() {
      git_publication_assess_status=pass
      git_publication_assess_reason=stand-in
    }
    git_publication_fixture_cleanup() { :; }
    artifact=$(mktemp -d "${identity_out}/journey.XXXXXX")
    git_publication_run_journey "${identity_source}" claude startup-trunk "${artifact}" \
      > "${artifact}.out" 2>&1
    printf '%s %s\n' "$?" "${git_publication_assess_status}"
  )
}
retained_record() {
  find "$1/claude/publication/startup-trunk" -mindepth 2 -maxdepth 2 -name "$2"
}
mkdir -p -- "${identity_out}/retained" "${identity_out}/unretained"
journey_outcome=$(retained_journey "${identity_out}/retained")
record=$(retained_record "${identity_out}/retained" record)
if [[ ${journey_outcome} != '0 pass' || -z ${record} ]] \
  || ! diff <(grep '^input-hash: ' "${record}") \
    "${identity_out}/baseline/startup" > /dev/null; then
  printf 'FAIL: the startup journey (%s) did not retain its startup identity.\n' \
    "${journey_outcome}" >&2
  identity_failures=1
fi
mv -- "${identity_source}/${fixture_helper}" "${identity_out}/removed"
journey_outcome=$(retained_journey "${identity_out}/unretained")
mv -- "${identity_out}/removed" "${identity_source}/${fixture_helper}"
if [[ ${journey_outcome} != [1-9]*' fail' ]] \
  || [[ -n $(retained_record "${identity_out}/unretained" record) ]] \
  || [[ -z $(retained_record "${identity_out}/unretained" observations.txt) ]]; then
  printf 'FAIL: without %s the startup journey (%s) retained a record or lost its artifacts.\n' \
    "${fixture_helper}" "${journey_outcome}" >&2
  identity_failures=1
fi

if ((identity_failures)); then
  exit 1
fi
