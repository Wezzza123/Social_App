import {z} from 'zod'
import {IAuthSocket} from "../gateway"
import { Server } from 'socket.io'
import { createChattingGroup, getChat, getChattingGroup } from './chat.validation'

export type IGetParamsDTO = z.infer<typeof getChat.params>
export type IGetChatQueryDTO = z.infer<typeof getChat.query>
export type IGetCreateChattingGroupDTO = z.infer<typeof createChattingGroup.body>
export type IGetChattingGroupDTO = z.infer<typeof getChattingGroup.params>


export interface IMainDTO{
    socket: IAuthSocket
    callback?:any
    io:Server
}

export interface ISayHiDto extends IMainDTO{
    message:string
}
export interface ISendMessageDto extends IMainDTO{
    content : string 
    sendTo : string
}
export interface IGetChatResponseDTO extends IMainDTO {
  chat: any;
}
export interface IJoinRoomDTO extends IMainDTO {
    roomId:string
}
export interface ISendGroupMessageDTO extends IMainDTO {
    roomId:string
    content:string
}