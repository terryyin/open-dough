// A finished dashboard launch in Claude Code session `claude` that the
// developer goes on replying to. Its responses are the transcript builder's
// counted Opus responses, weighing 1,450 + 5×O input tokens for O output tokens.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

export const claudeIdentity = "SEED-7#claude";
export const reference = "ca7430bd-0d52-499d-a1bd-000000000001";
// A finished launch of story `identity` in session `claude` at `launchedAt`,
// reporting through `launchReference`.
export const launchIn = (
  identity: string,
  launchReference: string,
  launchedAt = "2026-11-14T09:00:00.000Z",
) =>
  makeMe.aLaunchRecord
    .executing({ identity, title: `Story ${identity}` })
    .inClaudeSession({ sessionId: "claude" })
    .launchedAt(launchedAt)
    .reportingThrough({
      origin: "http://localhost:4318",
      reference: launchReference,
      command: "report",
    })
    .completedWith({ message: "", receivedAt: "2026-11-15T12:00:00.000Z" })
    .please();
// The launch's session: its launch input answered with 100 output tokens.
export const claudeSession = () =>
  makeMe.aClaudeTranscript
    .forSession("claude")
    .withLaunchInput({ reference, command: "report" })
    .withCountedOpusResponse({ uuid: "first", outputTokens: 100 });

export const claudeReplyWorker = () =>
  makeMe.aClaudeTranscript
    .forSession("claude")
    .asSidechain({ agentId: "worker" })
    .withUser({ uuid: "worker-input", parentUuid: null, content: "work" })
    .withCountedOpusResponse({ uuid: "worker", outputTokens: 100 })
    .please();

export function claudeReplyThenLaterLaunch() {
  const identity = "SEED-7#second";
  const reference = "ca7430bd-0d52-499d-a1bd-000000000002";
  return {
    identity,
    reference,
    launch: launchIn(identity, reference, "2026-11-14T09:30:00.000Z"),
    rows: claudeSession()
      .withDeveloperReply()
      .withLaunchInput({ uuid: "second-launch", reference })
      .withCountedOpusResponse({ uuid: "second-first", outputTokens: 700 })
      .withUser({ uuid: "ok", content: "ok" })
      .withCountedOpusResponse({ uuid: "after-ok", outputTokens: 900 })
      .please(),
  };
}
