import { A, pipe } from "@mobily/ts-belt";
import type { Comment as c } from "../schemas/commentSchema.server";

type Comment = Pick<c, "path" | "content" | "parentPath"> & {
  children?: Comment[];
};
type Comments = Comment[];
type Error = {
  error: string;
};

function getParents(comments: Comments) {
  return pipe(
    comments,
    A.filterMap((comment) => {
      if (comment.parentPath === null) {
        return comment;
      }
    })
  );
}

function findParentByPath(
  data: Comments,
  id: string,
  defaultValue = null
): null | Comment {
  if (!data.length) {
    return defaultValue;
  }

  return (
    data.find((el) => el.path === id) ||
    findParentByPath(
      data.flatMap((el) => el["children"] || []),
      id
    )
  );
}

function transformComments(
  comments: Comments | null,
  parents: null | Comments = null,
  children: null | Comments = null
): Error | Comments {
  if (!comments) {
    return { error: "You should pass the comments argument" } as Error;
  }
  if (!parents) {
    return transformComments(comments, [...getParents(comments)]);
  }
  if (!children) {
    const c = A.filterMap(comments, (comment) => {
      if (comment.parentPath !== null) {
        return comment;
      }
    });
    return transformComments([], parents, [...c]);
  }
  if (Array.isArray(children) && children.length > 0) {
    for (const child of children) {
      if (!child.parentPath) {
        return { error: "The parents should appear before children" } as Error;
      }
      const parent = findParentByPath(parents, child.parentPath);
      if (!parent) {
        return { error: "The parents should appear before children" } as Error;
      }
      children.shift();
      if (!parent?.children) {
        parent["children"] = [{ ...child }];
        return transformComments([], parents, children);
      }
      parent.children.push(child);
      return transformComments([], parents, children);
    }
  }

  return parents;
}
export { transformComments };
