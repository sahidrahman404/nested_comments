import { transformComments } from "~/domain/calculation/comment.server";
import type { Comment } from "~/domain/schemas/commentSchema.server";
import { comment } from "~/domain/schemas/commentSchema.server";
import { sql } from "~/repo/repo.server";

async function selectAllComments() {
  const comments = await sql<Comment[]>`select * from comments`;

  const parsed = await comment.safeParseAsync(comments[0]);

  const isCorrect = parsed.success;

  if (!isCorrect) {
    return { result: parsed, origin: comments[0] };
  }

  return transformComments(comments);
}

async function selectAllCommentsWithName() {
  const comments = await sql<
    Pick<Comment, "path" | "parentPath" | "content"> & { name: string }[]
  >`select content, name, path, parent_path 
from comments 
join users on comments.users_id = users.id`;

  // const parsed = await comment.safeParseAsync(comments[0]);
  //
  // const isCorrect = parsed.success;
  //
  // if (!isCorrect) {
  //   return { result: parsed, origin: comments[0] };
  // }

  return transformComments(comments);
}

export { selectAllComments, selectAllCommentsWithName };
