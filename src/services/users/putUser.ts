import db from "@/lib/db";
import LoginSchema from "@/schemas/login";
import validate from "@/utils/validate";
import z from "zod";
import getUserId from "./getUserId";
import ContentError from "@/utils/ContentError";
import redis from "@/lib/redis";
import minio from "@/lib/minio";
import { Readable } from "stream";

type Params = {
    /** Логин */
    login: string;
    /** Описание */
    description: string;
    /** Настройки приватности */
    privacy: {
        /** Понравилось */
        likes: boolean;
        /** Избранное */
        favorites: boolean;
        /** Подписки */
        subscribers: boolean;
        /** Игры */
        games: boolean;
    }
}

/**
 * Редактирование данных пользователя
 * 
 * @param login - Логин
 * @param params - Редактируемые данные
 * @param file - Аватар
 * @returns 
*/
const putUser = async (login: string, params: Params, file?: Buffer): Promise<Params> => {
    validate(LoginSchema, login, "putUser");
    validate(z.object({
        login: LoginSchema,
        description: z.string({ error: "errors.invalid.descriptions" })
            .optional(),
        privacy: z.object({
            likes: z.boolean({ error: "errors.invalid.privacy.likes" })
                .optional(),
            favorites: z.boolean({ error: "errors.invalid.privacy.favorites" })
                .optional(),
            subscribers: z.boolean({ error: "errors.invalid.privacy.subscribers" })
                .optional(),
            games: z.boolean({ error: "errors.invalid.privacy.games" })
                .optional()
        }).optional()
    }), params, "putUser");

    const id = await getUserId(login);
    const result = await db.query(`
        UPDATE "users"
        SET
            login=$2,
            description=$3,
            privacy=$4
        WHERE id=$1
        RETURNING login, description, privacy
    `, [ id, params.login, params.description, params.privacy ]);
    
    if (result.rowCount === 0)
        throw new ContentError("putUser", "errors.denied");

    const data_updated: Params = result?.rows?.[0];

    // Перемещение аватара:
    try {
        const isExists = await minio.bucketExists("users");
        if (!isExists)
            await minio.makeBucket("users");

        console.log(file);

        if (file)
            await minio.putObject("users", `${login}.png`, Readable.from(file));

        const isFile = await minio.checkFileExists("users", `${login}.png`);
        console.log(isFile);
        if (isFile && data_updated.login != login) {
            await minio.copyObject("users", `${data_updated.login}.png`, `users/${login}.png`);
            await minio.removeObject("users", `${login}.png`);
        }
    }
    catch(err) { throw new ContentError("putUser", "errors.exists"); }
    
    await redis.delWithLog(`user:${login}`);
    await redis.delAllWithLog(`user_id:${id}:*`);

    return data_updated;
}

export default putUser;