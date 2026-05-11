import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema, { IdSchemaCustom } from "@/schemas/id";
import Comment from "@/types/comment";
import validate from "@/utils/validate";

/**
 * Create new comment
 * 
 * @param id - ID Comment or Game
 * @param source_id - Creater id 
 * @param comment - Comment text
 * @param type - Type Comment or Game
 * @returns
*/
const createComment = async (
    id: number,
    source_id: number,
    comment: string,
    type: "game" | "comment" | "picture" = "game"
): Promise<Comment> => {
    validate(IdSchema, id);
    validate(IdSchemaCustom("source_id"), source_id);

    const result = await db.query(`
        INSERT INTO "comments" (
            source_id,
            target_id,
            comment,
            target_type
        ) SELECT $1, $2, $3, $4
        RETURNING id, date_created
    `, [ source_id, id, comment, type ]);

    if (result.rowCount === 0)
        return null;

    const data = {
        ...result.rows[0],
        source_id,
        target_id: id,
        comment,
        target_type: type
    }

    await redis.delAllWithLog(`comments:${type}:${id}:*`);
    redis.writeWithLog(`comment:${data.id}`, JSON.stringify(data));
    return data;
}

export default createComment;