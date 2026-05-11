import db from "@/lib/db";
import es from "@/lib/elasticsearch";
import redis from "@/lib/redis";
import Game, { GameSchema } from "@/schemas/game";
import AccessError from "@/utils/AccessError";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";
import { getJam } from "../jams";

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
        creater_id: true,
        jam_id: true
    }), props, "createGame");
    validate(GameSchema.pick({ creater_id: true }), { creater_id: user_id }, "createGame");

    if (props?.jam_id) {
        const jamdata = await getJam(Number(props?.jam_id));
        if (!["in_process"].includes(jamdata?.status))
            throw new AccessError("createGame", "errors.jams_denied");
    }

    const keys = Object.keys(props).filter(prop => [
        "title",
        "version",
        "description",
        "tags",
        "status",
        "creater_id",
        "jam_id",
        "is_background"
    ].includes(prop));
    const values = keys.map(key => props[key]);

    if (props?.authors?.length) {
        keys.push("authors");
        values.push(props?.authors || []);
    }

    keys.push("creater_id");
    values.push(user_id);

    const result = await db.query<Game[]>(`
        INSERT INTO "games" (
            ${keys?.join(",")}
        )
        VALUES (
            ${keys?.map((_, i: number) => `$${i + 1}`)?.join(",")}
        )
        RETURNING 
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
            date_updated,
            is_background
    `, [ ...values ]);

    if (result.rowCount === 0)
        throw new ContentError("createGame", "errors.denied");

    const game: Game = result?.rows?.[0];
    const cache_key = `game:${game?.id}`;

    
    redis.writeWithLog(cache_key, JSON.stringify(game));
    await redis.delAllWithLog(`user_id:*`);
    await redis.delAllWithLog(`games:user:${user_id}:*`);
    await redis.delAllWithLog(`feed:global:*`);
    if (props?.jam_id)
        await redis.delAllWithLog(`jams:games:${props?.jam_id}:*`);
    
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
                    tags: game.tags,
                    likes: 0,
                    comments: 0
                }
            });
        }
    }
    catch(err) {}

    return game;
}

export default createGame;