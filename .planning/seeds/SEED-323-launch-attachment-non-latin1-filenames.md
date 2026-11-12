---
id: SEED-323
status: active
planted: 2026-11-12
planted_during: Terry invoked dough-bug-fixing after Start session showed a fetch headers ISO-8859-1 failure beside the project row
trigger_when: Start session fails while uploading an attached image whose filename is not Latin-1
scope: story
---

# SEED-323 — Start session with non-Latin-1 attachment filenames

## Why This Matters

A developer attaches an image whose filename uses characters outside
ISO-8859-1 (for example Chinese text or emoji) and presses Start session.
The browser refuses the upload `fetch` because the client puts `file.name`
verbatim in the `x-launch-attachment-name` header. The row shows Launch
failed with that TypeError and Nothing was launched; no agent starts.

## Alternatives and Decision

Encode the filename for the header on the client and decode it on the
server (or stop carrying the display name in a header). Leaving the raw
name in the header keeps the failure for every non-Latin-1 filename.

## Story Decomposition

<a id="encode-launch-attachment-filenames-for-headers"></a>

### Encode launch attachment filenames for headers

**Identity:** SEED-323#encode-launch-attachment-filenames-for-headers
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Resolve the reported Start session failure so an attached image
whose filename contains non-ISO-8859-1 characters uploads and the launch
is not refused by the browser header check.

**Scope.** Client upload of launch-dialog attachments that sets
`x-launch-attachment-name`, and the matching server read/sanitize of that
header. Out of scope: unrelated launch refusal wording; changing attachment
type or size limits; terminal paste uploads that already use ASCII names.

**Expectations (gathered report).**

- Intended: Start session with an attached image keeps the image through
  upload when the filename is not Latin-1-safe, and does not fail with the
  browser ISO-8859-1 headers TypeError before anything launches.
- Actual: Beside Start session: `Launch failed: Failed to execute 'fetch'
  on 'Window': Failed to read the 'headers' property from 'RequestInit':
  String contains non ISO-8859-1 code point. Nothing was launched.`
- Evidence: dashboard screenshot of that row answer; `dashboard/src/
  launchAttachmentClient.ts` sets `[launchAttachmentNameHeader]: file.name`;
  `askedLaunches.ts` wraps the thrown `error.message` with Nothing was
  launched; feature introduced in `59c47d4c2` (Joey Chan, 2026-10-31,
  co-authored with Terry Yin). Server `sanitizeImageAttachmentName` already
  strips non-word characters after the header arrives.
- Gaps: the exact filename on the reported click is unknown; reproduction
  uses any non-Latin-1 `File.name` on the claim upload path.

**Key examples.**

- Given a PNG whose `File.name` is `截图.png` (or another non-Latin-1 name),
  when Start session uploads it, the claim request does not throw the
  ISO-8859-1 headers TypeError, and the server still receives a usable name.
- Given an ASCII filename such as `notes.png`, upload and sanitize behave as
  today.

## Ordering and Scope Reduction

Single story; stop when the reported header failure no longer occurs for a
non-Latin-1 attachment name and related attachment proof stays green.

## Open Decisions

None for the bounded repair.

## When to Surface

When Start session fails on attachment upload with the ISO-8859-1 headers
message.

## Breadcrumbs

`dashboard/src/launchAttachmentClient.ts`, `dashboard/src/launchAttachments.ts`
(`launchAttachmentNameHeader`), `dashboard/src/askedLaunches.ts`,
`dashboard/server/imageAttachments.ts`,
`dashboard/backend-tests/launches/launch-attachment-boundary.spec.ts`.
