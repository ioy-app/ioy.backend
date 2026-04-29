import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Get like counter by instance
 * 
 * @param target_id - Target ID
 * @param target_type - Target type
 * @returns
*/
const getLikesByInstance = async (
  target_id: number,
  target_type: "game" | "comment" | "picture"
): Promise<number> => {
    validate(z.object({
      target_id: IdSchemaCustom("target_id"),
      target_type: z.enum([
        "game",
        "comment",
        "picture"
      ], "errors.invalid.target_type")
      .nonoptional("errors.required.target_type")
    }), {
      target_id,
      target_type
    }, "getLikesByInstance");

    const cache_key = `likes_count:${target_type}:${target_id}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached)
        return Number(cached);

    const result = await db.query(`
        SELECT
            COUNT(*)::integer as total
        FROM "likes"
        WHERE
            target_id = $1
            AND target_type = $2
    `, [
      target_id,
      target_type
    ]);

    const { total } = result.rows[0];

    redis.writeWithLog(cache_key, String(total));
    return total;
}

export default getLikesByInstance;