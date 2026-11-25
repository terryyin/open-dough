// Independently read the Take published by the installed command on a bare origin.
import { parseBacklog } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-document.mjs";
import type { StartOrigin } from "./startOrigin.ts";
import { worktree } from "./startSessionLanding.ts";

export async function admittedStory(origin: StartOrigin, title: string) {
  const revision = (await origin.originGit("rev-parse", "main")).trim();
  const { entries } = parseBacklog(
    await origin.originGit("show", `${revision}:.planning/PRODUCT-BACKLOG.md`),
  ) as {
    entries: Array<{
      identity: string;
      href: string;
      title: string;
      list: string;
    }>;
  };
  const story = entries.find(
    (item) => item.list === "Taken" && item.title === title,
  );
  if (story === undefined)
    throw new Error(`No published Taken story named ${title}.`);
  const seed = story.href.split("#")[0];
  const source = await origin.originGit(
    "show",
    `${revision}:.planning/${seed}`,
  );
  return { ...story, revision, source };
}

export function isolatedAdmissionFlags(
  project: string,
  slug: string,
  host = "claude",
) {
  return [
    "start",
    "--repository",
    project,
    "--workspace",
    worktree(project, slug),
    "--branch",
    `${host}/${slug}`,
    "--admit",
    "--owned-draft",
    "--publisher-id",
    "--push-authorized",
    "--workspace-authorized",
  ];
}
