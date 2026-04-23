import db from "@/lib/db";
import kafka from "@/lib/kafka";
import minio from "@/lib/minio";
import redis from "@/lib/redis";
import { getGamesByUser, putGameFile } from "@/services/games";
import createGameService from "@/services/games/createGame";
import { getJam } from "@/services/jams";
import { getSubsByInstance } from "@/services/subscribers";
import getUserLogin from "@/services/users/getUserLogin";
import getUserNotify from "@/services/users/getUserNotify";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import ContentError from "@/utils/ContentError";
import { Response } from "express";

const producer = kafka.producer();

/**
 * Добавление новой игры
 * 
 * @param {Request} req 
 * @param {Response} res 
 */
const createGame = async (req: Request, res: Response): Promise<void> => {
    const { user_id } = req;

    if (req?.body?.jam_id) {
        const jam_id = Number(req?.body?.jam_id);
        const jamdata = await getJam(jam_id);

        if (jamdata?.status != "in_process")
            throw new AccessError("createGame", "errors.denied");

        if (jamdata?.judges?.length && jamdata?.judges?.includes(user_id))
            throw new AccessError("createGame", "errors.denied");

        if (jamdata?.creater_id == user_id)
            throw new AccessError("createGame", "errors.denied");

        req.body.status = "public";
    }

    if (req?.files?.icon?.[0]) {
        if (req?.files?.icon?.[0]?.size > (1 * 1024 * 1024))
            throw new AccessError("editGame", "errors.icon_limit");
        if (req?.files?.icon?.[0]?.mimetype != "image/png")
            throw new AccessError("editGame", "errors.icon_type");
    }

    if (req?.files?.game) {
        const totalsize = req?.files?.game?.reduce((a, b) => a + b.size, 0);
        if (totalsize > (32 * 1024 * 1024))
            throw new AccessError("createGame", "errors.game_limit");
        const files = req?.files?.game;
        if (!files?.filter(file => file?.originalname?.split("/")?.slice(1)?.join("/") == "index.html")?.length)
            throw new AccessError("createGame", "errors.indexhtml");
    }

    const [ games, total_games ] = await getGamesByUser(
        Number(user_id),
        0, 1,
        "draft"
    );

    if ((total_games + 1) > 5)
        throw new ContentError("createGame", "errors.draft_limit");

    const result = await createGameService(Number(user_id), req.body);

    if (req?.files?.icon?.[0])
        putGameFile(result?.id, "icon.png", req.files.icon?.[0]?.buffer, req.files.icon?.[0]?.size);

    if (req?.files?.game) {
        const files = req?.files?.game;
        for (const file of files) {
            const path = file?.originalname?.split("/")?.slice(1)?.join("/");
            putGameFile(result.id, `files/${path}`, file?.buffer, file.size);
        }
    }

    if (result.status == "public") {
        const author_login = await getUserLogin(result.creater_id);

        // Notify new game:
        const is_notify = await redis.readWithLog(`notify:add_game:${result.id}`);
        if (!is_notify) {
            const author_subscribers = await getSubsByInstance(result.creater_id, "user");
            if (author_subscribers) {
                await producer.connect();
                for (const uid of author_subscribers) {
                    const user_login = await getUserLogin(uid);
                    const user_rules = await getUserNotify(user_login);

                    if (!user_rules.new_game)
                        continue;

                    const user_result = await db.query(`
                        SELECT email from "users"
                        WHERE id = $1    
                    `, [ uid ]);

                    if (user_result.rowCount === 0)
                        continue;

                    await producer.send({
                        topic: "notify",
                        messages: [
                            {
                                key: `add_game:${result.id}`,
                                value: JSON.stringify({
                                    type: "game",
                                    subject: `${result.title} is released!`,
                                    email: user_result?.rows?.[0]?.email,
                                    props: {
                                        author: author_login,
                                        title: result.title,
                                        description: result.description,
                                        id: result.id,
                                        image_url: `https://ioy.app/g/${result.id}/icon`
                                    }
                                })
                            }
                        ]
                    });
                }
                await producer.disconnect();
                redis.writeWithLog(`notify:add_game:${result.id}`, "1", 1800);
            }
        }
    }
    res.status(200).json(result);
}

export default createGame;