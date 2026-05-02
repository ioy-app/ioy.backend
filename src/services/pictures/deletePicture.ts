import { PictureValidate } from "@/types/picture";
import validate from "@/utils/validate";
import getPicture from "./getPicture";
import db from "@/lib/db";
import redis from "@/lib/redis";
import { deleteLikes } from "../likes";
import { deleteSubs } from "../subscribers";
import { deleteComments } from "../comments";
import minio from "@/lib/minio";
import es from "@/lib/elasticsearch";

/**
 * Delete picture by id
 * 
 * @param id - Picture ID
 * @example
 * return deletePicture()
*/
const deletePicture = async (id: number): Promise<boolean> => {
  validate(PictureValidate.pick({ id: true }), { id }, "deletePicture");

  const picturedata = await getPicture(id);
  if (!picturedata)
    return false;

  const result = await db.query(`
    DELETE FROM "pictures"
    WHERE id = $1
    RETURNING 1
  `, [ id ]);

  if (result?.rowCount === 0)
    return false;

  await redis.delWithLog(`picture:${id}`);
  await redis.delAllWithLog(`pictures:*`);
  await redis.delAllWithLog(`feed:global:*`);
  await redis.delAllWithLog(`user_id:*`);
  if (picturedata?.jam_id)
    await redis.delAllWithLog(`jam:${picturedata?.jam_id}:*`);

  await deleteLikes(id, "picture");
  await deleteSubs(id, "picture");
  await deleteComments(id, "picture");

  try {
    const isExists = await minio.bucketExists("pictures");
    if (!isExists)
      await minio.makeBucket("pictures");

    await minio.removeObject("pictures", `${id}.png`);
    await es.delete({
      index: "pictures",
      id: String(id)
    });
  }
  catch(err) {}

  return true;
}

export default deletePicture;