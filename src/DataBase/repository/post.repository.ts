import { Model } from "mongoose";
import { IPost as TDocument } from "../models/post.model";
import { DataBaseRepository } from "./database.repository";

export class PostRepository extends DataBaseRepository<TDocument>{

    constructor(protected override readonly model:Model<TDocument>){
        super(model)
    }
}