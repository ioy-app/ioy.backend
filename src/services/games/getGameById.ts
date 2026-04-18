import db from "@/lib/db";
import minio from "@/lib/minio";
import redis from "@/lib/redis";
import Game, { GameSchema } from "@/schemas/game";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";
import { getJam, getJamPlace } from "../jams";

/**
 * Get game info by ID
 * 
 * @param id - Game ID
 * @returns
*/
const getGameById = async (id: number): Promise<Game> => {
    validate(GameSchema.pick({ id: true }), { id }, "getGameById");

    const cache_key = `game:${id}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            validate(GameSchema, parsed, "getGameById");
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
    for (const [ key, value ] of Object.entries(game))
        if (!value)
            delete game[key];

    game.is_avatar = await minio.checkFileExists("games", `${id}/icon.png`);

    if (game?.jam_id) {
        const jam = await getJam(game?.jam_id);
        if (jam?.results) {
            game.jam_result = jam?.results?.[game?.id];
        }
    }

    redis.writeWithLog(cache_key, JSON.stringify(game));

    return game;
}

export default getGameById;