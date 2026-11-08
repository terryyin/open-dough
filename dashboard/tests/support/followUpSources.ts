// Done ad hoc sessions a follow-up names (`../../src/followUpRequest.ts`),
// and the context text a session receives for one
// (`../../src/followUpContext.ts`), spelled out for black-box assertions.

import path from "node:path";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";

export const retiredTitle = "Why is the CI slow on main?";
export const quietTitle = "Tidy the changelog";

// A Done ad hoc session whose isolated workspace was retired, with this final
// report and the revision its work landed at.
export const retiredSession = (
  home: string,
  { report, landed, doneAt }: { report: string; landed: string; doneAt: Date },
): LaunchRecord =>
  makeMe.aLaunchRecord
    .adHoc({ instruction: retiredTitle, title: retiredTitle })
    .inClaudeSession({ sessionId: "reported-source", shortId: "reported" })
    .inIsolatedWorkspace({
      workspace: path.join(home, "retired-worktree"),
      branch: "claude/why-is-the-ci-slow-on-main",
    })
    .completedWith({ message: report })
    .landedAt(landed)
    .markedDoneAt(doneAt.toISOString())
    .please();

// A Done ad hoc session in Default main that completed quietly, under this
// native session id.
export const quietSession = (sessionId: string, doneAt: Date): LaunchRecord =>
  makeMe.aLaunchRecord
    .adHoc({ instruction: quietTitle, title: quietTitle })
    .inClaudeSession({ sessionId, shortId: sessionId.slice(0, 8) })
    .completedWith({ message: "" })
    .markedDoneAt(doneAt.toISOString())
    .please();

// The source a follow-up of `record` names.
export const followUpOf = (record: LaunchRecord) => ({
  session: { host: record.session.host, sessionId: record.session.sessionId },
});

// What every follow-up's context block opens with.
export const followUpPreamble =
  "Follow-up context: this session follows up earlier work in this project whose conversation can no longer be continued. These are the records the dashboard still holds of it; they state nothing beyond what was recorded.";

// The context block a session receives for a source titled `title`, with
// these item lines.
export const followUpContextOf = (title: string, items: readonly string[]) =>
  [followUpPreamble, `Session “${title}”:`, ...items].join("\n");
