import { JwtPayload } from "jsonwebtoken"
import { Socket } from "socket.io"
import { HUserDocument } from "../../DataBase/models/user.model"


export interface IAuthSocket extends Socket{
  credentials?:{
    user:Partial<HUserDocument>
    decoded: JwtPayload
  }
}