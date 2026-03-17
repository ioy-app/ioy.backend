import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";

/**
 * Удаление роли по ID
 * 
 * @param {number} id ID Роли
 * @returns {Promise<boolean>}
*/
const deleteRole = async (id: number): Promise<boolean> => {
    validate(IdSchema, id);

    const result = await db.query(`
        DELETE FROM "roles"
        WHERE
            id = $1
            AND NOT EXISTS (SELECT 1 FROM "users" WHERE role_id = $1)
        RETURNING 1
    `, [ id ]);

    if (result.rowCount === 0)
        throw new ContentError("deleteRole", "errors.denied");

    const cache_key: string = `role:${id}`;
    await redis.delWithLog(cache_key);
    await redis.delAllWithLog("roles:*");

    return true;
}

export default deleteRole;