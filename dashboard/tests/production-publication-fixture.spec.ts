// The disposable origin receives exactly the path changes a test publishes.
import { expect, test } from "./support/pageTest.ts";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { publishedMainFixture } from "./support/publishedMainFixture.ts";
import { repoRoot } from "./support/repositoryRoot.ts";

const exec = promisify(execFile);

// The fixture commits this repository's whole source (about 2s alone, about
// 20s while other workers commit theirs, most of it in `git add`), and the
// pushes follow it; give it its own budget, as the other full-source
// production specs have, so a busy machine cannot starve it inside the
// default per-test timeout.
test("a documentation-only publication pushes only its requested paths to origin main", async () => {
  test.setTimeout(120_000);
  const fixture = await publishedMainFixture(true);
  const origin = async (...args: string[]) =>
    (await exec("git", ["--git-dir", fixture.origin, ...args])).stdout;
  try {
    await fixture.push();
    const base = (await origin("rev-parse", "main")).trim();
    const readme = await readFile(
      path.join(fixture.development, "dashboard/README.md"),
      "utf8",
    );
    const published = await fixture.commit(
      {
        "dashboard/README.md": `${readme}\nPublication fixture note.\n`,
        "docs/publication-note.md": "# Publication note\n",
        "docs/dashboard-navigation.md": null,
      },
      "Document only",
    );
    await fixture.push();

    expect((await origin("rev-parse", "main")).trim()).toBe(published);
    expect((await origin("rev-parse", `${published}^`)).trim()).toBe(base);
    expect(
      (await origin("diff", "--name-status", "-z", base, published))
        .split("\0")
        .filter(Boolean),
    ).toEqual([
      "M",
      "dashboard/README.md",
      "D",
      "docs/dashboard-navigation.md",
      "A",
      "docs/publication-note.md",
    ]);
    for (const file of [
      "VERSION",
      "package.json",
      "dashboard/index.html",
      "dashboard/server/productionDeployment.mjs",
    ])
      expect(await origin("show", `${published}:${file}`)).toBe(
        await readFile(path.join(repoRoot, file), "utf8"),
      );
  } finally {
    fixture.cleanup();
  }
});
