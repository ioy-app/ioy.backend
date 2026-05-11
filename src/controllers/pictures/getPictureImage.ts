import fs from "fs";
import { Request, Response } from "express";
import getGameFile from "@/services/games/getGameFile";
import { getPictureImage as getPictureImageService } from "@/services/pictures";

/**
 * Get picture image
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const getPictureImage = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    try {
        const { stream } = await getPictureImageService(Number(id), "image.png");
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

export default getPictureImage;