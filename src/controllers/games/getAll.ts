import getGameById from "@/services/games/getGameById.js";
import es from "@/lib/elasticsearch.js";
const per_page = 10;

export default async function GetAll(req, res) {
    const { hits } = await es.search({
        index: "games",
        size: per_page,
        sort: [
            { likes: { order: "desc" } },
            { comments: { order: "desc" } }
        ]
    });

    const tags = await es.search({
        index: "games",
        size: 0,
        aggs: {
            popular_tags: {
                terms: {
                    field: "tags.keyword",
                    size: 10,
                    order: { _count: "desc" }
                }
            }
        }
    });

    const popularTags = tags.aggregations.popular_tags.buckets.map(bucket => bucket.key);

    const games = [];
    for (const game of hits.hits) {
        const data = await getGameById(Number(game._id));
        games.push(data);
    }
    
    res.status(200).json({
        games,
        tags: popularTags
    });
}