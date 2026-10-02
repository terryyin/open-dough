import type { RecordedLaunchRequest } from "../src/launchRequest.ts";
// All host grammars carry the same explicit channel; blank native launches stay blank.
export function reportingInstruction(
  request: RecordedLaunchRequest,
): string | undefined {
  if (
    request.reporting === undefined ||
    (request.workflow === "ad-hoc" && !request.instruction?.trim())
  )
    return undefined;
  return [
    "Dashboard reporting context:",
    `- project: ${request.source}`,
    `- host: ${request.host}`,
    `- launch reference: ${request.reporting.reference}`,
    `- reporting command: ${request.reporting.command}`,
    "For Dough Land or Story Wrap Up, after all required operations and final wording settle, append --outcome completed with no message file for explicit completion with nothing requiring attention. This is the final operation; wait for its matching receipt, then give only the normal minimal native response. Silence, a marker, or process exit cannot report success. To retain an attention message for this session, append --outcome completed (finished with a reminder) or --outcome unfinished (remaining work), and --message-file <file containing your exact response>. Wait for its receipt. A pending-native-session receipt names only this launch until its native session is confirmed. Reporting does not stop the session or declare the story complete.",
  ].join("\n");
}
