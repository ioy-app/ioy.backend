import db from "@/lib/db";
import redis from "@/lib/redis";
import { IdSchemaCustom } from "@/schemas/id";
import validate from "@/utils/validate";
import z from "zod";
import getReport from "./getReport";
import { deleteComment, getComment } from "../comments";
import { deleteGame, getGameById } from "../games";
import getUserLogin from "../users/getUserLogin";
import getUser from "../users/getUser";
import banUser from "../users/banUser";

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

  const result = await db.query(`
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
  console.log(data.params);

  // Ban instance's author to 3/30 days:
  if (data?.params?.ban_instance_3d || data?.params?.ban_instance_30d) {
    switch(report.target_type) {
      case "user": {
        await banUser(report.target_id, data?.params?.ban_instance_3d ? 3 : 30);
      } break;
      case "game": {
        const game = await getGameById(report.target_id);
        await banUser(game.creater_id, data?.params?.ban_instance_3d ? 3 : 30);
      } break;
      case "comment": {
        const comment = await getComment(report.target_id);
        await banUser(comment.source_id, data?.params?.ban_instance_3d ? 3 : 30);
      } break;
      case "jam": {

      } break;
    }
  }

  if (data?.params?.unban_instance) {
    switch(report.target_type) {
      case "user": {
        await banUser(report.target_id, -1);
      } break;
      case "game": {
        const game = await getGameById(report.target_id);
        await banUser(game.creater_id, -1);
      } break;
      case "comment": {
        const comment = await getComment(report.target_id);
        await banUser(comment.source_id, -1);
      } break;
      case "jam": {

      } break;
    }
  }

  // Delete instance (work only: comment/game/jam):
  if (data?.params?.delete_instance) {
    switch(report.target_type) {
      case "game": {
        await deleteGame(report.target_id);
      } break;
      case "comment": {
        await deleteComment(undefined, report.target_id);
      } break;
      case "jam": {

      } break;
    }
  }


  return true;
}

export default answerReport;