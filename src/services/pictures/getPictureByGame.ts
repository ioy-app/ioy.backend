import db from "@/lib/db";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";

/**
 * Get picture by game id
 * @example
 * return getPictureByGame()
*/
const getPictureByGame = async (game_id: number): Promise<number> => {
  validate(IdSchemaCustom("game_id"), game_id, "getPictureByGame");

  const result = await db.query(`
    SELECT id
    FROM "pictures"
    WHERE
      game_id = $1
      AND status = 'public'
      AND is_background = true
  `, [ game_id ]);

  const ids = result?.rows?.map(row => row?.id);
  const index = ~~(Math.random() * ids?.length);


  return ids[index];
}

export default getPictureByGame;