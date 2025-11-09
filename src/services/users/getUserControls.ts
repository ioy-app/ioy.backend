import IdSchema from "@schemas/id";
import UserControlsSchema from "@schemas/userControls";
import { UserController } from "@/types/user";
import validate from "@utils/validate";
import db from "@lib/db";
import redisClient from "@lib/redis";

/**
 * Пользовательские кнопки упарвления:
 * Подписаться, редактировать и т.д.
 * 
 * @param {number} source_id Источник 
 * @param {number} target_id Цель
 * @returns {Promise<UserController>}
*/
const getUserControls = async (source_id: number, target_id: number): Promise<UserController> => {
    validate(IdSchema, source_id, "getUserControls");
    validate(IdSchema, target_id, "getUserControls");
    
    const cache_key: string = `source_id:${source_id}:target_id:${target_id}:check`;
    const cached: string = await redisClient.readWithLog(cache_key);

    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            validate(UserControlsSchema, parsed, "getUserController");
            return parsed as UserController;
        }
        catch(err) { await redisClient.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT 1
        FROM "subscribers"
        WHERE
            source_id = $1
            AND target_id = $2
            AND target_type = 'user'
    `, [ source_id, target_id ]);

    const controls: UserController = {
        is_subscribe: Boolean(result.rowCount !== 0),
        is_me: Boolean(target_id == source_id)
    }
    redisClient.writeWithLog(cache_key, JSON.stringify(controls));

    return controls;
}

export default getUserControls;