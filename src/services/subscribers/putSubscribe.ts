import db from "@/lib/db";
import validate from "@/utils/validate";
import z from "zod";
import checkSubscribe from "./checkSubscribe";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";

/**
 * Create or Remove subs by instance
 * 
 * @param source_id - Source ID
 * @param target_id - Target ID
 * @param target_type - Target type
 * @returns
*/
const putSubscribe = async (
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
    }, "putSubscribe");

    const isSubscribe = await checkSubscribe(source_id, target_id, target_type);
    if (!isSubscribe) {
        await db.query(`
            INSERT INTO "subscribers" (
                source_id,
                target_id,
                target_type
            )
            SELECT $1, $2, $3
            WHERE NOT EXISTS (
                SELECT 1 FROM "subscribers"
                WHERE
                    source_id = $1
                    AND target_id = $2
                    AND target_type = $3
            )
            RETURNING id
        `, [
            source_id,
            target_id,
            target_type
        ]);
    } else {
        await db.query(`
            DELETE FROM "subscribers"
            WHERE
                source_id = $1
                AND target_id = $2
                AND target_type = $3
        `, [
            source_id,
            target_id,
            target_type
        ]);
    }
    
    await redis.delWithLog(`is_subscribe:${source_id}:${target_id}:${target_type}`);
    switch(target_type) {
        case "user":
            await redis.delWithLog(`user_id:${target_id}:followers`);
        break;
        case "jam":
            await redis.delAllWithLog(`jams:user:${target_id}:*`);
        break;
        case "picture":
            await redis.delWithLog(`user_id:${target_id}:subscribers`);
            await redis.delWithLog(`picture:${target_id}:saves`);
        break;
    }
    await redis.delAllWithLog(`subscribers:${source_id}:${target_type}:*`);
    await redis.delWithLog(`subs:${target_type}:${target_id}`);

    return !isSubscribe;
}

export default putSubscribe;