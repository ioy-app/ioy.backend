import Request from "@/types/request";
import { Response } from "express";
import { getReport, getReports as getReportsService } from "@/services/reports";
import { getGameById } from "@/services/games";
import getUserLogin from "@/services/users/getUserLogin";
import getUser from "@/services/users/getUser";
import { getComment } from "@/services/comments";
import { getJam } from "@/services/jams";
import { getRole } from "@/services/roles";
import AccessError from "@/utils/AccessError";
import { getPicture } from "@/services/pictures";
import { getReportResult } from "@/services/reportsAI";

/**
 * Get reports list
 * @param req - Request
 * @param res - Response
*/
const getAIReports = async(req: Request, res: Response): Promise<void> => {
  const comment = req.body.comment;
  const login = await getUserLogin(req?.user_id);
  const userdata = await getUser(login);
  const roledata = await getRole(userdata.role_id);

  if (!roledata.is_view_reports)
      throw new AccessError("getReports", "errors.denied");

  const {
    result,
    sql
  } = await getReportResult(comment);

  res.status(200).json({
    result,
    sql
  });
}

export default getAIReports;