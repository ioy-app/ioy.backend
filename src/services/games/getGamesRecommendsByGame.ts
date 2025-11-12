import es from "@/lib/elasticsearch";
import Game from "@/types/game";
import { SearchHit } from "node_modules/@elastic/elasticsearch/lib/api/types";

/**
 * Получение рекомендуемых игр
 * 
 * @param {Game} game Исходная игра 
 * @returns 
*/
const getGamesRecommendsByGame = async (game: Game): Promise<Game[]> => {
    const { id, title, description, tags } = game;
    const { hits } = await es.search({
        index: "games",
        size: 5,
        query: {
            bool: {
                must: [{
                    bool: {
                        should: [
                            { match: { title }},
                            { match: { description }},
                            { terms: { tags }}
                        ],
                        minimum_should_match: 2
                    }
                }],
                must_not: [
                    { term: { _id: id }}
                ]
            }
        }
    });
    return hits.hits.map((item: SearchHit<Game>) => ({
        id: Number(item._id),
        ...item._source
    })) as Game[];
}

export default getGamesRecommendsByGame;