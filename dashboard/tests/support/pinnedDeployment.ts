// One deployment staged (../../server/productionDeployment.mjs) from the
// application source's pinned origin/main commit after main advanced: the
// pinned commit's page title is "PINNED DASHBOARD COMMIT", the later main's
// "LATER MAIN". Beside the development checkout lie untracked local avatars:
// a cartoon `stanly.webp` with `notes.txt` in the odd-e-nerds cartoon folder,
// and a raw `stanly.jpg` photo above it. Installing and building it is cold
// preparation the worker does once (./publishedMainWorkerFixtures.ts); its
// reader only serves and inspects the staged directory, never writes it.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  resolvePublishedMain,
  stageDeployment,
} from "../../server/productionDeployment.mjs";
import { publishedMainFixture } from "./publishedMainFixture.ts";
import { productionBuildEnvironment } from "./productionWatcherFixture.ts";
import { repoRoot } from "./repositoryRoot.ts";

export const nerdsAvatarPath = "dashboard/public/agent-avatars/odd-e-nerds";

export type PinnedDeployment = Awaited<
  ReturnType<typeof stagePinnedDeployment>
>;

export async function stagePinnedDeployment() {
  const fixture = await publishedMainFixture(true, "application");
  try {
    const env = productionBuildEnvironment(fixture.env);
    const commit = await fixture.publish(
      fixture.markerChanges("PINNED DASHBOARD COMMIT"),
      "Pinned",
    );
    const published = await resolvePublishedMain(
      fixture.development,
      fixture.env,
    );
    // Main advances after selection; staging still builds the selected commit.
    await fixture.publish(fixture.markerChanges("LATER MAIN"), "Later main");
    const cartoons = path.join(fixture.development, nerdsAvatarPath, "cartoon");
    await mkdir(cartoons, { recursive: true });
    const cartoon = await readFile(
      path.join(repoRoot, "dashboard/public/agent-avatars/atlas-1.webp"),
    );
    await writeFile(path.join(cartoons, "stanly.webp"), cartoon);
    await writeFile(path.join(cartoons, "notes.txt"), "LOCAL NOTES");
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
