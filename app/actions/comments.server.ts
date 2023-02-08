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

type A = Pick<Comment, "path" | "parentPath" | "content">;
async function selectAllCommentsWithName() {
  const comments = await sql<
    A[]
  >`select c.id as comments_id, u.id as users_id, c.created_at, c.path, c.parent_path, u.username, c.content, count(cl.comments_id) as likes
from comments as c
join users as u on u.id = c.users_id
left join comments_likes as cl on cl.comments_id = c.id
group by c.id, u.id, u.username, c.content
order by c.created_at desc`;

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
