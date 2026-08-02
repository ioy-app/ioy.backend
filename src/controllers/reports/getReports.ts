import Request from "@/types/request";
import { Response } from "express";
import { getReport, getReports as getReportsService } from "@/services/reports";
import { getGameById } from "@/services/games";
import { getComment } from "@/services/comments";
import { getJam } from "@/services/jams";
import { getRole } from "@/services/roles";
import AccessError from "@/utils/AccessError";
import { getPicture } from "@/services/pictures";
import promisegRPC from "@/utils/promisegRPC";
import { serviceUsers } from "index";

/**
 * Get reports list
 * @param req - Request
 * @param res - Response
*/
const getReports = async(req: Request, res: Response): Promise<void> => {
    const offset: number = req.query.offset && Number(req.query.offset);
    const limit: number = req.query.limit && Number(req.query.limit);

    const items = [];
    const data = await getReportsService(offset, limit);

		const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: req?.user_id });
    const userdata = await promisegRPC(serviceUsers, "GetUser", { login });
    const roledata = await getRole(userdata.role_id);

    if (!roledata.is_view_reports)
        throw new AccessError("getReports", "errors.denied");

    for (const id of data[0]) {
        const report = await getReport(id);
        let instance;
        let sourcedata;
        let answerdata;
        try {
            switch(report.target_type) {
                case "game":
                    instance = await getGameById(report.target_id);
                break;
                case "user": {
										const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: report?.target_id });
                    instance = await promisegRPC(serviceUsers, "GetUser", { login });
                } break;
                case "comment": {
                    instance = await getComment(report.target_id);
										const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: instance?.source_id });
                    instance.userdata = await promisegRPC(serviceUsers, "GetUser", { login });
                } break;
                case "jam":
                    instance = await getJam(report.target_id);
                break;
                case "picture":
                    instance = await getPicture(report.target_id);
                break;
            }
        }
        catch(err) {}
        try {
					const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: report?.source_id });
            sourcedata = await promisegRPC(serviceUsers, "GetUser", { login });
        }
        catch(err) {}
        try {
					const { value: login } = await promisegRPC(serviceUsers, "GetUserLogin", { user_id: report?.answer_id });
            answerdata = await promisegRPC(serviceUsers, "GetUser", { login });
        }
        catch(err) {}

        items.push({
            ...report,
            instance,
            sourcedata,
            answerdata
        });
    }

    res.status(200).json({
        items,
        offset,
        limit
    });
}

export default getReports;
