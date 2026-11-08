// The page frame's layout (`./PageFrame.tsx`): one grid, always
// `page-frame`, whose tracks the open Sessions sidebar
// (`./sessions-sidebar.css`) and side panel (`./side-panel.css`) change,
// with the panel's width the Panel divider chose (`./sidePanelWidth.ts`).

import type { CSSProperties } from "react";

export function pageFrameLayout({
  sidebarOpen,
  panelOpen,
  covering,
  maximized,
  divider,
}: {
  readonly sidebarOpen: boolean;
  readonly panelOpen: boolean;
  readonly covering: boolean;
  readonly maximized: boolean;
  readonly divider: { readonly width: number } | undefined;
}): { className: string; style: CSSProperties | undefined } {
  return {
    className: [
      "page-frame",
      sidebarOpen && "page-with-sessions-sidebar",
      panelOpen && "page-split",
      panelOpen && covering && "page-covering",
      maximized && "page-maximized",
    ]
      .filter(Boolean)
      .join(" "),
    style:
      divider &&
      ({
        "--side-panel-width": `${String(divider.width)}px`,
      } as CSSProperties),
  };
}
