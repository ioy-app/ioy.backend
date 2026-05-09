import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Get ids subs by instance
 * 
 * @param target_id - Target ID
 * @param target_type - Target type
 * @example
 * return getSubsByInstance(10, "game")
*/
const getSubsByInstance = async (
  target_id: number,
  target_type: "jam" | "user" | "picture"
): Promise<number[] | null> => {
  validate(z.object({
    target_id: IdSchemaCustom("target_id"),
    target_type: z.enum([
      "jam",
      "user",
      "picture"
    ], "errors.invalid.target_type")
    .nonoptional("errors.required.target_type")
  }), {
    target_id,
    target_type
  }, "getSubsByInstance");

  const cache_key = `subs:${target_type}:${target_id}`;
  const cache = await redis.readWithLog(cache_key);
  if (cache) {
    try {
      const result = JSON.parse(cache);
      return result;
    }
    catch(err) { await redis.delWithLog(cache_key); }
  }

  const result = await db.query(`
    SELECT
      source_id
    FROM "subscribers"
    WHERE
      target_id = $1
      AND target_type = $2
  `, [ target_id, target_type ]);

  if (result.rowCount === 0)
    return null;

  const items: number[] = result?.rows?.map(row => row.source_id);
  redis.writeWithLog(cache_key, JSON.stringify(items));

  return items;
}

export default getSubsByInstance;