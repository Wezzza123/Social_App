import { IAuthSocket } from "../gateway";
import { Server } from "socket.io";
import { ChatService } from "./chat.services";




export class ChatEvent {
    private chatService: ChatService =new ChatService()
    constructor(){}

    sayHi= (socket:IAuthSocket,io:Server)=>{
 return socket.on("sayHi",(message:string , callback) => {
    return this.chatService.sayHi({ message, socket, callback, io }) 
})
}
  sendMessage= (socket:IAuthSocket,io:Server)=>{
 return socket.on("sendMessage",(data : {content : string; sendTo : any }) => {
    return this.chatService.sendMessage({ ...data , socket , io }) 
})
}
  joinRoom= (socket:IAuthSocket,io:Server)=>{
 return socket.on("join_room",(data : {roomId:string}) => {
    return this.chatService.joinRoom({ ...data , socket , io }) 
})
}
  sendGRoupMessage= (socket:IAuthSocket,io:Server)=>{
 return socket.on("sendGroupMessage",(data : {content:string , groupId:string}) => {
    return this.chatService.sendGroupMessage({ ...data , socket , io }) 
})
}

}