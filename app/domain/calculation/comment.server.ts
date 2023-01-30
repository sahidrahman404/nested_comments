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

function addChildren<c extends Comment>(comments: Comments) {
  return comments.map((comment) => ({ ...(comment as c), children: [] }));
}

function selectParents(comments: NestedComments) {
  return comments.filter((comment) => comment.parentPath === null);
}

function findRoot(data: NestedComments, id: string) {
  let result: NestedComment | undefined;
  function iter(a: NestedComment) {
    if (a.path === id) {
      result = a;
      return true;
    }
    return Array.isArray(a.children) && a.children.some(iter);
  }
  data.some(iter);
  return result;
}

function transformComments<c extends Comment>(comments: Comments) {
  const commentsWithChildren = addChildren<c>(comments);
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
