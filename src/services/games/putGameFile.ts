import { z } from "zod";
import IdSchema from "@/schemas/id";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";
import fs from "fs";
import path from "path";
import minio from "@/lib/minio";
import Stream, { Readable } from "stream";
import redis from "@/lib/redis";
import mime from "mime-types";

/**
 * Сохранение/изменение файла из папки игры по ID
 * 
 * @param {number} id ID Игры 
 * @param {string} filename Имя файла
 * @param {Buffer} buffer Содержание файла
 * @returns {Promise<Stream.Readable>}
*/
const putGameFile = async (id: number, filename: string, buffer: Buffer, size: number): Promise<boolean> => {
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
        if (!size)
            return true;
        const file = await minio.putObject("games", `${id}/${filename}`, Readable.from(buffer));
        await redis.delWithLog(`game:${id}`);
        return true;
    }
    catch(err) {
        console.log(err);
        throw new ContentError("putGameFile", "errors.exists");
    }

    return false;
}

export default putGameFile;