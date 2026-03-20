import { z } from "zod";
import IdSchema from "@/schemas/id";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";
import path from "path";
import minio from "@/lib/minio";
import Stream from "stream";
import mimo from "mime-types";

/**
 * Get jam file
 * 
 * @param id - Jam ID
 * @param filename - Filename
*/
const getJamFile = async (id: number, filename: string): Promise<Stream.Readable> => {
    validate(IdSchema, id);
    validate(
        z.string({ error: "errors.invalid.filename" })
            .trim()
            .nonoptional({ error: "errors.required.filename" })
    , filename);

    try {
        const isExists = await minio.bucketExists("jams");
        if (!isExists)
            await minio.makeBucket("jams");
        const stat = await minio.statObject("jams", `${id}/${filename}`);
        const stream = await minio.getObject("jams", `${id}/${filename}`);
        return {
            stream,
            size: stat.size,
            contentType: mimo.lookup(filename),
            filename: path.basename(filename)
        };
    }
    catch(err) { throw new ContentError("getJamFile", "errors.exists"); }
}

export default getJamFile;