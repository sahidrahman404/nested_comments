import { A, pipe } from "@mobily/ts-belt";
import type {
  Comment as cn,
  NestedComment as nc,
} from "../schemas/commentSchema.server";

type Comment = Omit<cn, "id" | "content" | "usersId">;
type Comments = Comment[];
type NestedComment = Omit<nc, "id" | "content" | "usersId" | "children"> & {
  children: NestedComment[];
};
type NestedComments = NestedComment[];

function transformComments(comments: Comments): NestedComments {
  const result: NestedComments = [];
  const commentsMap = new Map<string, number>();
  comments.forEach((comment, index, array) => {
    (array[index] as NestedComment).children = [];
    commentsMap.set(comment.path, index);
    if (comment.parentPath) {
      const parentCommentIndex = commentsMap.get(comment.parentPath);
      (array[parentCommentIndex!] as NestedComment).children.push(
        array[index] as NestedComment
      );
    }

    if (comment.parentPath === null) {
      result.push(array[index] as NestedComment);
    }
  });
  return result;
}
export { transformComments };
