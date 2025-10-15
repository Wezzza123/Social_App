<<<<<<< HEAD
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
=======
``// Import Express And Express Types
import express from "express";
import type { Request, Response } from "express";

// Import Third Party Middleware
import cors from "cors"
import { rateLimit } from "express-rate-limit";
import helmet from "helmet"

// Setup Env Config
import { resolve } from "node:path";
import { config } from "dotenv";
config({ path: resolve("./config/.env.development") });

// Import Modules Routers
import{userRouter , authRouter, postRouter} from './modules'

import { BadRequestException, glopalErrorHandler } from "./utils/response/error.response";
import { connectDB } from "./DataBase/db.connection";
import { HUserDocument, UserModel } from "./DataBase/models/user.model";
import { intializeIo } from "./modules/gateway/gateway";
import { chatRouter } from "./modules/chat";


// App Start Point
export default async function bootstrap(): Promise<void> {

    const app = express();
    const port: Number | String = process.env.PORT || 5000;

    // Third Party MiddleWares

    app.use(cors());

    app.use(helmet());

    const limiter = rateLimit({
        windowMs: 60 * 6000,
        limit: 2000,
        message: { error: "Too Many Requests , Try Again Later" },
        statusCode: 429
    });
    app.use(limiter);

    app.use(express.json());

    // DataBase
    await connectDB();


    // Hooks
async function test() {
    try {
        const user = new UserModel({
        username:"moaz raslan",
        email:`${Date.now()}@gmail.com`,
        password:"456585"
        });
        await user.save({validateBeforeSave:true})
        user.lastname="lo l lol"
        user.email="gdsgadja6646@gmail.com"
        await user.save()
        //const userModel= new UserRepository(UserModel)
        //const user = await userModel.findOne({filter: {}}) as HUserDocument
        //await user.updateOne({})
        
        //const userModel= new UserRepository(UserModel)
        //const user = await userModel.findOne({filter: {}}) as HUserDocument
        //await user.deleteOne({})

        
        //const userModel= new UserRepository(UserModel)
        //const user = await userModel.findOne({filter: {}, select:"extra"}) a
        //await user?.save()
        
        //const userModel= new UserRepository(UserModel)
        //const user = (await userModel.findOne({
       // filter: {gender:GenderEnum.female, paranoid:false},
    //})) as HUserDocument
    //console.log({result:user});


    //const userModel = new (UserModel)
    //const user = await userModel.findByIdAndUpdate({
   // id:"456dgdhshd7846ehe" as unknown asTypes.ObjectId,
   //update:{
    //freezedAt: newDate()
    //console.log({result:user});
   //}})


    //const userModel = new (UserModel)
    //const user = await userModel.deleteOne({
   // filte:{
// id:"434fdfe67shd7846ehe" as unknown asTypes.ObjectId,
  //  })
    //console.log({result:user});
   //}
    
   
   
   
    //const userModel = new (UserModel)
    //const user = await userModel.findOneAndDelete({
   // filte:{
// id:"434fdfe67shd7846ehe" as unknown asTypes.ObjectId,
  //  })
    //console.log({result:user});
   //}
   
  //const userModel= new UserRepository(UserModel)  
//const user = await userModel.insertMany({
    //data:{
      //  username: "moaz raslan",
    //    email: `${data.now()}@gmail.com`,
  //      password:"4534563"
 //   }
//})

    



    } catch (error) {
        console.error(error);
    }
}


    // AppLcation Routing 

    // Main Router
    app.get("/", (req: Request, res: Response): Response => {
        return res.json({
            message: "Welcome To LinkSphere BackEnd API",
            info: "LinkSphere is a social networking application that connects people, enables sharing posts, and fosters meaningful interactions in a modern digital community.",
            about: "This APP Created By Dev:Adham Zain @2025",
        })
    })

    // Authentacition Router
    app.use("/auth", authRouter);

    // Users Router
    app.use("/users", userRouter);
    app.use("/post", postRouter)
    app.use("./chat", chatRouter)


    // Glopal Error Handler
    app.use(glopalErrorHandler)



    // 404 Router 
    app.all("{*dummy}", (req: Request, res: Response) => {
        res.status(404).json({
            message: "Page Not Found",
            info: "Plase Check Your Method And URL Path",
            method: req.method,
            path: req.path
        })
    });

    

// start HTTP server
const httpServer = app.listen(port, () => {
  console.log("===================================");
  console.log(`🚀 server is running on port ${port}`);
  console.log("===================================");
});

intializeIo(httpServer)



>>>>>>> 5ec0679869509976f91dccdd2b87daf15fc12453
}
