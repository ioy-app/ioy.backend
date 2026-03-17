import { z } from "zod";

const IdSchema = z.number({
    error: "errors.invalid.id"
}).nonnegative({
    error: "errors.invalid.id"
}).nonoptional({
    error: "errors.required.id"
});

/**
 * Custom ID Schema
 * 
 * @param param - ID param
 * @returns
*/
export const IdSchemaCustom = (param: string) => (
    z.number({ error: `errors.invalid.${param}` })
    .nonnegative({ error: `errors.invalid.${param}` })
    .nonoptional({ error: `errors.required.${param}` })
);

export default IdSchema;