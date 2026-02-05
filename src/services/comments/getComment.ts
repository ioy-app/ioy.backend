import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import Comment, { CommentValidate } from "@/types/comment";
import validate from "@/utils/validate";

/**
 * Get comment data
 * 
 * @param id - Comment ID
*/
const getComment = async (id: number): Promise<Comment> => {
    validate(IdSchema, id);

    const cache_key = `comment:${id}`;
    const cache = await redis.readWithLog(cache_key);
    if (cache) {
        try {
            const parse = JSON.parse(cache);
            validate(CommentValidate, parse);
            return parse;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT
            id,
            comment,
            source_id,
            target_id,
            target_type,
            date_created,
            date_updated,
            deleted
        FROM "comments"
        WHERE id = $1
    `, [ id ]);

    if (result.rowCount === 0)
        return null;

    const data: Comment = result?.rows?.[0];
    redis.writeWithLog(cache_key, JSON.stringify(data));

    return data;
}

export default getComment;