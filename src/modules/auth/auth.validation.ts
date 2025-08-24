import { z } from "zod";
import { generalField } from "../../middleware/validation.middleware";

export const signup = z
  .object({
    username: generalField.username,
    email: generalField.email,
    password: generalField.password,
    confirmPassword: generalField.confirmPassword,
  })
  .strict()
  .superRefine((data, ctx) => {
    // check password match
    if (data.confirmPassword !== data.password) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Password mismatch",
      });
    }

    // check username format (two parts)
    if (data.username.trim().split(" ").length !== 2) {
      ctx.addIssue({
        code: "custom",
        path: ["username"],
        message: "Username must be two parts",
      });
    }
  });
