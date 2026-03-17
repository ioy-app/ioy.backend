import db from "@/lib/db";
import redis from "@/lib/redis";
import { deleteLikes } from "../likes";

/**
 * Delete all comments by user
 * @example
 * return deleteCommentsByUser()
*/
const deleteCommentsByUser = async (user_id: number): Promise<any> => {
    const result = await db.query(`
        UPDATE "comments"
            SET 
                deleted = true,
                comment = NULL,
                source_id = NULL,
                date_updated = NOW()
        WHERE source_id = $1
        RETURNING id
    `, [ user_id ]);

    if (result.rowCount === 0)
        return true;

    for (const lid of result.rows) {
        await redis.delAllWithLog(`comments:game:${lid.id}:*`);
        await redis.delAllWithLog(`comments:comment:${lid.id}:*`);
        await redis.delAllWithLog(`comment:${lid.id}`);
        await deleteLikes(lid.id, "comment");
    }

    return true;
}

export default deleteCommentsByUser;