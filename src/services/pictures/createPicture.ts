import db from "@/lib/db";
import minio from "@/lib/minio";
import redis from "@/lib/redis";
import { PictureValidate } from "@/types/picture";
import validate from "@/utils/validate";
import { Readable } from "stream";

/**
 * Create new picture
 * 
 * @param creater_id - User ID
 * @param title - Title
 * @param description - Description
 * @param tags - Tags array
 * @param jam_id - Jam ID
 * @param status - public or draft (Default: draft)
 * @param is_background - Picture maybe game reference
 * @param game_id - Game ID
 * @param filedata - Picture file
 * @example
 * return createPicture(1, "hello world", "test", ["1", "2"], undefined, "public", false, 10);
*/
const createPicture = async (
  creater_id: number,
  title: string,
  description?: string,
  tags?: string[],
  jam_id?: number,
  status: "draft" | "public" = "draft",
  is_background?: boolean,
  game_id?: number,
  filedata?: {
    filename: string,
    size: number,
    buffer: Buffer
  }
): Promise<number | null> => {
  validate(
    PictureValidate.omit({ id: true }),
    {
      creater_id,
      title,
      description,
      tags,
      jam_id,
      status,
      is_background,
      game_id
    }
  , "createPicture");

  const result = await db.query(`
      INSERT INTO "jams" (
          creater_id,
          title,
          description,
          tags,
          jam_id,
          status,
          is_background,
          game_id
      )
      VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $5,
          $7,
          $8
      )
      RETURNING id
  `, [
      creater_id,
      title,
      description,
      tags,
      jam_id,
      status,
      is_background,
      game_id
  ]);

  if (result.rowCount === 0)
    return null;

  const id = result?.rows?.[0]?.id;
  await redis.delWithLog(`picture:${id}`);
  await redis.delAllWithLog(`pictures:*`);

  if (filedata) {
    try {
        const isExists = await minio.bucketExists("pictures");
        if (!isExists)
            await minio.makeBucket("pictures");
        if (!filedata?.size)
            throw "errors.nofile";
        await minio.putObject("pictures", `${id}/${filedata?.filename}`, Readable.from(filedata?.buffer));
    }
    catch(err) { console.log(err); }
  }

  return id;
}

export default createPicture;