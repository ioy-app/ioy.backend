import db from "@/lib/db";
import redis from "@/lib/redis";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Get pictures list
 * 
 * @param offset - Offset
 * @param limit - Limit
 * @param search - Search query
 * @param creater_id - User ID
 * @param order - new or old sort by date_created
 * @example
 * return getPictures(0, 20, undefined, undefined, "desc")
*/
const getPictures = async (
  offset?: number,
  limit?: number,
  search?: string,
  creater_id?: number,
  order: "new" | "old" = "new",
  type: "public" | "draft" | "all" = "public"
): Promise<[ number[], number ]> => {
  validate(z.object({
    offset: z.number("errors.invalid.offset")
      .int("errors.invalid.offset")
      .nonnegative("errors.invalid.offset")
      .optional(),
    limit: z.number("errors.invalid.limit")
      .int("errors.invalid.limit")
      .nonnegative("errors.invalid.limit")
      .optional(),
    search: z.string("errors.invalid.search")
      .optional(),
    creater_id: z.number("errors.invalid.creater_id")
      .int("errors.invalid.creater_id")
      .nonnegative("errors.invalid.creater_id")
      .optional(),
    order: z.enum([
      "new",
      "old"
    ], "errors.invalid.order")
      .optional(),
    type: z.enum([
      "public",
      "draft",
      "all"
    ], "errors.invalid.type")
      .nonoptional(),
    
  }), {
    offset,
    limit,
    search,
    creater_id,
    order,
    type
  }, "getPictures");

  const cache_key = `pictures:${offset}:${limit}:${search}:${creater_id}:${order}:${type}`;
  const cache = await redis.readWithLog(cache_key);
  if (cache) {
    try {
      const result = JSON.parse(cache);
      return result;
    }
    catch(err) { await redis.delWithLog(cache_key); }
  }

  enum OrderEnum {
      new="DESC",
      old="ASC"
  }

  const filters = [];
  const options = [];
  if (creater_id) {
    filters.push(`creater_id = $${options?.length + 3}`);
    options.push(creater_id);
  }
  if (search) {
    filters.push(`(title ILIKE $${options?.length + 3} OR description ILIKE $${options?.length + 3})`);
    options.push(search);
  }
  if (type) {
    if (type != "all") {
      filters.push(`status = $${options?.length + 3}`);
      options.push(type);
    }
  }

  const result = await db.query(`
    SELECT
      id,
      COUNT(*) OVER()::INTEGER as total
    FROM "pictures"
    ${filters?.length && `WHERE ${filters?.join(" AND ")}` || ""}
    ORDER BY date_created ${OrderEnum[order] || "DESC"}
    OFFSET $1
    LIMIT $2
  `, [
    offset,
    limit,
    ...options
  ]);

  const items = result?.rows?.map((item: { id: number, total: number }) => item?.id);
  const total = result?.rows?.[0]?.total;
  const data: [ number[], number ] = [ items, total ];

  redis.writeWithLog(cache_key, JSON.stringify(data));
  return data;
}

export default getPictures;