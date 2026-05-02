import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";
import getReport from "./getReport";
import { deleteComment, getComment } from "../comments";
import { deleteGame, getGameById } from "../games";
import banUser from "../users/banUser";
import { deleteJam, getJam } from "../jams";
import kafka from "@/lib/kafka";
import dayjs from "dayjs";
import { deletePicture, getPicture } from "../pictures";
const producer = kafka.producer();

/**
 * Answer for report
 * @example
 * return answerReport()
*/
const answerReport = async (
  report_id: number,
  user_id: number,
  data: {
    answer: string,
    params: {
      ban_instance_3d?: boolean;
      ban_instance_30d?: boolean;
      delete_instance?: boolean;
      unban_instance?: boolean;
    }
  }
): Promise<any> => {
  validate(
    z.object({
      report_id: IdSchemaCustom("report_id"),
      user_id: IdSchemaCustom("user_id"),
      answer: z.string("errors.invalid.answer")
        .trim()
        .nonempty("errors.invalid.answer")
        .nonoptional("errors.required.answer")
    }),
    {
      report_id,
      user_id,
      answer: data?.answer
    },
    "answerReport"
  );

  await db.query(`
    UPDATE "reports"
    SET
      answer=$3,
      answer_id=$2,
      date_answered=NOW()
    WHERE id = $1
  `, [ report_id, user_id, data.answer ]);

  await redis.delWithLog(`report:${report_id}`);
  await redis.delAllWithLog(`reports:*`);

  const report = await getReport(report_id);

  // Ban instance's author to 3/30 days:
  if (data?.params?.ban_instance_3d || data?.params?.ban_instance_30d) {
    let user_id;
    switch(report.target_type) {
      case "user": {
        await banUser(report.target_id, data?.params?.ban_instance_3d ? 3 : 30);
        user_id = report.target_id;
      } break;
      case "game": {
        const game = await getGameById(report.target_id);
        await banUser(game.creater_id, data?.params?.ban_instance_3d ? 3 : 30);
        user_id = game.creater_id;
      } break;
      case "comment": {
        const comment = await getComment(report.target_id);
        await banUser(comment.source_id, data?.params?.ban_instance_3d ? 3 : 30);
        user_id = comment.source_id;
      } break;
      case "jam": {
        const jam = await getJam(report.target_id);
        await banUser(jam.creater_id, data?.params?.ban_instance_3d ? 3 : 30);
        user_id = jam.creater_id;
      } break;
      case "picture": {
        const picture = await getPicture(report.target_id);
        await banUser(picture.creater_id, data?.params?.ban_instance_3d ? 3 : 30);
        user_id = picture.creater_id;
      } break;
    }

    if (user_id) {
      const user_result = await db.query(`SELECT email FROM "users" WHERE id = $1`, [ user_id ]);
      if (user_result?.rowCount !== 0) {
        await producer.connect();
        await producer.send({
          topic: "notify",
          messages: [
              {
                  key: `block:${user_id}`,
                  value: JSON.stringify({
                      type: "block",
                      subject: `Blocked!`,
                      email: user_result?.rows?.[0]?.email,
                      props: {
                          date: dayjs().add(data?.params?.ban_instance_3d ? 3 : 30, "day")?.format("DD.MM.YYYY")
                      }
                  })
              }
          ]
        });
        console.log("sended block notify");
        await producer.disconnect();
      }
    }
  }

  if (data?.params?.unban_instance) {
    let user_id;
    switch(report.target_type) {
      case "user": {
        await banUser(report.target_id, -1);
        user_id = report.target_id;
      } break;
      case "game": {
        const game = await getGameById(report.target_id);
        await banUser(game.creater_id, -1);
        user_id = game.creater_id;
      } break;
      case "picture": {
        const picture = await getPicture(report.target_id);
        await banUser(picture.creater_id, -1);
        user_id = picture.creater_id;
      } break;
      case "comment": {
        const comment = await getComment(report.target_id);
        await banUser(comment.source_id, -1);
        user_id = comment.source_id;
      } break;
      case "jam": {
        const jam = await getJam(report.target_id);
        await banUser(jam.creater_id, -1);
        user_id = jam.creater_id;
      } break;
    }

    if (user_id) {
      const user_result = await db.query(`SELECT email FROM "users" WHERE id = $1`, [ user_id ]);
      if (user_result?.rowCount !== 0) {
        await producer.connect();
        await producer.send({
          topic: "notify",
          messages: [
              {
                  key: `unblock:${user_id}`,
                  value: JSON.stringify({
                      type: "block",
                      subject: `Unblocked!`,
                      email: user_result?.rows?.[0]?.email,
                      props: {
                          date: dayjs()?.format("DD.MM.YYYY")
                      }
                  })
              }
          ]
        });
        console.log("sended unblock notify");
        await producer.disconnect();
      }
    }
  }

  // Delete instance (work only: comment/game/jam):
  if (data?.params?.delete_instance) {
    switch(report.target_type) {
      case "game": {
        await deleteGame(report.target_id);
      } break;
      case "comment": {
        await deleteComment(report.target_id);
      } break;
      case "jam": {
        await deleteJam(report.target_id);
      } break;
      case "picture": {
        await deletePicture(report.target_id);
      } break;
    }
  }


  return true;
}

export default answerReport;