import { ZodError, ZodType } from "zod";
import ValidError from "./ValidError";

/**
 * Validate schema-data
 * 
 * @param schema - Schema or zod method
 * @param data - Validate date
 * @param component - Name Service/Component to validate
*/
const validate = <T>(schema: ZodType, data: unknown, component?: string) => {
    try { schema.parse(data); }
    catch(err) {
        if (err instanceof ZodError)
            throw new ValidError(component, err.issues[0].message);
        throw err;
    }
}

export default validate;