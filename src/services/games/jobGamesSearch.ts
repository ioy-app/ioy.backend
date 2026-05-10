import db from "@/lib/db"
import es from "@/lib/elasticsearch";
import Game from "@/schemas/game";
import { getLikesByGame, getLikesByInstance } from "../likes";
import { getComments } from "../comments";
import ContentError from "@/utils/ContentError";

const handleGet = async (offset: number = 0, limit: number = 5): Promise<Game[]> => {
    const result = await db.query<Game>(`
        SELECT
            id,
            title,
            description,
            tags,
            date_created,
            date_updated,
            COUNT(*) OVER()::INTEGER as total
        FROM "games"
        WHERE
            status = 'public'
        OFFSET $1
        LIMIT $2
    `, [
        offset,
        limit
    ]);
    
    return result.rows as Game[];
}



const jobGamesSearch = async () => {
    console.log("[job][elasticsearch] start indexing");
    let count: number = 0;
    //let isNext: boolean = true;
    const bulkStack = [];
    const bulkSize = 400;

    const flushBulk = async (): Promise<number> => {
        const size = bulkStack.length;
        if (!size)
            return 0;

        const response = await es.bulk({
            body: bulkStack,
            refresh: false
        });

        const failed = response?.items?.filter?.((item) => item?.index?.error);
        if (failed?.length)
            throw new ContentError("jobGamesSearch", `[job][es] Index error, count: ${failed?.length}`);

        
        bulkStack.length = 0;
        return ~~(size * .5);
    }

    try {
        const total = (await handleGet(0, 1))?.[0]?.total || 0;
        while(true) {
            const games = await handleGet(count, bulkSize);
            if (!games?.length)
                break;
            for (const game of games) {
                const likes = await getLikesByInstance(game?.id, "game");
                const [ _, comments ] = await getComments(game?.id, 0, 1, "game");
                
                bulkStack.push(
                    { index: { _index: "games", _id: String(game.id) } },
                    {
                        ...game,
                        likes,
                        comments,
                        type: "game"
                    }
                );
            }

            if (bulkStack?.length > (bulkSize * 2))
                count += await flushBulk();
        }

        count += await flushBulk();
    }
    catch(err) {
        console.log(err);
        return setTimeout(() => jobGamesSearch(), 5_000);
    }

    console.log("[job][elasticsearch] games indexed is", count);
}

export default jobGamesSearch;