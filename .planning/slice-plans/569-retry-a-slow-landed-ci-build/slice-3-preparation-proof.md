# Slice 3 preparation repair proof

First guarded fresh preparation, session73280, stopped at formatting before
plan mutation, staging, commit or push. HEAD remainsfa1cb8. The formatter's
findings were repaired; no earlier candidate was delivered instead.

## Diagnosed findings and correction

- Unsafe JSON in the frozen-reference test became a typed ProjectHistory
  document with explicit missing-order/build/start guards. Test facts and
  expected120000/106000/100000 observations are unchanged.
- `CiFollowUp.tsx` became `CiFollowUpViews.tsx`; its model remainsciFollowUp.ts.
  Distinct basenames remove the TypeScript project-service exclusion. Both
  real mounted imports were updated, preserving exports/props and rendering.
- The ledger's generic store and read expose explicit MachineJsonStore and
  StoreRead types, resolving circular inferred error-types across its callers.
- Collection's local ended() reads the current signal state at every former
  abort check, avoiding readonly-property narrowing without changing the cap
  or pre-send interruption behavior.
- Removed a fallback on required LaunchLanding.target only; legacy optional
  targets retain their canonicalization. Settings validate unknown JSON before
  reading enabled. The provider-verdict test method is called through a bound
  closure. These preserve the intended boundary behavior.
- Earlier slice2's source github-requests.mjs union JSDoc did not parse:
  TypeScript reported `'}' expected`, exported no WorkflowRepeatSubmission,
  and inferred the action as Promise<any>. Its union declaration now follows
  the existing GhRequestFailure syntax. This changes no runtime code or
  installed copy. The new typed action caller now passes lint.

Detailed formatter diagnostics are retained in
`/tmp/seed285-slice3-format-repair-2.log` and
`/tmp/seed285-slice3-format-repair-3.log`. The final coordinator-owned
`node /tmp/seed285-slice3-format-and-size.mjs` runs `npm run format` then checks
every declared owned path's actual size. Session39030 exit0;
`/tmp/seed285-slice3-format-repair-4.log` reports lint/Prettier pass and
45files at250lines or below. No hook-owned lint was run separately.

## Renewed proof after repair

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm run test:dashboard -- backend-tests/intent/landed-ci-automatic-repeat.spec.ts backend-tests/intent/landed-ci-repeat-reconciliation.spec.ts tests/intent/recently-done-ci-automatic-repeat.spec.ts --workers=1 --reporter=list
```

Session60491 exit0,12cases1.1m. Same actual published Done receipt/MakeMe
provider setup as the accepted implementation and refactor. Inspected results
include durable intent/two collectors/onePOST, all particular outcome cases,
interrupted reply/restart without resend, incomplete/multiple attempts,
current300000 versus frozen100000 with original120000 across eviction,
and the actual newly named mounted phone view. Fixtures supply no result.
Log `/tmp/seed285-slice3-preparation-proof.log`.

```sh
PATH="/opt/homebrew/bin:$PATH" caffeinate -s -i npm test -- tests/support/ci-follow-up-ledger.test.mjs tests/support/ci-follow-up-policy.test.mjs
npm run typecheck:dashboard
```

Session52199 exit0,2files; actual policy and independent-process durable
ledger observations remain17+8cases. Session27301 exit0, complete graph with
no diagnostics after the typed JSON guards and view rename. Logs
`/tmp/seed285-slice3-preparation-node.log` and
`/tmp/seed285-slice3-preparation-types.log`.

An intermediate typecheck90538 identified only missing optional trunk order
in the newly typed test; its explicit precondition guard was corrected before
the successful command. No failing/flaky test was waived or rerun as a fix.

At launch this Mac was awake on AC100%, load4.23/3.82/4.08 and65%free memory,
with no owned heavy proof competing. Sequenced one browser worker under
caffeinate-s-i, then compatible bounded native and incremental type checks.
Every command is terminal. All other accepted proof remains unchanged.

Freshness before this proof: unchanged on main46c8b193dd5eb282fca55d7fe19b9909cdedd407,
base09b455646f66ef273375965c55523fa610dfd834. Named comparison supplier
source/done/reference owners have no incoming change. Root accepts renewed
behavioral proof. Independent continuation is accepted below.

## Independent continuation

`/tmp/seed285-refactor3-preparation-return.md` ends `## REFACTOR COMPLETE`.
No further edit or test was needed. Root inspected its repair-path review,
unchanged-proof dispositions and exact trace. The963located consumers all
have nonempty dispositions with no missing path; metadata-only matches make
no unrelated test claim. Actual mounted imports, typed action/read contracts,
fresh abort checkpoints, legacy target fallback and unchanged test facts are
coherent. All46dirty files pass actual size checks; no old product import,
uncovered affected consumer, unresolved defect or required observation remains.
