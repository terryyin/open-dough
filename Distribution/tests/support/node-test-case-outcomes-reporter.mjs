export default async function* caseOutcomes(source) {
  for await (const { type, data } of source) {
    // Node's final run summary can count a synthetic file result, for example
    // when the file fails to load. Only the child file's summary counts cases.
    if (type !== "test:summary" || data.file === undefined) continue;
    const { passed, failed, skipped, todo, cancelled } = data.counts;
    for (const [outcome, count] of [
      ["passed", passed],
      ["failed", failed],
      ["other", skipped + todo + cancelled],
    ]) {
      yield `${outcome}\n`.repeat(count);
    }
    yield "complete\n";
  }
}
