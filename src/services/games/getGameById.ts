import db from "@/lib/db";
import redis from "@/lib/redis";
import IdSchema from "@/schemas/id";
import Game from "@/types/game";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";

/**
 * Получение информации об игре по ID
 * 
 * @param {number} id ID Игры 
 * @returns {Promise<Game>}
*/
const getGameById = async (id: number): Promise<Game> => {
    validate(IdSchema, id);

    const cache_key = `game:${id}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            return parsed as Game;
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query<Game[]>(`
        SELECT
            id,
            title,
            version,
            description,
            tags,
            status,
            creater_id,
            authors,
            jam_id,
            date_created,
            date_updated
        FROM "games"
        WHERE
            id = $1
    `, [ id ]);

    if (result.rowCount === 0)
        throw new ContentError("getGameById", "errors.exists");

    const game: Game = result.rows[0];
    redis.writeWithLog(cache_key, JSON.stringify(game));

    return game;
}

export default getGameById;