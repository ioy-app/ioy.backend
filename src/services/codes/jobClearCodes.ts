import db from "@/lib/db";
import deleteCode from "./deleteCode";

/**
 * Задание на удаление просроченных кодов
 * 
 * @returns {Promise<boolean>}
*/
const jobClearCodes = async (): Promise<boolean> => {
    const result = await db.query(`
        SELECT code
        FROM "codes"
        WHERE (NOW() - date_created) >= interval '5 minutes'
    `);

    if (result.rowCount === 0)
        return false;

    for (const row of result.rows)
        await deleteCode(String(row.code));

    console.log("[job][jobClearCodes]", `clear ${result.rowCount} rows`);
    return true;
}

export default jobClearCodes;