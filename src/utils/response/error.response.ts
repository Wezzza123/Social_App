import { NextFunction,Request,Response } from "express";

export interface IError extends Error {
    statuscode :number
}
export class ApplicationException extends Error {
    constructor(
        message:string,
        public statuscode : Number = 400,
        cause ?: unknown

    ){
        super(message, {cause})
        this.name =this.constructor.name
        Error.captureStackTrace(this,this.constructor)
    }
}

export class BadRequestException extends ApplicationException  {
    constructor(message:string ,cause ?: unknown){
        super(message,400,cause)
    }
}

export class NotfoundException extends ApplicationException  {
    constructor(message:string ,cause ?: unknown){
        super(message,404,cause)
    }
}
export const globalErrorHandling= (
    error:IError,
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    return res.status(error.statuscode|| 500).json({
        err_message:error.message||"something went wrong",
          stack: process.env.MODE === "development" ? error.stack : undefined,
        error
    })
}