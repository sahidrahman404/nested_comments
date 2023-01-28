import type {
  Comment,
  NestedComment as nc,
} from "../schemas/commentSchema.server";

type Comments = Omit<Comment, "id" | "content" | "usersId">[];
type NestedComment = Omit<nc, "id" | "content" | "usersId">;
type NestedComments = NestedComment[];

function addChildren(comments: Comments) {
  return comments.map((comment) => ({ ...comment, children: [] }));
}

function selectParents(comments: NestedComments) {
  return comments.filter((comment) => comment.parentPath === null);
}

function findParent(data: NestedComments, id: string) {
  let result: NestedComment | undefined;
  function iter(a: NestedComment) {
    if (a.path === id) {
      result = a;
    }
  }
  data.some(iter);
  return result;
}

function transformComments(comments: Comments) {
  const withChildren = addChildren(comments);
  withChildren.forEach((comment) => {
    const parentPath = comment.parentPath;

    if (parentPath === comment.path.slice(0, comment.path.length - 2)) {
      const a = findParent(withChildren, parentPath);
      a?.children.push(comment);
    }
  });
  const result = selectParents(withChildren);
  return result;
}
export { transformComments, selectParents, addChildren, findParent };
