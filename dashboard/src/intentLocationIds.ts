// Stable DOM id stem for one Intent location path (header, body, nested tree).

export function intentLocationIdPrefix(path: string): string {
  return `intent-${path.replaceAll("/", "-")}`;
}
