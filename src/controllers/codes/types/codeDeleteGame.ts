import { deleteGame, getGameById } from "@/services/games";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import ContentError from "@/utils/ContentError";
import { Response } from "express";

/**
 * Delete game
 * 
 * @param payload - Code data
 * @param req - Request 
 * @param res - Response 
*/
const CodeDeleteGame = async (
    payload: {
        id: number;
    },
    req: Request,
    res: Response
): Promise<void> => {
    const game = await getGameById(Number(payload.id));
    if (game.creater_id != req.user_id)
        throw new AccessError("CodeDeleteGame", "errors.denied");

    const isDeleted = await deleteGame(game.id);
    if (isDeleted) {
        res.status(200).json({
            deleted: true,
            id: game.id
        });
        return;
    }

    throw new ContentError("CodeDeleteGame", "errors.exists");
}

export default CodeDeleteGame;