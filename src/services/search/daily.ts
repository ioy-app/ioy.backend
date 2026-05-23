import es from "@/lib/elasticsearch";
import redis from "@/lib/redis";
import randomize from "@/utils/randomize";

/**
 * Daily find one game and picture
 * @example
 * return daily()
*/
const daily = async (): Promise<any> => {
  const cache_key = `daily:global`;
  const cache = await redis.readWithLog(cache_key);

  if (cache) {
    try {
      const result = JSON.parse(cache);
      return result;
    }
    catch(err) { await redis.delWithLog(cache_key); }
  }
  
  const { count: games_count } = await es.count({ index: "games" });
  const { count: pictures_count } = await es.count({ index: "pictures" });
  const games_index = ~~((await randomize("hype-games")) * games_count);
  const pictures_index = ~~((await randomize("hype-pictures")) * pictures_count);

  const games = await es.search({
    index: "games",
    from: games_index,
    size: 1,
    query: {
      match_all: {}
    }
  });

  const pictures = await es.search({
    index: "pictures",
    from: pictures_index,
    size: 1,
    query: {
      match_all: {}
    }
  });

  const game = games?.hits?.hits?.[0]?._id;
  const picture = pictures?.hits?.hits?.[0]?._id;

  const result = {
    game,
    picture
  };

  redis.writeWithLog(cache_key, JSON.stringify(result));
  return result;
}

export default daily;