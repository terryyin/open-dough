# Preparation evidence

## Decisive premises and observations

Observed in this preparation checkout at `4d7a2ff66` on 2026-11-11:

| Premise / consuming operation | Observation, result and remainder |
| --- | --- |
| Current entry selection can own both legacy and sources membership | `node --input-type=module` imported `declaredLocations` and `locationSelectsRepositoryPath`; MakeMe-built locations selected `frontend/src/a.spec.ts` and `checks/a.check`, excluded sibling production/Markdown files and uppercase `.TS`. The exact new `makeMe` input was projected away (`futurePropertyRetained:false`), so slice 2 must deliberately preserve it. No current opt-in support is assumed. |
| Existing glob semantics can run without dashboard/npm runtime dependencies | In the same Node profile, `rolldown({input:'dashboard/src/intentLocationSelection.ts',platform:'node',logLevel:'silent'})` then `bundle.generate({format:'esm',minify:true})` produced a 26,417-byte entry with no imports. Importing its code as a data URL selected `checks/nested/a.test`, excluded `a.TEST` and `a.txt`. This settles standalone feasibility; generated provenance/license and final installed execution remain slice 2/4 proof. No scratch edits remained. |
| Current native entry points are available, but discovery is unproved | `codex --version` → `0.167.1`; `claude --version` → `2.1.321`; `cursor agent --version` → `2026.11.10-731fb78`. Existing `tests/support/native-run-supervise.sh`, `native-codex.sh` and shared native stream readers provide the route. No paid session was run; the consuming ordinary-authoring operation, authentication and fresh candidate activation are bounded by slice 1's early probe. |
| Shared convention comes from actual practice, with local mechanics | Source inspection and representative builder/caller tracing reached Donut's Java/TS fluent construction, relationship derivation and fresh factory behavior; revisions and source paths are in the seed. Java persistence and some wall-clock defaults differ from Open Dough/Pygardon. The common rule therefore leaves persistence/language syntax local and states deterministic defaults as a preference. Native application remains owed, not inferred from source inspection. |

The selection observations are direct calls to the consuming functions, not a
claim that existing tests already prove the new rule. No new test is represented
as passing. Native observation is the only paid/credentialed unresolved premise;
its permitted early probe stops dependent slices if the mechanism fails.


### Already-oversized expected edit

`install.sh` is 344 lines, almost entirely its payload array. Slice 4 owns a
cohesive extraction of the execution skill's payload declaration (the largest
skill group) into a data-only fragment under `src/install/`, leaving the main
installer and that fragment below 250 lines. Keep `install.sh`'s assembled
`managed_files` as the single authoritative payload declaration, with no
parallel inventory. Its read-only declaration reader must read that fragment
without running an installer, and still read historical literal arrays.
Align `open-dough-release-version.sh`, historical-declaration recovery in
`open-dough-release-leftovers.sh`, release fixture construction in
`tests/support/releaseTestData.mjs`, and all traced declaration consumers.
Installation/update and declaration proofs below preserve their contract.
Do not replace cohesive extraction with arbitrary line folding. If execution
finds that the seam needs a different architecture or wider responsibility,
return that evidence before proceeding. Other inspected expected guidance and
selection edits are below 250 lines (execute skill 243, delegation 240,
refactor skill 158, parser 174, selector 142); keep additions proportionate.

## Installer preflight and declaration-reader seam

Read-only `/root/installer_preflight` confirmed the settled slice-4 seam:
execution payload lines 125–295 are one 171-line contiguous group. Move that
group to data-only `src/install/open-dough-execution-payload.sh` using an append;
keep prefix initialization and suffix append in `install.sh`, preserving order.
Estimated main/fragment sizes are 177/174. Bootstrap already requires full
`src/install` companions, and updates run a complete pinned Git checkout.

`open-dough-release-version.sh` is 240 lines. Slice 4 owns cohesive extraction
of declaration reading into `src/install/open-dough-payload-declaration.sh` if
new composition support would exceed 250. Preserve its existing public
`read_managed_files_declaration(path)` API and read-only behavior: statically
read bounded initialization/append/include forms without evaluating installer
shell; continue reading historical grouped/multiline literal arrays. Missing
fragments/incomplete declarations must fail, with core-entry validation across
the assembled result. The main assembled array remains the sole inventory.

Historical leftovers currently read only each tag's installer into a flat
file. Retrieve companion data from that same tag, preferably using existing
blob batching, and retain a compatible temporary layout. Never substitute the
current fragment for historical data. Preserve unavailable-history behavior,
edited-leftover refusal and force behavior. Add a differing-inventory historical
control so flattened fixture installers cannot hide a broken composed path.

`releaseTestData.mjs` currently reads/replaces only the first literal block;
make reading and fixture overrides cover the full assembled declaration.
`revision-release-files.mjs` and `copy_installer_modules` already copy new `.sh`
modules automatically. `payload-declaration-links.sh` must compare the complete
declaration-only composition with Bash, carry companion data into its malicious
installer fixture, retain no-installer-execution/legacy/order/link controls, and
add missing-fragment coverage. Explicit helper inspection lists in
`docs/installation-and-updates.md` (217 lines) and `tests/pin-and-inspect.sh`
(239 lines) must include the new data/reader files. The update skill already
requires inspecting sourced helpers. No other inspected expected edit exceeds
250 lines; leftovers is 179, execution SKILL 243, delegation 240, refactor 158.

In addition to the four planned install/payload checks, affected existing proof
includes `repository-release.test.mjs`, `update-removes-dropped-files.sh`,
`retrospective-reference-payload.sh`, `compare-payload.sh`,
`install-preserves-open-dough-json.sh` and `pin-and-inspect.sh`. Trace actual
consumers and run their observing assertions under the project's failure policy.
This preflight ran no tests or installer and changed no source behavior.
