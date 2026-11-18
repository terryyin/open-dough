# Source-only review

**Story:** SEED-384#keep-review-toolbar-truthful-while-reading

**Launch:** fresh general-purpose reviewer; inputs were the story Goal, Scope, and Key examples only (no plan, product, or proof).

**Unnumbered context:** Identity `SEED-384#keep-review-toolbar-truthful-while-reading`; correction provenance from the Keep Review changes focused on the diff retrospective (plan holds findings, provenance and proof); Scope proof/delivery note that the two-run landed opening is proved collapsed at the layer that owns it and the end-to-end runs journey keeps only what needs real launches.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C1 | Toolbar names no comparison that is not shown. Goal (“never sees the toolbar name a comparison that is not shown”); Scope (“Before the review's first answer, and when it cannot be read, the toolbar names no comparison it cannot yet show”); Key examples (pending: no comparison name; published answer brings **Published completion**; during refresh that still shows a previous answer, its name remains; choosing the older run shows its facts and diff). Triggers: opening Review changes for a completed story, published completion, or ad hoc landing; before first answer; when unreadable; while refresh still shows previous answer; when a run is chosen. | slice 2 | observed: frontend story-review-toolbar-truthful + gaps: pending no name; published/Landed/Session names; held Refresh keeps prior name |
| C2 | Eye only when details hold something. Goal (“or an eye that reveals nothing”); Scope (“the eye is offered only when the details hold something”); Key examples (pending: no details button; published answer brings its eye; during refresh that still shows a previous answer, its details remain available). | slice 2 | observed: frontend story-review-toolbar-truthful + gaps: pending no eye; answer supplies eye; held Refresh keeps eye; bare explanation no eye |
| C3 | Touch details + status share the prior status height budget (diff keeps its room). Goal (“on a short touch screen the revealed details and status leave the diff its room”); Scope (“On touch input, the revealed details and the review's status share the one height budget the status had before the details existed”); Key example (short landscape touch screen). | slice 3 | observed: frontend story-review-touch-height.spec.ts: shared .story-review-above budget at 780x390; status reachable; selected line in code pane |
| C4 | Failed first read keeps the problem visible. Key example (“If the first read fails, the problem stays visible”). | slice 2 | observed: frontend story-review-toolbar-truthful: refused first read keeps problem visible |
| C5 | Failed first read offers Refresh to try again. Key example (“and Refresh can try again”). | slice 2 | observed: frontend story-review-toolbar-truthful: refused first read keeps Refresh; retry succeeds |
| C6 | Two-run Done story opens on the newer run. Key example (“A Done story opens on the newer of two captured runs”). | slice 4 |  |
| C7 | Diff readable before opening details. Key example (“The developer can read its diff before opening the details”). | slice 4 |  |
| C8 | Refresh keeps the chosen run. Key example (“Refresh keeps that choice”). | slice 4 |  |
| C9 | Escape from the run picker returns focus to the eye. Key example (“Escape from the picker returns focus to the eye”). | slice 4 |  |
