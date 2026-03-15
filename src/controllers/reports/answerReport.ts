import Request from "@/types/request";
import { Response } from "express";
import answerReportService from "@/services/reports/answerReport";
import AccessError from "@/utils/AccessError";
import { getRole } from "@/services/roles";
import getUser from "@/services/users/getUser";
import getUserLogin from "@/services/users/getUserLogin";

/**
 * Answer fro report
 * @param req - Request
 * @param res - Response
*/
const answerReport = async(req: Request, res: Response): Promise<void> => {
  const login = await getUserLogin(req?.user_id);
  const userdata = await getUser(login);
  const roledata = await getRole(userdata.role_id);

  if (!roledata.is_view_reports)
      throw new AccessError("getReports", "errors.denied");

  const result = await answerReportService(
    Number(req.params?.id),
    Number(req?.user_id),
    req.body
  );

  res.status(200).end();
}

export default answerReport;