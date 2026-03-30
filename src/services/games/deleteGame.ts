import es from "@/lib/elasticsearch";
import getGameById from "./getGameById";
import redis from "@/lib/redis";
import db from "@/lib/db";
import validate from "@/utils/validate";
import { GameSchema } from "@/schemas/game";
import minio from "@/lib/minio";
import ContentError from "@/utils/ContentError";
import { deleteLikes } from "../likes";
import { deleteSubs } from "../subscribers";
import { deleteComments } from "../comments";

/**
 * Delete game
 * @param id - Game ID
 * 
 * @example
 * return deleteGame(1) // true
*/
const deleteGame = async (id: number): Promise<boolean> => {
    validate(GameSchema.pick({ id: true }), { id }, "deleteGame");

    const game = await getGameById(id);
    if (!game)
        return false;

    const result = await db.query(`
        DELETE FROM "games"
        WHERE id = $1
        RETURNING 1
    `, [ id ]);

    if (result.rowCount === 0)
        return false;

    await redis.delWithLog(`game:${id}`);
    await redis.delAllWithLog(`user_id:*`);
    await redis.delAllWithLog(`games:user:${game.creater_id}:*`);
    if (game?.jam_id)
        await redis.delAllWithLog(`jams:games:${game?.jam_id}:*`);

    await deleteLikes(id, "game");
    await deleteSubs(id, "game");
    await deleteComments(id, "game");

    try {
        const isExists = await minio.bucketExists("games");
        if (!isExists)
            await minio.makeBucket("games");

        await minio.removeObject("games", `${id}/icon.png`);
        await minio.removeObject("games", `${id}/index.html`);
        await es.delete({
            index: "games",
            id: String(game.id)
        });
    }
    catch(err) {}
    

    return true;
}

export default deleteGame;