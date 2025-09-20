import { HydratedDocument, Types, Schema, model } from "mongoose";

export enum AllowCommentsEnum {
  ALLOW = "ALLOW",
  DENY = "DENY",
}

export enum AvailabilityEnum {
  PUBLIC = "PUBLIC",
  FRIENDS = "FRIENDS",
  ONLY_ME = "ONLY-ME",
}

export enum LikeActionEnum{
    like ="LIKE",
    unlike = "UNLIKE",
}

export interface IPost {
  content?: string;
  attachments?: string[];
  assestsFolderID?: string;

  allowComments: AllowCommentsEnum;
  availability: AvailabilityEnum;

  likes?: Types.ObjectId[];
  tags?: Types.ObjectId[];

  createdBy: Types.ObjectId;

  freezedAt?: Date;
  freezedBy?: Types.ObjectId;

  restoredAt?: Date;
  restoredBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export type HPostDocument = HydratedDocument<IPost>;

const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      minlength: 2,
      maxlength: 20000,
      required: function () {
        return !(this as IPost).attachments?.length;
      },
    },
    attachments: [String],
    assestsFolderID: { type: String, required: true },

    availability: {
      type: String,
      enum: Object.values(AvailabilityEnum),
      default: AvailabilityEnum.PUBLIC,
    },
    allowComments: {
      type: String,
      enum: Object.values(AllowCommentsEnum),
      default: AllowCommentsEnum.ALLOW,
    },

    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: Schema.Types.ObjectId, ref: "User" }],

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    freezedAt: Date,
    freezedBy: { type: Schema.Types.ObjectId, ref: "User" },

    restoredAt: Date,
    restoredBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export const PostModel = model<IPost>("Post", postSchema);
