#!/usr/bin/env bash
# Build Slice 3 follow-up fixtures. Setup only; it does not wrap up.
set -euo pipefail

mode=${1:?mode: existing-story | create-home | missing-outcome}
target=${2:?target directory required}
slice2=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../slice-2" && pwd)
bash "${slice2}/build-fixture.sh" "${target}"

mkdir -p "${target}/.planning/quick/002-retry-backoff"
cat > "${target}/.planning/quick/002-retry-backoff/PLAN.md" <<'EOF'
# Retry widget status with backoff

FOLLOW-UP-PLAN-KEEP

Status: planned. Corrective follow-up from the widget-status retrospective.
Do not execute during wrap-up of Report widget status.

### Add backoff
Type: Behavior
Status: planned
EOF

cat > "${target}/.planning/quick/001-widget-status/RETROSPECTIVE.md" <<'EOF'
## EXECUTION RETROSPECTIVE COMPLETE

No process findings. Follow-up plan:
`.planning/quick/002-retry-backoff/PLAN.md`
EOF

case "${mode}" in
existing-story)
  cat >> "${target}/.planning/seeds/SEED-W-widget-status.md" <<'EOF'

<a id="retry-backoff"></a>

### Retry widget status with backoff

**For / why:** Operators need a reachable status endpoint after a blip.
**Outcome:** A failed check waits and retries with backoff before erroring.
**Plan:** none yet.
EOF
  python3 -c '
from pathlib import Path
p = Path("'"${target}"'") / ".planning/PRODUCT-BACKLOG.md"
text = p.read_text()
text = text.replace(
    "- [Keep the audit trail](seeds/SEED-W-widget-status.md#audit-trail) — SEED-W\n",
    "- [Keep the audit trail](seeds/SEED-W-widget-status.md#audit-trail) — SEED-W\n- [Retry widget status with backoff](seeds/SEED-W-widget-status.md#retry-backoff) — SEED-W\n",
)
p.write_text(text)
'
  ;;
create-home)
  ;;
missing-outcome)
  ;;
*)
  echo "unknown mode: ${mode}" >&2
  exit 1
  ;;
esac

git -C "${target}" add -A
git -C "${target}" commit -qm "fixture: follow-up plan (${mode})"
