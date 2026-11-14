import type { ReactNode } from "react";
import { SessionsButton } from "./SessionsSidebar.tsx";

export function SidePanelHeader({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <header className="side-panel-header">
      <SessionsButton />
      {children}
    </header>
  );
}
