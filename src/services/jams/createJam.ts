import db from "@/lib/db";
import redis from "@/lib/redis";
import Jam, { JamSchema } from "@/schemas/jam";
import validate from "@/utils/validate";

/**
 * Create new Jam
 * @example
 * return createJam()
*/
const createJam = async (
    creater_id: number,
    title: string,
    theme: string,
    date_started: string,
    date_finished: string,
    date_vote_started: string,
    nominations: string[],
    vote_type: "all" | "judges" | "members" = "all",
    description?: string,
    judges?: number[]
): Promise<number> => {
    const data: Jam = {
        creater_id,
        title,
        theme,
        date_started,
        date_finished,
        date_vote_started,
        nominations,
        vote_type,
        description,
        judges
    }
    validate(JamSchema, data, "createJam");

    const result = await db.query(`
        INSERT INTO "jams" (
            creater_id,
            title,
            theme,
            date_started,
            date_finished,
            date_vote_started,
            date_vote_finished,
            nominations,
            vote_type,
            description,
            judges
        )
        VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $5,
            $7,
            $8,
            $9,
            $10
        )
        RETURNING id
    `, [
        creater_id,
        title,
        theme,
        date_started,
        date_finished,
        date_vote_started,
        nominations,
        vote_type,
        description,
        judges
    ]);

    if (result.rowCount === 0)
        return null;

    const id = result?.rows[0].id;
    await redis.delWithLog(`jam:${id}`);
    await redis.delAllWithLog(`feed:global:*`);
    await redis.delAllWithLog(`jams:user:${creater_id}:*`);
    await redis.delAllWithLog(`jams:date:*`);
    return id;
}

export default createJam;