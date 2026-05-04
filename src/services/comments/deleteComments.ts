import db from "@/lib/db";
import redis from "@/lib/redis";
import { deleteLikes } from "../likes";
import validate from "@/utils/validate";
import z from "zod";
import { IdSchemaCustom } from "@/schemas/id";

/**
 * Delete all commentd by instance
 * 
 * @param id - Comment ID
 * @param type - Target type
 * @example
 * return deleteComments()
*/
const deleteComments = async (
    id: number,
    type: "game" | "comment" | "picture"
): Promise<boolean> => {
    validate(z.object({
        id: IdSchemaCustom("id"),
        type: z.enum([
            "game",
            "comment",
            "picture"
        ], "errors.invalid.type")
        .nonoptional("errors.required.type")
    }), {
        id,
        type
    }, "deleteComments");

    const result = await db.query(`
        DELETE FROM "comments"
        WHERE
            target_id = $1
            AND target_type = $2
        RETURNING
            id,
            target_type
    `, [ id, type ]);

    if (result.rowCount === 0)
        return true;

    for (const lid of result.rows) {
        await deleteComments(lid.id, "comment");
        await deleteLikes(lid.id, "comment");
        await redis.delAllWithLog(`comments:${lid?.target_type}:${lid.id}:*`);
        await redis.delAllWithLog(`comment:${lid.id}`);
    }

    return true;
}

export default deleteComments;