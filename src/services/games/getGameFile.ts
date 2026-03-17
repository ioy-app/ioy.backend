import { z } from "zod";
import IdSchema from "@/schemas/id";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";
import fs from "fs";
import path from "path";
import minio from "@/lib/minio";
import Stream from "stream";
import mimo from "mime-types";

/**
 * Получение файла из папки игры по ID
 * 
 * @param {number} id ID Игры 
 * @param {string} filename Имя файла
 * @returns {Promise<Stream.Readable>}
*/
const getGameFile = async (id: number, filename: string): Promise<Stream.Readable> => {
    validate(IdSchema, id);
    validate(
        z.string({ error: "errors.invalid.filename" })
            .trim()
            .nonoptional({ error: "errors.required.filename" })
    , filename);

    try {
        const isExists = await minio.bucketExists("games");
        if (!isExists)
            await minio.makeBucket("games");
        const stat = await minio.statObject("games", `${id}/${filename}`);
        const stream = await minio.getObject("games", `${id}/${filename}`);
        return {
            stream,
            size: stat.size,
            contentType: mimo.lookup(filename),
            filename: path.basename(filename)
        };
    }
    catch(err) { throw new ContentError("getGameFile", "errors.exists"); }
}

export default getGameFile;