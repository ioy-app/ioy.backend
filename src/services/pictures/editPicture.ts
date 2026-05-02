import { IdSchemaCustom } from "@/schemas/id";
import Picture, { PictureValidate } from "@/types/picture";
import validate from "@/utils/validate";
import z from "zod";
import getPicture from "./getPicture";
import { getJam } from "../jams";
import AccessError from "@/utils/AccessError";
import db from "@/lib/db";
import redis from "@/lib/redis";
import es from "@/lib/elasticsearch";
import { getLikesByInstance } from "../likes";
import minio from "@/lib/minio";
import { Readable } from "stream";

/**
 * Edit picture data
 * @example
 * return editPicture()
*/
const editPicture = async (
  id: number,
  props: Picture,
  filedata?: {
    filename: string,
    size: number,
    buffer: Buffer
  }
): Promise<Picture | null> => {
  validate(z.object({
    id: IdSchemaCustom("id"),
    props: PictureValidate.omit({
      id: true,
      creater_id: true
    })
  }), {
    id,
    props
  }, "editPicture");

  const picturedata = await getPicture(id);
  if (picturedata?.jam_id) {
    const jamdata = await getJam(picturedata?.jam_id);
    if (!["in_process"].includes(jamdata?.status))
      throw new AccessError("editPicture", "errors.jams_denied");
  }

  try {
      const isExists = await minio.bucketExists("pictures");
      if (!isExists)
          await minio.makeBucket("pictures");
      if (!filedata?.size)
          throw "errors.nofile";
      await minio.putObject("pictures", `${id}/${filedata?.filename}`, Readable.from(filedata?.buffer));
  }
  catch(err) { console.log(err); }

  const keys = Object.keys(props).filter(prop => [
      "title",
      "description",
      "tags",
      "status",
      "game_id"
  ].includes(prop));
  const values = keys.map(key => props[key]);

  const result = await db.query<Picture[]>(`
      UPDATE "pictures"
      SET
          ${keys?.map((key: string, i: number) => `${key}=$${i + 2}`)?.join(",")},
          date_updated=NOW()
      WHERE id=$1
      RETURNING 
          id,
          title,
          description,
          tags,
          status,
          creater_id,
          jam_id,
          game_id,
          date_created,
          date_updated
  `, [ id, ...values ]);

  if (result.rowCount === 0)
      return null;

  const picture: Picture = result.rows[0];
  for (const [ key, value ] of Object.entries(picture))
      if (!value)
          delete picture[key];

  await redis.delAllWithLog(`picture:${id}`);
  await redis.delAllWithLog(`pictures:*`);
  await redis.delAllWithLog(`subscribers:*`);
  await redis.delAllWithLog(`feed:global:*`);
  if (props?.jam_id) {
      await redis.delAllWithLog(`jam:${props?.jam_id}`);
      await redis.delAllWithLog(`jams:*`);
  }

  try {
      if (picture?.status == "public") {
          await es.index({
              index: "pictures",
              id: String(picture?.id),
              document: {
                  title: picture?.title,
                  description: picture?.description,
                  date_created: picture?.date_created,
                  date_updated: picture?.date_updated,
                  tags: picture?.tags,
                  likes: await getLikesByInstance(picture?.id, "picture")
              }
          });
      } else {
          await es.delete({
              index: "pictures",
              id: String(picture?.id)
          })
      }
  }
  catch(err) {}

  return picture;
}

export default editPicture;