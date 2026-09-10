#!/usr/bin/env bash
# Build the Slice 4 product-review starting fixture. Setup only.
set -euo pipefail

target=${1:?target directory required}
slice3=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../slice-3" && pwd)
bash "${slice3}/build-fixture.sh" existing-story "${target}"

cat >> "${target}/.planning/seeds/SEED-W-widget-status.md" <<'EOF'

<a id="widget-slo"></a>

### Document widget SLO

**For / why:** Operators need a published availability target.
**Outcome:** The widget doc states the status endpoint SLO.
EOF

python3 -c '
from pathlib import Path
p = Path("'"${target}"'") / ".planning/PRODUCT-BACKLOG.md"
text = p.read_text()
needle = "- [Retry widget status with backoff](seeds/SEED-W-widget-status.md#retry-backoff) — SEED-W\n"
insert = needle + "- [Document widget SLO](seeds/SEED-W-widget-status.md#widget-slo) — SEED-W\n"
if needle not in text:
    raise SystemExit("retry queue entry missing")
p.write_text(text.replace(needle, insert, 1))
'

git -C "${target}" add -A
git -C "${target}" commit -qm 'fixture: product-review starting queue'
