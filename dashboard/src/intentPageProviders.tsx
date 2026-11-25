// Intent's mode, project path, and reading place for PageFrame.

import type { ReactNode } from "react";
import { IntentModeProvider } from "./pageIntentMode.tsx";
import { IntentReadingProvider } from "./pageIntentReading.tsx";
import { ProjectIntentSelectionProvider } from "./intentWorkspaceSelection.ts";
import { IntentStoryTitleProvider } from "./intentStoryTitle.tsx";

export function IntentPageProviders({
  project,
  children,
}: {
  readonly project: string;
  readonly children: ReactNode;
}) {
  return (
    <IntentModeProvider project={project}>
      <ProjectIntentSelectionProvider project={project}>
        <IntentReadingProvider project={project}>
          <IntentStoryTitleProvider>{children}</IntentStoryTitleProvider>
        </IntentReadingProvider>
      </ProjectIntentSelectionProvider>
    </IntentModeProvider>
  );
}
