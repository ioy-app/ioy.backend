import es from "@/lib/elasticsearch";
import redis from "@/lib/redis";

/**
 * Get popular tags from index
 * @example
 * return getPopularTags()
*/
const getPopularTags = async (type: "pictures" | "games"): Promise<string[]> => {
  const cache_key = `tags:${type}`;
  const cache = await redis.readWithLog(cache_key);
  if (cache) {
    try {
      const items = JSON.parse(cache);
      return items;
    }
    catch(err) { await redis.delAllWithLog(cache_key); }
  }

  const tags = await es.search({
      index: type,
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

  const items = tags?.aggregations?.popular_tags?.buckets?.map?.(bucket => bucket?.key);
  return items;
}

export default getPopularTags;