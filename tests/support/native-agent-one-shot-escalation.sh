#!/usr/bin/env bash
# One-shot escalation journey for the credential-free publication substitute.
# Sourced by native-agent-one-shot.sh (copied beside it) with ${host} and
# ${workspace} (the originating checkout) set. Follows the escalation the
# one-shot guidance names, through the installed CLIs: start the owned
# workspace with --one-shot, rename the key, find in the project's docs that a
# saved key needs its own versioned migration, draft that story in the
# originating checkout, admit it with --admit --carry from the same workspace
# and branch, and stop before planning. Sets ${response}.
# NATIVE_ONE_SHOT_WORKSPACE, _BRANCH and _PUBLISHER carry the owned workspace,
# branch and publisher ID.
# shellcheck disable=SC2034,SC2154 # host, workspace and response are shared with the sourcing substitute.

native_one_shot_escalation_substitute() {
  local execution=${NATIVE_ONE_SHOT_WORKSPACE} skills start
  local identity='SEED-900#notes-directory-key'
  local link='seeds/SEED-900-settings.md#notes-directory-key'
  local title='Rename the saved notesDir setting with a migration'
  skills=$(admission_installed)
  start=(node "${skills}/dough-execute-plan/scripts/execution-start.mjs" start
    --integration "${workspace}" --workspace "${execution}"
    --branch "${NATIVE_ONE_SHOT_BRANCH}"
    --publisher-id "${NATIVE_ONE_SHOT_PUBLISHER}" --mode story-branch
    --remote origin --target main --push-authorized --workspace-authorized
    --host "${host}")
  admission_run "${start[@]}" --one-shot
  admission_run_in "${execution}" perl -pi -e 's/\bnotesDir\b/notesDirectory/g' \
    src/settings.mjs src/notes.mjs
  admission_run_in "${execution}" cat docs/settings.md
  cat > "${workspace}/.planning/seeds/SEED-900-settings.md" << EOF
---
id: SEED-900
---

# Saved settings

<a id="notes-directory-key"></a>

### ${title}

**Identity:** ${identity}

**Goal:** Users' saved settings keep working after the notesDir key becomes
notesDirectory: a versioned migration rewrites existing settings files, as
docs/settings.md requires.
EOF
  admission_run node "${skills}/dough-product-backlog/scripts/product-backlog.mjs" \
    record-state --identity "${identity}" --link "${link}" \
    --refinement not-refined --approach unselected
  admission_run "${start[@]}" --identity "${identity}" --admit --link "${link}" \
    --title "${title}" --carry
  response="Renaming notesDir breaks users' saved settings files: docs/settings.md makes that its own versioned migration, a separate outcome. Admitted ${identity} to Taken and restored the rename, uncommitted, over the claim in the owned workspace. Stopped before planning: this request grants no planning authority. Existing local changes were preserved."
}
