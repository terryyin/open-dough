# Source-only review

Launch: fresh general-purpose reviewer (`f38dc5fb-03d3-4f5a-9209-fae02a8f40b0`),
no conversation inheritance. Input: Goal, Scope, Key examples, UX/UI, and
Architecture from
`.planning/seeds/SEED-295-view-project-configuration-in-dashboard.md#inspect-project-configuration-in-dashboard`
only. No plan, product, or proof.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A maintainer using **System settings → Projects** can inspect each configured project's Client configuration (`.planning/open-dough.json` in that project's local checkout) without opening the checkout in an editor. | slice 1 | observed: SystemSettings Projects entries + ProjectClientConfiguration; system-settings-client-configuration.spec.ts UI and settings payload |
| 2 | That inspection lets them see what that machine's dashboard checkout holds for Open Dough without leaving settings. | slice 1 | observed: System settings → Projects inspection without leaving settings; same journey test |
| 3 | **Where.** On each project entry under **System settings → Projects**, the maintainer can see that project's Client configuration. | slice 1 | observed: ProjectClientConfiguration on each project entry in SystemSettings.tsx |
| 4.1 | While that inspection is available, the Projects list remains available | slice 1 | observed: Projects list still rendered; Add project / rows visible in journey |
| 4.2 | While that inspection is available, local path remains available | slice 1 | observed: local path still shown on Alpha row (~/git/alpha) |
| 4.3 | While that inspection is available, add / hide / remove remain available | slice 1 | observed: Add project, hide, remove controls visible on Alpha |
| 4.4 | While that inspection is available, other settings sections remain available | slice 1 | observed: OpenAI, Terminal theme, Feedback maintenance headings remain visible |
| 5 | **Source.** For each configured project, read `.planning/open-dough.json` from that project's configured local checkout path on this machine. | slice 1 | observed: inspectClientConfiguration via localFolder(localPath)/.planning/open-dough.json |
| 6.1 | That read must not substitute another project's file | slice 1 | observed: Alpha/Beta rows contain only their own texts |
| 6.2 | That read must not substitute a published GitHub revision | slice 1 | observed: inspection uses local checkout file, not published revision readers |
| 6.3 | That read must not substitute a cached copy from a different project | slice 1 | observed: per-project inspectClientConfiguration; no cross-project cache |
| 7 | **Readable file.** When the file exists and can be read as text, show that project's file text, including unrecognized keys and invalid JSON. | slice 1 | observed: readable status shows pre text including unrecognized keys; epsilon invalid JSON shown |
| 8 | Opening or leaving the view does not write the file. | slice 1 | observed: alpha file bytes unchanged after open/back in journey |
| 9 | **Absent or unreadable.** When the file is absent, or the checkout path or file cannot be read, that project's entry explains the condition. | slice 1 | observed: absent and unreadable explanations on gamma/delta/missing rows |
| 10 | In that absent/unreadable case, the entry does not show another project's settings or invent defaults as if they were the file. | slice 1 | observed: absent/unreadable rows do not contain other projects texts |
| 11 | **Read-only.** Provide no editing or saving actions for Client configuration in this story. | slice 1 | observed: no textbox/textarea/save\|edit\|write buttons in project rows |
| 12 | Isolating each project's file is required correctness for the stated goal (not an arbitrary cap). | slice 1 | observed: distinct per-row inspection payload and UI |
| 13 | None beyond the read-only promise (commitment 11). | slice 1 | observed: read-only promise only; no additional restrictions implemented |
| 14 | **Different projects, different files.** Projects A and B are configured with distinct local checkouts whose `.planning/open-dough.json` texts differ; opening **System settings → Projects** → A's entry shows A's file text; B's entry shows B's; neither entry shows the other's content. | slice 1 | observed: Alpha shows alphaText, Beta shows betaText, neither cross-shows |
| 15 | **Absent file.** Project C's checkout has no `.planning/open-dough.json`; C's entry explains that the Client configuration file is absent; other projects that have readable files still show theirs. | slice 1 | observed: Gamma absent explanation; others still show theirs |
| 16 | **Unreadable.** Project D's local path is missing or the file cannot be read (for example permission or I/O failure); D's entry explains that the configuration could not be read; it does not fall back to another project. | slice 1 | observed: Delta chmod-unreadable and Missing path show unreadable explanation without fallback |
| 17 | **No write.** A project's file is readable; the maintainer opens settings, views the configuration, and leaves settings; the file bytes are unchanged. | slice 1 | observed: beforeAlpha bytes equal after leaving settings |
| 18 | **Invalid JSON still inspectable.** A project's file exists as text but is not valid JSON; the entry shows that text so the maintainer can see what is on disk; it does not treat parse failure as another project's settings. | slice 1 | observed: Epsilon shows invalidText |
| 19 | **User.** The actor is a maintainer already using System settings to manage which projects this machine's dashboard observes. | slice 1 | observed: journey uses System settings Projects maintainer surface |
| 20 | **Task and context.** The maintainer can check what Client configuration each configured checkout holds, beside the existing GitHub repository and local path facts, without switching to an editor. | slice 1 | observed: inspection beside repository/local path facts on project entry |
| 21 | **Interaction — placement.** Keep the inspection on the project entry in **System settings → Projects**. | slice 1 | observed: ProjectClientConfiguration inside Projects entry |
| 22 | Do not place the inspection in the Side panel (terminals, final reports, and story reviews). | slice 1 | observed: inspection not placed in Side panel |
| 23 | Do not invent a separate settings page for the inspection. | slice 1 | observed: no separate settings page; shown in System settings |
| 24 | Show or disclose the file text within that project entry so the maintainer can reach it from the Projects list. | slice 1 | observed: file text disclosed in project entry pre |
| 25 | When absent or unreadable, the explanation is on that same entry. | slice 1 | observed: absent/unreadable explanation on same entry |
| 26 | Feedback is the shown text or the per-project explanation. | slice 1 | observed: shown text or per-project explanation as feedback |
| 27 | Recovery is retrying the settings load or fixing the checkout outside the dashboard. | slice 1 | observed: retry via settings reload / checkout fix outside dashboard (no edit controls) |
| 28 | No edit controls. | slice 1 | observed: no edit controls in project rows |
| 29 | Client configuration is the project-owned `.planning/open-dough.json` (ADR 0001 — Ubiquitous language). | slice 1 | observed: reads .planning/open-dough.json Client configuration |
| 30 | Machine-local project configuration (which checkouts this dashboard observes) remains separate from published repository workflow records (ADR 0008 — Project dashboard domain and architecture). | slice 1 | observed: machine-local settings path via projectSettings; not published workflow records |
| 31 | This story adds a read-only settings responsibility: for each configured project, read Client configuration from that project's local checkout and present it under System settings. | slice 1 | observed: read-only projectSettings clientConfiguration inspection |
| 32 | It does not move Intent's or the agent roster's published-revision reads. | slice 1 | observed: CI/Intent published-revision readers unchanged (no edits) |
| 33 | It does not write the file. | slice 1 | observed: inspectClientConfiguration only reads; journey bytes unchanged |
| 34 | It does not make the dashboard authoritative for Client configuration contents. | slice 1 | observed: dashboard presents checkout text; does not authoritatively rewrite config |
| 35 | No Accepted ADR conflict. | slice 1 | observed: Accepted ADR 0001/0008 followed; no conflict introduced |
| 36 | Not undertaken: editing or saving `.planning/open-dough.json`. | | G1 |
| 37 | Not undertaken: comparing two projects side by side. | | G2 |
| 38 | Not undertaken: showing the published GitHub revision that Intent or the agent roster use. | | G3 |
| 39 | Not undertaken: interpreting or validating individual keys for the maintainer. | | G4 |
| 40 | Not undertaken: opening the file in an external editor from settings. | | G5 |
| 41 | Deferred: published-revision inspection or local-vs-published comparison. | | G6 |
| 42 | Deferred: structured field explanations. | | G7 |
| 43 | Deferred: editing from the dashboard. | | G8 |
