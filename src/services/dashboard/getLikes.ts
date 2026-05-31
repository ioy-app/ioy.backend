import db from "@/lib/db";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

type Instance = {
  id: number;
  type: "game" | "picture";
  date_created: string;
}

/**
 * Get all likes instances by user
 * @example
 * return getLikes()
*/
const getLikes = async (
  user_id: number,
  filters?: {
    search?: string,
    type?: "game" | "picture",
    sort?: "new" | "old"
  },
  offset: number = 0,
  limit: number = 10
): Promise<[ Instance[], number ]> => {
  validate(z.object({
    user_id: IdSchemaCustom("user_id"),
    filters: z.object({
      search: z.string("errors.invalid.search")
        .optional(),
      type: z.enum([
        "game",
        "picture"
      ], "errors.invalid.type")
        .optional(),
      sort: z.enum([
        "new",
        "old"
      ], "errors.invalid.sort")
        .optional()
    }).optional(),
    offset: z.number("errors.invalid.offset")
      .int("errors.invalid.offset")
      .nonnegative("errors.invalid.offset"),
    limit: z.number("errors.invalid.limit")
      .int("errors.invalid.limit")
      .nonnegative("errors.invalid.limit")
  }), {
    user_id,
    filters,
    offset,
    limit
  }, "getLikes");

  const keys = [];
  const values = [];

  enum sort {
    "new"="DESC",
    "old"="ASC"
  }

  if (filters?.type) {
    keys.push(`l.target_type=$${keys?.length + 4}`);
    values.push(filters?.type);
  }

  if (filters?.search) {
    keys.push(`(g.title ILIKE $${keys?.length + 4} OR p.title ILIKE $${keys?.length + 4})`);
    values.push(`%${filters?.search}%`);
  }

  const result = await db.query(`
    SELECT
      l.target_id as id,
      l.target_type as type,
      l.source_id,
      l.date_created,
      CASE
        WHEN l.target_type = 'game' THEN g.title
        WHEN l.target_type = 'picture' THEN p.title
      END as title
    FROM likes l
    LEFT JOIN games g
      ON l.target_type = 'game'
      AND l.target_id = g.id
    LEFT JOIN pictures p
      ON l.target_type = 'picture'
      AND l.target_id = p.id
    WHERE l.target_type != 'comment' AND l.source_id = $1
    ${keys?.length && `AND ${keys?.join?.( " AND ")}` || ""}
    ORDER BY l.date_created ${sort?.[filters?.sort] || "DESC"}
    OFFSET $2
    LIMIT $3
  `, [
    user_id,
    offset,
    limit,
    ...values
  ]);

  const items: Instance[] = result?.rows?.map?.((row: Instance) => ({
    id: row?.id,
    type: row?.type,
    date_created: row.date_created
  }));
  const total = result?.rows?.[0]?.total;
  const data: [ Instance[], number ] = [ items, total ];

  return data;
}

export default getLikes;