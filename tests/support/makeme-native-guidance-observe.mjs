const contains = (value, marker) =>
  (typeof value === "string" ? value : JSON.stringify(value))?.includes(marker);

// Count actual successful content reads. Skill-tool expansion and retained
// native session input are separate evidence supplied by their host adapters.
export function guidanceReadCount(read, path, marker) {
  return (
    read.reads.filter(
      (entry) => entry.path.endsWith(path) && contains(entry.content, marker),
    ).length +
    read.calls.filter(
      (entry) =>
        entry.command.includes(path) &&
        [0, null].includes(entry.exitCode) &&
        contains(entry.output, marker),
    ).length
  );
}
