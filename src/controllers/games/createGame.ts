import minio from "@/lib/minio";
import { putGameFile } from "@/services/games";
import createGameService from "@/services/games/createGame";
import Request from "@/types/request";
import { Response } from "express";

/**
 * Добавление новой игры
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
const createGame = async (req: Request, res: Response): Promise<void> => {
    const { user_id } = req;

    const result = await createGameService(Number(user_id), req.body);

    if (req?.files?.icon?.[0]) {
        console.log(req.files.icon)
        putGameFile(result.id, "icon.png", req.files.icon?.[0].buffer);
    }

    if (req?.files?.game?.[0]) {
        console.log(req.files.game);
        putGameFile(result.id, "index.html", req.files.game?.[0].buffer);
    }

    res.status(200).json(result);
}

export default createGame;