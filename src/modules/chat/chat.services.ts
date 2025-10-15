import { Request, Response } from "express";
import { Types } from "mongoose";
import {
  IGetChattingGroupDTO,
  IGetCreateChattingGroupDTO,
  IGetParamsDTO,
  ISayHiDto,
  ISendMessageDto,
  IGetChatQueryDTO,
  IJoinRoomDTO,
  ISendGroupMessageDTO
} from "./chat.dto";
import { succsesResponse } from "../../utils/response/success.response";
import { BadRequestException, NotFoundException } from "../../utils/response/error.response";
import { UserRepository } from "../../DataBase/repository/user.repository";
import { ChatRepository } from "../../DataBase/repository/chat.repository";
import { ChatModel } from "../../DataBase/models/chat.model";
import { UserModel } from "../../DataBase/models/user.model";
import { connectedSocket } from "../gateway";
import { uploadFiles } from "../../utils/multer/s3.config";
import { deleteFiles } from "../../utils/multer/s3.config";
import { IGetChatResponseDTO } from "./chat.dto";
 
export class ChatService {
  private userModel: UserRepository = new UserRepository(UserModel);
  private chatModel: ChatRepository = new ChatRepository(ChatModel);

  constructor() {}

  getChat = async (req: Request, res: Response): Promise<Response> => {
    const { userId } = req.params as IGetParamsDTO;
    console.log({ userId });
    return  succsesResponse({ res });
  };

  joinRoom = async({roomId,socket,io}:IJoinRoomDTO) =>{
    const chat = await this.chatModel.findOne({
        filter:{
            roomId,
            group:{$exists:true},
             participants: {$in: socket.credentials?.user._id},

        },
    })
    if(!chat){
        throw new NotFoundException("Fail ti Find matching room")
    }
    console.log({join:roomId});
    
  }
  sendGroupMessage = async({
    content,
    roomId,
    socket,
    io,
  }: ISendGroupMessageDTO ) =>{
    try {
        const createdBy = socket.credentials?.user._id as Types.ObjectId
        const chat = await this.chatModel.findOneAndUpdate({
            filter:{
          _id: Types.ObjectId.createFromHexString(groupId),
          participants: { $in: [req.user?._id as Types.ObjectId] },
          group: { $exists: true },
            },
            updataData:{
                $addToSet:{message:{content , createdBy}}
            }
        })
        if(!chat){
            throw new BadRequestException ( "fail to find matching room")
        }
          io?.to(connectedSocket.get(createdBy.toString()) ?? [])
      .emit("successMessage", { content });

        io?.to(chat.roomId as string).emit("newMessage",{
            content,
            from:socket.crdentials?.user,
            roomId,
        })
    } catch (error) {
        socket.emit("custom_error",error)
    }
  }


  getChattingGroup = async (req: Request, res: Response): Promise<Response> => {
    try {
    const { groupId } = req.params  as IGetChattingGroupDTO;
    const { page, size }: IGetChatQueryDTO = req.query as any;

      const chat = await this.chatModel.findOneChat({
        filter: {
          _id: Types.ObjectId.createFromHexString(groupId),
          participants: { $in: [req.user?._id as Types.ObjectId] },
          group: { $exists: true },
        },
        options: {
          populate: [
            {
              path: "participants",
              select: "firstname lastname email gender",
            },
          ],
        },
        page,
        size,
      });

      if (!chat) {
        throw new BadRequestException("Failed to find this chat group");
      }

      return succsesResponse<IGetChatResponse>({ res, data: { chat } });
    } catch (error) {
      throw error;
    }
  };

  createChattingGroup = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { group, participants }: IGetCreateChattingGroupDTO = req.body;

      const users = await this.userModel.find({
        filter: {
          _id: { $in: participants },
          friends: { $in: [req.user?._id as Types.ObjectId] },
        },
      });

      if (participants.length !== users.data.length) {
        throw new NotFoundException("Some or all recipients are invalid");
      }

      let group_image = "";
      if (req.file) {
      const [group_image] = await uploadFiles({
  files: [req.file as Express.Multer.File],
  path: `chat/${group}`,
});

      }

    const dbParticipants = [
  ...participants.map((id) =>
    typeof id === "string" ? new Types.ObjectId(id) : id
  ),
  req.user?._id as Types.ObjectId,
];

      const [newGroup] =
        (await this.chatModel.create({
          data: [
            {
              createdBy: req.user?._id as Types.ObjectId,
              group,
              group_image,
              messages: [],
              participants: dbParticipants,
            },
          ],
        })) || [];

      if (!newGroup) {
        if (group_image) {
          await deleteFiles({ urls: [group_image] });;
        }
        throw new BadRequestException("Failed to create this group");
      }

      return succsesResponse({
        res,
        statusCode: 201,
        data: { chat: newGroup },
      });
    } catch (error) {
      throw error;
    }
  };

  sayHi = ({ message, callback, socket }: ISayHiDto) => {
    try {
      console.log({ message });
      if (callback) callback("Be To Fe");
    } catch (error) {
      socket.emit("custom_error", error);
    }
  };

  sendMessage = async ({ content, sendTo, socket, io }: ISendMessageDto) => {
    try {
      const createdBy = socket.credentials?.user._id as unknown as Types.ObjectId;

      const user = await this.userModel.findOne({
        filter: {
          _id: Types.ObjectId.createFromHexString(sendTo),
          friends: { $in: [createdBy] },
        },
      });

      if (!user) {
        throw new NotFoundException("Invalid recipient friend");
      }

      let chat = await this.chatModel.findOneAndUpdate({
        filter: {
          participants: { $all: [createdBy, Types.ObjectId.createFromHexString(sendTo)] },
          group: { $exists: false },
        },
        updateData: {
          $addToSet: { messages: { content, createdBy } },
        },
        options:null
      });

      if (!chat) {
        const [newChat] =
          (await this.chatModel.create({
            data: [
              {
                messages: [{ content, createdBy }],
                participants: [createdBy, Types.ObjectId.createFromHexString(sendTo)],
              },
            ],
          })) || [];

        if (!newChat) {
          throw new BadRequestException("Failed to create this chat instance");
        }
        chat = newChat;
      }

  io?.to(connectedSocket.get(createdBy.toString()) ?? [])
      .emit("successMessage", { content });
   io?.to(connectedSocket.get(sendTo) ?? [])
      .emit("newMessage", { content, from: socket.credentials?.user });
    } catch (error) {
      socket.emit("custom_error", error);
    }
  };
}
