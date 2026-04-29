import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Check has like by instance
 * 
 * @param user_id - User ID
 * @param target_id - Target ID
 * @param target_type - Target type
 * @returns
*/
const checkLikeByInstance = async (
    user_id: number,
    target_id: number,
    target_type: "game" | "comment" | "picture"
): Promise<boolean> => {
    validate(z.object({
        user_id: IdSchemaCustom("user_id"),
        target_id: IdSchemaCustom("target_id"),
        target_type: z.enum([
          "game",
          "comment",
          "picture"
        ], "errors.invalid.target_type")
        .nonoptional("errors.required.target_type")
    }), {
        user_id,
        target_id,
        target_type
    }, "checkLikeByInstance");

    const cache_key = `likes_check:${target_type}:${target_id}:${user_id}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached)
        return cached == "true" ? true : false;

    const result = await db.query(`
        SELECT 1
        FROM "likes"
        WHERE
            source_id = $1
            AND target_id = $2
            AND target_type = $3
    `, [
        user_id,
        target_id,
        target_type
    ]);

    const value = !(result.rowCount === 0);
    redis.writeWithLog(cache_key, String(value));

    return value;
}

export default checkLikeByInstance;