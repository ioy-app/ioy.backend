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

    const login = await getUserLogin(req?.user_id);
    const userdata = await getUser(login);
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
                    const login = await getUserLogin(report.target_id);
                    instance = await getUser(login);
                } break;
                case "comment": {
                    instance = await getComment(report.target_id);
                    const login = await getUserLogin(instance.source_id);
                    instance.userdata = await getUser(login);
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
            const login = await getUserLogin(report.source_id);
            sourcedata = await getUser(login);
        }
        catch(err) {}
        try {
            const login = await getUserLogin(report.answer_id);
            answerdata = await getUser(login);
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