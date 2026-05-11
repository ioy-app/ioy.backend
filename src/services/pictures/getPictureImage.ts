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
 * Get picture's files
 * 
 * @param id - Picture ID
 * @param filename - Filename
 * @returns
*/
const getPictureImage = async (
  id: number,
  filename: string
): Promise<Stream.Readable> => {
    validate(IdSchema, id);
    validate(
        z.string({ error: "errors.invalid.filename" })
            .trim()
            .nonoptional({ error: "errors.required.filename" })
    , filename);

    try {
        const isExists = await minio.bucketExists("pictures");
        if (!isExists)
            await minio.makeBucket("games");
        const stat = await minio.statObject("pictures", `${id}/${filename}`);
        const stream = await minio.getObject("pictures", `${id}/${filename}`);
        return {
            stream,
            size: stat.size,
            contentType: mimo.lookup(filename),
            filename: path.basename(filename)
        };
    }
    catch(err) { throw new ContentError("getPictureImage", "errors.exists"); }
}

export default getPictureImage;