import { z } from "zod";
import { generalField } from "../../middleware/validation.middleware";
import { fileValidation } from "../../utils/multer/cloud.multer";

export const getChat = {
  params: z.strictObject({
    userId: generalField.id,
  }),
  query: z.strictObject({
    page: z.coerce.number().int().min(1).optional(),
    size: z.coerce.number().int().min(1).optional(),
  }),
};

export const createChattingGroup = {
  body: z
    .strictObject({
      participants: z.array(generalField.id).min(1),
      group: z.string().min(2).max(500),
      attachment: generalField.file(fileValidation.image),
    })
    .superRefine((data, ctx) => {
      // ✅ rule: must have unique participants
      const uniqueCount = new Set(data.participants).size;
      if (uniqueCount !== data.participants.length) {
        ctx.addIssue({
          code: "custom",
          path: ["participants"],
          message: "Participants list contains duplicates",
        });
      }
    }),
};

export const getChattingGroup = {
  params: z.strictObject({
    groupId: generalField.id,
  }),
  query: getChat.query, // ✅ استخدم الجزء الخاص بـ query فقط
};
