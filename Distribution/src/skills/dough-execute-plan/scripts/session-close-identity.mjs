// A session close's identity: the session a close names, its story, record
// path and shared-checkout note, or the refusal before any push when that
// identity is absent or conflicting. With several Dashboard launches open in
// one checkout, a close naming neither its landing context nor a session id
// is refused rather than guessed as any launch or native session.
import { readFile } from "node:fs/promises";
import { readSessionEvidence } from "./execution-session-evidence.mjs";
import {
  resolvePublicationLandingContext,
  severalLaunchesOpen,
} from "./resolve-publication-landing-context.mjs";
import { sessionRecordPath } from "./sealed-session-record.mjs";
import {
  parseSharedCheckoutNote,
  sharedCheckoutNoteOnReadFailure,
  sharedCheckoutNotePathBeside,
} from "./shared-checkout-note.mjs";

// The Dashboard's shared-checkout note beside the landing context, if any; a
// note that exists but cannot be read is overlap of unknown start.
async function sharedCheckoutNote(landingContext) {
  try {
    return parseSharedCheckoutNote(
      await readFile(sharedCheckoutNotePathBeside(landingContext), "utf8"),
    );
  } catch (error) {
    return sharedCheckoutNoteOnReadFailure(error);
  }
}

// The session a close names, with the story it carries and any
// shared-checkout note beside it: a Dashboard launch's landing context, else,
// with no explicitly retained id and no other launch open in the checkout,
// the workspace's unclosed native session evidence.
async function namedSession(retained, landingContext, checkout) {
  if (landingContext) {
    const launch = JSON.parse(await readFile(landingContext, "utf8"));
    return {
      sessionId: launch.reference,
      story: launch.identity,
      sharedCheckout: await sharedCheckoutNote(landingContext),
    };
  }
  if (retained || (await severalLaunchesOpen(checkout))) return {};
  const kept = readSessionEvidence(checkout.workspace);
  return kept && !kept.closedAt
    ? { sessionId: kept.sessionId, story: kept.story, native: true }
    : {};
}

// The close's identity, story and record path, refused before any push when
// the identity is absent or conflicting.
export async function closeTarget({
  retained,
  story,
  backlogPath,
  ...request
}) {
  const landingContext = await resolvePublicationLandingContext({
    remote: "origin",
    ...request,
  });
  const named = await namedSession(retained, landingContext, request);
  const refusal = identityRefusal(retained, named.sessionId);
  if (refusal) {
    return {
      refused: {
        work: { ok: false, ...refusal },
        record: { status: "not-published" },
      },
    };
  }
  const sessionId = named.sessionId ?? retained;
  // An invalid UUID throws here, before the work is pushed.
  sessionRecordPath(sessionId, backlogPath);
  return {
    sessionId,
    story: story ?? named.story,
    native: named.native === true,
    landingContext,
    sharedCheckout: named.sharedCheckout,
  };
}

function identityRefusal(retained, named) {
  if (named && retained && named !== retained) {
    return {
      status: "session-identity-conflict",
      error: `retained session ${retained} differs from launch reference ${named}`,
    };
  }
  if (!named && !retained) {
    return {
      status: "session-identity-missing",
      error:
        "no landing context reference or retained session id names this session",
    };
  }
  return undefined;
}
