import { Router } from "express";
import { ChatService } from "./chat.services";
import { authenticationMiddleware } from "../../middleware/authentication.middleware";
import * as validtors from "./chat.validation"
import { validation } from "../../middleware/validation.middleware";
import { fileValidation } from "../../utils/multer/cloud.multer";
import { cloudFileUpload } from "../../utils/multer/cloud.multer";

const router = Router({ mergeParams: true})
const chatService : ChatService =new ChatService()
router.get("./chat",
    authenticationMiddleware(),
    validation(validtors.getChat),
    chatService.getChat
)

router.post("./group",
    authenticationMiddleware(),
   cloudFileUpload({validation:fileValidation.image}).single("attachment"),
    validation(validtors.createChattingGroup),
    chatService.getChat
)
export default router