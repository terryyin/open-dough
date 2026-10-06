// Maps items through an asynchronous read with at most `limit` reads under
// way at once, answering the results in the items' order. Shared by the
// browser's file reads (`./repositoryFileReads.ts`) and the local
// authenticated read boundary's listed records (`../server/listedRecordsRead.ts`).
// When one read fails the pool fails with it and starts no further item.

export async function mapPool<T, R>(
  items: readonly T[],
  limit: number,
  map: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  let failed = false;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (!failed && next < items.length) {
        const index = next;
        next += 1;
        try {
          results[index] = await map(items[index] as T);
        } catch (error) {
          failed = true;
          throw error;
        }
      }
    },
  );
  await Promise.all(workers);
  return results;
}
