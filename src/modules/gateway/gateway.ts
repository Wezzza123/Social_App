import{Server as HttpServer} from "node:http"
import { Socket, Server } from "socket.io";
import { TokenTypeEnum } from "../../utils/security/token.security";
import { IAuthSocket } from "./gateway.interface";
import { ChatGateway } from "../chat";
import { BadRequestException } from "../../utils/response/error.response";


 export const connectedSocket = new Map<string, string>()

let io: undefined | Server = undefined

export const intializeIo= (httpServer: HttpServer)=>{
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });
    io.use(async(socket:IAuthSocket,next)=>{
        try {
            const{user,decoded} = await decodeToken({
                authrization: socket.handshake?.auth.authorization || "",
                tokenType:TokenTypeEnum.accses,
            })
            connectedSocket.set(user._id.toString(), socket.id)
            socket.data.credentials = {user , decoded}
            next()
        } catch (error:any) {
            next(error)
        }
    })

    function disconnection(socket: IAuthSocket){
        return   socket.on("disconnect",()=>{
        const userId = socket.credentials?.user._id?.toString() as string
      connectedSocket.delete(userId)
        getIo().emit("offline_user",userId) 
        console.log(`logout from ::: ${socket.id}`);
        console.log({ connectedSocket});
          
      }) 
    }
    const chatGateway : ChatGateway = new ChatGateway()
    io.on("connection", (socket: IAuthSocket) => {
       chatGateway.register(socket, getIo())      
         disconnection(socket)
    
    })
    
    
    
    
    }
    export const getIo= (): Server => {
      if(!io){
        throw new BadRequestException("Fail to stablish server socket Io")
      }
      return io
    }

