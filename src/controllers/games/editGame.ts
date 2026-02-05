import { getGameById, putGameFile } from "@/services/games";
import editGameService from "@/services/games/editGame";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import { Response } from "express";

/**
 * Edit game
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const editGame = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { user_id } = req;
    const game_data = await getGameById(id);

    if (game_data.creater_id != user_id)
        throw new AccessError("editGame", "errors.denied");

    const result = await editGameService(id, req.body);

    if (req?.files?.icon?.[0]) {
        putGameFile(result.id, "icon.png", req.files.icon?.[0].buffer);
    }

    if (req?.files?.game?.[0]) {
        putGameFile(result.id, "index.html", req.files.game?.[0].buffer);
    }

    res.status(200).json(result);
}

export default editGame;