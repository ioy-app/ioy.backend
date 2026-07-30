import LoginSchema from "@schemas/login";
import ContentError from "@utils/ContentError";
import validate from "@utils/validate";
import minio from "@lib/minio";
import Stream from "stream";
import redis from "@/lib/redis";

/**
 * Получение пользовательского аватара
 * 
 * @param login - Логин 
 * @returns
*/
const getUserAvatar = async (login: string): Promise<Stream.Readable> => {
    validate(LoginSchema, login);

    try {
        const isExists = await minio.bucketExists("users");
        if (!isExists)
            await minio.makeBucket("users");

        const file = await minio.getObject("users", `${login}.png`);
        return file;
    }
    catch(err) { throw new ContentError("getUserAvatar", "errors.exists"); }
}

export default getUserAvatar;