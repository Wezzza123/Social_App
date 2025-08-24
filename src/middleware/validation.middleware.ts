import { Request, Response, NextFunction } from "express";
import { z, ZodType, ZodError } from "zod";
import { BadRequestException } from "../utils/response/error.response";

type KeyReqType = keyof Request; // body | params | query | headers ...
type SchemaType = Partial<Record<KeyReqType, ZodType>>;

export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: Array<{
      message: string;
      path: string | number | symbol | undefined;
    }> = [];

    for (const key of Object.keys(schema) as KeyReqType[]) {
      const validator = schema[key];
      if (!validator) continue;

      const validationResult = validator.safeParse(req[key]);

      if (!validationResult.success) {
        const errors = validationResult.error as ZodError;

        errors.issues.forEach((issue) => {
          validationErrors.push({
            message: issue.message,
            path: issue.path[0],
          });
        });
      }
    } // ✅ قفلت اللوب هنا

    if (validationErrors.length) {
      throw new BadRequestException("Validation Error", { validationErrors });
    }

    return next();
  };
};

// ✅ generalField schema
export const generalField = {
  username: z.string().min(2).max(20),
  email: z.string().email(),
  password: z
    .string()
    .regex(
      /^(?=.*\d)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
      "Invalid password"
    ),
  confirmPassword: z.string(),
};
