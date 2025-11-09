import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import RoleSchema from "@/schemas/role";
import Role from "@/types/role";
import validate from "@/utils/validate";

/**
 * Обновление данных о роли
 * 
 * @param {number} id ID Роли 
 * @param {Role} props Новые данные роли
 * @returns {Promise<boolean>}
*/
const putRole = async (id: number, props: Role): Promise<boolean> => {
    validate(IdSchema, id);
    validate(RoleSchema, props);

    await db.query(`
        UPDATE "roles"
        SET
            title = $2,
            is_warning_users = $3,
            is_warning_jams = $4,
            is_warning_games = $5,
            is_warning_comments = $6,
            is_delete_users = $7,
            is_delete_jams = $8,
            is_delete_games = $9,
            is_delete_comments = $10,
            is_ban = $11
        WHERE id = $1
    `, [
        id,
        props.title,
        props.is_warning_users,
        props.is_warning_jams,
        props.is_warning_games,
        props.is_warning_comments,
        props.is_delete_users,
        props.is_delete_jams,
        props.is_delete_games,
        props.is_delete_comments,
        props.is_ban
    ]);

    await redis.delWithLog(`role:${id}`);
    await redis.delAllWithLog("roles:*");
    return true;
}

export default putRole;