#!/usr/bin/env bash
# The guard that keeps native assessor rejected cases in the helper
# (native-assessor-counterexample.sh). It reads test files and prints one
# `FAIL: FILE:LINE: ...` per statement outside the helper that expects an
# assessor to reject:
#   - a call to a removed rejection primitive;
#   - an `expect...` call with a fail, inconclusive, or pending verdict;
#   - an assessor call negated as a statement (`! x_assess ...`), or followed
#     by `&& ...FAIL`;
#   - an `if`/`elif` on an assessor call, a pass status, or a status other
#     than fail, inconclusive, or pending, whose then-branch fails the check;
#   - a bare `[[ ...status == fail ]]` (or inconclusive or pending) assertion;
#   - in JavaScript, a fail, inconclusive, or pending literal beside a call of
#     an assessor exported by a file declaring `// assessor-signal:` lines.
# An assessor call is a command named `*_assess`, `*_assess_*`, or `assess_*`.
# Required-pass checks, runners that set a verdict from an assessor, conditions
# inside assessor definitions (`&& ! ..._accepts_...`), and observer readings
# do not match those shapes and are left alone.
#
#   native_assessor_counterexample_guard FILE...
#     Returns 1 when any FILE holds such a statement.
#   native_assessor_counterexample_guard_files
#     Lists the test files under ./tests the guard reads, run from the
#     repository root: shell and JavaScript files other than the helper and its
#     check, this guard and its check (both named
#     native-assessor-counterexample-guard.sh), and the guard's fixture.
# shellcheck disable=SC2312 # A file without signals is not an error.

native_assessor_counterexample_guard_files() {
  find tests -type f \
    \( -name '*.sh' -o -name '*.bash' -o -name '*.mjs' -o -name '*.js' \) \
    ! -name 'native-assessor-counterexample.sh' \
    ! -name 'native-assessor-counterexample-diff.sh' \
    ! -name 'native-assessor-counterexample-guard.sh' \
    ! -name 'native-assessor-counterexample-stray-suite.sh' \
    ! -name 'native-assessor-counterexamples.sh' \
    ! -path '*/node_modules/*' | LC_ALL=C sort
}

native_assessor_counterexample_guard() {
  local js_assessors
  if (($# == 0)); then
    echo 'FAIL: native_assessor_counterexample_guard needs files to read' >&2
    return 1
  fi
  # JavaScript assessors: functions exported by files declaring signals.
  js_assessors=$(grep -l '^// assessor-signal:' -- "$@" 2> /dev/null \
    | xargs -I{} sed -n -E 's/^export (async )?function (assess[A-Za-z0-9_]*).*/\2/p' {} \
    | paste -sd '|' -)
  awk -v js_assessors="${js_assessors}" '
    function flag(what, at, text) {
      printf "FAIL: %s:%d: %s: %s\n", FILENAME, at, what, text
      bad = 1
    }
    # Starts watching the then-branch of the `if` on this line.
    function watch(what) {
      watching = 1; in_then = 0; depth = 0
      watch_what = what; watch_line = FNR; watch_text = t
    }
    # Checks then-branch text s for a failure of the check.
    function then_fails(s) {
      if (s ~ fails) {
        flag(watch_what, watch_line, watch_text)
        watching = 0
      }
    }
    BEGIN {
      name = "([A-Za-z0-9_]*_assess(_[A-Za-z0-9_]+)?|assess_[A-Za-z0-9_]+)([ \t;)]|$)"
      status = "[$][{]?[A-Za-z0-9_]*status[}]?[\"]?"
      rejected = "[\"'"'"']?(fail|inconclusive|pending)[\"'"'"']?"
      passed = "[\"'"'"']?pass[\"'"'"']?"
      fails = "(FAIL|exit[ \t]+[1-9]|return[ \t]+[1-9])"
      removed = "(^|[^A-Za-z0-9_])(git_publication_suite_expect_rejected|git_publication_suite_expect_assess|assert_not_pass)([^A-Za-z0-9_]|$)"
    }
    FNR == 1 {
      watching = 0
      js = FILENAME ~ /\.(mjs|js)$/
      js_defines = 0
      js_calls = 0
    }
    {
      t = $0
      sub(/^[ \t]+/, "", t)
    }
    t ~ /^(#|\/\/)/ {
      if (js && t ~ /^\/\/ assessor-signal:/) js_defines = 1
      next
    }
    t ~ removed { flag("calls a removed rejection primitive", FNR, t); next }
    t ~ ("(^|[^A-Za-z0-9_])[A-Za-z0-9_]*expect[A-Za-z0-9_]*[ \t]+" rejected "([ \t]|$)") {
      flag("expects a rejection verdict outside the helper", FNR, t); next
    }
    js {
      if (js_assessors != "" && !js_defines &&
        t ~ ("(^|[^A-Za-z0-9_])(" js_assessors ")[ \t]*[(]")) js_calls = 1
      if (js_calls && t ~ /["'"'"'](fail|inconclusive|pending)["'"'"']/)
        flag("expects a rejection verdict outside the helper", FNR, t)
      next
    }
    watching && in_then {
      if (t ~ /^(if|case)[ \t]/ && t !~ /(^|[ \t;])(fi|esac)[ \t;]*$/) depth++
      else if (depth > 0 && t ~ /^(fi|esac)([ \t;]|$)/) depth--
      else if (depth == 0 && t ~ /^(else|elif|fi)([ \t;]|$)/) watching = 0
      if (watching) then_fails(t)
    }
    watching && !in_then && FNR > watch_line && t ~ /(^|[ \t;])then([ \t]|$)/ {
      in_then = 1
      rest = t
      sub(/.*(^|[ \t;])then/, "", rest)
      then_fails(rest)
    }
    t ~ ("^(if|elif)[ \t]+" name) {
      watch("tests an assessor call expecting a rejection")
    }
    t ~ ("^(if|elif)[ \t]+[[][[]") &&
      (t ~ (status "[ \t]*==?[ \t]*" passed) ||
      t ~ (status "[ \t]*!=[ \t]*" rejected)) {
      watch("tests a verdict expecting a rejection")
    }
    watching && FNR == watch_line && t ~ /(^|[ \t;])then([ \t]|$)/ {
      in_then = 1
      rest = t
      sub(/.*(^|[ \t;])then/, "", rest)
      then_fails(rest)
    }
    t ~ ("^![ \t]+" name) || t ~ ("[;{][ \t]*![ \t]+" name) {
      flag("negates an assessor call", FNR, t)
    }
    t ~ ("(^|[ \t;(])" name) && t ~ ("&&[^#]*" fails) {
      flag("fails the check when an assessor passes", FNR, t)
    }
    t ~ ("^[[][[][ \t]*[\"]?" status "[ \t]*==?[ \t]*" rejected) {
      flag("expects a rejection verdict outside the helper", FNR, t)
    }
    END { exit bad }
  ' "$@"
}
