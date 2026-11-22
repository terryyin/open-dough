// Intent page providers for PageFrame: mode, reading place, and the scope
// chooser bridge the banner Recent stories control uses.

import type { ReactNode } from "react";
import { IntentModeProvider } from "./pageIntentMode.tsx";
import { IntentReadingProvider } from "./pageIntentReading.tsx";
import { IntentScopeBridgeProvider } from "./intentStoryTabs.tsx";

export function IntentPageProviders({
  project,
  children,
}: {
  readonly project: string;
  readonly children: ReactNode;
}) {
  return (
    <IntentModeProvider project={project}>
      <IntentReadingProvider project={project}>
        <IntentScopeBridgeProvider>{children}</IntentScopeBridgeProvider>
      </IntentReadingProvider>
    </IntentModeProvider>
  );
}
