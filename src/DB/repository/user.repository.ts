import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";


@Injectable()
export class UserRepository extends DatabaseRepository<TDocument> {
    constructor(@InjectModel(User.name) protected override readonly model:Model)
       super(model)
}