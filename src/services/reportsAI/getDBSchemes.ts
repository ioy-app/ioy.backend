import db from "@/lib/db";

/**
 * Get DB schemes for AI
 * @example
 * return getDBSchemes()
*/
const getDBSchemes = async (): Promise<any> => {
  const result = await db.query(`
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name,
      a.attname AS column_name,
      pg_catalog.format_type(a.atttypid, a.atttypmod) AS column_type
    FROM pg_attribute a
    JOIN pg_class c ON a.attrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE a.attnum > 0
      AND NOT a.attisdropped
      AND c.relkind = 'r'
      AND n.nspname NOT IN ('pg_catalog', 'information_schema')
      AND n.nspname NOT LIKE 'pg_toast%'
    ORDER BY n.nspname, c.relname, a.attnum;
  `);

  return result?.rows;
}

export default getDBSchemes;