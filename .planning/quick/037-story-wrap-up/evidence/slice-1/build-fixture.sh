#!/usr/bin/env bash
# Build the Slice 1 isolated Git fixture. Setup only; it does not wrap up.
set -euo pipefail

target=${1:?target directory required}
rm -rf -- "${target}"
mkdir -p -- "${target}/.planning/quick/001-widget-status" \
  "${target}/.planning/seeds" \
  "${target}/docs" \
  "${target}/tests" \
  "${target}/src"

cat > "${target}/AGENTS.md" <<'EOF'
# Widget project conventions

- Repository root is this directory.
- Canonical seeds live in `.planning/seeds/`. Story identity is the heading
  or the `widget-status` anchor.
- Executable plans live in `.planning/quick/`. Slice status is
  `planned`, `in-progress`, or `done`.
- Product backlog is `.planning/PRODUCT-BACKLOG.md`.
- A retrospective is complete when the user says so or the conversation
  contains `## EXECUTION RETROSPECTIVE COMPLETE`. Empty output is complete.
- Commit uncommitted spent history before deleting it:
  `git commit -am "chore: preserve spent history before wrap-up"`
- Wrap-up deletions stay in the working tree unless a commit is authorized.
EOF

cat > "${target}/docs/widget.md" <<'EOF'
# Widget

The widget reports whether its status endpoint is reachable.
EOF

cat > "${target}/src/widget.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
# Widget status helper. Product behavior, not story history.
printf 'ok\n'
EOF

cat > "${target}/tests/widget-status.sh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
[[ "$(bash src/widget.sh)" == "ok" ]]
EOF

cat > "${target}/SENTINEL.md" <<'EOF'
UNRELATED-SENTINEL-KEEP

This file is unrelated active content and must remain byte-identical.
EOF

cat > "${target}/.planning/PRODUCT-BACKLOG.md" <<'EOF'
# Product backlog

## Near-future direction

Keep the widget status endpoint reliable.

## Backlog list

- [Report widget status](seeds/SEED-W-widget-status.md#widget-status) — SEED-W
- [Keep the audit trail](seeds/SEED-U-unrelated.md#audit-trail) — SEED-U

## Recently done
EOF

cat > "${target}/.planning/seeds/SEED-U-unrelated.md" <<'EOF'
# SEED-U: Unrelated audit trail

<a id="audit-trail"></a>

### Keep the audit trail

UNRELATED-SENTINEL-KEEP

This sibling story is active and must remain.
EOF

cat > "${target}/.planning/seeds/SEED-W-widget-status.md" <<'EOF'
# SEED-W: Widget status

<a id="widget-status"></a>

### Report widget status

**Status:** execution and retrospective complete.
**Plan:** `.planning/quick/001-widget-status/PLAN.md`.

SPENT-STORY-WIDGET-STATUS

A failed widget status check is retried twice before an error is returned.

This section is spent story history for wrap-up.
EOF

cat > "${target}/.planning/quick/001-widget-status/PLAN.md" <<'EOF'
# Report widget status

Status: done. SPENT-STORY-WIDGET-STATUS

## Learnings

A failed widget status check is retried twice before an error is returned.
Do not narrate this execution in product docs.

### Close the status path
Type: Behavior
Status: done
EOF

chmod +x "${target}/src/widget.sh" "${target}/tests/widget-status.sh"

git -C "${target}" init -q
git -C "${target}" config user.email 'wrap-up-fixture@example.test'
git -C "${target}" config user.name 'Wrap-Up Fixture'
git -C "${target}" add .
git -C "${target}" commit -qm 'fixture: committed widget baseline'
