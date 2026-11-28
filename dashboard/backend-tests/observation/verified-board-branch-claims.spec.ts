import { expect, test } from "vitest";
import { renderAgentProfile } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { boardConfirmation } from "../../server/boardConfirmation.ts";
import { reviewRepositoryPath } from "../../server/reviewRepository.ts";
import { publishBranch } from "../../test-support/committedOriginRepo.ts";
import { sharedReadsFacts } from "../../test-support/support/sharedReads.ts";
import { opened } from "../review/verifiedOriginTrunkCase.ts";

test("the Board verifies the branch named by each valid execution claim", async () => {
  const facts = sharedReadsFacts();
  const preparation = makeMe.anAgentProfile
    .preparing({ name: "Kirara", identity: "SEED-shared#one" })
    .please();
  const misplaced = makeMe.anAgentProfile
    .executing({
      name: "Maki",
      identity: "SEED-other#two",
      mode: "story-branch",
      branch: "story/misplaced",
    })
    .please();
  const { repository, source, read } = await opened(
    makeMe.aRepository
      .withRevision("older", { files: { "earlier.txt": "Earlier" } })
      .withRevision("published", {
        ...facts,
        agentProfiles: [...facts.agentProfiles, preparation],
        files: {
          ...facts.files,
          ".planning/agents/mana-chan.json": renderAgentProfile(misplaced),
        },
      })
      .please(),
  );

  const { older, published } = repository.revisions;
  publishBranch(repository.origin, "story/one", older);
  publishBranch(repository.origin, "story/two", published);
  publishBranch(repository.origin, "story/misplaced", older);
  await expect(read()).resolves.toMatchObject({
    kind: "verified",
    revision: published,
  });
  const confirmed = await boardConfirmation(
    reviewRepositoryPath(source),
    "main",
  );
  expect(new Set(confirmed?.branches)).toEqual(
    new Set([
      { branch: "story/one", head: older },
      { branch: "story/two", head: published },
    ]),
  );
});
