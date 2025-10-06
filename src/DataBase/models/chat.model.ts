import { HydratedDocument, Types, Schema, model, models } from "mongoose";

export interface IMessage {
    content: string;
    createdBy: Types.ObjectId;

    createdAt?: Date;
    updatedAt?: Date;
}

export interface IChat {
    participants: Types.ObjectId[];
    messages: IMessage[];

    group?: string;
    group_image?: string;
    roomId?: string;

    createdBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export type HChatDocument = HydratedDocument<IChat>;

// Message Schema
const messageSchema = new Schema<IMessage>(
    {
        content: { type: String, minlength: 2, maxlength: 5000, required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

// Chat Schema
const chatSchema = new Schema<IChat>(
    {
        participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        group: { type: String },
        group_image: { type: String },
        roomId: {
            type: String,
            required: function () {
                return !!this.roomId;
            },
        },
        messages: [messageSchema],
    },
    { timestamps: true }
);

// Chat Model
export const ChatModel = models.Chat || model<IChat>("Chat", chatSchema);
