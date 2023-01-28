import { z } from "zod";

const comment = z.object({
  id: z.string(),
  path: z.string(),
  parentPath: z.string().nullable(),
  content: z.string(),
  usersId: z.string(),
});

type Comment = z.infer<typeof comment>;

type NestedComment = z.infer<typeof comment> & { children: NestedComment[] };

const nestedComment: z.ZodType<NestedComment> = comment.extend({
  children: z.lazy(() => nestedComment.array()),
});

export { comment, nestedComment };
export type { Comment, NestedComment };
