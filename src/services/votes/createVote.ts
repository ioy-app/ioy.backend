import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Create new vote
 * @example
 * return createVote()
*/
const createVote = async (
  source_id: number,
  jam_id: number,
  target_id: number,
  nomination: string,
  score: number
): Promise<any> => {
  validate(z.object({
    source_id: IdSchemaCustom("source_id"),
    jam_id: IdSchemaCustom("jam_id"),
    target_id: IdSchemaCustom("target_id"),
    nomination: z.string("errors.invalid.nomination")
      .trim()
      .nonempty("errors.required.nomination")
      .nonoptional("errors.required.nomination"),
    score: z.number("errors.invalid.score")
      .int("errors.invalid.score")
      .nonnegative("errors.invalid.score")
      .min(1, "errors.invalid.score")
      .max(3, "errors.invalid.score")
      .nonoptional("errors.required.score")
  }), {
    source_id,
    jam_id,
    target_id,
    nomination,
    score
  }, "createVote");

  let id;
  const result = await db.query(`
      INSERT INTO "votes" (
          source_id,
          jam_id,
          target_id,
          nomination,
          score
      )
      SELECT $1, $2, $3, $4, $5
      WHERE NOT EXISTS (
          SELECT 1 FROM "votes"
          WHERE
            source_id=$1
            AND jam_id=$2
            AND target_id=$3
            AND nomination=$4
      )
      RETURNING id
  `, [
    source_id,
    jam_id,
    target_id,
    nomination,
    score
  ]);

  if (result.rowCount === 0) {
    const _result = await db.query(`
      UPDATE "votes"
      SET
        score=$5,
        date_updated=NOW()
      WHERE
        source_id=$1
        AND jam_id=$2
        AND target_id=$3
        AND nomination=$4
      RETURNING id
    `, [
      source_id,
      jam_id,
      target_id,
      nomination,
      score
    ]);

    if (_result.rowCount === 0)
      return null;

    id = _result?.rows?.[0]?.id;
  } else
    id = result?.rows?.[0]?.id;

  await redis.delWithLog(`vote:${id}`);
  await redis.delWithLog(`votes:${jam_id}:${source_id}:${target_id}`);
  await redis.delWithLog(`votes:${jam_id}:global`);
  
  return id;
}

export default createVote;