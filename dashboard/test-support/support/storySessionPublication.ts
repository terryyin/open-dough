import { sessionRecordPathBeside } from "../../../Distribution/src/skills/dough-execute-plan/scripts/session-record.mjs";
import { defaultBacklogPath } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-store.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import {
  publishedPairAdding,
  trunkAdvancedWith,
} from "../originatingMachine.ts";
import type { StartOrigin } from "./startOrigin.ts";

export function retainedStorySession(
  story: { readonly identity: string; readonly title: string },
  {
    sessionId,
    reference,
    instruction,
    report,
  }: {
    readonly sessionId: string;
    readonly reference: string;
    readonly instruction: string;
    readonly report: string;
  },
) {
  return makeMe.aLaunchRecord
    .executing({ ...story, instruction })
    .reportingThrough({
      origin: "https://dashboard.example",
      reference,
      command: "node report.mjs",
    })
    .inClaudeSession({ sessionId })
    .completedWith({ message: report })
    .markedDoneAt(new Date().toISOString())
    .please();
}

export function publishStorySession(
  origin: StartOrigin,
  identity: string,
  firstFile: string,
  interveningFile: string,
  secondFile: string,
) {
  const first = publishedPairAdding(origin, firstFile);
  trunkAdvancedWith(origin, interveningFile);
  const second = publishedPairAdding(origin, secondFile);
  const record = makeMe.aSessionRecord
    .forStory(identity)
    .closing(first)
    .andClosing(second)
    .please();
  const path = sessionRecordPathBeside(defaultBacklogPath, record.sessionId);
  const revision = trunkAdvancedWith(
    origin,
    path,
    `${JSON.stringify(record)}\n`,
  );
  return { record, first, second, revision };
}
