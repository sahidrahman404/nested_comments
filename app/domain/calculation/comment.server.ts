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

function addChildren(comments: Comments): NestedComments {
  return comments.map((comment) => ({ ...comment, children: [] }));
}

function selectParents(comments: NestedComments): NestedComments {
  return comments.filter((comment) => comment.parentPath === null);
}

function findRoot(comments: NestedComments, parentPath: string): NestedComment {
  const root = comments.find((comment) => comment.path === parentPath);
  if (!root) {
    throw new Error("Parent Path should appears first");
  }
  return root;
}

function transformComments(comments: Comments): NestedComments {
  const commentsWithChildren = addChildren(comments);
  commentsWithChildren.forEach((comment) => {
    const parentPath = comment.parentPath;
    if (parentPath !== null) {
      const root = findRoot(commentsWithChildren, parentPath);
      root?.children.push(comment);
    }
  });
  const result = selectParents(
    commentsWithChildren
  ) as typeof commentsWithChildren;
  return result;
}
export { transformComments };
