// Real preview processes serve two built commits. This boundary is also the
// watcher's owner of same-port replacement and restoration.
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { expect, test } from "vitest";
import { productionFailureFixture } from "../../test-support/support/productionWatcherFixture.ts";
import {
  faultCause,
  faultGateChanges,
  ownCauseFault,
} from "../../test-support/support/productionFault.ts";
import { processRunning } from "../../test-support/support/processGroup.ts";
import {
  resolvePublishedMain,
  stageDeployment,
} from "../../server/productionDeployment.mjs";
import { startProductionPreview } from "../../server/productionPreviewLifecycle.mjs";

test("failed candidate and restoration leave neither preview running and report both causes", async () => {
  const fixture = await productionFailureFixture();
  try {
    await fixture.publish(
      {
        ...fixture.markerChanges("WORKING"),
        ...(await faultGateChanges(fixture.development)),
      },
      "Working",
    );
    const working = await resolvePublishedMain(
      fixture.development,
      fixture.env,
    );
    await fixture.publish(
      {
        ...fixture.markerChanges("CANDIDATE"),
        "production-fault.mjs": ownCauseFault("candidate").replace(
          "TRANSIENT",
          "CANDIDATE",
        ),
      },
      "Candidate",
    );
    const candidate = await resolvePublishedMain(
      fixture.development,
      fixture.env,
    );
    const options = {
      developmentRoot: fixture.development,
      deploymentsRoot: fixture.deploymentsRoot,
      env: fixture.env,
    };
    const first = await stageDeployment({ ...options, published: working });
    const second = await stageDeployment({ ...options, published: candidate });
    const owner = await startProductionPreview({
      ...working,
      directory: first.directory,
      env: fixture.env,
      port: 0,
    });
    try {
      const running = owner.current;
      if (running?.pid === undefined)
        throw new Error("Working preview never started");
      expect(await (await fetch(running.url)).text()).toContain(
        "<title>WORKING</title>",
      );
      expect(
        await readFile(
          path.join(second.directory, "dashboard/dist/index.html"),
          "utf8",
        ),
      ).toContain("<title>CANDIDATE</title>");

      const causes = [
        [
          faultCause(fixture.home, "preview", "candidate"),
          "candidate cannot start",
        ],
        [faultCause(fixture.home, "preview"), "working preview cannot restart"],
      ] as const;
      for (const [file, cause] of causes) await writeFile(file, cause);
      const replacement = owner.replace({
        ...candidate,
        directory: second.directory,
      });
      await expect(replacement).rejects.toThrow(`${candidate.commit} failed:`);
      await expect(replacement).rejects.toThrow(
        `restoring ${working.commit} also failed:`,
      );
      await expect(replacement).rejects.toThrow("CANDIDATE preview FAILURE");
      await expect(replacement).rejects.toThrow("TRANSIENT preview FAILURE");
      expect(owner.current).toBeUndefined();
      expect(processRunning(running.pid)).toBe(false);
      await expect(fetch(running.url)).rejects.toThrow();
    } finally {
      await owner.stop();
      await first.remove();
      await second.remove();
    }
    expect(await readdir(fixture.deploymentsRoot)).toEqual([]);
  } finally {
    await fixture.cleanup();
  }
}, 120_000);
