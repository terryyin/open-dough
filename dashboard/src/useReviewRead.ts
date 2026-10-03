// One read of the launch boundary's story review endpoints
// (`./storyReview.ts`), kept until the reader leaves: the answer, or why it
// could not be read.

import { useEffect, useState } from "react";
import type { z } from "zod";

export function useReviewRead<Answer>(
  endpoint: string,
  query: Readonly<Record<string, string>>,
  schema: z.ZodType<Answer>,
): { readonly answer?: Answer; readonly problem?: string } {
  const [read, setRead] = useState<{ answer?: Answer; problem?: string }>({});
  const search = new URLSearchParams(query).toString();
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`${endpoint}?${search}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const answer: unknown = await response.json();
        if (!response.ok) {
          const said = (answer as { error?: unknown }).error;
          throw new Error(
            typeof said === "string" ? said : "The review was refused.",
          );
        }
        return schema.parse(answer);
      })
      .then(
        (answer) => {
          setRead({ answer });
        },
        (error: unknown) => {
          if (!controller.signal.aborted)
            setRead({
              problem: error instanceof Error ? error.message : String(error),
            });
        },
      );
    return () => {
      controller.abort();
    };
  }, [endpoint, search, schema]);
  return read;
}
