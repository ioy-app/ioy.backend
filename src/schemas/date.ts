import dayjs from "dayjs";
import z from "zod";

/**
 * Validate custom date parameter
 * 
 * @param name - Name parameter
 * @returns
*/
const DateSchema = (name: string) => (
  z.string(`errors.invalid.${name}`)
    .refine((val) => dayjs(val)?.isValid?.(), {
      message: `errors.invalid.${name}`,
      path: [ name ]
    })
);

export default DateSchema;