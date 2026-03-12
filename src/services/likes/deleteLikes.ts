import db from "@/lib/db";
import redis from "@/lib/redis";

/**
 * Delete all likes by instance
 * 
 * @param id - ID
 * @param type - Instance type
 * @example
 * return deleteLikes(1, "game")
*/
const deleteLikes = async (
    id: number,
    type: "game" | "comment"
): Promise<boolean> => {
    const result = await db.query(`
        DELETE FROM "likes"
        WHERE target_id = $1 AND target_type = $2
        RETURNING source_id
    `, [ id, type ]);

    if (type == "comment")
        await redis.delWithLog(`comment:${id}`);

    await redis.delWithLog(`likes_count:${type}:${id}`);
    await redis.delAllWithLog(`likes_check:${type}:${id}:*`);

    return true;
}

export default deleteLikes;