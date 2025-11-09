import { ZodError } from "zod";
import ValidError from "./ValidError";

const validate = <T>(schema: any, data: unknown, component?: string) => {
    try { schema.parse(data); }
    catch(err) {
        if (err instanceof ZodError)
            throw new ValidError(component, err.issues[0].message);
        throw err;
    }
}

export default validate;