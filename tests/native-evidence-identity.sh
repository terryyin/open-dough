#!/usr/bin/env bash
# Credential-free proof that every retained native evidence identity covers the
# native supervision inputs, taken from native-run-supervise.sh's one list, and
# the guidance and commands its journey exercises.
# shellcheck disable=SC2310,SC2312 # Predicates in conditions; pipefail covers the captured identity records.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT

# Every retained evidence identity must change when any native supervision
# input changes, and must take those inputs from native-run-supervise.sh's list.
identity_source="${work_dir}/identity-source"
identity_out="${work_dir}/identity-hashes"
mkdir -p -- "${identity_source}" "${identity_out}"
cp -R -- "${source_dir}/tests" "${source_dir}/src" "${identity_source}/"
supervision_inputs=(
  tests/support/native-run-supervise.sh
  tests/support/native-run-stream.sh
  tests/support/native-host-stream.sh
  tests/support/native-host-stream.mjs
  tests/support/native-host-stream-adapters.mjs
  tests/support/native-run-watchdog.sh
  tests/helpers/wait-for.bash
)
# Each entry: the file defining the writer, then the call that prints its lines.
identity_writers=(
  'tests/support/story-branch-closure-native-run.sh story_closure_write_evidence_identity'
  'tests/support/trunk-closure-native-run.sh trunk_closure_write_evidence_identity'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity selection'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity claims'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity consumers'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity gaps'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity publication'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity owned-context'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity land-default-checkout'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity execution-review'
  'tests/support/native-result-retain-journey.sh native_result_journey_input_hash_lines'
  'tests/support/execution-worktree-prep-native-run.sh prep_native_input_hash_lines'
  'tests/support/native-result-retain.sh native_result_context_input_hash_lines'
)

# Whether input-hash lines FILE list INPUT.
lists_input() {
  awk -v input="$2" '$3 == input { found = 1 } END { exit !found }' "$1"
}

# Writes each writer's input-hash lines, from the scratch source, to DIR/INDEX.
capture_identity_hashes() {
  local dir=$1
  mkdir -p -- "${dir}"
  (
    source_dir=${identity_source}
    # shellcheck disable=SC2034 # Read by the sourced identity writers.
    native_case_host=codex
    support="${identity_source}/tests/support"
    # shellcheck disable=SC1091
    source "${support}/git-publication-native-run.sh"
    # shellcheck disable=SC1091
    source "${support}/trunk-closure-native-run.sh"
    # shellcheck disable=SC1091
    source "${support}/story-branch-closure-native-run.sh"
    # shellcheck disable=SC1091
    source "${support}/delivery-evidence-native-run.sh"
    # shellcheck disable=SC1091
    source "${support}/native-result-retain-journey.sh"
    # shellcheck disable=SC1091
    source "${support}/execution-worktree-prep-native-run.sh"
    for index in "${!identity_writers[@]}"; do
      read -r -a call <<< "${identity_writers[index]}"
      "${call[@]:1}" > "${dir}/${index}.record"
      grep '^input-hash: ' "${dir}/${index}.record" > "${dir}/${index}" || true
    done
  )
}

capture_identity_hashes "${identity_out}/baseline"
identity_failures=0
for input in "${supervision_inputs[@]}"; do
  cp -- "${identity_source}/${input}" "${identity_out}/original"
  printf '\n# changed supervision input\n' >> "${identity_source}/${input}"
  capture_identity_hashes "${identity_out}/changed"
  cp -- "${identity_out}/original" "${identity_source}/${input}"
  for index in "${!identity_writers[@]}"; do
    if cmp -s "${identity_out}/baseline/${index}" "${identity_out}/changed/${index}"; then
      printf 'FAIL: evidence identity %s did not change when %s changed.\n' \
        "${identity_writers[index]}" "${input}" >&2
      identity_failures=1
    fi
  done
  rm -rf -- "${identity_out}/changed"
done

# A supervision input added to the one list reaches every identity.
cp -- "${identity_source}/tests/support/native-run-supervise.sh" "${identity_out}/original"
: > "${identity_source}/tests/support/native-run-probe.sh"
printf 'native_run_supervision_inputs+=(tests/support/native-run-probe.sh)\n' \
  >> "${identity_source}/tests/support/native-run-supervise.sh"
capture_identity_hashes "${identity_out}/extended"
cp -- "${identity_out}/original" "${identity_source}/tests/support/native-run-supervise.sh"
for index in "${!identity_writers[@]}"; do
  if ! grep -q ' tests/support/native-run-probe\.sh$' "${identity_out}/extended/${index}"; then
    printf 'FAIL: evidence identity %s does not take the supervision list.\n' \
      "${identity_writers[index]}" >&2
    identity_failures=1
  fi
done

# Guidance and commands each closure journey exercises beyond Dough Land's
# inputs, including scripts its modules spawn: ci-host-bridge.mjs spawns
# ci-host-hook.mjs, publication runs product-backlog-git-rebase.mjs, and the
# backlog merge adapter registers product-backlog-git-driver.mjs. An identity
# that omits one keeps its recorded evidence bound after that input changes.
land_inputs=(
  src/skills/dough-land/SKILL.md
  src/skills/dough-land/references/completion-attention.md
  src/skills/dough-land/scripts/worktree-retirement.mjs
  src/skills/dough-land/scripts/queued-closure-check.mjs
  src/skills/dough-land/scripts/retirement-checks.mjs
  src/skills/dough-manual-testing/references/exploration-workspace.md
  src/skills/dough-execute-plan/references/maintain-default-checkout.md
)
closure_journey_inputs=(
  'git_publication_write_evidence_identity owned-context|
  src/skills/dough-story-refinement/references/preparation-workspace.md'
  'git_publication_write_evidence_identity land-default-checkout|
  src/skills/dough-execute-plan/references/publish-the-candidate.md'
  'trunk_closure_write_evidence_identity|
  src/skills/dough-execute-plan/references/wrap-up-closure-publication.md
  src/skills/dough-story-wrap-up/scripts/trunk-closure.mjs
  src/skills/dough-story-wrap-up/scripts/trunk-closure-settlement.mjs
  src/skills/dough-execute-plan/scripts/ci-host-hook.mjs
  src/skills/dough-product-backlog/scripts/product-backlog-git-rebase.mjs'
  'story_closure_write_evidence_identity|
  src/skills/dough-execute-plan/references/wrap-up-closure-publication.md
  src/skills/dough-product-backlog/scripts/product-backlog-git-driver.mjs'
)
for entry in "${closure_journey_inputs[@]}"; do
  for index in "${!identity_writers[@]}"; do
    [[ ${identity_writers[index]#* } == "${entry%%|*}" ]] || continue
    for input in "${land_inputs[@]}" ${entry#*|}; do
      if ! lists_input "${identity_out}/baseline/${index}" "${input}"; then
        printf 'FAIL: evidence identity %s omits %s, which its journey exercises.\n' \
          "${entry%%|*}" "${input}" >&2
        identity_failures=1
      fi
    done
  done
done

# Every module a listed command imports or spawns, directly or transitively,
# is listed too, so the per-input change check below covers what the command
# runs.
for index in "${!identity_writers[@]}"; do
  mapfile -t modules < <(awk '$3 ~ /\.mjs$/ { print $3 }' \
    "${identity_out}/baseline/${index}")
  ((${#modules[@]})) || continue
  while IFS= read -r module; do
    if ! lists_input "${identity_out}/baseline/${index}" "${module}"; then
      printf 'FAIL: evidence identity %s omits %s, which a listed command imports or spawns.\n' \
        "${identity_writers[index]}" "${module}" >&2
      identity_failures=1
    fi
  done < <(node "${identity_source}/tests/support/native-import-closure.mjs" \
    "${identity_source}" "${modules[@]}")
done

# Changing any guidance or command input an identity lists changes that
# input's hash in the identity.
while IFS= read -r input; do
  printf '\n# changed guidance input\n' >> "${identity_source}/${input}"
done < <(sed -n 's|^input-hash: [^ ]* \(src/.*\)$|\1|p' \
  "${identity_out}/baseline"/* | sort -u)
capture_identity_hashes "${identity_out}/guidance-changed"
for index in "${!identity_writers[@]}"; do
  while read -r _ hash input; do
    [[ ${input} == src/* ]] || continue
    if ! awk -v input="${input}" -v hash="${hash}" \
      '$3 == input && $2 != hash { found = 1 } END { exit !found }' \
      "${identity_out}/guidance-changed/${index}"; then
      printf 'FAIL: evidence identity %s did not change when %s changed.\n' \
        "${identity_writers[index]}" "${input}" >&2
      identity_failures=1
    fi
  done < "${identity_out}/baseline/${index}"
done
if ((identity_failures)); then
  exit 1
fi
