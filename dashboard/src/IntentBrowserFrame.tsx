import type { ReactNode } from "react";
import type { IntentTabPanelAttributes } from "./IntentTabs.tsx";
import "./intent-browser.css";

export function IntentBrowserFrame({
  filesShown,
  panel,
  children,
}: {
  readonly filesShown: boolean;
  readonly panel?: IntentTabPanelAttributes;
  readonly children: ReactNode;
}) {
  return (
    <div
      className={
        filesShown ? "intent-browser" : "intent-browser intent-files-hidden"
      }
      {...panel}
    >
      {children}
    </div>
  );
}
