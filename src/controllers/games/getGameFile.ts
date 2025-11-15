import fs from "fs";
import { Request, Response } from "express";
import getGameFileService from "@/services/games/getGameFile";

/**
 * Получение файлов внутри папки с игрой
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getGameFile = async (req: Request, res: Response): Promise<void> => {
    const { id, file } = req.params;

    try {
        const stream = await getGameFileService(Number(id), file);
        res.setHeader("Content-Type", "application/octet-stream");

        stream.on("error", () => {
            if (!res.headersSent)
                res.status(404).end("errors.exists");
        });

        stream.pipe(res);
    }
    catch(err) { res.status(404).end("errors.exists"); }
}

export default getGameFile;