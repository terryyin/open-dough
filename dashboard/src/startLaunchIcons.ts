// The glyph each workflow's Start leads with. It stays beside the card rather
// than in `launchWorkflows`, which the server reads too.
import { PencilLine, Play, type LucideIcon } from "lucide-react";
import type { LaunchWorkflow } from "./agentLaunch.ts";

export const startIcons: Record<LaunchWorkflow, LucideIcon> = {
  execution: Play,
  refinement: PencilLine,
};
