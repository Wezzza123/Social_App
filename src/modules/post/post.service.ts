import { Request, Response } from "express";
import { succsesResponse } from "../../utils/response/success.response";
import { UserRepository } from "../../DataBase/repository";
import { UserModel } from "../../DataBase/models/user.model";
import { PostModel, IPost, HPostDocument, LikeActionEnum } from "../../DataBase/models/post.model";
import { NotFoundException, BadRequestException } from "../../utils/response/error.response";
import { uploadFiles } from "../../utils/multer/s3.config";
import { v4 as uuid } from "uuid";
import { UpdateQuery } from "mongoose";
import { LikePostQueryInputDto } from "./post.dto";


class PostService {
  private userModel = new UserRepository(UserModel);
  private postModel = new UserRepository(PostModel);

  constructor() {}

  createPost = async (req: Request, res: Response): Promise<Response> => {
    // validate tags
    if (
      req.body.tags?.length &&
      (
        await this.userModel.find({
          filter: { _id: { $in: req.body.tags } },
        })
      ).data.length !== req.body.tags.length
    ) {
      throw new NotFoundException("some of the mentioned users are not exist");
    }

    // handle file uploads
    let attachments: string[] = [];
    let assestsFolderID: string = uuid();

    if (req.files?.length) {
      attachments = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${req.user?._id}/post/${assestsFolderID}`,
      });
    }

    // create post
    const [post] =
      (await this.postModel.create({
        data: [
          {
            ...req.body,
            attachments,
            assestsFolderID,
            createdBy: req.user?._id,
          },
        ],
      })) || [];

    if (!post) {
      if (attachments.length) {
        throw new BadRequestException("fail to create this post");
      }
    }

    return succsesResponse({ res, statusCode: 201 });
  };


likePost = async (req: Request, res: Response): Promise<Response> => {
  const { postId } = req.params as { postId: string };
  const { action } = req.query as LikePostQueryInputDto;

  let updateData: UpdateQuery<HPostDocument> = {
    $addToSet: { likes: req.user?._id },
  };

  if (action === LikeActionEnum.unlike) {
    updateData = { $pull: { likes: req.user?._id } };
  }

  const post = await this.postModel.findOneAndUpdate({
    filter: { _id: postId },
    updateData, 
     options: { new: true }
    
  });

  if (!post) {
    throw new NotFoundException("invalid postId or post does not exist");
  }

  return succsesResponse({ res, statusCode: 201, data: post });
};
}



export default new PostService();
