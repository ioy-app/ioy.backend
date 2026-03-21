import minio from "@/lib/minio";
import { getGamesByUser, putGameFile } from "@/services/games";
import createGameService from "@/services/games/createGame";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import ContentError from "@/utils/ContentError";
import { Response } from "express";

/**
 * Добавление новой игры
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
const createGame = async (req: Request, res: Response): Promise<void> => {
    const { user_id } = req;
    if (req?.files?.game) {
        const totalsize = req?.files?.game?.reduce((a, b) => a + b.size, 0);
        if (totalsize > (32 * 1024 * 1024))
            throw new AccessError("createGame", "errors.game_limit");
        const files = req?.files?.game;
        if (!files?.filter(file => file?.originalname?.split("/")?.slice(1)?.join("/") == "index.html")?.length)
            throw new AccessError("createGame", "errors.indexhtml");
    }

    const [ games, total_games ] = await getGamesByUser(
        Number(user_id),
        0, 1,
        "draft"
    );

    if ((total_games + 1) > 5)
        throw new ContentError("createGame", "errors.draft_limit");

    const result = await createGameService(Number(user_id), req.body);

    if (req?.files?.icon?.[0]) {
        putGameFile(result.id, "icon.png", req.files.icon?.[0].buffer);
    }

    if (req?.files?.game) {
        const files = req?.files?.game;
        for (const file of files) {
            const path = file?.originalname?.split("/")?.slice(1)?.join("/");
            putGameFile(result.id, `files/${path}`, file?.buffer, file.size);
        }
    }

    res.status(200).json(result);
}

export default createGame;