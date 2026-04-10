import db from "@/lib/db";
import kafka from "@/lib/kafka";
import minio from "@/lib/minio";
import redis from "@/lib/redis";
import { getGameById, putGameFile } from "@/services/games";
import editGameService from "@/services/games/editGame";
import { getJam } from "@/services/jams";
import { getSubsByInstance } from "@/services/subscribers";
import getUser from "@/services/users/getUser";
import getUserEmail from "@/services/users/getUserEmail";
import getUserLogin from "@/services/users/getUserLogin";
import getUserNotify from "@/services/users/getUserNotify";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import { Response } from "express";

const producer = kafka.producer();

/**
 * Edit game
 * 
 * @param {Request} req 
 * @param {Response} res 
*/
const editGame = async (req: Request, res: Response): Promise<void> => {
    const id = Number(req.params.id);
    const { user_id } = req;
    const game_data = await getGameById(id);

    if (game_data?.jam_id) {
        const jam_id = Number(game_data?.jam_id);
        const jamdata = await getJam(jam_id);

        if (jamdata?.status != "in_process")
            throw new AccessError("editGame", "errors.denied");

        if (jamdata?.judges?.length && jamdata?.judges?.includes(user_id))
            throw new AccessError("createGame", "errors.denied");

        if (jamdata?.creater_id == user_id)
            throw new AccessError("createGame", "errors.denied");

        req.body.status = "public";
    }

    if (game_data.creater_id != user_id)
        throw new AccessError("editGame", "errors.denied");

    if (req?.files?.icon?.[0]) {
        if (req?.files?.icon?.[0]?.size > (1 * 1024 * 1024))
            throw new AccessError("editGame", "errors.icon_limit");
        if (req?.files?.icon?.[0]?.mimetype != "image/png")
            throw new AccessError("editGame", "errors.icon_type");
        
        putGameFile(id, "icon.png", req.files.icon?.[0]?.buffer, req.files.icon?.[0]?.size);
    }

    if (req?.files?.game) {
        const totalsize = req?.files?.game?.reduce((a, b) => a + b.size, 0);
        if (totalsize > (32 * 1024 * 1024))
            throw new AccessError("editGame", "errors.game_limit");

        const files = req?.files?.game;
        if (!files?.filter(file => (file?.originalname?.split("/")?.slice(1)?.join("/")) == "index.html")?.length)
            throw new AccessError("editGame", "errors.indexhtml");

        await removeAllFilesInFolder("games", `${id}/files/`);
        for (const file of files) {
            const path = file?.originalname?.split("/")?.slice(1)?.join("/");
            putGameFile(id, `files/${path}`, file?.buffer, file.size);
        }
    }

    const result = await editGameService(id, req.body);

    if (result.status == "public") {
        const author_login = await getUserLogin(result.creater_id);

        // Notify update game:
        const is_notify = await redis.readWithLog(`notify:add_game:${id}`);
        if (!is_notify) {
            const author_subscribers = await getSubsByInstance(game_data.creater_id, "user");
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
                            key: `add_game:${id}`,
                            value: JSON.stringify({
                                type: "game",
                                subject: `${result.title} is updated!`,
                                email: user_result?.rows?.[0]?.email,
                                props: {
                                    author: author_login,
                                    title: result.title,
                                    description: result.description,
                                    id: result.id,
                                    image_url: `https://ioy.app/g/${id}/icon`
                                }
                            })
                        }
                    ]
                });
            }
            await producer.disconnect();
            redis.writeWithLog(`notify:add_game:${id}`, "1", 1800);
        }
    }
    res.status(200).json(result);
}

async function removeAllFilesInFolder(bucketName, folderPrefix) {

    const objectsList = [];
    try {
        // List all objects recursively under the given prefix
        const stream = minio.listObjects(bucketName, folderPrefix, true);
        
        // Use a promise to handle the stream events and collect object names
        await new Promise((resolve, reject) => {
            stream.on('data', obj => {
                objectsList.push(obj.name);
            });
            stream.on('error', reject);
            stream.on('end', resolve);
        });

        if (objectsList.length > 0) {
            // Remove the collected objects in a batch
            const errors = await minio.removeObjects(bucketName, objectsList);
            

        } else {
        }

    } catch (err) {
        console.error('Error during MinIO operation:', err);
    }
}


export default editGame;