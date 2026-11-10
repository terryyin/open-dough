# Slice 3 boundary typing repair

Delivery's four no-unsafe-assignment failures were repaired only in its two named paths:

- dashboard/tests/support/ciProofEntryInputs.ts: production fragment result is explicitly unknown before it enters the collector read candidate; this also keeps candidate.value opaque rather than inferred any.
- dashboard/tests/intentCiAdapterProofProject.ts: the real fragmentsFromOutcomes call's known array result is typed readonly unknown[] before destructuring; the real summarize call's returned summary field is typed unknown at its result boundary. These are narrow return-value types, not unknown-to-function casts or a suite-specific proof model.

No runtime statement/action, builder, representation, API, helper, module, dependency, suppression, assertion or public contract added. No formatting/lint/commit/push/status operation performed. Root-owned records and all current files are preserved.

Verification completed exit0:

```sh
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" npm run typecheck:dashboard
env -u NO_COLOR -u FORCE_COLOR -u GIT_ALTERNATE_OBJECT_DIRECTORIES PATH="/opt/homebrew/bin:$PATH" OPEN_DOUGH_TEST_JOBS=1 caffeinate -s -i bash scripts/test.sh tests/support/dashboard-ci-proof-units-read.test.mjs tests/support/story-ci-comparison-entry-summaries.test.mjs
git diff --check
```

The first dependent typecheck/Node command completed in session27075. A final typecheck and whitespace check after settling the return annotations completed in session43350. No failing/flaky test was observed; AGENTS.md#failing-and-flaky-tests remains as written.

A TypeScript transpileModule comparison, using identical source filename and ESNext target/module options, stripped only the new boundary annotations/assertions from each current file and compared emitted outputText before/after: both files' emitted JavaScript is byte-for-byte identical (assert.equal, exit0). Therefore the 105 accepted browser/backend tests, two Node assertions and 19 real collector snapshots retain the same implementation/setup/observation correspondence. No browser or snapshot rerun was made.

The existing consumer trace and independent refactor return still cover these two paths. No consumer, meaningful effect term, observing assertion, setup or runtime boundary changed; no new trace or representation required. Publication remains pending for the coordinator's formatter/lint gate from base c61170efdc7bddc5ce0b58ed24e0ff4b6550a73b.

Exact emitted-runtime comparison command (exit0, two matching outputs):

```sh
node --input-type=module - <<'JS'
import ts from 'typescript'; import{readFileSync}from'node:fs';import assert from'node:assert/strict';
for(const file of ['dashboard/tests/intentCiAdapterProofProject.ts','dashboard/tests/support/ciProofEntryInputs.ts']){
 const current=readFileSync(file,'utf8');const original=current.replace('const value: unknown = fragment(', 'const value = fragment(').replace(') as readonly unknown[];', ');').replace('}) as { readonly summary: unknown };','});');
 const options={fileName:file,compilerOptions:{target:ts.ScriptTarget.ESNext,module:ts.ModuleKind.ESNext,removeComments:false}};
 assert.equal(ts.transpileModule(current,options).outputText,ts.transpileModule(original,options).outputText);
 console.log(`${file}: emitted JavaScript identical before/after boundary typing`);
}
JS
```
