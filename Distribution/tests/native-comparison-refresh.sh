#!/usr/bin/env bash
# Credential-free refresh and recovery of a comparison case through the
# maintainer entry (Distribution/tests/native-comparison.sh), on a committed
# copy of this checkout's harness
# (Distribution/tests/support/native-comparison-pair-fixture.sh): a pair
# names the commit holding its case basis and refuses an uncommitted one; a
# refreshed assessment, committed, gives a new basis and a new record while
# the earlier record stays as it was; after the files move, --recover finds
# each record's basis by its hashes and prints the record unchanged; drift
# in payloads and host is stated, never rerun; an edited record or one whose
# inputs no commit holds is not recovered; and the recovery judge's rejected
# cases.
# shellcheck disable=SC1091,SC2154,SC2310,SC2312 # Sourced fixture and helper globals; journeys report their verdicts.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/support/native-comparison-pair-fixture.sh"
source "${source_dir}/Distribution/tests/support/native-observation.sh"
source "${source_dir}/Distribution/tests/support/native-comparison-basis-verdict.sh"
source "${source_dir}/Distribution/tests/support/native-assessor-counterexample.sh"

work=$(mktemp -d)
trap 'rm -rf -- "${work}"' EXIT
native_comparison_pair_fixture "${source_dir}" "${work}"
quiet=$(native_comparison_fixture_rule "${work}" quiet)
git -C "${work}/payloads" tag v-fixture "${native_comparison_fixture_baseline}"
source_repo=${work}/source
case_dir=Distribution/tests/native-comparison/paused-supplier
comparisons=${case_dir}/comparisons
# Commits every change of the fixture source with MESSAGE; prints the commit.
commit() {
  native_comparison_fixture_git "${source_repo}" add -A
  native_comparison_fixture_git "${source_repo}" commit -q -m "$1"
  git -C "${source_repo}" rev-parse HEAD
}
# Recovers RECORD through this checkout's entry, with OPTIONS and the codex
# in host_bin first on PATH, into NAME.out; returns the entry's status.
host_bin=${work}/bin
recover() {
  local name=$1 record=$2
  shift 2
  PATH="${host_bin}:${PATH}" "${BASH}" "${source_dir}/Distribution/tests/native-comparison.sh" \
    --recover "${record}" --payload-repo "${work}/payloads" "$@" > "${work}/${name}.out"
}
# Requires recovery NAME to end with RECORD's bytes, unchanged.
report_is() {
  sed -n '/^report: /,$p' "${work}/$1.out" | tail -n +2 | cmp -s - "$2" || {
    printf 'FAIL: recovery %s did not report the record unchanged\n' "$1" >&2
    exit 1
  }
}

# The first comparison names the commit holding its case basis; the
# maintainer keeps its record with the case.
basis_a=$(git -C "${source_repo}" rev-parse HEAD)
first=$(native_comparison_fixture_record "${work}" v-fixture "${quiet}" concurrent first)
grep -Fqx 'verdict: preserved' "${first}"
grep -Fqx "case-basis-revision: ${basis_a}" "${first}"
cp -- "${first}" "${source_repo}/${comparisons}/first.txt"
kept_a=$(commit 'Keep the first comparison')

# A refreshed assessment that is not committed yet runs no arm.
sed -i.orig "s/^  case_assess_reason='held through/  case_assess_reason='refreshed: held through/" \
  "${source_repo}/${case_dir}/assess.bash"
rm -- "${source_repo}/${case_dir}/assess.bash.orig"
attempts=$(find "${work}/results/codex" -mindepth 3 -maxdepth 3 | wc -l)
status=0
native_comparison_fixture_run "${work}" v-fixture "${quiet}" concurrent uncommitted || status=$?
[[ ${status} -eq 2 ]]
grep -q 'the case basis is not committed' "${work}/uncommitted.err"
grep -Fq " M ${case_dir}/assess.bash" "${work}/uncommitted.err"
[[ $(find "${work}/results/codex" -mindepth 3 -maxdepth 3 | wc -l) -eq ${attempts} ]]

# Committed, the refresh runs: the new record names the new basis, which
# differs from the first only in the assessment, and the first record keeps
# its bytes.
basis_b=$(commit 'Refresh the paused-supplier assessment')
second=$(native_comparison_fixture_record "${work}" v-fixture "${quiet}" sequential second)
grep -Fqx "case-basis-revision: ${basis_b}" "${second}"
grep -Eq "^baseline-outcome: pass: refreshed: held through" "${second}"
diff <(grep '^case-input-hash: ' "${first}") <(grep '^case-input-hash: ' "${second}") \
  | grep '^[<>]' > "${work}/refreshed-inputs" || true
[[ $(wc -l < "${work}/refreshed-inputs") -eq 2 ]]
[[ $(grep -c " ${case_dir}/assess.bash$" "${work}/refreshed-inputs") -eq 2 ]]
cmp -s "${first}" "${source_repo}/${comparisons}/first.txt"
cp -- "${second}" "${source_repo}/${comparisons}/second.txt"
commit 'Keep the refreshed comparison' > /dev/null

# The harness moves, as trunk once moved tests/ under Distribution/.
git -C "${source_repo}" mv Distribution Moved
commit 'Move the harness' > /dev/null
moved=${source_repo}/Moved/tests/native-comparison/paused-supplier/comparisons

# Each record recovers its own basis from its hashes, at the paths of then,
# and reports itself unchanged.
recover first "${moved}/first.txt"
grep -Fqx "record-history: unchanged since ${kept_a}" "${work}/first.out"
grep -Fqx "named-revision: ${basis_a} holds the recorded inputs" "${work}/first.out"
grep -Fqx "case-basis-revision: ${basis_a}" "${work}/first.out"
grep -Fqx "case-basis-directory: ${case_dir}" "${work}/first.out"
grep -Fqx 'recovery: pass' "${work}/first.out"
grep -q "^rerun: possible; from case basis ${basis_a}, not the case as later refreshed; recovery never" "${work}/first.out"
report_is first "${first}"
assessment_a=$(git -C "${source_repo}" show "${basis_a}:${case_dir}/assess.bash" | shasum -a 256)
grep -Fqx "case-input-hash: ${assessment_a%% *} ${case_dir}/assess.bash" "${first}"
recover second "${moved}/second.txt"
grep -Fqx "case-basis-revision: ${basis_b}" "${work}/second.out"
report_is second "${second}"

# Drift keeps a rerun from repeating the first comparison; it is stated, and
# the report stays the one observed.
git -C "${work}/payloads" tag -d v-fixture > /dev/null
mkdir -p -- "${work}/drift"
printf '#!/usr/bin/env bash\necho codex-cli 9.9.9\n' > "${work}/drift/codex"
chmod a+x "${work}/drift/codex"
host_bin=${work}/drift recover drifted "${moved}/first.txt"
grep -Fqx 'rerun-limit: v-fixture no longer names the frozen commit; a rerun must name the commit' "${work}/drifted.out"
grep -Fqx 'rerun-limit: the host is now codex-cli 9.9.9; the arms ran codex-cli paused-supplier-substitute' \
  "${work}/drifted.out"
grep -q '^rerun: not as recorded; ' "${work}/drifted.out"
grep -Fqx "case-basis-revision: ${basis_a}" "${work}/drifted.out"
report_is drifted "${first}"
recover unavailable "${moved}/first.txt" --payload-repo "${source_repo}"
grep -Fqx "rerun-limit: the candidate payload ${quiet} is not in the payload repository" "${work}/unavailable.out"
grep -q '^rerun: unavailable; ' "${work}/unavailable.out"
grep -Fqx 'recovery: pass' "${work}/unavailable.out"
report_is unavailable "${first}"
cmp -s "${first}" "${moved}/first.txt"

# A record edited after it was kept is not recovered as the observation.
sed 's/^verdict: preserved$/verdict: improved/' "${first}" > "${moved}/first.txt"
status=0
recover relabeled "${moved}/first.txt" || status=$?
[[ ${status} -eq 1 ]]
grep -Fqx "record-history: edited since ${kept_a} (2 versions)" "${work}/relabeled.out"
cp -- "${first}" "${moved}/first.txt"

# Nor is a record whose inputs no commit holds, such as a case changed
# without being committed.
sed "s|^case-input-hash: [0-9a-f]* ${case_dir}/assess.bash$|case-input-hash: $(printf '%064d' 0) ${case_dir}/assess.bash|" \
  "${first}" > "${moved}/uncommitted.txt"
commit 'Keep a record of uncommitted inputs' > /dev/null
status=0
recover unmatched "${moved}/uncommitted.txt" || status=$?
[[ ${status} -eq 1 ]]
grep -Fqx "named-revision: ${basis_a} lacks 1 of the recorded inputs" "${work}/unmatched.out"
grep -Fqx 'case-basis-revision: none' "${work}/unmatched.out"

# The recovery judge's rejected cases, from the first record's recovery.
sed '/^recovery: /,$d' "${work}/first.out" > "${work}/first.observations"
native_assessor_counterexamples \
  "${source_dir}/Distribution/tests/support/native-comparison-basis-verdict.sh" "${work}/first.observations" \
  --verdict native_comparison_recovery_status native_comparison_recovery_reason -- native_comparison_recovery_judge
native_assessor_rejects_field_rows << 'EOF'
no-recorded-inputs inputs recorded-inputs: 0 | names no input hashes
unmatched-inputs basis case-basis-revision: none | no commit of this repository holds the recorded inputs
relabeled-record record record-history: edited since 0000000000000000000000000000000000000000 (2 versions) | changed after it was added
EOF
