---
id: SEED-276
status: active
planted: 2026-11-08
scope: story
---

# Guard per-file syntax highlighting in Intent

<a id="guard-intent-per-file-highlighting"></a>

### Guard per-file syntax highlighting in Intent

**Identity:** SEED-276#guard-intent-per-file-highlighting
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"bb4c745eef16bec41d7e6a42ff16e7e037d8bc1e2f70197df7298bf98dc51351"}}
```

**Goal.** Maintainers get a failing browser test if Intent highlights a
JavaScript test as shell when both kinds of test share a location.

**Scope.** Strengthen the existing
[mixed-source Playwright test](../../dashboard/tests/intent/intent-code-browse-sources.spec.ts)
at the point where it opens the `.test.mjs` file. Check that the rendered
`import` and `from` tokens have the same colour and that the module string
has a different colour. Keep the existing fixture and assertions. Production
code changes are outside this story's scope.

**Key examples.** In the existing location with shell listed first and
JavaScript second, opening the `.test.mjs` file produces the JavaScript colour
relationship and the focused spec passes. In a scratch checkout, temporarily
make the pane use the location's first hint for every file. The same spec
fails at the new assertion. Restore the fault and confirm the spec passes.

**Evidence.** The [SEED-274 Intent Coverage report](../done/SEED-274_declare-intent-test-sources.json)
records the original fault and the observed token colours. Run the focused
dashboard Playwright spec under the [project failure policy](../../AGENTS.md#failing-and-flaky-tests).
