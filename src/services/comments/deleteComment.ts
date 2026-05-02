import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import validate from "@/utils/validate";

/**
 * Delete comment
 * 
 * @param id - Comment ID
 * @returns 
*/
const deleteComment = async (id: number): Promise<boolean> => {
    validate(IdSchema, id);

    const result = await db.query(`
        UPDATE "comments"
        SET 
            deleted = true,
            comment = NULL,
            source_id = NULL,
            date_updated = NOW()
        WHERE
            id = $1
        RETURNING 1
    `, [ id ]);

    if (result.rowCount === 0)
        return false;

    await redis.delAllWithLog(`comments:*`);
    await redis.delAllWithLog(`comment:${id}`);
    
    return true;
}

export default deleteComment;