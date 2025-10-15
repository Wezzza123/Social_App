<<<<<<< HEAD
import { Controller, Get } from '@nestjs/common';
import { IUser } from 'src/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  allusers(): { message: string; data: { users: IUser[] } } {
    const users: IUser[] = this.userService.allUsers();
    return { message: 'done', data: { users } };
  }
}
=======
import { Router } from "express";
import usersService from "./user.services";
import { authenticationMiddleware,authorizationMiddleware } from "../../middleware/authentication.middleware"; 
import { cloudFileUpload, fileValidation, StorageEnum } from "../../utils/multer/cloud.multer";
import { validation } from "../../middleware/validation.middleware";
import * as usersValidation from "./user.validation";
import { endPoints } from "./user.authorization";
import { userRouter } from "..";
import { chatRouter } from "../chat";

const usersRouter = Router();
userRouter.get("/:uderID/chat", chatRouter)

usersRouter.get("/profile", authenticationMiddleware(), usersService.profile);

usersRouter.patch("/profile-picture",
    authenticationMiddleware(),
    cloudFileUpload({ validation: fileValidation.image, storageApproach: StorageEnum.memory }).single("image")
    , usersService.uploadProfilePicture);

usersRouter.delete("/profile-picture",
    authenticationMiddleware(),
    usersService.deleteProfilePicture);


usersRouter.patch("/profile-cover-images",
    authenticationMiddleware(),
    cloudFileUpload({ validation: fileValidation.image, storageApproach: StorageEnum.disk }).array("images", 2)
    , usersService.uploadCoverImages);


usersRouter.delete("/cover-images",
    authenticationMiddleware(),
    usersService.deleteCoverImages);

usersRouter.delete("/freez/{:userId}",
    authorizationMiddleware(endPoints.freezAccount),
    validation(usersValidation.freezAccount),
    usersService.freezAccount);

usersRouter.delete("/delete/{:userId}",
    authorizationMiddleware(endPoints.freezAccount),
    validation(usersValidation.deleteAccount),
    usersService.deleteAccount);

export default usersRouter;
>>>>>>> 5ec0679869509976f91dccdd2b87daf15fc12453
