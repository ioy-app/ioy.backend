import db from "@/lib/db";
import Code from "@/types/code";
import ContentError from "@/utils/ContentError";

/**
 * Проверка наличия кода подтверждения
 * 
 * @param {string} code Код 
 * @returns {Promise<Code>}
*/
const checkCode = async (code: string): Promise<Code> => {
    const result = await db.query(`
        SELECT id, payload, code, uid
        FROM "codes"
        WHERE
            code = $1
            AND (NOW() - date_created) < interval '5 minutes'
    `, [ code ]);

    if (result.rowCount === 0)
        throw new ContentError("checkCode", "errors.exists");

    return result?.rows?.[0] as Code;
}

export default checkCode;