import express, { type Request, type Response, type Express, NextFunction } from "express";
import { config } from "dotenv";
import { resolve } from "path";
import cors from "cors";
import helmet from "helmet";
import {rateLimit} from "express-rate-limit"
import authcontroller from './modules/auth/auth.controller.js'
import { globalErrorHandling } from "./utils/response/error.response.js";
config({ path: resolve("./config/.env.development") });

const limiter = rateLimit({
    windowMs: 60 * 60000, 
    max: 2000,
    message: "Too many requests please try again later",
    statusCode: 429
});

const bootstrap = (): void => { 
   const app: Express = express();
   const port: number | string = process.env.PORT || 5000;

   app.use(cors(), express.json(), helmet(), limiter);

   app.get("/", (req: Request, res: Response) => {
       res.json({ message: `Welcome to ${process.env.APPLICATION_NAME} backend` });
   });



app.use("/auth",authcontroller)

app.use("{*/dummy}",(req:Request,res:Response,next:NextFunction)=>{
    res.json({message:"In-valid app routing"})
})

app.use(globalErrorHandling)
  
   app.listen(port, () => {
       console.log(`Server is running ON PORT :::${port}`);
   });
}

export default bootstrap;
