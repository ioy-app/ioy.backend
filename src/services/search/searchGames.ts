import es from "@/lib/elasticsearch";

enum prioritySearch {
    title=5,
    description=1.5,
    tags=3,
}

/**
 * Get result of search by games
 * @example
 * return searchGames()
*/
const searchGames = async (
    search?: string,
    offset: number = 0,
    limit: number = 20
): Promise<any> => {
    const result = await es.search({
        index: "games",
        from: offset,
        size: limit,
        query: {
            bool: {
                should: [
                    {
                        match: {
                            title: {
                                query: search,
                                boost: prioritySearch.title
                            }
                        }
                    },
                    {
                        match: {
                            description: {
                                query: search,
                                boost: prioritySearch.description
                            }
                        }
                    },
                    {
                        match: {
                            tags: {
                                query: search,
                                boost: prioritySearch.tags
                            }
                        }
                    }
                ],
                minimum_should_match: 1
            }
        },
        sort: [
            { _score: { order: "desc" } },
            { likes: { order: "desc" }}
        ]
    });

    const items = result.hits.hits.map(hit => hit._id);
    const total = result.hits.total.value;
    return [ items, total ];
}

export default searchGames;