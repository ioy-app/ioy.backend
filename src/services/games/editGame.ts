import db from "@/lib/db";
import es from "@/lib/elasticsearch";
import redis from "@/lib/redis";
import Game, { GameSchema } from "@/schemas/game";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";

/**
 * Edit game
 * 
 * @param id - Game ID
 * @param props - Game properties
 * @returns
*/
const editGame = async (id: number, props: Game): Promise<Game> => {
    validate(GameSchema.omit({
        id: true,
        creater_id: true
    }), props, "editGame");
    validate(GameSchema.pick({ id: true }), { id }, "editGame");

    const keys = Object.keys(props).filter(prop => [
        "title",
        "version",
        "description",
        "tags",
        "status",
        "creater_id",
        "authors",
        "jam_id"
    ].includes(prop));
    const values = keys.map(key => props[key]);

    const result = await db.query<Game[]>(`
        UPDATE "games"
        SET
            ${keys?.map((key: string, i: number) => `${key}=$${i + 2}`)?.join(",")},
            date_updated=NOW()
        WHERE id=$1
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
            date_updated
    `, [ id, ...values ]);

    if (result.rowCount === 0)
        return null;

    const game: Game = result.rows[0];
    for (const [ key, value ] of Object.entries(game))
        if (!value)
            delete game[key];

    redis.writeWithLog(`game:${id}`, JSON.stringify(game));
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
    } else {
        await es.delete({
            index: "games",
            id: String(game.id)
        })
    }

    return game;
}

export default editGame;