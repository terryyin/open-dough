# Slice 6 consumer dispositions

Installed consumer-trace ran against base
`37fb6a94cbb69aff99ae403c8177697d40e034c6`, with all owned changes and the
coordinator's three preserved planning edits visible. The removed source text
also contributes broad words and existing imports; those are inspected as
lexical matches, not treated as imports of the new revision answer family.

```sh
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout "$PWD" --base 37fb6a94cbb69aff99ae403c8177697d40e034c6 --term installFrontendIntentRevisionAnswers --term openWithFeatureSelected --term intentReads --term controlFrontendAuthenticatedRead --term holdAuthenticatedReadsWhere
node .agents/skills/dough-execute-plan/scripts/consumer-trace.mjs --checkout "$PWD" --path dashboard/tests/support/frontendIntentRevisionAnswers.ts --path dashboard/tests/support/frontendIntentRevisionJourney.ts --term installFrontendIntentRevisionAnswers --term openWithFeatureSelected --term intentReads
```

Raw final trace `/tmp/slice6-final-consumer-raw.md` has728 located paths.
Every row is individually disposed in
`/tmp/slice6-final-consumer-dispositions.md`:19 run,709 excluded, no empty cells.
The explicit helper trace `/tmp/slice6-helper-consumer-raw.md` has16 paths;
`/tmp/slice6-helper-consumer-dispositions.md` disposes seven run, five reused
original sources and four excluded independent/local observers. That trace ran
before original deletion; its original source rows explicitly refer to their
same-named maintained cases and assertion tables. The final trace ran after
original deletion and production scratch restoration.

| Surface and actual consumers | Disposition and observing evidence |
| --- | --- |
| New immutable answer family → new journey adapter → five maintained specs | Run: exact imports inspected; final Frontend9 exercises every caller with unchanged original assertions. Old/latest files differ and source-scoped Doughnut/Pygardon snapshots prevent default-map and project aliasing. |
| `frontendAuthenticatedReadSubstitute` reused behind the keyed family | Run: new family supplies explicit immutable snapshot/head to the unchanged service-answer function. Final Frontend9 observes real browser query revision/source choice through exact read arrays and distinct old/latest/project content. All default Frontend consumers receive identical inputs and helper body; excluded from additional reruns for that unchanged boundary. |
| `frontendAuthenticatedReadControl` | Run: final unreadable-settings case arranges transient unreadable, then pass; actual Retry applies the new source. Other imports in Gherkin/settings recovery retain identical helper behavior and default inputs. |
| `holdAuthenticatedReads` | Run: final Frontend holds locations/file answers, fails and releases through actual browser requests; only companion comments changed in this shared helper. Source-target two cases also renewed. Other callers retain the identical function body and no changed input/contract, individually excluded. |
| `intentRevisionJourney` | Run: final new specs use unchanged `intentReads`, `jobsFeatures`, `publishedFiles`; exact browser arrays retained. Old real-server opener remains unchanged for the remaining home-activation source. No helper retirement. |
| Source-target recovery | Run: existing two whole-app Python case paths retain target44, revision, source, focus, measured offset and exact held/failed asks. |
| `intentReads` names in read-reuse, reading-place and E2E side-panel navigation | Excluded: inspection found separate locally declared functions; no import of the new revision family or changed helper behavior. |
| Existing page objects, clock and request-noting owners | Run through the nine new whole-app cases; unchanged behavior and independent caller expectations. Other existing imports are lexical fallout from removed specs; their contracts and implementations remain unchanged. |
| Jobs and catalog fixtures | Run: exact original feature/disk-space text and two original project publications feed selected source, alternate-file reads, project switch and exact source/revision expectations. No new fixture-generated expected answers. |
| Real settings/listing/source admission | Run: Backend6 actually reads upstream through real HTTP and gh; exact classification and refused content acquisition are independent of Frontend answers. |
| Real revision streams/setup departure | Run: Backend11 and E2E visibility use actual event streams and upstream call observations; Frontend preheld slots supply no SSE claim. |
| Representative real project freshness, reading recovery and per-project acquisition | Run: E2E6 includes actual later project publication, classified retry with exact heads-check +1, directed limit wait and actual Doughnut/Pygardon source retrieval. |
| Exact five retired source registrations | Run: static comparison to base proves only those five duration rows removed and no new rows added. Integrated root still includes the project part. No runner/config/roster change. |
| Live companion comments | Updated hold-helper and selection-reads links point to maintained Frontend cases. Sibling new spec links remain valid. Historical planning/finding identities retained. |
| Coordinator planning edits and broad PLAN/aria-live/Show latest/settingsProblem matches | Excluded per path: no changed service/helper behavior or direct import of the new revision family; historical and independent component meanings remain intact. |

No known affected consumer is deferred to CI. The source/test names, setup,
assertions, literal commands, exact selections and terminal proof are in
[slice-6-proof.md](slice-6-proof.md). No source family, runner or testability seam
was added to product code.

Independent [post-change refactoring and renewed proof](slice-6-refactor.md)
consolidates the two openers’ browser mechanics. Its per-path trace supersedes
the original home-activation exclusion above: that exact live caller was renewed.
The original raw traces and all other dispositions remain retained.
