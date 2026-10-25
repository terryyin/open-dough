# CI completion follows pending containing revisions

<a id="retry-aware-integrated-completion"></a>

### Keep completion pending for a containing revision's current retry

**Identity:** SEED-152#retry-aware-integrated-completion
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Investigate and repair the observer's ten-minute timeout while a
containing main revision has a current automatic retry pending.

The owner requests investigation and a bounded repair. Accepted main revision
15f6e78bad54cf14a4f0898f505568d26e41e534 was coalesced into
4e520e4570dacb8a4ccb1d0ee7319a1a76a16f3c. Completion in mailbox
/tmp/dough-ci-501/watch-PQ5MnV returned timeout with confirmed shutdown even
though discovery still listed a pending automatic retry for the descendant.
Earlier queue metadata attested retrying; no queue fact was present at the
completion boundary. Recovery later validated integrated state at that
containing revision. Establish why the pending attempt did not preserve the
recoverable handoff; the exact transient service error is not retained.

Scope: progress evidence and completion for a same-target containing revision,
including automatic retry transitions and temporary absence of queue metadata.
Reproduce before repair through the real observer/completion boundary. Preserve
exact failures, integrated-state policy, ancestry, check/context restrictions,
freshness and unavailable-evidence rejection, original completion deadline,
confirmed shutdown and cleanup gates. Pending progress is never success.
No CI scheduling, production host changes, extra live retries, unrelated
refactoring or weakened test timing is authorized. Change Open Dough source,
never its installed managed payload by hand. Execute the bug-fixing skill's
one ten-minute bounded planless repair with no replanning and independent
pre-commit refactoring; route any larger remaining work under that skill.
