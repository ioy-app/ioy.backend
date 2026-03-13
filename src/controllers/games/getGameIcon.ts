import fs from "fs";
import { Request, Response } from "express";
import getGameFile from "@/services/games/getGameFile";

/**
 * Get game icon
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getGameIcon = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    try {
        const { stream } = await getGameFile(Number(id), "icon.png");
        //res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=300");
        
        stream.on("error", () => {
            if (!res.headersSent)
                res.status(404).end("errors.exists");
        });

        stream.pipe(res);
    }
    catch(err) { res.status(404).end("errors.exists"); }
}

export default getGameIcon;