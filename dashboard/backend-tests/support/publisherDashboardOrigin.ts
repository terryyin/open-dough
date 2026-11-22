import { reportingReference } from "../../../Distribution/tests/support/launchLandingTestData.mjs";

// The dashboard the installed publisher reports to.
export const dashboardOrigin = "http://127.0.0.1:4173";

// The reporting context a launch's session reports its completion through to
// that dashboard, under the fixed reporting reference.
export const dashboardReporting = {
  origin: dashboardOrigin,
  reference: reportingReference,
  command: "dashboard-completion",
};
