import { z } from "zod";
import { objectIdSchema } from "../src/storyReviewFiles.ts";
import type { StoryReviewResultRead } from "../src/storyReviewResult.ts";
import { reviewedStorySubjectSchema } from "../src/reviewedWorkSubject.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { requireExactQuery } from "./sessionAdmission.ts";

export type AdmittedStoryReviewResult = {
  readonly kind: "story-review-result";
  readonly read: StoryReviewResultRead;
};

const filePath = z
  .string()
  .min(1)
  .max(4096)
  .refine(
    (path) =>
      !path.includes("\0") &&
      path
        .split("/")
        .every((part) => part !== "" && part !== "." && part !== ".."),
  );
const fields = {
  ...reviewedStorySubjectSchema.shape,
  tree: objectIdSchema,
  path: filePath.optional(),
};
const wireRead = z.union([
  z.strictObject({ ...fields, completion: objectIdSchema }),
  z.strictObject({ ...fields, publishedHead: objectIdSchema }),
  z.strictObject({ ...fields, reference: z.string().min(1).max(4096) }),
]);

export function storyReviewResultRequest(url: URL): AdmittedStoryReviewResult {
  const parsed = wireRead.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success)
    throw new RefusedRequest(
      400,
      "The story result names a malformed comparison or path.",
    );
  requireExactQuery(url, Object.keys(parsed.data), "story result");
  const { source, identity, path, ...result } = parsed.data;
  return {
    kind: "story-review-result",
    read: {
      subject: { source, identity },
      ...result,
      ...(path === undefined ? {} : { path }),
    },
  };
}
