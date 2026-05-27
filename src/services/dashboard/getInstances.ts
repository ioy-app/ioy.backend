import db from "@/lib/db";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

type Instance = {
  id: number;
  type: "game" | "picture";
}

/**
 * Get all instances by user
 * @example
 * return getInstances()
*/
const getInstances = async (
  user_id: number,
  filters?: {
    search?: string,
    type?: "game" | "picture",
    status?: "public" | "draft",
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
      status: z.enum([
        "public",
        "draft"
      ], "errors.invalid.status")
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
  }, "getInstances");

  const keys = [];
  const values = [];

  enum sort {
    "new"="DESC",
    "old"="ASC"
  }

  if (filters?.type) {
    keys.push(`type=$${keys?.length + 4}`);
    values.push(filters?.type);
  }

  if (filters?.status) {
    keys.push(`status=$${keys?.length + 4}`);
    values.push(filters?.status);
  }

  if (filters?.search) {
    keys.push(`title ILIKE $${keys?.length + 4}`);
    values.push(`%${filters?.search}%`);
  }

  const result = await db.query(`
    SELECT
      id,
      type,
      title,
      COUNT(*) OVER()::INTEGER as total
    FROM (
      SELECT
        id,
        title,
        'game' AS type,
        status,
        date_created
      FROM "games"
      WHERE creater_id = $1

      UNION ALL

      SELECT
        id,
        title,
        'picture' AS type,
        status,
        date_created
      FROM "pictures"
      WHERE creater_id = $1
    )
    ${keys?.length && `WHERE ${keys?.join?.( " AND ")}` || ""}
    ORDER BY date_created ${sort?.[filters?.sort] || "DESC"}
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
    type: row?.type
  }));
  const total = result?.rows?.[0]?.total;
  const data: [ Instance[], number ] = [ items, total ];

  return data;
}

export default getInstances;