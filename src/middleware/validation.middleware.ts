import { Request, Response, NextFunction } from "express";
import { z, ZodType, ZodError } from "zod";
import { BadRequestException } from "../utils/response/error.response";
import { Types } from "mongoose";

type KeyReqType = keyof Request; // body | params | query | headers ...
type SchemaType = Partial<Record<KeyReqType, ZodType>>;

export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors: Array<{
      message: string;
      path: (string | number | symbol)[];
    }> = [];

    for (const key of Object.keys(schema) as KeyReqType[]) {
      const validator = schema[key];
      if (!validator) continue;

      if (req.file) {
        req.body.attachment = req.file;
      }

      const validationResult = validator.safeParse(req[key]);
      if (!validationResult.success) {
        const errors = validationResult.error as ZodError;
        errors.issues.forEach((issue) => {
          validationErrors.push({
            message: issue.message,
            path: issue.path,
          });
        });
      }
    }

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
  otp: z.string().regex(/^\d{6}$/),
  password: z
    .string()
    .regex(
      /^(?=.*\d)(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
      "Invalid password"
    ),
  confirmPassword: z.string(),
  phone: z.string().regex(/^01[0-2,5]\d{8}$/, "Invalid Egyptian phone number"),
  id: z.string().refine(
    (data) => Types.ObjectId.isValid(data),
    { message: "Invalid ObjectId format" }
  ),
  token: z.string().min(10, "Invalid token"),
  file: (mimetypes: string[]) => {
    return z
      .strictObject({
        fieldname: z.string(),
        originalname: z.string(),
        encoding: z.string(),
        mimetype: z.enum(mimetypes as [string, ...string[]]),
        buffer: z.any().optional(),
        path: z.string().optional(),
        size: z.number(),
      })
      .refine(
        (data) => {
          return data.buffer || data.path;
        },
        { error: "neither path or buffer is available" }
      );
  },
};
