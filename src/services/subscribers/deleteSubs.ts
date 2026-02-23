import db from "@/lib/db";
import redis from "@/lib/redis";

/**
 * Delete all subs by instance
 * @example
 * return deleteSubs()
*/
const deleteSubs = async (id: number, type: "game" | "user" | "jam"): Promise<boolean> => {
    const result = await db.query(`
        DELETE FROM "subscribers"
        WHERE
            (source_id = $1 OR target_id = $1)
            AND target_type = $2
        RETURNING source_id, target_id, target_type
    `, [ id, type]);

    for (const { source_id, target_id, target_type } of result.rows) {
        await redis.delWithLog(`is_subscribe:${source_id}:${target_id}:${target_type}`);
        if (target_type == "user")
            await redis.delWithLog(`user_id:${target_id}:followers`);
        if (target_type == "game")
            await redis.delWithLog(`user_id:${target_id}:subscribers`);
        await redis.delAllWithLog(`subscribers:${source_id}:${target_type}:*`);
    }

    return true;
}

export default deleteSubs;