// What a published session close record is: the short published fact that one
// session closed with accepted Git comparisons, kept beside the backlog. The
// directory, file name, version, session-UUID rule, and standalone workflow
// value have one owner here. No filesystem, Git, or Node-only imports, so every
// reader of published session records shares it.

// Session records live beside the backlog, one file per session UUID.
export const sessionRecordDirectory = "sessions";

// The record schema version every writer and reader shares.
export const sessionRecordVersion = 1;

// The standalone (Dashboard ad-hoc) workflow value a close record may carry.
// Other workflows may add values later; this module owns only this one.
export const standaloneSessionWorkflow = "ad-hoc";

// Whether `value` is a session UUID as records spell it.
export function isSessionId(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)
  );
}

// The file name (within the session-record directory) the record of `sessionId`
// takes. The same UUID always names the same file.
export function sessionRecordFileName(sessionId) {
  return `${sessionId}.json`;
}

// The record's path relative to the backlog's directory.
export function sessionRecordRelativePath(sessionId) {
  return `${sessionRecordDirectory}/${sessionRecordFileName(sessionId)}`;
}
