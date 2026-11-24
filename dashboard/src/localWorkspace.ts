import { z } from "zod";

export const localWorkspaceSchema = z.object({
  // The project's id.
  source: z.string().min(1),
  // The story whose claim the worktree's head holds.
  identity: z.string().min(1),
  // The agent the worktree's own Git config names as author.
  agent: z.string().min(1),
  // The worktree as the page shows paths under the execution checkout.
  workspace: z.string().min(1),
  branch: z.string().min(1),
});

export type LocalWorkspace = z.infer<typeof localWorkspaceSchema>;
