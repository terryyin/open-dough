// A linked worktree of a project's local checkout that holds a story's claim
// on this machine (`../server/localWorkspaces.ts`): the story review reads it
// when no kept launch record names a workspace (`./storyReviewWorkspace.ts`
// `reviewWorkspaceOf`). It is this machine's Git evidence, never a launch.

import { z } from "zod";

export const localWorkspaceSchema = z.object({
  // The project's id.
  source: z.string().min(1),
  // The story whose claim the worktree's head holds.
  identity: z.string().min(1),
  // The agent the worktree's own Git config names as author.
  agent: z.string().min(1),
  // The worktree as the page shows the project's folders.
  workspace: z.string().min(1),
  branch: z.string().min(1),
});

export type LocalWorkspace = z.infer<typeof localWorkspaceSchema>;
