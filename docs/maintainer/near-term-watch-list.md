# Near-term watch list

Reviewed 2026-09-25 (Asia/Singapore) against all three project logs. These codes
remain allocated. Retire only after seven days, relevant exercise and no
unresolved recurrence. Historical detail is recoverable at
`36fb9366295d1e6000cb3901a7ad3ce074382778:docs/maintainer/near-term-watch-list.md`.

<a id="odf-056"></a>

## ODF-056 — Symlink CLI startup

- **Sources:** Open Dough / DD-066 (literal CLI); Doughnut / DD-065.
- **Response:** `eff69eb`, first released in 0.3.27, compares real paths at all three CLI entrypoints.
- **Watch start:** 2026-09-21; Doughnut ownership review `2381cf9e60:DearDough.md` reproduced installed 0.3.26 failure and observed `CI_OBSERVER` through the skill symlink with isolated released 0.3.27.
- **Review after:** 2026-09-28.
- **Last assessed:** 2026-09-25; no supported recurrence. This is isolated boundary exercise, not a verified installation or evidence about missing aliases (ODF-085).

<a id="odf-066"></a>

## ODF-066 — Unpublished queue claims

- **Source:** Open Dough / DD-064; original execution `d0a9495`, guidance 0.3.26.
- **Response:** `be94345` / `f699e60`, first released in 0.3.27; shared startup `194617b` / `1a63c0c` / `6f5d0ef`, first released in 0.3.33. Native queued-start acceptance is complete in SEED-008.
- **Watch start:** 2026-09-24 (date-only); Doughnut plan 022 / `70b3b67313` used released 0.3.33 startup and recorded its claim receipt. Open Dough plan 092 also records Take `1443c42`, 0.3.38, at 20:27:08+08:00. Evidence remains under [ODF-099](finding-names.md#odf-099).
- **Review after:** 2026-10-01.
- **Last assessed:** 2026-09-25; no supported unpublished-claim recurrence. Startup use does not certify every concurrency/refusal case; oversized receipts remain a separate active problem.
