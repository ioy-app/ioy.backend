import db from "@/lib/db";
import redis from "@/lib/redis";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Get games by jam
 * @example
 * return getGamesByJam()
*/
const getGamesByJam = async (
  jam_id: number,
  offset: number = 0,
  limit: number = 10,
  search?: string,
  sort: "new" | "old" = "new"
): Promise<any> => {
  validate(z.object({
    jam_id: z.number({ error: "errors.invalid.id" })
        .nonnegative({ error: "errors.invalid.id" })
        .nonoptional({ error: "errors.required.id" }),
    offset: z.number({ error: "errors.invalid.offset" })
        .nonnegative({ error: "errors.invalid.offset" })
        .optional(),
    limit: z.number({ error: "erros.invlaid.limit" })
        .nonnegative({ error: "errors.invalid.limit" })
        .optional()
  }), {
    jam_id,
    offset,
    limit
  }, "getGamesByJam");
  validate(z.object({
      search: z.string({ error: "errors.invalid.search" }).optional()
  }), { search }, "getGamesByJam");
  validate(
      z.enum([ "new", "old" ], { error: "errors.invalid.sort" })
          .optional(),
  sort, "getGamesByJam");

  const cache_key: string = `jams:games:${jam_id}:${offset}:${limit}:${search}:${sort}`;
  let cached = await redis.readWithLog(cache_key);
  if (cached) {
      try {
          const parsed = JSON.parse(cached as string);
          return parsed as [number[], number];
      }
      catch(err) { await redis.delWithLog(cache_key); }
  }


  const filters = [];
  const opts = [];

  if (search) {
      filters.push(`title ILIKE $${4 + opts.length}`);
      opts.push(`%${search}%`);
  }

  enum OrderEnum {
      new="DESC",
      old="ASC"
  }

  const result = await db.query(`
      SELECT
          id,
          COUNT(*) OVER()::INTEGER as total
      FROM "games"
      WHERE
          jam_id = $1
          ${filters?.length >= 1 && `AND ${filters.join(" AND ")}` || ""}
      ORDER BY date_created ${OrderEnum[sort] || "DESC"}
      OFFSET $2 LIMIT $3
  `, [ jam_id, offset, limit, ...opts ]);;

  const total = Number(result?.rows?.[0]?.total || 0);
  const games_ids: number[] = result?.rows?.map((row: { id: number, total: number }) => row.id);

  redis.writeWithLog(cache_key, JSON.stringify([ games_ids, total ]));

  return [ games_ids, total ];
}

export default getGamesByJam;