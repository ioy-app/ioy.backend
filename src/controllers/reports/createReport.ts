import Request from "@/types/request";
import { Response } from "express";
import { createReport as createReportService } from "@/services/reports";

/**
 * Create new report for instance
 * @param req - Request
 * @param res - Response
*/
const createReport = async(req: Request, res: Response): Promise<void> => {
    const {
        target_id,
        type,
        message
    } = req.body;

    const report = await createReportService(Number(req.user_id), Number(target_id), type, message);
    res.status(200).json(report);
}

export default createReport;