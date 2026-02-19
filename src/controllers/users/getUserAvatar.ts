import getUserAvatarService from "@services/users/getUserAvatar";
import { Request, Response } from "express";

/**
 * Получение пользовательского аватара
 * 
 * @param req - Запрос 
 * @param res - Ответ 
*/
const getUserAvatar = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;

    try {
        const fileStream = await getUserAvatarService(login);

        //res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=300");
        
        fileStream.on("error", () => {
            if (!res.headersSent)
                res.status(404).end("errors.exists");
        });

        fileStream.pipe(res);
    }
    catch(err) { res.status(404).end("errors.exists"); }
}

export default getUserAvatar;