import redis from "@/lib/redis";
import db from "@/lib/db";
import validate from "@/utils/validate";
import minio from "@/lib/minio";
import { deleteSubs } from "../subscribers";
import { IdSchemaCustom } from "@/schemas/id";
import getJam from "./getJam";

/**
 * Delete jam
 * @param id - Jam ID
 * 
 * @example
 * return deleteJam(1) // true
*/
const deleteJam = async (id: number): Promise<boolean> => {
    validate(IdSchemaCustom("id"), id, "deleteJam");

    const jam = await getJam(id);
    if (!jam)
        return false;

    const result = await db.query(`
        DELETE FROM "jams"
        WHERE id = $1
        RETURNING 1
    `, [ id ]);

    if (result.rowCount === 0)
        return false;

    await redis.delWithLog(`jam:${id}`);
    await redis.delAllWithLog(`jams:user:${jam.creater_id}:*`);
    await redis.delAllWithLog(`jams:*`);

    await deleteSubs(id, "jam");

    try {
        const isExists = await minio.bucketExists("jams");
        if (!isExists)
            await minio.makeBucket("jams");

        await minio.removeObject("jams", `${id}/icon.png`);
    }
    catch(err) {}
    

    return true;
}

export default deleteJam;