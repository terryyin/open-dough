import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./styles.css";
import "./project-actions.css";
import "./frame-states.css";
import "./banner.css";
import "./story-cards.css";
import "./column-frame.css";
import "./story-detail.css";

export function mountDashboard(container: HTMLElement) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  return root;
}
