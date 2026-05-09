import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Checking user subscribe/save to instance
 * 
 * @param source_id - Source ID
 * @param target_id - Target ID
 * @param target_type - Target type
 * @returns
*/
const checkSubscribe = async (
    source_id: number,
    target_id: number,
    target_type: "user" | "jam" | "picture"
): Promise<boolean> => {
    validate(z.object({
        source_id: IdSchemaCustom("source_id"),
        target_id: IdSchemaCustom("target_id"),
        target_type: z.enum([
            "user",
            "jam",
            "picture"
        ], "errors.invalid.target_type")
        .nonoptional("errors.required.target_type")
    }), {
        source_id,
        target_id,
        target_type
    }, "checkSubscribe");

    const cache_key: string = `is_subscribe:${source_id}:${target_id}:${target_type}`;
    let cached = await redis.readWithLog(cache_key);

    if (cached) {
        try {
            const isSubscribe = Boolean((await redis.readWithLog(cache_key)) == "true");
            return isSubscribe;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT 1
        FROM "subscribers"
        WHERE
            source_id = $1
            AND target_id = $2
            AND target_type = $3
    `, [ source_id, target_id, target_type ]);

    const isSubscribe = Boolean(result.rowCount !== 0);

    redis.writeWithLog(cache_key, String(isSubscribe));
    return isSubscribe;
}

export default checkSubscribe;