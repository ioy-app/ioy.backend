import { z } from "zod";
import IdSchema from "@/schemas/id";
import ContentError from "@/utils/ContentError";
import validate from "@/utils/validate";
import fs from "fs";
import path from "path";

/**
 * Получение файла из папки игры по ID
 * 
 * @param {number} id ID Игры 
 * @param {string} filename Имя файла
 * @returns {fs.ReadStream}
*/
const getGameFile = (id: number, filename: string): fs.ReadStream => {
    validate(IdSchema, id);
    validate(
        z.string({ error: "errors.invalid.filename" })
            .trim()
            .nonoptional({ error: "errors.required.filename" })
    , filename);

    const work_dir: string = path.resolve(process.env.DIR_GAMES, String(id));
    const filepath: string = path.resolve(work_dir, filename);
    const relative = path.relative(work_dir, filepath);
    const isExists: boolean = filepath.startsWith(work_dir + path.sep)
        && !relative.startsWith("..") && !path.isAbsolute(relative);

    if (!isExists)
        throw new ContentError("getGameFile", "errors.exists");

    return fs.createReadStream(filepath);
}

export default getGameFile;