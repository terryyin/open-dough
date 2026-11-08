# Follow up from Recently done

A standalone Done session in the Board's Recently done whose conversation can
no longer be continued, because no session it holds offers Open terminal
(`offersFollowUp` in `src/sessionAccess.ts`: its workspace is missing or
unconfirmed, its conversation is confirmed unavailable, or its host has no
embedded terminal), offers **Follow up** beside its primary action; Read final
report stays. An entry that offers Open terminal keeps it and offers no Follow
up, and the Sessions sidebar and Intent offer none. Follow up opens the
[Start session](LAUNCH-START.md#start-session) dialog with the same host,
model, Attach images, field, Session group, defaults, gating and
confirmations, plus a read-only line naming the session by its label and a
one-line-per-item list of the context it supplies (`src/FollowUpSubject.tsx`,
`src/followUpContext.ts`): its workflow and story identity when it had one,
its original request, its final report or that none was submitted or is
retained, and the revision its work landed at when that was recorded. The
context states only what the records hold; a Done mark is not evidence that
work landed. The field stays empty for the new request.
The request names only its source (`followUp.session`,
`src/followUpRequest.ts`); admission resolves the context from the kept
record (`server/followUpAdmission.ts`), refuses context text from a page and a
source the project no longer keeps, and keeps the resolved text on the
request, so a retry, Startup recovery or rebuilt first input resends it after
the source record is gone. The first input (`server/unattachedInput.ts`)
carries it as its own block: `[context, request, reporting]` with no
established session, `[established block, reporting, context, request]` with
one; a blank follow-up sends the context and the reporting context. The
context never counts against the 4,000-character field. The launch is an
ordinary ad hoc one, labelled by its request or launch time and listed in
Taken without naming its source; its attempt is kept on the page by project
and source, apart from the project row's Start session. The source session
stays Done, in place, with its actions and record unchanged.

Owned by [Launch start](LAUNCH-START.md#start-session): the launch identity
that includes the source is the ad hoc one there, and the entry's place in
Recently done is [session history](AGENT-LAUNCH-HISTORY.md).
