# Source review

Launch: a fresh general-purpose reviewer (no conversation inheritance) during slice 1 acceptance, 2026-11-02, given only the selected story's Goal, Scope, Scope limits and Key examples from [SEED-222](../../seeds/SEED-222-intent-purpose-proof-layout.md#intent-purpose-proof-layout), told to read no files and change nothing. Its numbered return is below as returned; Slice and the last cell are the coordinator's allocation and observations.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | When a file is selected, or nothing is selected yet, Intent's reading area offers a **Purpose** tab and a **Proof** tab sharing the reading area. | slice 2 | |
| 2 | Beside the tabs, the reading area offers a **Side by side** toggle (same condition: a file is selected or nothing is selected yet). | slice 3 | |
| 3 | With Side by side off, the chosen tab's content fills the reading area. | slice 2 | |
| 4 | **Purpose** is the chosen tab when Intent opens (example 1: selecting a feature file with Side by side off shows Purpose chosen, with the file's source). | slice 2 | |
| 5 | Choosing **Proof** shows the same file's observed proof filling the reading area (example 1). | slice 2 | |
| 6 | The chosen tab stays chosen while the developer selects other files (example 1: Proof stays chosen and shows the new file's proof). | slice 2 | |
| 7.1 | The tabs use Intent's existing tab keyboard behavior: arrow keys. | slice 2 | |
| 7.2 | The tabs use Intent's existing tab keyboard behavior: Home. | slice 2 | |
| 7.3 | The tabs use Intent's existing tab keyboard behavior: End. | slice 2 | |
| 7.4 | Tab keyboard handling never reaches page-wide project cycling. | slice 2 | |
| 8.1 | The Side by side toggle is a button that can be operated by keyboard. | slice 3 | |
| 8.2 | The Side by side toggle shows whether it is pressed. | slice 3 | |
| 9 | With Side by side on, Purpose and Proof appear together as two panels for the same file (example 2). | slice 3 | |
| 10 | With Side by side on, each panel scrolls on its own, so reading a long Purpose/source keeps Proof in view (example 2). | slice 3 | |
| 11 | With Side by side on, both panels follow the selection when another file is selected (example 2). | slice 3 | |
| 12 | Where the reading area is too narrow for two readable columns, the two panels stack with Purpose above Proof, and the toggle stays on (example 4: narrowing the window until the locations sit above the reading area shows Purpose above Proof, and the toggle still reads on). | slice 3 | |
| 13 | Widening the reading area again puts the panels back side by side (example 4). | slice 3 | |
| 14 | Turning Side by side off brings back the tabs with the tab that was chosen before. | slice 3 | |
| 15.1 | The browser remembers the Side by side choice across perspective switches (example 3: switching to Development and back keeps Side by side on). | slice 4 | |
| 15.2 | The browser remembers the Side by side choice across reloads (example 3: reloading the dashboard keeps Side by side on; turning it off and reloading shows tabs with Purpose chosen). | slice 4 | |
| 15.3 | The browser remembers the Side by side choice across later visits. | slice 4 | |
| 16 | The remembered choice is one choice for every project (example 5: Side by side on in one project means another project's Intent also opens side by side). | slice 4 | |
| 17.1 | When there is no remembered choice, Intent starts with tabs (example 6). | slice 4 | |
| 17.2 | When the browser keeps no preferences (for example, refuses storage), Intent starts with tabs (example 6). | slice 4 | |
| 18 | In those no-memory cases, a Side by side choice made lasts for the page, until the page is reloaded (example 6). | slice 4 | |
| 19 | Switching layouts or tabs never changes the selection. | slice 3 | |
| 19.1 | The selected file stays as it was. | slice 3 | |
| 19.2 | The file's positioned case stays as it was. | slice 3 | |
| 19.3 | The Intent tab (Intent, Optimization Candidates, and any later tab) stays as it was. | slice 3 | |
| 19.4 | Any selected story stays as it was. | slice 3 | |
| 20 | Both layouts show the same file read and the same proof (example 7: when layouts or tabs switch, nothing is read again). | slice 3 | |
| 21 | Opening a recorded file from **Optimization Candidates** shows its Purpose, positioned on its case, in either layout. | slice 3 | |
| 22 | With tabs, opening a recorded file from Optimization Candidates makes Purpose the chosen tab (example 8: with tabs on Proof, opening a recorded file shows Purpose positioned on that case). | slice 2 | |
| X1 | Exclusion (deferred): keeping the chosen Purpose/Proof tab after leaving Intent or after a reload is not promised; only the Side by side choice is remembered. | slice 4 | |
| X2 | Exclusion (deferred): there are no layout choices for a location or folder Summary. The Summary keeps its single reading pane with no tabs or toggle, and selecting a file brings the layout back. (The part about the layout returning when a file is selected is stated inside this limit.) | slice 2 | |
| X3.1 | Exclusion (deferred): resizing the panels. | slice 3 | |
| X3.2 | Exclusion (deferred): collapsing the locations tree. | slice 3 | |
| X3.3 | Exclusion (deferred): linking the scrolling of the two panels. | slice 3 | |
| X4 | Exclusion (deferred): a separate layout choice for each project. | slice 4 | |
