# Consumer trace

## Effect terms searched

| Term | Origin |
| --- | --- |
| `dashboard/frontend-tests/launches/launch-attachments.spec.ts` | changed path |
| `launch-attachments.spec.ts` | basename of `dashboard/frontend-tests/launches/launch-attachments.spec.ts` |
| `mountStartSession` | supplied |
| `launchAttachmentEndpoint` | supplied |
| `pasteImageInField` | supplied |
| `pickImagesInDialog` | supplied |
| `dashboard/frontend-tests/launches/launch-attachments.spec` | import path of `dashboard/frontend-tests/launches/launch-attachments.spec.ts` |
| `launch-attachments.spec` | import path of `dashboard/frontend-tests/launches/launch-attachments.spec.ts` |
| `autoOpen` | declared in `dashboard/frontend-tests/launches/launch-attachments.spec.ts` |
| `offer` | declared in `dashboard/frontend-tests/launches/launch-attachments.spec.ts`; in 400 files, too broad to list consumers by itself; supply it as a `--term` to list them |

## Scope

Whole checkout at `e6ecba906120`, including uncommitted and untracked files: 7577 tracked and untracked non-ignored files searched with fixed-string, case-insensitive matching.

Changed files not searched: `dashboard/frontend-tests/launches/launch-attachments.spec.ts`.

## Located consumers

Kinds are path hints for inspection; each file appears once. Fill every Disposition with `run`, `reused` or `excluded: <reason the effect does not reach its boundary>`.

### Production

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/server/launchAttachmentBoundary.ts` | `launchAttachmentEndpoint` | 1: `import { launchAttachmentEndpoint } from "../src/launchAttachments.ts";` |  reused: attachment E2E observes copied bytes through the unchanged upload and server boundary |
| `dashboard/src/FollowUp.tsx` | `autoOpen` | 48: `autoOpen = false,` |  excluded: forwards autoOpen to StartSession, whose behavior and callers are unchanged |
| `dashboard/src/launchAttachmentClient.ts` | `launchAttachmentEndpoint` | 5: `launchAttachmentEndpoint,` |  reused: attachment E2E observes copied bytes through the unchanged upload client |
| `dashboard/src/launchAttachments.ts` | `launchAttachmentEndpoint` | 6: `export const launchAttachmentEndpoint = "/__agent-launch/attachments";` |  run: mounted attachment case exercises the unchanged file rules and browser paste handling through their dialog |
| `dashboard/src/StartSession.tsx` | `autoOpen` | 73: `` // trigger (`autoOpen`, `showTrigger`). `` |  run: mounted attachment cases use the existing typed autoOpen input, native launcher reopen, and startAdHoc callback |
| `dashboard/src/StoryAnchoredFollowUp.tsx` | `autoOpen` | 56: `autoOpen = false,` |  excluded: real line-menu autoOpen caller and production semantics are unchanged |

### Test

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/backend-tests/launches/agent-launch-follow-up-identity.spec.ts` | `launchAttachmentEndpoint` | 17: `launchAttachmentEndpoint,` |  excluded: test-only opening change reaches neither backend nor follow-up identity |
| `dashboard/backend-tests/launches/launch-attachment-boundary.spec.ts` | `launchAttachmentEndpoint` | 12: `launchAttachmentEndpoint,` |  excluded: test-only opening change reaches neither route nor backend file validation |

### Test support or stand-in

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `dashboard/test-support/support/frontendLaunchSubstitutes.ts` | `launchAttachmentEndpoint` | 18: `import { launchAttachmentEndpoint } from "../../src/launchAttachments.ts";` |  excluded: test-only opening change reaches neither the shared substituted endpoint nor its callers |
| `dashboard/test-support/support/launchAttachmentFixtures.ts` | `pasteImageInField`, `pickImagesInDialog` | 50: `export async function pickImagesInDialog(` |  reused: E2E starts the native chooser or sends a clipboard-shaped paste to the live mounted dialog |

### Journey or feature

| File | Terms matched | First matching line | Disposition |
| --- | --- | --- | --- |
| `e2e/launches/agent-launch-ad-hoc-attachments-codex.spec.ts` | `pickImagesInDialog` | 17: `pickImagesInDialog,` |  excluded: uses the unchanged shared chooser helper and unchanged runtime; the private mounting change affects only the selected frontend spec |
| `e2e/launches/agent-launch-ad-hoc-attachments-continuation.spec.ts` | `pickImagesInDialog` | 17: `pickImagesInDialog,` |  excluded: uses the unchanged shared chooser helper and unchanged runtime; the private mounting change affects only the selected frontend spec |
| `e2e/launches/agent-launch-ad-hoc-attachments-cursor.spec.ts` | `pickImagesInDialog` | 19: `pickImagesInDialog,` |  excluded: uses the unchanged shared chooser helper and unchanged runtime; the private mounting change affects only the selected frontend spec |
| `e2e/launches/agent-launch-ad-hoc-attachments.spec.ts` | `dashboard/frontend-tests/launches/launch-attachments.spec.ts`, `launch-attachments.spec.ts`, `pasteImageInField`, `pickImagesInDialog`, `dashboard/frontend-tests/launches/launch-attachments.spec`, `launch-attachments.spec` | 6: `// ../../dashboard/frontend-tests/launches/launch-attachments.spec.ts.` |  reused: 45108770652 passed all three chooser and image-paste paths; reference to mounted text-paste proof still resolves |
| `e2e/launches/agent-launch-start-session-existing-changes-attachments.spec.ts` | `pickImagesInDialog` | 43: `pickImagesInDialog,` |  excluded: uses the unchanged shared chooser helper and unchanged runtime; the private mounting change affects only the selected frontend spec |
| `e2e/launches/agent-launch-story-attachments.spec.ts` | `pickImagesInDialog` | 22: `pickImagesInDialog,` |  excluded: uses the unchanged shared chooser helper and unchanged runtime; the private mounting change affects only the selected frontend spec |
| `e2e/terminals/agent-terminal-cursor-launch-page.spec.ts` | `pickImagesInDialog` | 33: `pickImagesInDialog,` |  excluded: uses the unchanged shared chooser helper and unchanged runtime; the private mounting change affects only the selected frontend spec |

### Guidance reader

none found
