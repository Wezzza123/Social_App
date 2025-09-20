import { z } from "zod";
import { AllowCommentsEnum, AvailabilityEnum ,LikeActionEnum } from "../../DataBase/models/post.model";
import { generalField} from "../../middleware/validation.middleware"

export const createPost = {
  body: z
    .strictObject({
      content: z.string().min(2).max(20000).optional(),
      attachments: z.array(z.string()).max(2).optional(),

      availability: z.enum(
        Object.values(AvailabilityEnum) as [string, ...string[]]
      ).default(AvailabilityEnum.PUBLIC),

      allowComments: z.enum(
        Object.values(AllowCommentsEnum) as [string, ...string[]]
      ).default(AllowCommentsEnum.ALLOW),

      tags: z.array(z.string()).max(10).optional(),
    })
    .superRefine((data, ctx) => {
      // rule: must have either content or attachments
      if (!data.attachments?.length && !data.content) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "sorry, we cannot make a post without content or attachments",
        });
      }

      // rule: tags must be unique
      if (data.tags?.length && data.tags.length !== new Set(data.tags).size) {
        ctx.addIssue({
          code: "custom",
          path: ["tags"],
          message: "Duplicated tagged user",
        });
      }
    }),
};
export const likePost = {
    params: z.strictObject({
        postId: generalField.id,
    }),
    query: z.strictObject({
        action : z.enum(LikeActionEnum).default(LikeActionEnum.like)
    }),
}