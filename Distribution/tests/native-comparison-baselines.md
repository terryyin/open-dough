# Save, reuse and reassess native comparison baselines

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

`--export-baseline` also accepts an existing baseline JSON file. It validates
the observation and writes a lossless compact copy to a new filename, without
raw sessions, a model launch or another assessment. Capture/export dates,
original judgment, evidence, usage and canonical integrity stay unchanged.
Fresh exports use the same compact JSON representation. Keep immutable case
evidence outside automatic formatting; the repository's comparison directories
are excluded from Prettier for that reason.

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


## Compare another candidate with saved evidence

Declare the factor, intended gain and quality criteria on the ordinary pair
command, and supply the exact saved observation with `--reuse-baseline FILE`:

```sh
PATH=/opt/homebrew/bin:$PATH TMPDIR=$HOME/tmp/native-comparison \
  Distribution/tests/native-comparison.sh --native codex --case paused-supplier \
  --baseline v0.3.98 --candidate candidate-commit \
  --reuse-baseline Distribution/tests/native-comparison/paused-supplier/comparisons/baseline-v0.3.98.json \
  --factor 'payload guidance only' --gain 'fewer commands through the same proof' \
  --quality 'current case outcome and decisive proof' \
  --model gpt-6.1-sol --effort xhigh --arms sequential \
  --results-dir "$HOME/tmp/native-comparison-results"
```

A matching, sufficient observation launches only the candidate. The record
cites the original source, date, conditions, integrity, outcome and effort;
`baseline-assessment.json` retains the current derived assessment separately.
The historical baseline is one stochastic observation under its recorded load
and scheduling, never a new simultaneous pair. Full provenance remains intact.
Current assessor and retention changes can reuse sufficient decisive inputs.
Changed stream or session-discovery readers obtain fresh comparison evidence:
the compact archive does not retain every raw executed-call or discovery input
needed to re-establish its metric and ownership interpretation. Task, events,
project files, installation and launch/supervision inputs
must match, along with the host version/route, machine, model and effort.
`case.bash` currently combines setup and observation: a changed hash cannot
establish unchanged setup, so it obtains fresh evidence.

A different requested baseline or material condition, or missing, incomplete
or insufficient evidence, starts a fresh baseline and candidate. A usable new
observation is written to the pair attempt's `baseline.json` and named by
`baseline-saved:`. Keep it with the case before raw cleanup. Earlier archives
stay byte-identical. A completed task failure can be reused; an unjudged
interruption cannot. No stopped session is retried or resumed automatically.
`--fresh-pair` explicitly observes both arms even when saved evidence matches.
`--save-baseline FILE` can retain the selected baseline at an additional new
path; when reused, its bytes are copied unchanged.

The gain/quality prose states the evaluation intent; the current case assessor
owns executable outcome/proof criteria. Add `--require-usage` when the current
comparison requires complete native response counters. Missing saved counters
then trigger fresh acquisition. Missing counters after that acquisition, or
unavailable/mismatched actual candidate conditions, produce `not-comparable`
and no effort delta. Without that flag unavailable counters remain unknown and
cannot imply a token gain. When both arms have complete attributed usage, the
record prints their counters and processed-token difference after the outcome;
billing cost remains unknown. Lower effort never offsets a failed outcome or
missing proof.
