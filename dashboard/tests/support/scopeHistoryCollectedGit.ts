// Remove only verified disposable fixture Git metadata, restoring it even
// when the observing operation fails. No real repository or ref is mutated.
import { existsSync, realpathSync, renameSync, statSync } from "node:fs";
import path from "node:path";
import type { ProjectHistory } from "../../server/landedCiHistoryStore.ts";
import type { StartOrigin } from "./startOrigin.ts";
import { commonGitDir } from "./launchLanding.ts";
import { expect } from "./preparationPage.ts";

export async function withoutScopeHistoryGit<T>(
  origin: StartOrigin,
  kept: ProjectHistory,
  observe: () => Promise<T>,
  additionalRepositories: readonly string[] = [],
): Promise<T> {
  const machine = realpathSync(origin.machine);
  const repositories = Object.values(kept.landings).map(
    (landing) => landing.repository,
  );
  expect(repositories.every((repository) => repository !== undefined)).toBe(
    true,
  );
  const repositoryDirectories = [
    ...new Set([
      ...repositories.flatMap((repository) =>
        repository === undefined ? [] : [repository],
      ),
      origin.project,
      ...additionalRepositories,
    ]),
  ];
  for (const directory of repositoryDirectories) {
    const relative = path.relative(machine, realpathSync(directory));
    expect(relative).not.toBe("");
    expect(relative.startsWith("..") || path.isAbsolute(relative)).toBe(false);
  }
  const metadata = [
    ...new Set(
      repositoryDirectories.map((repository) =>
        realpathSync(commonGitDir(repository)),
      ),
    ),
  ];
  const moves = metadata.map((directory) => ({
    from: directory,
    to: `${directory}.history-order-unavailable`,
  }));
  // Every moved directory belongs to this disposable fixture. Refuse an
  // unexpected authority or overlapping metadata directory rather than guess.
  for (const move of moves) {
    const relative = path.relative(machine, move.from);
    expect(relative).not.toBe("");
    expect(relative.startsWith("..") || path.isAbsolute(relative)).toBe(false);
    expect(statSync(move.from).isDirectory()).toBe(true);
    expect(existsSync(move.to)).toBe(false);
    expect(
      metadata.some(
        (other) =>
          other !== move.from && move.from.startsWith(`${other}${path.sep}`),
      ),
    ).toBe(false);
  }
  const moved: typeof moves = [];
  try {
    for (const move of moves) {
      renameSync(move.from, move.to);
      moved.push(move);
    }
    expect(metadata.every((directory) => !existsSync(directory))).toBe(true);
    return await observe();
  } finally {
    for (const move of moved.reverse()) renameSync(move.to, move.from);
  }
}
