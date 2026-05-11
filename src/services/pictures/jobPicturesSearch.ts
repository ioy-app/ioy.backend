import db from "@/lib/db"
import es from "@/lib/elasticsearch";
import Game from "@/schemas/game";
import { getLikesByInstance } from "../likes";
import { getComments } from "../comments";
import ContentError from "@/utils/ContentError";
import Picture from "@/types/picture";

const handleGet = async (
  offset: number = 0,
  limit: number = 5
): Promise<Picture[]> => {
    const result = await db.query<Picture>(`
        SELECT
            id,
            title,
            description,
            tags,
            date_created,
            date_updated,
            COUNT(*) OVER()::INTEGER as total
        FROM "pictures"
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

const jobPicturesSearch = async () => {
    console.log("[job][elasticsearch] pictures start indexing");
    let count: number = 0;
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
            throw new ContentError("jobPicturesSearch", `[job][es] Index error, count: ${failed?.length}`);

        
        bulkStack.length = 0;
        return ~~(size * .5);
    }

    try {
        while(true) {
            const pictures = await handleGet(count, bulkSize);
            if (!pictures?.length)
                break;
            for (const picture of pictures) {
                const likes = await getLikesByInstance(picture?.id, "game");
                const [ _, comments ] = await getComments(picture?.id, 0, 1, "game");
                
                bulkStack.push(
                    { index: { _index: "pictures", _id: String(picture.id) } },
                    {
                        ...picture,
                        likes,
                        comments,
                        type: "picture"
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
        return setTimeout(() => jobPicturesSearch(), 5_000);
    }

    console.log("[job][elasticsearch] pictures indexed is", count);
}

export default jobPicturesSearch;