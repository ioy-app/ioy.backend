import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Get total of subscribers by instance
 * 
 * @param target_id - Target ID
 * @param target_type - Target Type
 * @example
 * return getSubsCounterByInstance(10, "game")
*/
const getSubsCounterByInstance = async (
  target_id: number,
  target_type: "game" | "jam" | "user" | "picture"
): Promise<number> => {
  validate(z.object({
    target_id: IdSchemaCustom("target_id"),
    target_type: z.enum([
      "game",
      "jam",
      "user",
      "picture"
    ], "errors.invalid.target_type")
    .nonoptional("errors.required.target_type")
  }), {
    target_id,
    target_type
  }, "getSubsCounterByInstance");

  const cache_key = `${target_type}:${target_id}:saves`;
  const cache = await redis.readWithLog(cache_key);
  if (cache) {
    try {
      const total = Number(cache);
      return total;
    }
    catch(err) { await redis.delWithLog(cache_key); }
  }

  const result = await db.query(`
    SELECT
      COUNT(*) OVER()::INTEGER AS total
    FROM "subscribers"
    WHERE
      target_id = $1
      AND target_type = $2
  `, [
    target_id,
    target_type
  ]);

  const total = result?.rows?.[0]?.total || 0;
  redis.writeWithLog(cache_key, String(total));

  return total;
}

export default getSubsCounterByInstance;