# Shared observations for an ordinary update: project configuration is planted
# by the caller, and the installed publication modules must load afterwards.
# shellcheck shell=bash

project_configuration='{"sentinel":"project-owned-open-dough"}'

write_project_configuration() {
  local target=$1
  mkdir -p -- "${target}/.planning"
  printf '%s\n' "${project_configuration}" > "${target}/.planning/open-dough.json"
}

assert_project_configuration() {
  local target=$1
  local contents
  contents=$(cat "${target}/.planning/open-dough.json")
  [[ "${contents}" == "${project_configuration}" ]]
}

assert_installed_publication_modules() {
  local root=$1
  # shellcheck disable=SC2016 # The node program is literal source, not a shell expansion.
  node --input-type=module -e '
    import { pathToFileURL } from "node:url";
    const root = process.argv[1];
    const modules = [
      "dough-execute-plan/scripts/current-branch-publication.mjs",
      "dough-execute-plan/scripts/execution-increment-publication.mjs",
      "dough-execute-plan/scripts/execution-start.mjs",
      "dough-execute-plan/scripts/execution-source.mjs",
      "dough-execute-plan/scripts/execution-worktree-preparation-readiness-gate.mjs",
      "dough-execute-plan/scripts/history-preserving-publication.mjs",
      "dough-execute-plan/scripts/maintain-default-checkout.mjs",
      "dough-execute-plan/scripts/publication-resume.mjs",
      "dough-execute-plan/scripts/publication-git.mjs",
      "dough-execute-plan/scripts/publication-test-fixtures.mjs",
      "dough-bug-fixing/scripts/retained-artifacts.mjs",
      "dough-story-wrap-up/scripts/closure-publication.mjs",
      "dough-story-wrap-up/scripts/closure-resources.mjs",
    ];
    for (const modulePath of modules) {
      await import(pathToFileURL(`${root}/${modulePath}`));
    }
  ' "${root}"
}
