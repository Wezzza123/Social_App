import { Router } from "express";
import postService from "./post.service";
import { authenticationMiddleware } from "../../middleware/authentication.middleware";
import { cloudFileUpload , fileValidation } from "../../utils/multer/cloud.multer";
import { validation } from "../../middleware/validation.middleware";
import * as validators from './post.validation'
const router = Router()

router.post("/",
    cloudFileUpload({validation:fileValidation.image}).array("attachment,2"),
    validation(validators.createPost),
    postService.createPost)

router.patch(
  "/:postId/like",
  authenticationMiddleware(),
  validation(validators.likePost), 
  postService.likePost
);

export default router