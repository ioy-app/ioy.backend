import { z } from "zod";
import db from "@lib/db";
import IdSchema from "@schemas/id";
import Game from "@/types/game";
import validate from "@utils/validate";
import getGameById from "@services/games/getGameById";
import redis from "@/lib/redis";

const getUserGames = async (id: number, offset: number, limit: number): Promise<[Game[], number]> => {
    validate(IdSchema, id);

    validate(z.number({
        error: "errors.invalid.offset"
    }).nonnegative({
        error: "errors.invalid.offset"
    }).int({
        error: "errors.invalid.offset"
    }), offset);

    validate(z.number({
        error: "errors.invalid.limit"
    }).nonnegative({
        error: "errors.invalid.limit"
    }).int({
        error: "errors.invalid.limit"
    }), limit);

    const cache_key = `user_id:${id}:games:${offset}:${limit}`;
    let cached = await redis.readWithLog(cache_key);
    if (cached) {
        try {
            const parsed = JSON.parse(cached as string);
            return [ parsed as Game[], parsed?.[0]?.total as number ];
        }
        catch(err) { await redis.delWithLog(cache_key); }
    }

    const result = await db.query(`
        SELECT
            id,
            COUNT(*) OVER()::INTEGER as total
        FROM "games"
        WHERE creater_id = $1
        ORDER BY date_created DESC
        OFFSET $2 LIMIT $3
    `, [ id, offset, limit ]);

    const data: Game[] = [];
    const total: number = result?.rows?.[0]?.total || 0;

    for (const row of result.rows) {
        const content = await getGameById(row?.id)
        data.push({
            ...row,
            ...content
        });
    }

    redis.writeWithLog(cache_key, JSON.stringify(data));
    return [ data, total ];
}

export default getUserGames;