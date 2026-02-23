import { deleteCommentsByUser } from "@/services/comments";
import { deleteGame, getGameById, getGamesByUser } from "@/services/games";
import { deleteLikes } from "@/services/likes";
import { deleteSubs, getUserSubs, putSubscribe } from "@/services/subscribers";
import getUserGames from "@/services/users/getUserGames";
import getUserLogin from "@/services/users/getUserLogin";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import { Response } from "express";
import deleteUserService from "@/services/users/deleteUser";

/**
 * Delete user
 * 
 * @param {any} payload - Payload data
 * @param {Request} req - Request 
 * @param {Response} res - Response
*/
const CodeDeleteUser = async (payload: any, req: Request, res: Response): Promise<void> => {
    const { id } = payload;
    if (id != req.user_id)
        throw new AccessError("CodeDeleteGame", "errors.denied");

    await deleteSubs(id, "user");
    await deleteCommentsByUser(id);
    let games = await getGamesByUser(id, 0, 1);
    for (let i = 0; i < games[1]; i++) {
        const data = await getGamesByUser(id, 0, 1);
        if (!data)
            continue;

        const game_id = data[0][0];
        const game = await getGameById(game_id);
        if (game.creater_id != id)
            continue;

        await deleteGame(game.id);
    }

    const favorite_games = await getUserSubs(id, "game", 0, 1);
    for (let i = 0; i < favorite_games[1]; i++) {
        const data = await getUserSubs(id, "game", 0, 1);
        if (!data)
            continue;

        const game_id = data[0][0];
        await putSubscribe(id, game_id, "game");
    }

    const favorite_users = await getUserSubs(id, "user", 0, 1);
    for (let i = 0; i < favorite_users[1]; i++) {
        const data = await getUserSubs(id, "user", 0, 1);
        if (!data)
            continue;

        const user_id = data[0][0];
        await putSubscribe(id, user_id, "user");
    }

    const favorite_jams = await getUserSubs(id, "jam", 0, 1);
    for (let i = 0; i < favorite_jams[1]; i++) {
        const data = await getUserSubs(id, "jam", 0, 1);
        if (!data)
            continue;

        const jam_id = data[0][0];
        await putSubscribe(id, jam_id, "jam");
    }

    await deleteUserService(id);

    res.status(200).json({
        status: "ok"
    })
}

export default CodeDeleteUser;