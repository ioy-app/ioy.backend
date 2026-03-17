import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";
import { getGameById } from "../games";
import es from "@/lib/elasticsearch";
import getLikesByGame from "./getLikesByGame";

/**
 * Создание лайка по ID
 * 
 * @param {number} user_id ID Пользователя
 * @param {number} id ID Сущности
 * @param {"game" | "comment"} type Тип сущеости
 * @returns {Promise<boolean>}
*/
const createLike = async (user_id: number, id: number, type: string = "game"): Promise<boolean> => {
    validate(IdSchema, id);
    validate(IdSchema, user_id);

    if (type == "game") {
        const game = await getGameById(id);
        if (game.status != "public")
            return false;

        await es.index({
            index: "games",
            id: String(game.id),
            document: {
                title: game.title,
                description: game.description,
                date_created: game.date_created,
                date_updated: game.date_updated,
                tags: game.tags,
                likes: await getLikesByGame(game.id)
            }
        });
    }

    const result = await db.query(`
        INSERT INTO "likes" (
            source_id,
            target_id,
            target_type
        ) SELECT $1, $2, $3
        WHERE NOT EXISTS (
            SELECT 1 FROM "likes"
            WHERE source_id = $1 AND target_id = $2 AND target_type = $3
        )
        RETURNING id, date_created
    `, [ user_id, id, type ]);

    if (result.rowCount !== 0) {
        redis.delWithLog(`likes_count:${type}:${id}`);
        redis.delWithLog(`likes_check:${type}:${id}:${user_id}`);
        if (type == "game")
            redis.delAllWithLog(`user_id:${user_id}:likes:*`);
        if (type == "comment")
            redis.delWithLog(`comment:${id}`);
    }

    return true;
}

export default createLike;