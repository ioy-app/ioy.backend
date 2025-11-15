import getUserAvatarService from "@services/users/getUserAvatar";
import { Request, Response } from "express";

/**
 * Получение пользовательского аватара
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getUserAvatar = async (req: Request, res: Response): Promise<void> => {
    const { login } = req.params;

    try {
        const fileStream = await getUserAvatarService(login);

        res.setHeader("Content-Type", "application/octet-stream");
        fileStream.on("error", () => {
            if (!res.headersSent)
                res.status(404).end("errors.exists");
        });

        fileStream.pipe(res);
    }
    catch(err) { res.status(404).end("errors.exists"); }
}

export default getUserAvatar;