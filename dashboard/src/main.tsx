import { mountDashboard } from "./mountDashboard.tsx";

const root = document.getElementById("root");
if (!root) {
  throw new Error("The dashboard page has no #root element.");
}
mountDashboard(root);
