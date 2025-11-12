import db from "@/lib/db"
import es from "@/lib/elasticsearch";
import Game from "@/types/game";

const jobGamesSearch = async () => {
    const handleGet = async (offset: number = 0, limit: number = 5): Promise<Game[]> => {
        const result = await db.query<Game>(`
            SELECT
                id,
                title,
                description,
                tags,
                date_created,
                date_updated
            FROM "games"
            WHERE status = 'public'
            OFFSET $1 LIMIT $2
        `, [ offset, limit ]);
        
        return result.rows as Game[];
    }

    let count: number = 0;
    let isNext: boolean = false;
    do {
        const games = await handleGet(count, 100);

        for (const game of games) {
            await es.index({
                index: "games",
                id: String(game.id),
                document: {
                    title: game.title,
                    description: game.description,
                    date_created: game.date_created,
                    date_updated: game.date_updated,
                    tags: game.tags
                }
            });
        }

        count += games.length;
        isNext = Boolean(games.length > 0);
    } while (isNext);

    console.log("[job][elasticsearch] games indexed is", count);
}

export default jobGamesSearch;