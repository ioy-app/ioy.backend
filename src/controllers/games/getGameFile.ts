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
        const customfile = file == "index" ? "index.html" : file;

        const {
            stream,
            size,
            contentType,
            filename
        } = await getGameFileService(Number(id), `files/${customfile}`);
        
        console.log(contentType);
        //res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Content-Type", file == "index" ? "text/html; charset=utf-8" : contentType);
        
        // Ключевой заголовок для скачивания с именем
        if (file != "index") {
            res.setHeader(
                "Content-Disposition",
                `inline; filename*=UTF-8''${encodeURIComponent(filename)}`
            );

            // Размер для прогресс-бара
            res.setHeader("Content-Length", size);
        }
        stream.on("error", () => {
            if (!res.headersSent)
                res.status(404).end("errors.exists");
        });

        stream.pipe(res);
    }
    catch(err) { res.status(404).end("errors.exists"); }
}

export default getGameFile;