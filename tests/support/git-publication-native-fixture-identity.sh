#!/usr/bin/env bash
# Evidence identities of the Git publication fixture families: the inputs that
# build and observe each family's fixtures. Sourced by
# git-publication-native-evidence.sh.
# shellcheck disable=SC2154 # source_dir comes from the sourcing runner.

# The publication identity plus the inputs that build and observe family $1's
# fixtures: each fixture entry and shell-launched module with its import
# closure in source_dir, the family's journey helpers and guidance, and the
# installer inputs. Generated project sources stay data inside their fixture
# module, which is hashed whole.
git_publication_fixture_family_identity() {
  git_publication_write_evidence_identity publication || return
  case $1 in
    startup)
      # The startup fixture entry materializes the queued trunk, and the
      # claim-race and resume cases run the startup command.
      native_import_closure_input_hash_lines \
        tests/support/git-publication-native-startup-fixture.mjs \
        src/skills/dough-execute-plan/scripts/execution-start.mjs || return
      ;;
    admission)
      # The admission fixture entry materializes the probed queued trunk, then
      # its journeys admit, prepare and draft through the admission helpers
      # and the startup operation.
      native_result_input_hash_lines \
        tests/support/git-publication-native-admission.sh \
        tests/support/git-publication-native-admission-closure.sh \
        tests/support/git-publication-native-admission-correction.sh \
        tests/support/git-publication-native-admission-fixture.mjs \
        tests/support/git-publication-native-admission-observe.mjs || return
      native_import_closure_input_hash_lines \
        src/skills/dough-execute-plan/scripts/workspace-publication-admission-fixtures.mjs \
        src/skills/dough-execute-plan/scripts/execution-start.mjs \
        tests/support/git-publication-native-admission-fixture.mjs \
        tests/support/git-publication-native-admission-observe.mjs || return
      ;;
    owned-context)
      native_result_input_hash_lines \
        tests/support/git-publication-native-owned-context.sh \
        tests/support/git-publication-native-owned-context-fixture.mjs \
        tests/support/git-publication-native-startup-owned-context.sh \
        tests/support/git-publication-native-preparation-land.sh \
        tests/support/git-publication-native-push-log-observe.mjs \
        tests/support/native-harness-observation.sh \
        tests/support/native-harness-login-shell.sh \
        tests/support/native-node-call-recorder.mjs \
        src/skills/dough-execute-plan/SKILL.md \
        src/skills/dough-story-refinement/references/preparation-assignment.md \
        src/skills/dough-story-refinement/references/preparation-workspace.md || return
      git_publication_closing_input_hash_lines \
        src/skills/dough-execute-plan/scripts/workspace-publication-select.mjs \
        src/skills/dough-execute-plan/scripts/workspace-publication-ownership.mjs \
        src/skills/dough-story-refinement/scripts/preparation-assignment.mjs \
        tests/support/git-publication-native-owned-context-fixture.mjs \
        tests/support/git-publication-native-push-log-observe.mjs \
        tests/support/native-node-call-recorder.mjs || return
      ;;
    one-shot)
      # The one-shot fixture entry materializes each journey's named trunk,
      # with queued B and its sibling B2 or the escalation product; the
      # journeys then start, deliver, refine and observe through the skills'
      # operations.
      native_result_input_hash_lines \
        tests/support/git-publication-native-one-shot.sh \
        tests/support/git-publication-native-one-shot-fixture.sh \
        tests/support/git-publication-native-one-shot-fixture.mjs \
        tests/support/git-publication-native-one-shot-unobserved.sh \
        tests/support/git-publication-native-one-shot-queued.sh \
        tests/support/git-publication-native-one-shot-queued-observe.mjs \
        tests/support/git-publication-native-one-shot-escalation.sh \
        tests/support/git-publication-native-one-shot-escalation-fixture.mjs \
        tests/support/git-publication-native-one-shot-retained.sh \
        tests/support/git-publication-native-one-shot-review.sh \
        tests/support/git-publication-native-one-shot-refinement.sh \
        tests/support/git-publication-native-one-shot-refinement-observe.mjs \
        tests/support/git-publication-native-one-shot-default-main.sh \
        tests/support/git-publication-native-one-shot-auto-land.sh \
        tests/support/git-publication-native-one-shot-established.sh \
        tests/support/git-publication-native-one-shot-refinement-auto-land.sh \
        src/skills/dough-story-refinement/references/preparation-disposition.md \
        tests/support/git-publication-native-push-log-observe.mjs \
        src/skills/dough-execute-plan/SKILL.md \
        src/skills/dough-execute-plan/references/one-shot.md \
        src/skills/dough-execute-plan/references/established-start.md \
        src/skills/dough-story-refinement/SKILL.md \
        src/skills/dough-story-refinement/references/one-shot-refinement.md || return
      native_import_closure_input_hash_lines \
        src/skills/dough-execute-plan/scripts/execution-start.mjs \
        src/skills/dough-execute-plan/scripts/execution-increment-delivery.mjs \
        src/skills/dough-execute-plan/scripts/established-start.mjs \
        src/skills/dough-story-refinement/scripts/preparation-assignment.mjs \
        src/skills/dough-product-backlog/scripts/product-backlog.mjs \
        tests/support/git-publication-native-one-shot-fixture.mjs \
        tests/support/git-publication-native-one-shot-queued-observe.mjs \
        tests/support/git-publication-native-one-shot-refinement-observe.mjs \
        tests/support/git-publication-native-push-log-observe.mjs || return
      ;;
    *) return 2 ;;
  esac
  git_publication_installer_input_hash_lines
}

# One input-hash line per input a fresh `install.sh --source source_dir` run
# reads from that working tree: the entry and the install, release-check and
# hook-registration helpers it sources or runs, VERSION and CHANGELOG.md, and
# every payload file its managed_files declaration names, hook fragments
# included.
git_publication_installer_input_hash_lines() {
  local declared
  local -a payload
  declared=$(
    # shellcheck source=src/install/open-dough-release-version.sh
    # shellcheck disable=SC1091
    source "${source_dir}/src/install/open-dough-release-version.sh" \
      && read_managed_files_declaration "${source_dir}/install.sh"
  ) || return
  mapfile -t payload <<< "${declared}"
  native_result_input_hash_lines \
    install.sh VERSION CHANGELOG.md \
    src/install/open-dough-install-entry.sh \
    src/install/open-dough-install-payload.sh \
    src/install/open-dough-install-request.sh \
    src/install/open-dough-platform.sh \
    src/install/open-dough-register-hooks.sh \
    src/install/open-dough-release.sh \
    src/install/open-dough-release-version.sh \
    src/install/open-dough-release-resolve.sh \
    src/install/open-dough-release-baseline.sh \
    src/install/open-dough-release-leftovers.sh \
    src/install/open-dough-release-apply.sh || return
  native_import_closure_input_hash_lines \
    src/install/open-dough-payload-bytes.mjs \
    src/install/open-dough-register-hooks.mjs || return
  native_result_input_hash_lines "${payload[@]/#/src/skills/}"
}
