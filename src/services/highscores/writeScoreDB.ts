import db from "@/lib/db";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";

/**
 * Write score to db
 * @example
 * return writeScoreDB(1, 1, 10)
*/
const writeScoreDB = async (
  user_id: number,
  game_id: number,
  score: number
): Promise<boolean> => {
  validate(z.object({
    user_id: IdSchemaCustom("user_id"),
    game_id: IdSchemaCustom("game_id"),
    score: z.number("errors.invalid.score")
      .int("errors.invalid.score")
      .nonnegative("errors.invalid.score")
      .nonoptional("errors.required.score")
  }), {
    user_id,
    game_id,
    score
  }, "writeScoreDB");

  const result = await db.query(`
    SELECT id
    FROM "highscores"
    WHERE
      user_id = $1
      AND game_id = $2
  `, [
    user_id,
    game_id
  ]);

  if (result.rowCount === 0)
    await db.query(`
      INSERT INTO "highscores"
      (
        user_id,
        game_id,
        score
      )
      VALUES (
        $1,
        $2,
        $3
      )
    `, [
      user_id,
      game_id,
      score
    ]);
  else
    await db.query(`
      UPDATE "highscores"
      SET score=$3
      WHERE
        user_id=$1
        AND game_id=$2
    `, [
      user_id,
      game_id,
      score
    ]);

  return true;
}

export default writeScoreDB;