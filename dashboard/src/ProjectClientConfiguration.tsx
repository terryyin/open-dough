import type { ClientConfigurationInspection } from "./projectConfiguration.ts";
import "./project-client-configuration.css";

const absentExplanation =
  "The Client configuration file (.planning/open-dough.json) is absent.";
const unreadableExplanation =
  "The Client configuration could not be read from this project's local checkout.";

export function ProjectClientConfiguration({
  inspection,
}: {
  readonly inspection: ClientConfigurationInspection | undefined;
}) {
  return (
    <>
      <dt>Client configuration</dt>
      <dd className="settings-client-configuration">
        {inspection === undefined ? (
          "Loading…"
        ) : inspection.status === "readable" ? (
          <pre>{inspection.text}</pre>
        ) : inspection.status === "absent" ? (
          absentExplanation
        ) : (
          unreadableExplanation
        )}
      </dd>
    </>
  );
}
