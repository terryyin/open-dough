# Save and reassess native comparison baselines

Use the [native comparison entry](native-comparison.md) for catalog selection,
runtime requirements, authorization and ordinary journey/pair operation.

## Save one frozen baseline

An authorized baseline capture needs no candidate. Give `--baseline` a commit
or tag and `--save-baseline` a new case-local filename. The command freezes and
installs that revision, runs one case journey and exports its compact evidence:

```sh
PATH=/opt/homebrew/bin:$PATH TMPDIR=$HOME/tmp/native-comparison \
  Distribution/tests/native-comparison.sh --native codex --case paused-supplier \
  --baseline v0.3.98 --model gpt-6.1-sol --effort xhigh \
  --save-baseline Distribution/tests/native-comparison/paused-supplier/comparisons/baseline-v0.3.98.json \
  --results-dir "$HOME/tmp/native-comparison-results"
```

The case and harness must be committed, as for a pair. An existing output is
refused before a session starts. A completed task failure is still an observed
baseline and is saved; the command retains the journey's failing exit status.
A stopped turn, truncated stream or unsupported claimed proof cannot become
a reusable completed result. The raw attempt stays available to diagnose it;
the command never retries a session.

Export an already retained journey, or one arm of a pair, without a new session:

```sh
PATH=/opt/homebrew/bin:$PATH Distribution/tests/native-comparison.sh \
  --export-baseline /path/to/retained/attempt --arm baseline \
  --save-baseline Distribution/tests/native-comparison/paused-supplier/comparisons/baseline-observed.json
```

For a journey, `--export-baseline` names its attempt directory. For a pair it
names the pair attempt and `--arm baseline` (the default) or `--arm candidate`
selects the retained arm. The arm's raw attempt must remain at its recorded
relative location. `--save-baseline FILE` also exports the selected arm at the
end of an ordinary pair. Unfrozen working-tree journeys cannot be exported as
a resolved baseline.

The immutable JSON contains original capture provenance and assessment,
payload and input hashes, project basis, observed time and conditions, safe
scalar observations, completed-stream identities, independent proof receipts,
executed agent/owned-worker proof attribution, available deduplicated native
response usage and explicit unknowns. Commands, command output, account
metadata and local session paths stay in the raw attempt. Unknown usage is
not zero; CLI cumulative usage is never added to native response counters.

Replay the current case assessor after removing the raw evidence:

```sh
PATH=/opt/homebrew/bin:$PATH Distribution/tests/native-comparison.sh \
  --assess-baseline Distribution/tests/native-comparison/paused-supplier/comparisons/baseline-observed.json \
  > /path/to/derived-assessment.json
```

This writes a separate derived assessment naming the original archive integrity,
current assessor and reconstructed evidence hashes. Retain a useful correction
beside its source; never rewrite the original observation or assessment. A
current assessor needing an input the archive lacks reports insufficient evidence.
An old record containing only a verdict and proof filenames is historical
evidence, not a replayable baseline; export it only when its decisive supporting
inputs remain available. Saving evidence establishes no applicability to a new
comparison: runtime, input, proof and measurement sufficiency still matter.
