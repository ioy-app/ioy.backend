import db from "@/lib/db";
import redis from "@/lib/redis";
import { deleteLikes } from "../likes";

/**
 * Delete all commentd by instance
 * @example
 * return deleteComments()
*/
const deleteComments = async (id: number, type: "game" | "comment"): Promise<boolean> => {
    const result = await db.query(`
        DELETE FROM "comments"
        WHERE target_id = $1 AND target_type = $2
        RETURNING id, target_type
    `, [ id, type ]);

    if (result.rowCount === 0)
        return true;

    for (const lid of result.rows) {
        await deleteComments(lid.id, "comment");
        await deleteLikes(lid.id, "comment");
        if (lid.target_type == "game")
            await redis.delAllWithLog(`comments:game:${lid.id}:*`);
        if (lid.target_type == "comment")
            await redis.delAllWithLog(`comments:comment:${lid.id}:*`);
        await redis.delAllWithLog(`comment:${lid.id}`);
    }

    return true;
}

export default deleteComments;