import { json } from "@remix-run/node";
import { sql } from "~/repo/repo.server";

type Comment = {
  id: number;
  path: string;
  parentPath?: string;
  content: string;
  userId: number;
};

type CommentWithChildren = Comment & { children: Comment[] };

export async function loader() {
  const comments = await sql<Comment[]>`select * from comments`;

  function addChildren(comments: Comment[]) {
    return comments.map((comment) => ({ ...comment, children: [] }));
  }

  function selectParents(comments: CommentWithChildren[]) {
    return comments.filter((comment) => comment.parentPath === null);
  }

  function findParent(data: CommentWithChildren[], id: string) {
    let result: CommentWithChildren | undefined;
    function iter(a: CommentWithChildren) {
      if (a.path === id) {
        result = a;
      }
    }
    data.some(iter);
    return result;
  }

  function transformComments(comments: Array<Comment>) {
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

  return json(transformComments(comments));
}
