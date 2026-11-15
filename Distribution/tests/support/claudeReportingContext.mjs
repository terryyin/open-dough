// @ts-check
// Native Claude launch-input reporting-context block under proof. Prefix and
// suffix stay at the call site when a case wraps or trails the block.

/**
 * Short reporting-context block matching native Claude launch input under proof.
 * @param {{
 *   reference: string,
 *   project?: string,
 *   command?: string,
 *   prefix?: string,
 *   suffix?: string,
 * }} options
 * @returns {string}
 */
export function claudeReportingContext({
  reference,
  project = "open-dough",
  command,
  prefix = "",
  suffix = "",
}) {
  const lines = [
    "Dashboard reporting context:",
    `- project: ${project}`,
    `- host: claude`,
    `- launch reference: ${reference}`,
  ];
  if (command !== undefined) {
    lines.push(`- reporting command: ${command}`);
  }
  return `${prefix}${lines.join("\n")}${suffix}`;
}
