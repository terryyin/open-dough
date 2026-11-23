# Paired timing command

```bash
#!/bin/bash
set -u
name=$1
checkout=$2
folder=$3
clock=.agents/skills/dough-execute-plan/scripts/slice-clock.mjs
record_host() (
  cd "$checkout" || exit 1
  date -Iseconds
  pwd
  git rev-parse HEAD
  git status --short
  uname -srm
  sw_vers
  sysctl hw.logicalcpu
  uptime
  pmset -g ps
  node --version
  npm --version
  node -p 'require("./node_modules/vitest/package.json").version'
  node -p 'require("./node_modules/playwright/package.json").version'
  node -p 'require("./node_modules/playwright").chromium.executablePath()'
  shasum -a 256 package-lock.json
  ls -ld node_modules node_modules/.vitest-cache
)
record_host > "$folder/$name.host"
if ! pmset -g ps | rg -q "AC Power"; then
  printf '%s\n' "Paired measurement requires native macOS on AC power."
  exit 2
fi
node "$clock" run --log "$folder/$name.log" --exit-file "$folder/$name.exit" -- \
  /bin/bash -c 'cd "$1" && shift && exec "$@"' timed-launch "$checkout" \
  env "OPEN_DOUGH_DASHBOARD_FRONTEND_PROOF_RECORD=$folder/$name.json" \
  /usr/bin/time -p caffeinate -s -i npm run test:dashboard:frontend -- \
  dashboard/frontend-tests/launches --workers=2
result=$?
{ date -Iseconds; uptime; pmset -g ps; } >> "$folder/$name.host"
tail -12 "$folder/$name.log"
exit "$result"
```
