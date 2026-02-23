import db from "@/lib/db";
import minio from "@/lib/minio";
import redis from "@/lib/redis";

/**
 * Delete all user data
 * @example
 * return deleteUser()
*/
const deleteUser = async (user_id: number): Promise<boolean> => {
    const result = await db.query(`
        DELETE FROM "users"
        WHERE id = $1
        RETURNING login
    `, [ user_id ]);

    if (result.rowCount === 0)
        return true;

    await redis.delWithLog(`user:${result.rows[0].login}`);
    await redis.delAllWithLog(`user_id:${user_id}:*`);

    try {
        const isExists = await minio.bucketExists("users");
        if (!isExists)
            await minio.makeBucket("users");

        await minio.removeObject("games", `${result.rows[0].login}.png`);x
    }
    catch(err) {}

    return true;
}

export default deleteUser;