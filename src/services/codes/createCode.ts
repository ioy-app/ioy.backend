import db from "@/lib/db";
import redis from "@/lib/redis";
import Code from "@/types/code";
import genCode from "@/utils/genCode";
import kafka from "@/lib/kafka";
import AccessError from "@/utils/AccessError";
const producer = kafka.producer();

/**
 * Создание проверочного кода
 * 
 * @param {number} user_id ID Пользователя
 * @param {Record<string, any>} payload Данные 
 * @returns {Promise<Code>}
*/
const createCode = async (user_id: number, payload: Record<string, any>): Promise<Code> => {
    let created: Code;
    do {
        const code = genCode();
        const result = await db.query(`
            INSERT INTO "codes" (
                uid,
                code,
                payload
            ) SELECT $1, $2, $3
            WHERE NOT EXISTS (
                SELECT 1 FROM "codes"
                WHERE code=$2
            )
            RETURNING id, code, date_created, payload
        `, [ user_id, code, payload ]);

        if (result.rowCount !== 0)
            created = result?.rows?.[0];
    } while (!created);

    const user_result = await db.query(`
        SELECT email from "users"
        WHERE id = $1    
    `, [ user_id ]);

    if (user_result.rowCount === 0)
        throw new AccessError("createCode", "errors.denied");

    try {
        await producer.connect();
        await producer.send({
            topic: "notify",
            messages: [
                {
                    key: `verify:${user_id}:${created.payload?.type}`,
                    value: JSON.stringify({
                        type: "code",
                        subject: `Verify`,
                        email: user_result?.rows?.[0]?.email,
                        props: {
                            code: created.code,
                            action: created.payload?.type
                        }
                    })
                }
            ]
        });
        await producer.disconnect();
        console.log("send code");
    }
    catch(err) { console.log(err); }

    redis.writeWithLog(`code:${created.code}`, JSON.stringify(created));
    return created;
}

export default createCode;