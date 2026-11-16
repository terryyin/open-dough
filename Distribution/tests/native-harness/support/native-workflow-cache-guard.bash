# Every optional cache restore must use the locked, platform-compatible browser
# cache. All acquisition and validation steps retain their ordinary failure gate.
native_workflow_cache_guard() {
  awk '
    BEGIN {
      expected_key = "key: playwright-chromium-${{ runner.os }}-${{ runner.arch }}-${{ hashFiles(\047package-lock.json\047) }}"
      expected_gate = "if: ${{ !cancelled() && steps.npm.outcome == \047success\047 }}"
    }
    function finish() {
      if (cache) {
        caches++
        if (tolerate != 1 || !action || !identity || !path || !key || !prerequisite)
          bad = 1
      }
    }
    /^ *- (name|uses):/ {
      finish()
      cache = ($0 ~ /name: Cache Playwright Chromium$/)
      tolerate = action = identity = path = key = prerequisite = 0
    }
    /restore-keys:|--with-deps|if:.*always\(/ { bad = 1 }
    /continue-on-error:/ {
      if (!cache || $0 !~ /continue-on-error: true$/) bad = 1
      tolerate++
    }
    cache && /uses: actions\/cache@v[0-9]+$/ { action = 1 }
    cache && /id: playwright-cache$/ { identity = 1 }
    cache && /path: ~\/.cache\/ms-playwright$/ { path = 1 }
    cache {
      line = $0
      sub(/^ */, "", line)
      if (line == expected_key) key = 1
      if (line == expected_gate) prerequisite = 1
    }
    END { finish(); if (bad || caches == 0) exit 1 }
  ' "$@"
}
