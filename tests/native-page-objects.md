# Native page-object authoring probe

This manually invoked, paid check observes ordinary browser test work against
`src/skills/dough-page-objects`. It uses the existing writable host launch
profiles, owned native supervision and shared stream reader. Follow
[maintainer guidance](../AGENTS.md) and [native setup](native-setup.md).

Prepare the current checkout's locked dependencies and browser first. On macOS
use Bash 5 on `PATH`; on AC power run one native session at a time under
`caffeinate -s -i` after checking host load and competing work. Authentication
must already work in each native CLI. A credential failure needs the developer;
do not substitute recorded streams or alter activation to produce a pass.

The deterministic fixture-layout check is part of the ordinary suite. Its
separate browser control is selected explicitly because the shell/Node CI jobs
do not install Chromium:

```sh
npm test -- tests/support/page-object-native-fixture.test.mjs tests/support/page-object-makeme-fixture.test.mjs
npm test -- tests/support/page-object-native-browser-proof.mjs
npm test -- tests/support/page-object-makeme-browser-proof.mjs
```

The gate uses the shared `dough-execute-plan/scripts/test-entry-rules.mjs`
command. Its import-free runtime bundles the maintained Intent declaration and
membership owners, so a project needs Node but no Open Dough npm dependencies.
Regenerate it from the locked source installation with
`node scripts/build-test-entry-rules.mjs`; `--check` verifies correspondence
without writes. Keep the generated license alongside the runtime. Public
selection and isolated command contracts run through
`npm test -- tests/support/test-entry-rules.test.mjs tests/support/test-entry-rules-standalone.test.mjs tests/support/test-entry-rules-installed.test.mjs`.

Run a fresh authoring task, with `codex`, `cursor` or `claude` and a new absolute
artifact directory outside the source checkout:

```sh
caffeinate -s -i bash tests/support/page-object-native-run.sh codex on /tmp/page-object-codex-on
caffeinate -s -i bash tests/support/page-object-native-run.sh codex off /tmp/page-object-codex-off
caffeinate -s -i bash tests/support/page-object-native-run.sh codex refactor /tmp/page-object-codex-refactor
caffeinate -s -i bash tests/support/page-object-native-run.sh claude installed /tmp/page-object-claude-installed
caffeinate -s -i bash tests/support/page-object-native-run.sh claude both /tmp/page-object-claude-both
caffeinate -s -i bash tests/support/page-object-native-run.sh codex makeme-only /tmp/page-object-codex-makeme
caffeinate -s -i bash tests/support/page-object-native-run.sh claude neither /tmp/page-object-claude-neither
```

`on` selects the browser entry and leaves the legacy entry off. `off` creates a
fresh project with both entries off and requests work in the legacy entry.
The ordinary prompt supplies behavior and expected item names, without naming
the skill or its convention. The fixture uses MakeMe's repository and location
builders; copying the candidate into the native layout is harness preparation,
not installer/update proof. Browser runtime imports use this checkout's locked
installation; the later standalone-delivery check owns installed independence.

`installed` builds isolated MakeMe-described releases, installs the older payload,
then updates through its recorded source to the complete current payload before
fresh authoring. Both native roots carry every declared skill and dependency;
project configuration and unrelated guidance remain in place. Inspect
`install.txt`, `update.txt` and `fixture.json` alongside the native evidence.
Fixture tags and version metadata exist only under the artifact directory.
The installed-selection test separately exercises all four flags, custom source
membership, diagnostics and complete bytes without project npm dependencies.

`both` and `makeme-only` use that full install/update journey with an empty
catalog, a project-owned item factory and a setup boundary exposed in README.
The first requests browser work in an entry selecting both rules; the second
uses a fresh project whose legacy entry selects only MakeMe and already has a
direct-control browser example. Inspect actual selected convention reads and
the authored domain builders, relationships, explicit expectations, causal order
and independent held-read/request observations. The both-enabled result reuses
the focused UI owners; the MakeMe-only result retains the legacy browser style
without reading the page-object convention. Run the scenario and wrong-expected
control. The separate browser control verifies fresh builders and that omitting
catalog setup fails; this harness proof is distinct from native MakeMe use.
`neither` supplies the same fresh full catalog with both flags false in every
entry. Check selection and confirm neither convention is read or imposed;
the project's existing APIs remain available without an Open Dough requirement.

`refactor` installs the current refactoring skill and its shared references,
stages one new enabled scenario and leaves a different opted-out scenario
untracked. Both direct-control scenarios pass before native use. The prompt
invokes post-change refactoring without naming the selected convention. Inspect
the resulting enabled test's reuse of the existing page/component owners,
visible Atlas/Boreal values, held-read ordering and independent request evidence.
Inspect the opted-out result and actual selector/reference reads too; selection
output alone is insufficient. Run both resulting scenarios and retain their
terminal result alongside `before-tests.txt`.

Inspect `events.jsonl` through `native-host-stream.mjs`, plus `calls.jsonl`,
`reads.jsonl`, `tools.jsonl` and the authored test. An enabled result must show
actual reads of the gate, configuration and convention, reuse the existing
library owner, expose Atlas then Boreal expectations and causal order, keep the
held-read and request assertions independent, and pass the running browser
scenario. Replace only the authored scenario's expected Boreal title with an
incorrect title, run it, require a failure naming expected and actual values,
then restore the original bytes. A fresh opted-out result must check selection
without loading the convention. Passing fixture controls, exit zero, copied
files and agent self-report do not establish application.

Retain the candidate hashes, native version, prompt, terminal stream status,
actual observations, and unmet requirements in the active plan. Follow
[ADR 0005](../docs/adrs/0005-cross-tool-validation-accepted.md) for per-host
assessment, justified reuse and retirement of spent artifacts.
