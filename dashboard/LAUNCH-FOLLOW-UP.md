# Follow up from Recently done

An entry in the Board's Recently done whose conversation can no longer be
continued, because no session it holds offers Open terminal
(`offersFollowUp` in `src/sessionAccess.ts`: its workspace is missing or
unconfirmed, its conversation is confirmed unavailable, or its host has no
embedded terminal), offers **Follow up**: a standalone Done session beside its
primary action, where Read final report stays, and a done story's card, once
its done record is read, in its Story actions group, also when it holds no
session. An entry that offers Open terminal keeps it and offers no Follow up,
and the Sessions sidebar and Intent offer none. Follow up opens the
[Start session](LAUNCH-START.md#start-session) dialog with the same host,
model, Attach images, field, Session group, defaults, gating and
confirmations, plus a read-only line naming the entry as it reads (a
session's label, or a story's “identity — title”) and a one-line-per-item
list of the context it supplies (`src/FollowUpSubject.tsx`,
`src/followUpContext.ts`). A done story's comes first: when it was completed
(UTC), by which developer with which agent, and that it is done, so its seed
and plan may have been removed while its records remain in the project's
history under its identity; or, holding no session, that no session context
is retained. Then each session's, oldest first: its workflow and story
identity when it had one, its original request, its final report or that none
was submitted or is retained, and the revision its work landed at when that
was recorded. The context states only what the records hold; a Done mark is
not evidence that work landed. The field stays empty for the new request.
The context is not typed text: a follow-up with nothing typed opens the new
session's terminal once it starts, and one with typed text presents nothing
and returns the keyboard to Follow up ([startup](AGENT-LAUNCH-STARTUP.md)).
A card's sessions lack their landing until the sessions history is read, so
opening its Follow up asks for that read (`src/FollowUp.tsx`).

The request names only its source (`followUp.session`, or `followUp.story`
with the identity and the revision whose done record the page showed,
`src/followUpRequest.ts`); admission resolves the context
(`server/followUpAdmission.ts`). A session's comes from its kept record; a
story's from its published done record, read at that revision by the
`done=bodies` read the page uses (`server/doneCatalogRead.ts`, so only a
record that revision's agreeing catalog lists), with the Done sessions this
machine keeps for it, as its card holds them (`server/followUpStory.ts`).
Admission refuses context text from a page. For a new follow-up, it refuses
a session the project no longer keeps (404), a story the revision does not
publish or whose record does not read as it (404), or a story whose record
could not be read (502). Repeating a matching retained start or resuming a
pending first input uses its saved context even after the source record is
gone. The context stays on the recorded request for Startup recovery and
rebuilt first inputs. The first input (`server/unattachedInput.ts`) carries it as its own
block: `[context, request, reporting]` with no established session,
`[established block, reporting, context, request]` with one, the same on
Claude, Codex and Cursor; a blank follow-up sends the context and the
reporting context, so Cursor admits a blank follow-up with a chosen model. The context never
counts against the 4,000-character field. The launch is an ordinary ad hoc
one, labelled by its request or launch time and listed in Taken without
naming or grouping with its source; its identity and its attempt on the page
include the source (a story's by identity, not the revision shown), apart
from the project row's Start session. The source session or story stays
Done, in place, with its actions, record and published done record
unchanged.

Owned by [Launch start](LAUNCH-START.md#start-session): the launch identity
that includes the source is the ad hoc one there, and the entry's place in
Recently done is [session history](AGENT-LAUNCH-HISTORY.md).
