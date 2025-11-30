import db from "@/lib/db";
import es from "@/lib/elasticsearch";
import redis from "@/lib/redis";
import Game from "@/types/game";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Добавление новой игры (без файлов и аватарки)
 * 
 * @param {number} user_id ID Пользователя 
 * @param {Game} props Свойства игры 
 * @returns 
*/
const createGame = async (user_id: number, props: Game): Promise<Game> => {
    validate(
        z.number({ error: "errors.invalid.user_id" })
            .nonnegative({ error: "errors.invalid.user_id" })
            .int({ error: "errors.invalid.user_id" })
            .nonoptional({ error: "errors.required.user_id" }),
        user_id,
        "createGame"
    );
    validate(z.object({
        title: z.string({ error: "errors.invalid.title" })
            .trim()
            .nonempty({ error: "errors.empty.title" })
            .nonoptional({ error: "errors.required.title" }),
        version: z.string({ error: "errors.invalid.version" })
            .optional(),
        description: z.string({ error: "errors.invalid.description" })
            .max(255, { error: "errors.max.description" })
            .optional(),
        tags: z.array(z.string({ error: "errors.invalid.tags" }))
            .optional(),
        authors: z.array(z.number({ error: "errors.invalid.authors" }))
            .optional(),
        status: z.string({ error: "errors.invalid.status" })
            .trim()
            .nonempty({ error: "errors.empty.status" })
            .nonoptional({ error: "errors.required.status" })
    }), props, "createGame");

    const { title, version, description, tags, authors, status } = props;
    
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

    return game;
}

export default createGame;