# Source review — SEED-204#attach-image-at-launch

Launch: fresh general-purpose reviewer (no conversation inheritance), 2026-10-31.
Input: story Goal, Scope (required behavior, restrictions, deferred exclusions),
boundary assumptions, key examples, architecture note, and human amendment that
the early native host-readability probe is waived (2026-10-31).

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| 1 | A developer starting any dashboard session can attach one or more images in the launch dialog. | slice 7 | |
| 2 | The started session's first input names each image's local file path so the agent can open it without the developer saving or typing paths first. | slice 7 | |
| 3 | There is one attachment capability in the shared launch dialog (`LaunchDialog`). | slice 2 | observed: dashboard/src/LaunchAttachmentControls.tsx + LaunchDialog.tsx; agent-launch-ad-hoc-attachments.spec.ts Attach images control |
| 4a.1 | Start session gains that capability identically. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts Start session dialog uses shared Attach images |
| 4a.2 | Start execution gains that capability identically. | slice 3 | observed: agent-launch-story-attachments.spec.ts Start execution dialog Attach images |
| 4a.3 | Start refinement gains that capability identically. | slice 3 | observed: agent-launch-story-attachments.spec.ts Start refinement dialog Attach images |
| 4b.1 | Same wording across those entry points. | slice 2 | observed: LaunchAttachmentControls.tsx shared wording Attach images / Image N · name |
| 4b.2 | Same controls across those entry points. | slice 2 | observed: LaunchAttachmentControls.tsx shared picker, list, Remove controls in LaunchDialog |
| 4b.3 | Same limits across those entry points. | slice 5 | |
| 4c | There is no per-dialog variant of the attachment capability. | slice 2 | observed: LaunchDialog.tsx mounts one LaunchAttachments; no per-dialog variant |
| 5a | Images can be added by an Attach images control that opens a file picker and allows several files at once. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts filechooser setFiles two PNGs |
| 5b | Images can be added by pasting an image into the instruction field. | slice 4 | |
| 5c | Pasted text keeps its normal behavior (paste of non-image text is unchanged). | slice 4 | |
| 6a | Attached images show in the dialog as a numbered list in the form "Image N · \<filename\>". | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts Image 1 · card-a.png / Image 2 · card-b.png |
| 6b | Each listed attachment includes a small preview. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts list.locator(img) count |
| 6c | Each listed attachment has Remove. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts Remove Image N buttons |
| 6d | Removing an image renumbers the remaining images. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts after Remove Image 1 shows Image 1 · card-b.png |
| 6e | The developer may refer to attachments by number in the instruction text. | slice 2 | observed: LaunchAttachmentControls.tsx numbering enables referral by number; no dedicated text-reference assertion |
| 7a | On Cancel, the dialog sends nothing (including no images), as today. | slice 6 | |
| 7b | On Escape, the dialog sends nothing (including no images), as today. | slice 6 | |
| 7c | Images reach the dashboard server only with Start (Terry, 2026-10-31). | slice 2 | observed: launchAttachmentClient uploads only from Start path; agent-launch-ad-hoc-attachments.spec.ts Start then paths |
| 7d | A launch that is not accepted closes the dialog and discards its images, the same way it discards the instruction. | slice 6 | |
| 7e | The existing-changes confirmation keeps the images in the dialog. | slice 6 | |
| 7f | Continue (from that confirmation) sends the images again with the launch. | slice 6 | |
| 8a | The server copies each image into a folder it owns for that launch. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts path under launch-attachments with copied bytes |
| 8b | That folder is outside any workspace. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts attachments under dashboard.home/.open-dough/dashboard/launch-attachments |
| 8c | After the developer's text, the server appends an "Attached images" list of numbered absolute paths. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts prompt Attached images: 1. <path>; developer-part.spec.ts |
| 8d | That appended list is not counted in the 4,000 character instruction limit. | slice 2 | observed: dashboard/src/launchAttachments.ts developerPart composes list outside instruction field; developer-part.spec.ts |
| 8e.1 | The same first input (text plus attached-images path list) reaches Claude Code. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts fake Claude argv ends with Attached images list |
| 8e.2 | The same first input reaches Codex. | slice 3 | observed: agent-launch-ad-hoc-attachments-codex.spec.ts turn/start text ends with Attached images path |
| 8e.3 | The same first input reaches Cursor. | slice 3 | observed: agent-launch-ad-hoc-attachments-cursor.spec.ts prompt developer part ends with Attached images path |
| 8f | That includes a story start's handoff. | slice 3 | observed: agent-launch-story-attachments.spec.ts refinement argv includes handoff then Attached images list |
| 8g | That includes an ad hoc session's established-session block. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts ad hoc Start session; unattachedInput.ts uses developerPart |
| 9a | Copied images are kept with their launch attempt. | slice 6 | |
| 9b | Those images are removed when that settled attempt is pruned after 30 days. | slice 6 | |
| 9c | Recovery can still find those files while the attempt is retained. | slice 6 | |
| 9d | Continue can still find those files while the attempt is retained. | slice 6 | |
| 9e | A later resumed session can still find those files while the attempt is retained (Terry, 2026-10-31). | slice 6 | |
| 10a | Images never enter launch records as bytes. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts request.attachments paths; JSON has no iVBOR |
| 10b | Images never enter attempts as bytes. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts record.request.attachments paths only |
| 10c | Images never enter start stores as bytes. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts no attachmentClaims on kept request; no image bytes in JSON |
| 10d | Those records hold only the paths. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts attachments equal [attachedPath] |
| 11a | Accepted types are PNG, JPEG, GIF, and WebP. | slice 5 | |
| 11b | Each image is at most 10 MB. | slice 5 | |
| 11c | A launch carries at most 5 images. | slice 5 | |
| 11d | A refused file is named in the dialog with its refusal reason. | slice 5 | |
| 11e | On refusal, the instruction remains. | slice 5 | |
| 11f | On refusal, other (accepted) images remain. | slice 5 | |
| 11g | On refusal, other dialog choices remain. | slice 5 | |
| 12 | The dashboard overrides no host permission: if a host asks before reading a file outside its workspace, the developer answers as usual. | slice 1 | observed: waived native probe (developer 2026-10-31); premise retained in plan Current decisions |
| 13 | A blank instruction with images is not a blank start: its first input is the image list. | slice 7 | |
| 14 | A Cursor start with a chosen model and only images is therefore allowed. | slice 7 | |
| 15 | An ad hoc launch's identity includes its images (by content), so the same text with different images is a different session. | slice 7 | |
| 16 | Attachments are machine-local operational evidence of a launch (ADR 0008). | slice 2 | observed: launch path under machine dashboard home; AGENT-LAUNCH.md / ADR 0008 docs |
| 17 | Attachment files live under the dashboard's machine directory `~/.open-dough/dashboard/launch-attachments/<launch attempt>/`. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts …/launch-attachments/<attempt>/1-card-b.png |
| 18 | Attachment files never live in a repository or workspace. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts path under dashboard.home machine dir, not workspace |
| 19 | The launch request stays the one Start submission. | slice 2 | observed: claim upload + Start launch request; bytes not sent before Start (client Start wiring) |
| 20 | Image bytes must not raise the 32 KB JSON bound for every other request. | slice 2 | observed: boundedRawBody.ts separate from jsonRequestBody; instructionAudio reuses it |
| 21 | Image bytes must not be written into the JSON stores. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts JSON.stringify(request) without iVBOR; attachments are paths |
| 22 | The early native host-readability probe is waived (developer, 2026-10-31). | slice 1 | observed: plan slice 1 Proof waived; Current decisions record skip |
| 23 | The premise that hosts can open absolute paths under `launch-attachments` is retained without that probe. | slice 1 | observed: plan Current decisions retain premise |
| E1 | Start session with text "Why is this card clipped?" and a pasted screenshot → first input is that text followed by Attached images path list. | slice 4 | |
| E2 | Start refinement with two picked mockups and no text → skill line, preparation handoff, then numbered paths. | slice 3 | observed: agent-launch-story-attachments.spec.ts two mockups no text → skill/handoff/reporting then numbered paths |
| E3 | Attach two images, remove Image 1, then Start → one path is sent, numbered 1. | slice 2 | observed: agent-launch-ad-hoc-attachments.spec.ts remove Image 1 → single 1-card-b.png path numbered 1 |
| E4 | Pick a PDF and a 14 MB PNG → refused with typed reasons; text and other attachments remain. | slice 5 | |
| E5 | Attach an image, press Cancel → nothing uploaded; reopening shows no attachment. | slice 6 | |
| E6 | Default main Existing changes → Back keeps images; Continue sends them. | slice 6 | |
| E7 | Unconfirmed Codex first input continued from Startup recovery → same paths still exist. | slice 6 | |
| X1 | Dropping files onto the dialog is out of scope for now. |  | G1 |
| X2 | Non-image attachments are out of scope for now. |  | G2 |
| X3 | Attaching images to an already running session is out of scope for now. |  | G2 |
| X4 | Showing attachments in session history is out of scope for now. |  | G3 |
| X5 | Showing attachments in the Sessions sidebar is out of scope for now. |  | G3 |
