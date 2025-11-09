import { QueryResult } from "pg";
import db from "@/lib/db";
import LoginSchema from "@/schemas/login";
import validate from "@/utils/validate";

const getUserSubscribers = async (
    login: string,
    searchParams?: {
        offset?: number;
        limit?: number;
    }
) => {
    validate(LoginSchema, login, "getUserSubscribers");

    const offset: number = searchParams?.offset || 0;
    const limit: number = searchParams?.limit || 5;

    const result: QueryResult = await db.query(`
        SELECT
            tu.login,
            s.date_created,
            COUNT(*) OVER()::INTEGER AS total
        FROM "subscribers" s
        JOIN "users" u
        ON 
            s.source_id = u.id 
            AND u.login = $1
            AND s.target_type = 'user'
            AND u.privacy->'subscribers' = 'true'::jsonb
        JOIN "users" tu
        ON
            s.target_id = tu.id
        ORDER BY s.date_created DESC
        OFFSET $2 LIMIT $3
    `, [ login, offset, limit ]);

    return {
        items: result.rows,
        offset,
        limit,
        total: result.rows?.[0]?.total
    };
}

export default getUserSubscribers;