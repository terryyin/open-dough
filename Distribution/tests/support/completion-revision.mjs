// @ts-check
import { agentIdentity } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "./makeMe.mjs";
import { direction } from "./product-backlog-fixture.mjs";

/** @typedef {Parameters<typeof makeMe.aBacklogEntry.with>[0]} BacklogEntry */

/**
 * Completes `story`: Taken→queued, profile removed, `makeMe.aDoneRecord`.
 * Name `agent`, or `agentless: true` — not both or neither.
 * @param {{ story: BacklogEntry, queued: readonly BacklogEntry[], developer: string, completedAt?: string, agent?: string, host?: string, agentless?: boolean, intentCoverage?: import("./repositoryTestData.mjs").DoneRecord["intentCoverage"], message?: string, author?: import("./repositoryTestData.mjs").GitPerson, committer?: import("./repositoryTestData.mjs").GitPerson }} facts
 */
export function completionRevision({
  story,
  queued,
  developer,
  completedAt = "2026-01-15T12:00:00.000Z",
  agent,
  host = "claude",
  agentless = false,
  intentCoverage,
  message = "complete the story through CLI",
  author,
  committer,
}) {
  if (agentless === (agent !== undefined))
    throw new Error(
      "completionRevision names an agent, or states agentless: true, not both or neither",
    );
  const identity = agent === undefined ? undefined : agentIdentity(agent);
  /** @type {import("./repositoryTestData.mjs").GitPerson | undefined} */
  const doneAuthor =
    author ??
    (identity === undefined
      ? undefined
      : { name: identity.agent, email: identity.email });
  return {
    message,
    backlog: { direction, queued },
    ...(identity === undefined
      ? {}
      : { remove: [`.planning/${identity.path}`] }),
    doneRecords: [
      makeMe.aDoneRecord
        .with({
          identity: story.identity,
          title: story.title,
          completedAt,
          developer,
          ...(identity === undefined ? {} : { agent: identity.agent, host }),
          ...(intentCoverage === undefined ? {} : { intentCoverage }),
        })
        .please(),
    ],
    ...(doneAuthor === undefined ? {} : { author: doneAuthor }),
    ...(committer === undefined ? {} : { committer }),
  };
}
