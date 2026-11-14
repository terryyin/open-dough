#!/usr/bin/env bash
# Read a payload declaration without evaluating an installer. Historical
# literal arrays and current data-only append fragments share this reader.
read_managed_files_declaration() {
  local install_script=$1 declared
  # shellcheck disable=SC2016 # The include prefix matches literal installer source text.
  if ! declared=$(awk '
    function declaration(path, fragment, depth, line, result, inside, relative, directory, n, words, i) {
      if (depth > 8 || active[path]) return 0
      active[path] = 1
      directory = path
      if (directory !~ /\//) directory = "."
      sub(/\/[^\/]*$/, "", directory)
      while ((result = (getline line < path)) > 0) {
        if (line ~ /^[[:space:]]*(#.*)?$/) continue
        if (line ~ /^managed_files(\+)?=\($/) {
          if (inside) return 0
          if (line == "managed_files=(") {
            if (initialized++) return 0
          } else if (!initialized) return 0
          inside = 1
          continue
        }
        if (inside) {
          if (line == ")") { inside = 0; continue }
          n = split(line, words, /[[:space:]]+/)
          for (i = 1; i <= n; i++) {
            if (words[i] == "") continue
            if (words[i] !~ /^[A-Za-z0-9_.\/-]+$/ || words[i] ~ /(^|\/)\.\.(\/|$)/) return 0
            if (words[i] == "dough-update/SKILL.md") core = 1
            print words[i]
          }
          continue
        }
        if (index(line, include_prefix) == 1 && substr(line, length(line)) == "\"") {
          relative = substr(line, length(include_prefix) + 1, length(line) - length(include_prefix) - 1)
          if (relative ~ /^(Distribution\/)?src\/install\/[a-z0-9-]+-payload[.]sh$/) {
            if (!initialized || !declaration(directory "/" relative, 1, depth + 1)) return 0
            continue
          }
        }
        if (fragment || line ~ /^managed_files[+=]/) return 0
      }
      close(path)
      delete active[path]
      return result == 0 && !inside
    }
    BEGIN {
      include_prefix = "source \"$(dirname -- \"${BASH_SOURCE[0]}\")/"
      if (!declaration(ARGV[1], 0, 0) || !initialized || !core) exit 1
      exit 0
    }
  ' "${install_script}"); then
    echo "Cannot read managed payload declaration: ${install_script}" >&2
    return 1
  fi
  printf '%s\n' "${declared}"
}
