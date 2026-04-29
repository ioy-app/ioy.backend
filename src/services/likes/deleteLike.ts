import db from "@/lib/db";
import es from "@/lib/elasticsearch";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import { getGameById } from "../games";
import getLikesByGame from "./getLikesByGame";
import z from "zod";

/**
 * Delete like by ID
 * 
 * @param user_id - User ID
 * @param target_id - Target ID
 * @param target_type - Target Type
 * @returns
*/
const deleteLike = async (
    user_id: number,
    target_id: number,
    target_type: "game" | "comment" | "picture" = "game"
): Promise<boolean> => {
    validate(z.object({
        user_id: IdSchemaCustom("user_id"),
        target_id: IdSchemaCustom("target_id"),
        target_type: z.enum([
            "game",
            "comment",
            "picture"
        ], "errors.invalid.target_type")
        .nonoptional("errors.required.target_type")
    }), {
        user_id,
        target_id,
        target_type
    }, "deleteLike");

    const result = await db.query(`
        DELETE FROM "likes"
        WHERE
            source_id = $1
            AND target_id = $2
            AND target_type = $3
        RETURNING
            id,
            source_id
    `, [
        user_id,
        target_id,
        target_type
    ]);

    await redis.delWithLog(`likes_count:${target_type}:${target_id}`);
    await redis.delWithLog(`likes_check:${target_type}:${target_id}:${user_id}`);

    switch(target_type) {
        case "game": {
            await redis.delAllWithLog(`user_id:${user_id}:likes:*`);
            const gamedata = await getGameById(target_id);
            await es.index({
                index: "games",
                id: String(gamedata?.id),
                document: {
                    title: gamedata?.title,
                    description: gamedata?.description,
                    date_created: gamedata?.date_created,
                    date_updated: gamedata?.date_updated,
                    tags: gamedata?.tags,
                    likes: await getLikesByGame(gamedata?.id)
                }
            });
            if (result?.rows?.length)
                for (const row of result?.rows)
                    await redis.delAllWithLog(`user_id:${row?.source_id}:likes:*`);
        } break;
        case "comment": {
            await redis.delWithLog(`comment:${target_id}`);
        } break;
        case "picture": {
            await redis.delAllWithLog(`user_id:${user_id}:likes:*`);
            if (result?.rows?.length)
                for (const row of result?.rows)
                    await redis.delAllWithLog(`user_id:${row?.source_id}:likes:*`);
        } break;
    }
    
    return true;
}

export default deleteLike;