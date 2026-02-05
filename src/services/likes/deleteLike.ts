import db from "@/lib/db";
import es from "@/lib/elasticsearch";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import validate from "@/utils/validate";
import { getGameById } from "../games";
import getLikesByGame from "./getLikesByGame";

/**
 * Удаление лайка по ID
 * 
 * @param {number} user_id ID Пользователя
 * @param {number} id ID Сущности
 * @param {"game" | "comment"} type Тип сущеости
 * @returns {Promise<boolean>}
*/
const deleteLike = async (user_id: number, id: number, type: string = "game"): Promise<boolean> => {
    validate(IdSchema, id);
    validate(IdSchema, user_id);

    const result = await db.query(`
        DELETE FROM "likes"
        WHERE source_id = $1 AND target_id = $2 AND target_type = $3
        RETURNING id
    `, [ user_id, id, type ]);

    if (result.rowCount != 0) {
        redis.delWithLog(`likes_count:${type}:${id}`);
        redis.delWithLog(`likes_check:${type}:${id}`);
        if (type == "game") {
            redis.delAllWithLog(`user_id:${user_id}:likes:*`);
            const game = await getGameById(id);
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
        if (type == "comment")
            redis.delWithLog(`comment:${id}`);
    }

    return true;
}

export default deleteLike;