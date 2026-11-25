// The metadata and literal path in one NUL-delimited Git tree record.
export function storyReviewTreeEntry(record: string) {
  const match = /^\d+ (\S+) ([0-9a-f]+)\t/.exec(record);
  if (match === null) return undefined;
  const [metadata, type, object] = match;
  if (type === undefined || object === undefined) return undefined;
  return { type, object, path: record.slice(metadata.length) };
}
