import minio from "@/lib/minio";
import { getGameById, putGameFile } from "@/services/games";
import editGameService from "@/services/games/editGame";
import Request from "@/types/request";
import AccessError from "@/utils/AccessError";
import { Response } from "express";

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