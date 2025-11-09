import LoginSchema from "@schemas/login";
import ContentError from "@utils/ContentError";
import validate from "@utils/validate";
import path from "path";
import fs from "fs";

const work_dir: string = path.resolve(process.env.DIR_USERS);

/**
 * Получение пользовательского аватара
 * 
 * @param {string} login Логин 
 * @returns {fs.ReadStream}
*/
const getUserAvatar = (login: string): fs.ReadStream => {
    validate(LoginSchema, login, "getUserAvatar");

    const filename: string = `${login}.png`;
    const filepath: string = path.resolve(work_dir, filename);
    const relative = path.relative(work_dir, filepath);

    try {
        const isExists: boolean = filepath.startsWith(work_dir + path.sep)
            && !relative.startsWith("..") && !path.isAbsolute(relative);
        
        if (!isExists)
            throw new Error();
        fs.accessSync(filepath, fs.constants.R_OK);
        
    }
    catch(err) { throw new ContentError("getUserAvatar", "Файл не найден"); }
    return fs.createReadStream(filepath);
}

export default getUserAvatar;