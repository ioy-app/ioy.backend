import fs from "fs";
import { Request, Response } from "express";
import getGameFile from "@/services/games/getGameFile";

/**
 * Получение иконки игры
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getGameIcon = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    try {
        const stream = await getGameFile(Number(id), "icon.png");
        res.setHeader("Content-Type", "application/octet-stream");
        
        stream.on("error", () => {
            if (!res.headersSent)
                res.status(404).end("errors.exists");
        });

        stream.pipe(res);
    }
    catch(err) { res.status(404).end("errors.exists"); }
}

export default getGameIcon;