// Common canonical history facts. Each case declares its own graph and reads
// it afresh; no Git preparation or mutable history is shared by rule cases.
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { agentIdentity } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export const endpointIdentity = "SEED-1#comparison";
export const endpointAgent = agentIdentity("Yui");
export const endpointAuthor = {
  name: endpointAgent.agent,
  email: endpointAgent.email,
};
export const endpointProfilePath = `.planning/${endpointAgent.path}`;
const endpointOriginal = "story original\ntrunk original\n";
export const endpointPrefix = makeMe.aRepository
  .withRevision("start", { files: { "shared.txt": endpointOriginal } })
  .withRevision("claim", {
    agentProfiles: [
      makeMe.anAgentProfile
        .executing({
          name: "Yui",
          identity: endpointIdentity,
          mode: "story-branch",
          branch: "story",
        })
        .please(),
    ],
    author: endpointAuthor,
  })
  .withRevision("work", {
    files: { "shared.txt": "story edit\ntrunk original\n" },
    author: endpointAuthor,
  });
