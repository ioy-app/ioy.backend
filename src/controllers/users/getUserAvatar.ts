import getUserAvatarService from "@services/users/getUserAvatar";
import { Request, Response } from "express";

/**
 * Получение пользовательского аватара
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getUserAvatar = (req: Request, res: Response): void => {
    const { login } = req.params;
    const stream = getUserAvatarService(login);

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=300");

    stream.on("error", () => {
        if (!res.headersSent)
            res.status(404).end("errors.exists");
    });

    stream.pipe(res);
}

export default getUserAvatar;