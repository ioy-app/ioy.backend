import db from "@/lib/db";
import Role from "@/types/role";
import validate from "@/utils/validate";
import ContentError from "@/utils/ContentError";
import redis from "@/lib/redis";
import RoleSchema from "@/schemas/role";

/**
 * Создание новой роли
 * 
 * @param {Role["title"]} title Название роли
 * @param {Role} props Свойства роли 
 * @returns 
*/
const createRole = async (title: Role["title"], props: Role): Promise<Role> => {
    validate(RoleSchema, props);

    const result = await db.query(`
        INSERT INTO "users" (
            title,
            is_warning_comments,
            is_warning_games,
            is_warning_jams,
            is_warning_users,
            is_delete_comments,
            is_delete_games,
            is_delete_jams,
            is_delete_users,
            is_ban
        )
        SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        WHERE NOT EXISTS (
            SELECT 1 FROM "roles"
            WHERE title = $1
        )
        RETURNING id, date_created
    `, [
        title,
        props.is_warning_comments,
        props.is_warning_games,
        props.is_warning_jams,
        props.is_warning_users,
        props.is_delete_comments,
        props.is_delete_games,
        props.is_delete_jams,
        props.is_delete_users,
        props.is_ban
    ]);

    if (result.rowCount === 0)
        throw new ContentError("createRole", "errors.exists");

    const { id, date_created } = result.rows[0];
    const obj = {
        id,
        title,
        ...props,
        date_created
    } as Role;

    const cache_key: string = `role:${id}`;
    redis.writeWithLog(cache_key, JSON.stringify(obj));

    return obj;
}

export default createRole;