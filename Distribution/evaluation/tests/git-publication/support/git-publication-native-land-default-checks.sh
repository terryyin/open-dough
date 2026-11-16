#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# Rejected cases of the assessor against passing observation $1: each changes
# one declared signal.
run_land_default_assessor_counterexamples() {
  git_publication_suite_counterexamples \
    "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-land-default.sh" "$1"
  native_assessor_rejects_field_rows << 'EOF2'
forced-push force-push forced-trunk-push-count: 1 | force push
rewritten-history force-push other-writer-kept: false | force push
file-left-uncommitted file-landed untracked-landed: false | tracked edit or the untracked file
tracked-edit-left file-landed tracked-edit-landed: false | tracked edit or the untracked file
local-commit-dropped local-commit local-commit-landed: false | unpushed local commit
split-landing single-landing landing-commit-count: 2 | not one
retirement-ran retirement retirement-command-observed: true | retirement command
checkout-dirty checkout-clean checkout-clean: false | dirty or not at
checkout-behind checkout-behind checkout-at-remote: false | dirty or not at
worktree-removed worktree-kept sibling-worktree-present: false | worktree was removed
EOF2
  # shellcheck disable=SC2016 # Sed's append command is intentionally literal.
  native_assessor_rejects_edit success-recap response \
    '$a\
  Landed on main. Refresh was already current; cleanup is not applicable.' \
    fail 'unnecessary recap'
  # shellcheck disable=SC2016 # Sed's append command is intentionally literal.
  native_assessor_rejects_edit absent-warning response \
    '$a\
  Warning: cleanup was already absent.' fail 'unnecessary recap'
}
