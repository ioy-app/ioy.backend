import db from "@/lib/db";
import es from "@/lib/elasticsearch";
import redis from "@/lib/redis";
import Game, { GameSchema } from "@/schemas/game";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";

/**
 * Add new game
 * 
 * @param user_id - Author ID
 * @param props - Game properties
 * @returns
*/
const createGame = async (user_id: number, props: Game): Promise<Game> => {
    validate(GameSchema.omit({
        id: true,
        creater_id: true
    }), props, "createGame");
    validate(GameSchema.pick({ creater_id: true }), { creater_id: user_id }, "createGame");

    const {
        title,
        version,
        description,
        tags,
        authors,
        status
    } = props;

    const result = await db.query(`
        INSERT INTO "games" (
            creater_id,
            title,
            version,
            description,
            tags,
            authors,
            status
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
        )
        RETURNING id, date_created
    `, [
        user_id,
        title,
        version,
        description,
        tags,
        authors,
        status
    ]);

    if (result.rowCount === 0)
        throw new ContentError("createGame", "errors.denied");

    const id: number = result.rows?.[0]?.id;
    const date_created: string = result.rows?.[0]?.date_created;
    const cache_key = `game:${id}`;

    const game: Game = {
        id,
        title,
        version,
        description,
        tags,
        authors,
        status,
        creater_id: user_id,
        date_created
    }
    redis.writeWithLog(cache_key, JSON.stringify(game));
    await redis.delAllWithLog(`user_id:*`);
    await redis.delAllWithLog(`games:user:${user_id}:*`);
    
    try {
        if (game.status == "public") {
            await es.index({
                index: "games",
                id: String(game.id),
                document: {
                    title: game.title,
                    description: game.description,
                    date_created: game.date_created,
                    date_updated: game.date_updated,
                    tags: game.tags
                }
            });
        }
    }
    catch(err) {}

    return game;
}

export default createGame;