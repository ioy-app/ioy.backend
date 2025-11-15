import fs from "fs";
import getGameFile from "@/services/games/getGameFile";
import { Request, Response } from "express";

/**
 * Получение файла игры
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getGamePlay = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    try {
        const stream = await getGameFile(Number(id), "index.html");
        res.setHeader("Content-Type", "text/html");

        stream.on("error", () => {
            if (!res.headersSent)
                res.status(404).end("errors.exists");
        });

        stream.pipe(res);
    }
    catch(err) { res.status(404).end('errors.exists'); }
}

export default getGamePlay;