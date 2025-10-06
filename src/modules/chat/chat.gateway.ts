import { IAuthSocket } from "../gateway";
import { Server } from "socket.io";
import { ChatEvent } from "./chat.event";

export class ChatGateway {
    private chatEvent : ChatEvent = new ChatEvent()
    constructor(){}
    register = (socket: IAuthSocket, io: Server) =>{
       this.chatEvent.sayHi(socket , io)
       this.chatEvent.sendMessage(socket , io)
    }
}