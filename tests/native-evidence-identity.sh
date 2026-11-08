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
cp -R -- "${source_dir}/tests" "${source_dir}/src" "${source_dir}/install.sh" \
  "${source_dir}/VERSION" "${source_dir}/CHANGELOG.md" "${identity_source}/"
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
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity aggregate'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity nostore'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity deferred'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity original'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity terminal'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity release'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity drift'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity scheduling'
  'tests/support/delivery-evidence-native-run.sh delivery_evidence_write_evidence_identity amended'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity publication'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity startup'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity admission'
  'tests/support/git-publication-native-evidence.sh git_publication_write_evidence_identity one-shot'
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

# Each journey must identify the guidance and runtime inputs it exercises.
land_inputs=(
  src/skills/dough-land/SKILL.md
  src/skills/dough-land/references/completion-attention.md
  src/skills/dough-land/references/dashboard-completion.md
  src/skills/dough-execute-plan/scripts/dashboard-completion.mjs
  src/skills/dough-land/scripts/worktree-retirement.mjs
  src/skills/dough-land/scripts/queued-closure-check.mjs
  src/skills/dough-land/scripts/retirement-checks.mjs
  src/skills/dough-manual-testing/references/exploration-workspace.md
  src/skills/dough-execute-plan/references/maintain-default-checkout.md
)
response_input=tests/support/native-response-field.sh
journey_inputs=(
  "git_publication_write_evidence_identity owned-context|${land_inputs[*]}
  src/skills/dough-story-refinement/references/preparation-workspace.md"
  "git_publication_write_evidence_identity land-default-checkout|${land_inputs[*]}
  src/skills/dough-execute-plan/references/publish-the-candidate.md"
  "trunk_closure_write_evidence_identity|${land_inputs[*]} ${response_input}
  src/skills/dough-execute-plan/references/wrap-up-closure-publication.md
  src/skills/dough-story-wrap-up/scripts/trunk-closure.mjs
  src/skills/dough-story-wrap-up/scripts/trunk-closure-settlement.mjs
  src/skills/dough-story-wrap-up/scripts/trunk-closure-observer.mjs
  src/skills/dough-execute-plan/scripts/ci-host-hook.mjs
  src/skills/dough-product-backlog/scripts/product-backlog-git-rebase.mjs"
  "story_closure_write_evidence_identity|${land_inputs[*]} ${response_input}
  src/skills/dough-execute-plan/references/wrap-up-closure-publication.md
  src/skills/dough-product-backlog/scripts/product-backlog-git-driver.mjs"
  "git_publication_write_evidence_identity execution-review|${response_input}
  src/skills/dough-land/references/completion-attention.md"
  'git_publication_write_evidence_identity admission|
  tests/support/makeMe.mjs
  tests/support/story-preparation.mjs
  src/skills/dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs'
)
for entry in "${journey_inputs[@]}"; do
  for index in "${!identity_writers[@]}"; do
    [[ ${identity_writers[index]#* } == "${entry%%|*}" ]] || continue
    for input in ${entry#*|}; do
      if ! lists_input "${identity_out}/baseline/${index}" "${input}"; then
        printf 'FAIL: evidence identity %s omits journey input %s.\n' \
          "${entry%%|*}" "${input}" >&2
        identity_failures=1
      fi
    done
  done
done

# The drift and amended families' rounds run the story-obligation gate; their
# identities list the gate's scripts so a gate change marks the evidence stale,
# and drift also lists the gate guidance it exercises. Families that do not run
# the gate keep its scripts out of their identity.
gate_scripts=(
  src/skills/dough-execute-plan/scripts/story-obligations.mjs
  src/skills/dough-execute-plan/scripts/story-obligation-reader.mjs
  src/skills/dough-execute-plan/scripts/story-obligation-source-review.mjs
)
gate_guidance=src/skills/dough-execute-plan/references/story-obligations.md
for index in "${!identity_writers[@]}"; do
  case ${identity_writers[index]#* } in
    'delivery_evidence_write_evidence_identity drift' | \
      'delivery_evidence_write_evidence_identity amended') expected=true ;;
    'delivery_evidence_write_evidence_identity '*) expected=false ;;
    *) continue ;;
  esac
  for input in "${gate_scripts[@]}"; do
    listed=false
    ! lists_input "${identity_out}/baseline/${index}" "${input}" || listed=true
    if [[ ${listed} != "${expected}" ]]; then
      printf 'FAIL: evidence identity %s lists %s: %s, expected %s.\n' \
        "${identity_writers[index]}" "${input}" "${listed}" "${expected}" >&2
      identity_failures=1
    fi
  done
  [[ ${identity_writers[index]#* } == *' drift' ]] || continue
  if ! lists_input "${identity_out}/baseline/${index}" "${gate_guidance}"; then
    printf 'FAIL: evidence identity %s omits %s, which its rounds exercise.\n' \
      "${identity_writers[index]}" "${gate_guidance}" >&2
    identity_failures=1
  fi
done

# Every module a listed command imports or spawns, directly or transitively,
# is listed too, so the per-input change check below covers what the command
# runs.
for index in "${!identity_writers[@]}"; do
  mapfile -t modules < <(awk '$3 ~ /\.mjs$/ { print $3 }' \
    "${identity_out}/baseline/${index}")
  ((${#modules[@]})) || continue
  if ! node "${identity_source}/tests/support/native-import-closure.mjs" \
    "${identity_source}" "${modules[@]}" > "${identity_out}/closure"; then
    printf 'FAIL: evidence identity %s lists modules whose closure cannot be traced.\n' \
      "${identity_writers[index]}" >&2
    identity_failures=1
    continue
  fi
  while IFS= read -r module; do
    printf 'FAIL: evidence identity %s omits %s, which a listed command imports or spawns.\n' \
      "${identity_writers[index]}" "${module}" >&2
    identity_failures=1
  done < <(awk 'NR == FNR { listed[$3] = 1; next } !($0 in listed)' \
    "${identity_out}/baseline/${index}" "${identity_out}/closure")
done

# Changing any supervision input, or any guidance or command input an identity
# lists, changes that input's hash in every identity that lists it. Every
# identity lists every supervision input, with the hash of that input's own
# content.
{
  printf '%s\n' "${supervision_inputs[@]}"
  sed -n 's|^input-hash: [^ ]* \(src/.*\)$|\1|p' "${identity_out}/baseline"/*
} | sort -u > "${identity_out}/changed-inputs"
while IFS= read -r input; do
  printf '\n# changed input\n' >> "${identity_source}/${input}"
done < "${identity_out}/changed-inputs"
capture_identity_hashes "${identity_out}/inputs-changed"
(cd -- "${identity_source}" && shasum -a 256 "${supervision_inputs[@]}") \
  | awk '{ print "input-hash:", $1, $2 }' > "${identity_out}/supervision-hashes"
for index in "${!identity_writers[@]}"; do
  while IFS= read -r line; do
    if ! grep -Fqx -- "${line}" "${identity_out}/inputs-changed/${index}"; then
      printf 'FAIL: evidence identity %s does not hash the content of supervision input %s.\n' \
        "${identity_writers[index]}" "${line##* }" >&2
      identity_failures=1
    fi
  done < "${identity_out}/supervision-hashes"
  # Each baseline line of a changed input needs a line with a different hash.
  while IFS= read -r input; do
    printf 'FAIL: evidence identity %s did not change when %s changed.\n' \
      "${identity_writers[index]}" "${input}" >&2
    identity_failures=1
  done < <(awk '
    FILENAME == ARGV[1] { changed[$1] = 1; next }
    FILENAME == ARGV[2] { lines[$3]++; same[$3, $2]++; next }
    $3 in changed && lines[$3] <= same[$3, $2] { print $3 }
  ' "${identity_out}/changed-inputs" "${identity_out}/inputs-changed/${index}" \
    "${identity_out}/baseline/${index}")
done
if ((identity_failures)); then
  exit 1
fi
