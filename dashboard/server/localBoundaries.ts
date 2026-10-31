// This dashboard's local boundaries, in the order a server mounts them: the
// project configuration, OpenAI configuration, terminal theme and feedback
// maintenance JSON endpoints, instruction transcription, launch-image claims,
// the authenticated read boundary, and the launch boundary with its terminal
// upgrades. Vite mounts this list as
// plugins in dev and preview (`../vite.config.mts`, each through
// `./localBoundaryPlugin.ts`), and the boundary server mounts the same list
// on a plain HTTP server for boundary tests (`./boundaryServer.ts`), so both
// serve the same boundaries by construction.

import { installAuthenticatedReadMiddleware } from "./authenticatedRead.ts";
import { installInstructionTranscriptionMiddleware } from "./instructionTranscriptionBoundary.ts";
import { installFeedbackMaintenanceMiddleware } from "./feedbackMaintenanceBoundary.ts";
import { installLaunchAttachmentMiddleware } from "./launchAttachmentBoundary.ts";
import { installAgentLaunchMiddleware } from "./launchBoundary.ts";
import type { LocalBoundary } from "./localBoundary.ts";
import { installOpenAIConfigurationMiddleware } from "./openAIConfigurationBoundary.ts";
import { installProjectConfigurationMiddleware } from "./projectConfigurationBoundary.ts";
import { installTerminalThemeMiddleware } from "./terminalThemeBoundary.ts";

export const localBoundaries: readonly LocalBoundary[] = [
  {
    name: "dough-project-configuration",
    install: installProjectConfigurationMiddleware,
  },
  {
    name: "dough-openai-configuration",
    install: installOpenAIConfigurationMiddleware,
  },
  { name: "dough-terminal-theme", install: installTerminalThemeMiddleware },
  {
    name: "dough-feedback-maintenance",
    install: installFeedbackMaintenanceMiddleware,
  },
  {
    name: "dough-instruction-transcription",
    install: installInstructionTranscriptionMiddleware,
  },
  {
    name: "dough-launch-attachments",
    install: installLaunchAttachmentMiddleware,
  },
  {
    name: "dough-authenticated-read",
    install: installAuthenticatedReadMiddleware,
  },
  { name: "dough-agent-launch", install: installAgentLaunchMiddleware },
];
