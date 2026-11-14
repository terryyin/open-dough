#!/usr/bin/env bash
# Fixture of credential-free comparison pairs through the maintainer entry
# (Distribution/tests/native-comparison.sh): a committed copy of this
# checkout's harness, payload revisions and a substitute Codex. A pair names
# the commit holding its case basis and refuses an uncommitted one, so the
# journeys run the entry, its cases and the support files they source as
# they are in this working tree, committed in a repository of their own,
# whatever this checkout's state or history depth.
#
#   native_comparison_pair_fixture SOURCE_DIR WORK
#     Creates WORK/source (that repository, one commit on main), WORK/payloads
#     (a clone of SOURCE_DIR whose HEAD is the baseline payload) and
#     WORK/bin/codex (the paused-supplier substitute). Leaves
#     native_comparison_fixture_entry (the command running the copied entry)
#     and native_comparison_fixture_baseline (SOURCE_DIR's HEAD).
#   native_comparison_fixture_rule WORK RULE [FAULT]
#     Commits, on the baseline payload, guidance naming the substitute's RULE
#     and, when given, its host FAULT (native-agent-paused-supplier.sh), and
#     prints that commit.
#   native_comparison_fixture_run WORK BASELINE CANDIDATE ARMS NAME [OPTION]...
#     Runs a substitute pair of the paused-supplier case through the copied
#     entry (with the substitute first on PATH and WORK/codex-home as
#     CODEX_HOME) into WORK/NAME.out and WORK/NAME.err; returns its status.
#   native_comparison_fixture_record WORK BASELINE CANDIDATE ARMS NAME [OPTION]...
#     Like native_comparison_fixture_run for a pair that must reach an
#     outcome; prints its record's path.
#   native_comparison_fixture_git DIR GIT-ARGUMENTS...
#     Git in DIR with the fixture's identity and fixed clock, for a journey's
#     own commits.
# shellcheck disable=SC2312 # The copy fails as tar does.

native_comparison_fixture_paths=(
  Distribution/tests/native-comparison.sh
  Distribution/tests/native-comparison
  Distribution/tests/support
  Distribution/tests/helpers
  scripts/owned-process-group.bash
)
native_comparison_fixture_entry=()
native_comparison_fixture_baseline=

native_comparison_fixture_git() {
  local dir=$1
  shift
  GIT_AUTHOR_DATE='2026-11-14T00:00:00Z' GIT_COMMITTER_DATE='2026-11-14T00:00:00Z' \
    git -C "${dir}" -c user.name='Comparison Fixture' \
    -c user.email='comparison-fixture@example.invalid' -c commit.gpgsign=false \
    -c init.defaultBranch=main "$@"
}

native_comparison_pair_fixture() {
  local source_dir=$1 work=$2 file
  mkdir -p -- "${work}/source" "${work}/bin"
  git -C "${source_dir}" ls-files --cached --others --exclude-standard --deduplicate -- \
    "${native_comparison_fixture_paths[@]}" | while IFS= read -r file; do
    [[ ! -e ${source_dir}/${file} ]] || printf '%s\0' "${file}"
  done | (cd -- "${source_dir}" && tar --null -T - -cf -) | tar -xf - -C "${work}/source" || return
  native_comparison_fixture_git "${work}/source" init -q || return
  native_comparison_fixture_git "${work}/source" add -A || return
  native_comparison_fixture_git "${work}/source" commit -q -m 'Native comparison harness' || return
  # By its physical path: the stream reader runs as a script only when its
  # path is the one Node resolves (macOS keeps temporary files under /var,
  # a link to /private/var).
  native_comparison_fixture_entry=("${BASH}"
    "$(cd -- "${work}/source" && pwd -P)/Distribution/tests/native-comparison.sh")
  git clone -q --shared --no-checkout "${source_dir}" "${work}/payloads" || return
  native_comparison_fixture_baseline=$(git -C "${source_dir}" rev-parse HEAD) || return
  cp -- "${source_dir}/Distribution/tests/support/native-agent-paused-supplier.sh" "${work}/bin/codex"
  chmod a+x "${work}/bin/codex"
}

native_comparison_fixture_rule() {
  local work=$1 rule=$2 fault=${3-}
  local skill="${work}/payloads/Distribution/src/skills/dough-execute-plan/SKILL.md"
  git -C "${work}/payloads" checkout -q --detach "${native_comparison_fixture_baseline}" || return
  printf '\n<!-- paused-supplier-substitute-rule: %s -->\n' "${rule}" >> "${skill}" || return
  [[ -z ${fault} ]] || printf '<!-- paused-supplier-substitute-fault: %s -->\n' "${fault}" >> "${skill}" || return
  native_comparison_fixture_git "${work}/payloads" commit -q -am "Substitute rule ${rule} ${fault}" || return
  git -C "${work}/payloads" rev-parse HEAD
}

native_comparison_fixture_run() {
  local work=$1 baseline=$2 candidate=$3 arms=$4 name=$5
  shift 5
  PATH="${work}/bin:${PATH}" CODEX_HOME="${work}/codex-home" "${native_comparison_fixture_entry[@]}" \
    --native codex --case paused-supplier --baseline "${baseline}" --candidate "${candidate}" \
    --arms "${arms}" --payload-repo "${work}/payloads" \
    --factor 'substitute rule in the installed guidance' --gain 'fewer commands per hold' \
    --quality 'the case assessor passes before effort counts' --model gpt-test --effort low \
    --deadline 120 --results-dir "${work}/results" "$@" > "${work}/${name}.out" 2> "${work}/${name}.err"
}

native_comparison_fixture_record() {
  native_comparison_fixture_run "$@" || {
    printf 'FAIL: the %s pair did not reach an outcome\n' "$5" >&2
    cat -- "$1/$5.out" "$1/$5.err" >&2
    return 1
  }
  printf '%s/record\n' "$(sed -n 's/^result-path: //p' "$1/$5.out")"
}

# A single frozen capture through the same public entry, for comparison
# journeys whose starting state is an already observed baseline.
native_comparison_fixture_capture() {
  local work=$1 baseline=$2 name=$3
  shift 3
  PATH="${work}/bin:${PATH}" CODEX_HOME="${work}/codex-home" "${native_comparison_fixture_entry[@]}" \
    --native codex --case paused-supplier --baseline "${baseline}" \
    --payload-repo "${work}/payloads" --model gpt-test --effort low --deadline 120 \
    --save-baseline "${work}/${name}.json" --results-dir "${work}/results" "$@" \
    > "${work}/${name}.out" 2> "${work}/${name}.err"
}

# Each native session creates its own saved root record. Journeys use this
# observed host boundary to distinguish candidate-only from fresh acquisition.
native_comparison_fixture_sessions() {
  if [[ -d $1/codex-home/sessions ]]; then
    find "$1/codex-home/sessions" -type f -name '*.jsonl' | wc -l | tr -d ' '
  else
    echo 0
  fi
}
