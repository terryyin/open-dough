#!/usr/bin/env bash
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
node --test --test-concurrency=1 \
  "${source_dir}/src/skills/dough-story-wrap-up/scripts/closure-publication.test.mjs" \
  "${source_dir}/src/skills/dough-story-wrap-up/scripts/closure-publication-refresh.test.mjs" \
  "${source_dir}/src/skills/dough-story-wrap-up/scripts/closure-resource-cleanup.test.mjs" \
  "${source_dir}/src/skills/dough-story-wrap-up/scripts/closure-publication-resume.test.mjs" \
  "${source_dir}/src/skills/dough-story-wrap-up/scripts/closure-publication-resume-published.test.mjs" \
  "${source_dir}/src/skills/dough-story-wrap-up/scripts/closure-story-integration.test.mjs" \
  "${source_dir}/src/skills/dough-story-wrap-up/scripts/closure-story-branch-cleanup.test.mjs" \
  "${source_dir}/src/skills/dough-story-wrap-up/scripts/closure-current-branch.test.mjs"
