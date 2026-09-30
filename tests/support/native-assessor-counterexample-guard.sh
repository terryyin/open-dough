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
#     or `&& {` with such a failure on a following line, or `|| rc=$?` that
#     captures the status to test it, or an `if !` whose else-branch fails;
#   - a bare `[[ ...status == fail ]]` (or inconclusive or pending) assertion,
#     or a bare `[[ ...status != pass ]]`;
#   - any other command, after joining backslash continuations, with a bare or
#     wholly quoted argument word fail, inconclusive, or pending; echo, printf,
#     an assignment, local, return, `[[`, and commands named
#     `native_assessor_rejects*` are left alone, and a quoted phrase such as
#     'a stop pending resolution' is not a verdict word;
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
  LC_ALL=C awk -v js_assessors="${js_assessors}" '
    function flag(what, at, text) {
      if ((FILENAME, at) in seen) return
      seen[FILENAME, at] = 1
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
    # Ends the current command: names a verdict word passed to a wrapper.
    function end_segment() {
      if (cmd != "" && hit && cmd !~ exempt) wrapper = 1
      cmd = ""; hit = 0
    }
    # Takes finished word w of the current command.
    function end_word(   bare) {
      if (w == "") return
      if (cmd == "") {
        if (w !~ /^(if|elif|then|else|do|while|until|!|[{])$/ &&
          w !~ /^[A-Za-z_][A-Za-z0-9_]*=/) cmd = w
      } else {
        bare = w
        if (bare ~ /^".*"$/ || bare ~ /^'"'"'.*'"'"'$/)
          bare = substr(bare, 2, length(bare) - 2)
        if (bare ~ /^(fail|inconclusive|pending)$/) hit = 1
      }
      w = ""
    }
    # Whether statement s passes a verdict word to a non-exempt command.
    function passes_verdict(s,   i, c, q) {
      wrapper = 0; cmd = ""; hit = 0; w = ""; q = ""
      for (i = 1; i <= length(s); i++) {
        c = substr(s, i, 1)
        if (q != "") {
          w = w c
          if (c == q) q = ""
        } else if (c == "\"" || c == "'"'"'") {
          q = c; w = w c
        } else if (c == "#" && w == "") {
          break
        } else if (c ~ /[ \t]/) {
          end_word()
        } else if (c ~ /[;&|()]/) {
          end_word(); end_segment()
        } else {
          w = w c
        }
      }
      end_word(); end_segment()
      return wrapper
    }
    BEGIN {
      exempt = "^(echo|printf|local|return|[[][[]?|native_assessor_rejects[A-Za-z0-9_]*)$"
      name = "([A-Za-z0-9_]*_assess(_[A-Za-z0-9_]+)?|assess_[A-Za-z0-9_]+)([ \t;)]|$)"
      status = "[$][{]?[A-Za-z0-9_]*status[}]?[\"]?"
      rejected = "[\"'"'"']?(fail|inconclusive|pending)[\"'"'"']?"
      passed = "[\"'"'"']?pass[\"'"'"']?"
      fails = "(FAIL|exit[ \t]+[1-9]|return[ \t]+[1-9])"
      removed = "(^|[^A-Za-z0-9_])(git_publication_suite_expect_rejected|git_publication_suite_expect_assess|assert_not_pass)([^A-Za-z0-9_]|$)"
    }
    FNR == 1 {
      watching = 0; braced = 0; negated = 0; joined = ""
      js = FILENAME ~ /\.(mjs|js)$/
      js_defines = 0
      js_calls = 0
    }
    {
      t = $0
      sub(/^[ \t]+/, "", t)
      # Joins backslash continuations into one statement for the wrapper rule.
      if (joined == "") stmt_line = FNR
      if (t ~ /\\$/) { joined = joined substr(t, 1, length(t) - 1) " "; stmt_done = 0 }
      else { stmt = joined t; joined = ""; stmt_done = 1 }
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
    braced {
      if (t ~ /^}/) braced = 0
      else if (t ~ fails) { flag("fails the check when an assessor passes", braced_line, braced_text); braced = 0 }
    }
    negated {
      if (t ~ /^if[ \t]/ && t !~ /(^|[ \t;])fi[ \t;]*$/) neg_depth++
      else if (neg_depth > 0 && t ~ /^fi([ \t;]|$)/) neg_depth--
      else if (neg_depth == 0 && t ~ /^fi([ \t;]|$)/) negated = 0
      else if (neg_depth == 0 && t ~ /^else([ \t;]|$)/) neg_else = 1
      else if (neg_else && neg_depth == 0 && t ~ fails) {
        flag("tests an assessor call expecting a rejection", neg_line, neg_text)
        negated = 0
      }
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
    t ~ ("^(if|elif)[ \t]+![ \t]+" name) {
      if (t ~ /;[ \t]*else[ \t].*(FAIL|exit[ \t]+[1-9]|return[ \t]+[1-9])/)
        flag("tests an assessor call expecting a rejection", FNR, t)
      else if (t !~ /(^|[ \t;])fi[ \t;]*$/) {
        negated = 1; neg_else = 0; neg_depth = 0; neg_line = FNR; neg_text = t
      }
    }
    t ~ ("^![ \t]+" name) || t ~ ("[;{][ \t]*![ \t]+" name) {
      flag("negates an assessor call", FNR, t)
    }
    t ~ ("(^|[ \t;(])" name) && t ~ ("&&[^#]*" fails) {
      flag("fails the check when an assessor passes", FNR, t)
    }
    t ~ ("(^|[ \t;(])" name) && t ~ /&&[ \t]*[{][ \t]*$/ {
      braced = 1; braced_line = FNR; braced_text = t
    }
    t ~ ("(^|[ \t;(])" name) && t ~ /[|][|][ \t]*[A-Za-z0-9_]+=[$][?]/ {
      flag("captures an assessor status to test for a rejection", FNR, t)
    }
    t ~ ("^[[][[][ \t]*[\"]?" status "[ \t]*==?[ \t]*" rejected) ||
      t ~ ("^[[][[][ \t]*[\"]?" status "[ \t]*!=[ \t]*" passed) {
      flag("expects a rejection verdict outside the helper", FNR, t)
    }
    stmt_done && passes_verdict(stmt) {
      flag("passes a rejection verdict to a wrapper", stmt_line, stmt)
    }
    END { exit bad }
  ' "$@"
}
