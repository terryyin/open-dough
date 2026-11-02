# Cucumber proof

Record only passing Cucumber scenarios as committed proof, so a reader of
this project's feature files sees each scenario's last successful proof,
including when it passed, its attempts, and the commit and file version it
was observed on. A real unsuccessful final attempt clears that scenario's
earlier proof. Open Dough's Intent reads these files from the project's
published revision. Every ordinary run maintains proof for the scenarios it
ran; nobody runs the whole suite only to collect proof. A passing scenario
records proof even when another scenario makes the overall run fail.

These rules are for this project's Cucumber.js setup. Implement them in this
project's own code; Open Dough ships no recorder or consolidation tool.

## Configure once

- Write a proof recorder in this project as a Cucumber.js plugin and add it
  to the Cucumber configuration (`cucumber.js`, `cucumber.mjs`,
  `cucumber.json`, or the equivalent) beside the formatters already there,
  for example `format: ['progress'], plugin: ['./<path>/proof-plugin.js']`.
  Add it to every profile that runs scenarios, so focused, tagged, parallel,
  retried and full runs all record proof.
- Cucumber.js loads plugins with native `import()`, before `requireModule` or
  `require` hooks such as `tsx` apply. In a TypeScript project, write the
  recorder as JavaScript, or as a module Node loads by type stripping without
  warnings (for example `.mts` with erasable syntax only), and check that
  loading it prints nothing, so existing output stays unchanged.
- Do not add the recorder as another `format` entry without its own output
  target: Cucumber.js writes standard output through only one formatter, the
  last such entry, so the recorder would replace the project's existing
  output. A Cucumber.js without plugin support can use a formatter given its
  own output file outside the proof directory instead.
- Record in the recorder, which runs once per run in Cucumber's main process
  and receives every worker's messages under `--parallel`; not in support-code
  hooks, which run in each worker.
- Keep existing output, diagnostics and the command's exit meaning
  unchanged. The recorder prints nothing and never fails the run. When it
  cannot record, for example outside a Git checkout, it records nothing.
- Declare the proof directory in `.planning/open-dough.json` on the Gherkin
  Intent location it covers:

  ```json
  {
    "intent": {
      "locations": [
        {
          "path": "e2e_test/features",
          "kind": "gherkin",
          "proof": "e2e_test/proof"
        }
      ]
    }
  }
  ```

  `proof` is a directory path from the repository root. Commit its files; do
  not ignore it.

- Record only scenarios of feature files under the Gherkin location or
  locations that declare this proof directory. Scenarios of other features
  run through the same configuration, such as throwaway features this
  project's own tests run, are not recorded.

## Maintain successful proof

- Each run writes its own file in the proof directory, named uniquely, for
  example `<UTC start time>-<random suffix>.json`
  (`20261101T095900Z-3f9a1c2e.json`). Never reuse a name.
- After every passing scenario, rewrite the run's file atomically: write it
  under a temporary name in the same directory that does not end in `.json`,
  then rename it over the run's file. An interrupted run keeps its completed
  successful proof. A run with no successful scenario writes no run file.
- A scenario has finished when its last attempt has finished, that is, when
  no retry follows. Record a final pass once, then, preserving all attempts
  and their total duration. Intermediate retry failures do not clear proof.
- For an executed scenario whose final result is unsuccessful, remove its
  earlier observations from every proof file in this checkout, including the
  current run's file. Match by `feature`, `scenario` and `example`; preserve
  unrelated identities and observations newer than the unsuccessful attempt.
  Rewrite changed files atomically through a non-JSON temporary file and
  delete files made empty. Persist no failed observation or failure marker.
  A later pass records successful proof again.
- Serialize proof mutations by concurrent runs sharing this checkout, so
  cleanup cannot lose another scenario's proof or an in-memory run snapshot
  restore a removed success. Separate worktrees retain separate proof
  directories; ordinary Git reconciliation must preserve identity cleanup.
  Unique run filenames alone do not make cleanup merge without conflict.
- Record only attempts that ran. Under `--dry-run`, and for scenarios that
  `--fail-fast` stops after an earlier failure, Cucumber reports every step,
  hooks included, as skipped without running it; record nothing for such an
  attempt, and do not clear its earlier proof. An executed unsuccessful
  attempt, including hooks or executed pending/undefined steps, clears proof.
- Every `.json` file in the proof directory, or in any directory below it, is
  read as proof. Keep nothing else there with that extension. One file that is
  not valid proof leaves the whole directory's proof unreadable until it is
  fixed or removed.

## File format

A proof file is one JSON object:

```json
{
  "version": 1,
  "observations": [
    {
      "feature": "e2e_test/features/jobs.feature",
      "scenario": "Retry a job after <failure>",
      "example": ["timeout", "3"],
      "outcome": "passed",
      "attempts": 2,
      "durationMs": 4100,
      "finishedAt": "2026-11-01T10:01:00.000Z",
      "commit": "e5f6a7b8e5f6a7b8e5f6a7b8e5f6a7b8e5f6a7b8",
      "featureBlob": "3b18e512dba79e4c8300dd08aeb37f8e728b8dad"
    }
  ]
}
```

Each observation has these fields:

- `feature`: feature file path from the repository root, with `/`
  separators. Cucumber names it relative to its working directory; convert
  when that is not the repository root.
- `scenario`: scenario name as written in the feature file. For an outline,
  its name before placeholders are filled in (the Gherkin source's name, not
  the runner's pickle name).
- `example`: outline rows only. The example row's cell values in column
  order, as Gherkin parses them: trimmed, with escaped pipes, backslashes and
  newlines unescaped. Omit it for a plain scenario.
- `outcome`: always `passed`. Determine the final attempt's result from all
  steps and hooks; any unsuccessful executed result clears earlier proof
  instead of recording an observation.
- `attempts`: attempts made, retries included; `1` when the scenario was not
  retried.
- `durationMs`: milliseconds spent across all attempts.
- `finishedAt`: ISO 8601 UTC time the last attempt finished.
- `commit`: full SHA of the commit the run started from (`git rev-parse HEAD`
  at run start).
- `featureBlob`: Git blob hash of the feature file's bytes as tested, as
  `git hash-object <file>` prints it.

Identify a scenario only by `feature`, `scenario` and `example`. Never record
runner-generated IDs: they change on every run. A file holds at most one
observation per identity; a run that executes one twice keeps the later one.

Keep files compact: no screenshots, traces, captured output, error messages,
step details or other attachments.

## Reading proof

The latest successful observation of a scenario, by `finishedAt`, is its
last successful proof. Scenarios a run did not execute keep their earlier
proof. When reading older version-1 files containing unsuccessful outcomes,
first select each identity's latest observation across every file, then keep
only passes: a later unsuccessful observation invalidates an older success.
An unsuccessful result also clears a success with the same `finishedAt`,
independently of file order.
Do not filter unsuccessful observations before selecting the latest result.
No retained success means **No successful proof**. Missing or unreadable
proof remains a distinct explanation. A matching `featureBlob` shows only
that the scenario's Gherkin is unchanged since it passed, not that the product
or its steps are. Last successful proof does not assert current product health.

## Consolidating, optionally

When the directory holds many files, consolidate: read every proof file, keep
the latest observation of each identity before retaining only passes, write
those successes as a new uniquely named file in the same format, then delete
the files consumed, and commit the change together. If no success remains,
delete the consumed files without creating an empty replacement. Use this
same latest-first cleanup when adopting the contract over older proof files.
Readers see the same successful proof before and after;
nothing distinguishes a consolidated file from a run file. A setup that
already keeps a single latest snapshot need not consolidate.

## Commit proof

Commit proof files and cleanup deletions with the ordinary work they observed.
Only committed proof
is proof; files written by runs that are never committed, such as in CI, do
not count.
