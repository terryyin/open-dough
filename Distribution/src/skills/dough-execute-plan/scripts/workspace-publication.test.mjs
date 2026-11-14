// Real startup command boundaries for the claim and its selected source;
// project readiness remains a separate gate. Each group of startup boundaries
// is its own test file, so each job stays well within the runner's safety
// deadline under a loaded local run: readiness and blocking dependencies,
// plan links, the canonical plan home, the default checkout's local copies
// and maintenance, owned and reused workspaces, and the continued journey
// (workspace-publication-startup-*.test.mjs).
import "./workspace-publication-startup-claim-cases.mjs";
import "./workspace-publication-startup-source-cases.mjs";
import "./workspace-publication-admission-dependency-cases.mjs";
