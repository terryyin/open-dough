#!/usr/bin/env bash
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
node --test --test-concurrency=1 "${source_dir}/src/skills/dough-execute-plan/scripts/"*.test.mjs
