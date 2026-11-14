#!/usr/bin/env bash
# The field diff behind native assessor rejected cases: whether a candidate
# observation changes only fields of one signal its assessor declares.
# Sourced by native-assessor-counterexample.sh, whose header describes the
# signal declarations and observation format, and whose suite state names the
# assessor file and passing observation.
# shellcheck disable=SC2154 # Suite state assigned by the sourcing helper.

# Prints `ok` when candidate $2 differs from the passing observation only in
# fields of signal $1, otherwise what is wrong.
native_assessor_counterexample_diff() {
  awk -v signals="${native_assessor_counterexample_file}" \
    -v base="${native_assessor_counterexample_passing}" \
    -v candidate="$2" -v signal="$1" '
    function read_obs(side, path, line, key) {
      key = ""
      while ((getline line < path) > 0) {
        if (line ~ /^[A-Za-z0-9][A-Za-z0-9_.-]*: / ||
          line ~ /^[A-Za-z0-9][A-Za-z0-9_.-]*:$/) {
          key = line
          sub(/:.*/, "", key)
        } else if (key == "") {
          key = "(before any field)"
        }
        present[side, key] = 1
        keys[key] = 1
        value[side, key] = value[side, key] line "\n"
      }
      close(path)
    }
    function join_sorted(set, n, i, j, list, out, t) {
      n = 0
      for (i in set) list[++n] = i
      for (i = 2; i <= n; i++)
        for (j = i; j > 1 && list[j - 1] > list[j]; j--) {
          t = list[j]; list[j] = list[j - 1]; list[j - 1] = t
        }
      out = ""
      for (i = 1; i <= n; i++) out = out (i > 1 ? ", " : "") list[i]
      return out
    }
    BEGIN {
      prefix = "^[ \t]*(#|//) assessor-signal: "
      while ((getline line < signals) > 0) {
        if (line !~ prefix) continue
        sub(prefix, "", line)
        n = split(line, words, /[ \t]+/)
        declared[words[1]] = 1
        for (i = 2; i <= n; i++) {
          member[words[1], words[i]] = 1
          owned[words[i]] = 1
        }
      }
      close(signals)
      if (!(signal in declared)) {
        print "names signal " signal ", which " signals " does not declare"
        exit
      }
      read_obs("base", base)
      read_obs("candidate", candidate)
      for (key in keys)
        if (present["base", key] != present["candidate", key] ||
            value["base", key] != value["candidate", key]) {
          changed[key] = 1
          changes++
          if (!(key in owned)) { undeclared[key] = 1; undeclares++ }
        }
      if (!changes) { print "changes no field"; exit }
      if (undeclares) {
        print "changes undeclared field(s) " join_sorted(undeclared)
        exit
      }
      for (key in changed) {
        if ((signal, key) in member) { touched[signal] = 1; continue }
        outside++
        for (s in declared) if ((s, key) in member) touched[s] = 1
      }
      if (outside) {
        print "changes signals " join_sorted(touched) " (fields " \
          join_sorted(changed) ")"
        exit
      }
      print "ok"
    }
  '
}
