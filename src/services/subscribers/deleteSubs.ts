import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Delete all subs by instance
 * 
 * @param id - Targer or Source ID
 * @param type - Target type
 * @example
 * return deleteSubs(10, "game")
*/
const deleteSubs = async (
    id: number,
    type: "game" | "user" | "jam" | "picture"
): Promise<boolean> => {
    validate(z.object({
        id: IdSchemaCustom("id"),
        type: z.enum([
            "game",
            "user",
            "jam",
            "picture"
        ], "errors.invalid.target_type")
        .nonoptional("errors.required.target_type")
    }), {
        id,
        type
    }, "deleteSubs");

    const result = await db.query(`
        DELETE FROM "subscribers"
        WHERE
            (source_id = $1 OR target_id = $1)
            AND target_type = $2
        RETURNING source_id, target_id, target_type
    `, [ id, type]);

    for (const { source_id, target_id, target_type } of result.rows) {
        await redis.delWithLog(`is_subscribe:${source_id}:${target_id}:${target_type}`);
        
        switch(target_type) {
            case "user":
                await redis.delWithLog(`user_id:${target_id}:followers`);
            break;
            case "game":
                await redis.delWithLog(`user_id:${target_id}:subscribers`);
                await redis.delWithLog(`game:${target_id}:saves`);
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
    }

    return true;
}

export default deleteSubs;