import { json } from "@remix-run/node";
import { selectAllCommentsWithName } from "~/actions/comments.server";
import { sql } from "~/repo/repo.server";

export async function loader() {
  const data = await selectAllCommentsWithName();
  return json(data);
}
