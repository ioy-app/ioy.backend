import Request from "@/types/request";
import { Response } from "express";
import answerReportService from "@/services/reports/answerReport";
import AccessError from "@/utils/AccessError";
import { getRole } from "@/services/roles";
import { serviceUsers } from "index";
import promisegRPC from "@/utils/promisegRPC";

/**
 * Answer fro report
 * @param req - Request
 * @param res - Response
*/
const answerReport = async(req: Request, res: Response): Promise<void> => {
	const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: req?.user_id });
  const userdata = await promisegRPC(serviceUsers, "GetUser", { login });
  const roledata = await getRole(userdata.role_id);

  if (!roledata.is_view_reports)
      throw new AccessError("getReports", "errors.denied");

  await answerReportService(
    Number(req.params?.id),
    Number(req?.user_id),
    req.body
  );

  res.status(200).end();
}

export default answerReport;
