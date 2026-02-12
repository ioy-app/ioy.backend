import { createCode } from "@/services/codes";
import { getGameById } from "@/services/games";
import getUserLogin from "@/services/users/getUserLogin";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Delete game
 * @param req - Request
 * @param res - Response
*/
const deleteGame = async(req: Request, res: Response): Promise<void> => {
    try {
        const game = await getGameById(Number(req.params.id));
        const code = await createCode(req.user_id, { type: "delete_game", id: game.id });
        console.log(code);
    }
    finally { res.status(200).end(); }
}

export default deleteGame;