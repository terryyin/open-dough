// Committed repository tips and path bytes for the committed-origin fixture
// (`./committedOrigin.ts`): `git show`, `git ls-tree`, and `git rev-parse` over
// an isolated repo directory, never hand-constructed display state.

import { execFileSync } from "node:child_process";
import type { ListedPath } from "./listingAnswers.ts";

export function showAt(
  repoDir: string,
  revision: string,
  repositoryPath: string,
) {
  try {
    return execFileSync(
      "git",
      ["-C", repoDir, "show", `${revision}:${repositoryPath}`],
      // An absent path is a 404, not output.
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
  } catch {
    return undefined;
  }
}

// The directory's paths at the revision, each with its object sha; undefined
// once the journey's repository is gone, as it is for a request arriving
// after the journey ends.
export function listedAt(
  repoDir: string,
  revision: string,
  directory: string,
): ListedPath[] | undefined {
  try {
    return execFileSync(
      "git",
      ["-C", repoDir, "ls-tree", revision, "--", `${directory}/`],
      { encoding: "utf8" },
    )
      .split("\n")
      .flatMap((line) => {
        // `<mode> <type> <sha>\t<path>`
        const [object, path] = line.split("\t");
        const sha = object?.split(" ")[2];
        return path === undefined || sha === undefined ? [] : [{ path, sha }];
      });
  } catch {
    return undefined;
  }
}

// The directory's paths at the revision, as `listedAt` lists them.
export function listAt(repoDir: string, revision: string, directory: string) {
  return listedAt(repoDir, revision, directory)?.map(({ path }) => path);
}

// The commit `name` names in the repository, if it names one.
export function commitOf(repoDir: string, name: string): string | undefined {
  try {
    return execFileSync(
      "git",
      ["-C", repoDir, "rev-parse", "--verify", "--quiet", `${name}^{commit}`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
  } catch {
    return undefined;
  }
}

// Every published branch head in the bare origin, with `main` forced to the
// tip the fixture currently publishes (Taken story-branch tip moves stay
// visible to the page's revision check).
export function headsOf(
  repoDir: string,
  mainSha: string,
): Record<string, string> {
  const listed = execFileSync(
    "git",
    [
      "-C",
      repoDir,
      "for-each-ref",
      "--format=%(refname:short) %(objectname)",
      "refs/heads",
    ],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean);
  const heads: Record<string, string> = {};
  for (const line of listed) {
    const space = line.indexOf(" ");
    if (space <= 0) continue;
    heads[line.slice(0, space)] = line.slice(space + 1);
  }
  heads.main = mainSha;
  return heads;
}

// Every file under the directory at the revision, at any depth, with its
// committed text; undefined once the journey's repository is gone.
export function filesUnder(
  repoDir: string,
  revision: string,
  directory: string,
): Record<string, string> | undefined {
  try {
    const listed = execFileSync(
      "git",
      [
        "-C",
        repoDir,
        "ls-tree",
        "-r",
        "--name-only",
        revision,
        "--",
        `${directory}/`,
      ],
      { encoding: "utf8" },
    )
      .split("\n")
      .filter((file) => file !== "");
    return Object.fromEntries(
      listed.map((file) => [file, showAt(repoDir, revision, file) ?? ""]),
    );
  } catch {
    return undefined;
  }
}
