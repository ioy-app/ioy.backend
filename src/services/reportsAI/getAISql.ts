import logger from "@/lib/logger";
import getDBSchemes from "./getDBSchemes";
import AIClient from "@/lib/openai";
import dotenv from "dotenv";
import ContentError from "@/utils/ContentError";
import redis from "@/lib/redis";

dotenv.config();

/**
 * Get AI SQL result
 * 
 * @param query - Query
 * @example
 * return getAISql("Get last user info")
*/
const getAISql = async (query: string, errors: string[] = []): Promise<any> => {
  if (errors?.length >= 5)
    throw new ContentError("getAISql", "errors.ai.limit");

  const schemes = await getDBSchemes();
  const obj = {}
  for (const scheme of schemes) {
    if (!obj?.[scheme?.table_name])
      obj[scheme?.table_name] = [];

    obj[scheme?.table_name].push({
      name: scheme?.column_name,
      type: scheme?.column_type
    })
  }

  let structure = "";
  for (const [ key, value ] of Object.entries(obj)) {
    structure += `Table: ${key}: `;
    const arr = [];
    for (const column of value) {
      arr.push(`${column.name} (type: ${column.type})`);
    }
    structure += arr.join(",") + ".";
  }

  const response = await AIClient.chat.completions.create({
    model: process.env.AI_MODEL,
    messages: [
      {
        role: "system",
        content: `Task: Your task is to convert a user request into a valid PostgreSQL query`
      },
      {
        role: "system",
        content: `
          You MUST follow ALL rules below:
          1. Output ONLY a raw SQL query as plain text.
          2. Absolutely NO markdown.
          3. Absolutely NO code blocks (no \`\`\` or \`\`\`sql).
          4. Absolutely NO explanations, comments, or extra text.
          5. Output must start directly with SELECT.
          6. Use ONLY SELECT queries (read-only operations only).
          7. Keep queries as simple as possible.
          8. Use ONLY the provided database schema. Do not assume missing tables or columns.
          9. If the request cannot be solved, output exactly:
            SELECT 'ERROR' AS error;
          10. INTERNAL SELF-CHECK (IMPORTANT):
            - Before finalizing the answer, validate the SQL query in your reasoning step.
            - Check for syntax correctness (SELECT structure, commas, parentheses).
            - Check that all tables and columns exist in the provided schema.
            - Check JOIN conditions are valid and not missing ON clauses.
            - Check that no non-SELECT statements exist.
            - If any issue is found, FIX the query before outputting it.
            - You MUST output only the corrected final SQL, never the reasoning or the errors.
          11. Use ONLY standard PostgreSQL syntax.
          12. Never use MySQL, SQL Server, Oracle, SQLite, or other database-specific syntax.
          13. Never invent tables, columns, functions, operators, or SQL keywords.
          14. Every function used must exist in PostgreSQL.
          15. If you are not certain that a function exists in PostgreSQL, do not use it.
        `
      },
      {
        role: "system",
        content: `Database schema: ${structure}`
      },
      ...errors?.map((err) => ({
        role: "system",
        content: `Last try error: ${err}`
      })),
      {
        role: "user",
        content: query
      }
    ]
  });

  const sql = response.choices[0].message.content;

  return sql;
}

export default getAISql;