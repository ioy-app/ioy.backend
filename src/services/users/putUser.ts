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
    /** Login */
    login: string;
    /** Description */
    description: string;
    /** Privacy */
    privacy: {
        /** Likes */
        likes: boolean;
        /** Favorites */
        favorites: boolean;
        /** Followers */
        subscribers: boolean;
        /** Games */
        games: boolean;
    },
    notify: {
        new_game?: boolean;
        new_jam?: boolean;
        jam_started?: boolean;
        jam_ended?: boolean;
        jam_finish?: boolean;
    }
}

/**
 * Edit user data
 * 
 * @param login - Login
 * @param params - New data
 * @param file - avatar file
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
        }).optional(),
        notify: z.object({
            new_game: z.boolean("errors.invalid.notify.new_game")
                .optional(),
            new_jam: z.boolean("errors.invalid.notify.new_jam")
                .optional(),
            jam_started: z.boolean("errors.invalid.notify.jam_started")
                .optional(),
            jam_ended: z.boolean("errors.invalid.notify.jam_ended")
                .optional(),
            jam_finish: z.boolean("errors.invalid.notify.jam_finish")
                .optional()
        }).optional()
    }), params, "putUser");

    const id = await getUserId(login);
    const result = await db.query(`
        UPDATE "users"
        SET
            login=$2,
            description=$3,
            privacy=$4,
            notify=$5
        WHERE id=$1
        RETURNING login, description, privacy, notify
    `, [ id, params.login, params.description, params.privacy, params.notify ]);
    
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
    catch(err) {
        console.log(err);
        throw new ContentError("putUser", "errors.exists");
    }
    
    await redis.delWithLog(`user:${login}`);
    await redis.delAllWithLog(`user_id:${id}:*`);
    await redis.delWithLog(`user_id:${id}:notify`);

    return data_updated;
}

export default putUser;