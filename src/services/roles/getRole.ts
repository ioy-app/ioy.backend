import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import RoleSchema from "@/schemas/role";
import Role from "@/types/role";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";

/**
 * Получение данных о роли по ID
 * 
 * @param {number} id ID Роли 
 * @returns {Promise<Role>}
*/
const getRole = async (id: number): Promise<Role> => {
    validate(IdSchema, id);

    const cache_key = `role:${id}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            validate(RoleSchema, parsed, "getRole");
            return parsed as Role;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query<Role>(`
        SELECT *
        FROM "roles"
        WHERE id = $1
    `, [ id ]);

    if (result.rowCount === 0)
        throw new ContentError("getRole", "errors.exists");

    const role: Role = result.rows[0];
    redis.writeWithLog(cache_key, JSON.stringify(role));

    return role;
}

export default getRole;