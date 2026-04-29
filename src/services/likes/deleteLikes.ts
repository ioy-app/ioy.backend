import db from "@/lib/db";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";
import deleteLike from "./deleteLike";

/**
 * Delete all likes by instance
 * 
 * @param target_id - Target ID
 * @param target_type - Target type
 * @example
 * return deleteLikes(1, "game")
*/
const deleteLikes = async (
    target_id: number,
    target_type: "game" | "comment" | "picture"
): Promise<boolean> => {
    validate(z.object({
        target_id: IdSchemaCustom("target_id"),
        target_type: z.enum([
            "game",
            "comment",
            "picture"
        ], "errors.invalid.target_type")
        .nonoptional("errors.required.target_type")
    }), {
        target_id,
        target_type
    }, "deleteLikes");

    const result = await db.query(`
        SELECT
            id,
            source_id
        FROM "likes"
        WHERE
            target_id = $1
            AND target_type = $2
    `, [
        target_id,
        target_type
    ]);

    if (result.rowCount === 0)
        return false;

    const items = result?.rows;
    for (const { source_id } of items)
        await deleteLike(source_id, target_id, target_type);

    return true;
}

export default deleteLikes;