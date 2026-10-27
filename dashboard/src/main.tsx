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

const root = document.getElementById("root");
if (!root) {
  throw new Error("The dashboard page has no #root element.");
}
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
