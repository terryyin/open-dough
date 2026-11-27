// One deployment staged (../../server/productionDeployment.mjs) from the
// application source's pinned origin/main commit after main advanced: the
// pinned commit supplies its page title and cartoon portrait. Later main changes
// both, and the development checkout holds a local raw photo and notes.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  resolvePublishedMain,
  stageDeployment,
} from "../../server/productionDeployment.mjs";
import { publishedMainFixture } from "./publishedMainFixture.ts";
import { productionBuildEnvironment } from "./productionWatcherFixture.ts";
import { repoRoot } from "./repositoryRoot.ts";

const avatarRoot = "dashboard/public/agent-avatars";
const nerdsAvatarPath = `${avatarRoot}/odd-e-nerds`;
const cartoonFile = `${nerdsAvatarPath}/cartoon/stanly.webp`;

export async function stagePinnedDeployment() {
  const fixture = await publishedMainFixture(true, "application");
  try {
    const env = productionBuildEnvironment(fixture.env);
    const cartoon = await readFile(
      path.join(repoRoot, avatarRoot, "atlas-1.webp"),
    );
    const commit = await fixture.publish(
      {
        ...fixture.markerChanges("PINNED DASHBOARD COMMIT"),
        [cartoonFile]: cartoon,
      },
      "Pinned",
    );
    const published = await resolvePublishedMain(
      fixture.development,
      fixture.env,
    );
    await fixture.publish(
      {
        ...fixture.markerChanges("LATER MAIN"),
        [cartoonFile]: await readFile(
          path.join(repoRoot, avatarRoot, "atlas-2.webp"),
        ),
      },
      "Later main",
    );
    await writeFile(
      path.join(fixture.development, nerdsAvatarPath, "cartoon/notes.txt"),
      "LOCAL NOTES",
    );
    await writeFile(
      path.join(fixture.development, nerdsAvatarPath, "stanly.jpg"),
      "PRIVATE RAW PHOTO",
    );
    const staged = await stageDeployment({
      developmentRoot: fixture.development,
      published,
      deploymentsRoot: fixture.deploymentsRoot,
      env,
    });
    return {
      fixture,
      env,
      commit,
      published,
      cartoon,
      staged,
      async cleanup() {
        await staged.remove();
        await fixture.cleanup();
      },
    };
  } catch (error) {
    await fixture.cleanup();
    throw error;
  }
}
