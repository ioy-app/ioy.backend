import redis from "@/lib/redis";
import dayjs from "dayjs";

/**
 * Random with seed (Current date)
 * 
 * @param subseed - Sub seed
 * @example
 * return randomize("games")
*/
const randomize = async (subseed?: string): Promise<number> => {
  const current_date = dayjs?.()?.format?.("YYYY-MM-DD");
  const seed = `${current_date}-${subseed}`;
  const cache_key = `randomize:${seed}`;

  const cache = await redis.readWithLog(cache_key);
  if (cache) {
    try {
      const result = Number(cache);
      return result;
    }
    catch(err) { await redis.delWithLog(cache_key); }
  }

  let h = 1779033703 ^ seed?.length;
  for (let i = 0; i < seed?.length; i++) {
    h = Math.imul(h ^ seed?.charCodeAt?.(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);

  const result = ((h ^= h >>> 16) >>> 0) / 4294967296;
  redis.writeWithLog(cache_key, String(result));
  return result;
}

export default randomize;