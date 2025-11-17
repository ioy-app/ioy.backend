import db from "@/lib/db"

const deleteCode = async (code: string): Promise<void> => {
    const result = await db.query(`
        DELETE FROM "codes"
        WHERE code=$1
    `, [ code ]);
}

export default deleteCode;