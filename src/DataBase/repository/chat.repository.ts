import {
  Model,
  PopulateOptions,
  RootFilterQuery,
  UpdateQuery,
  QueryOptions,
  HydratedDocument,
  LeanDocument,
} from "mongoose";

import { IChat as TDocument } from "../models/chat.model";
import { DataBaseRepository } from "./database.repository";

export class ChatRepository extends DataBaseRepository<TDocument> {
  constructor(protected override readonly model: Model<TDocument>) {
    super(model);
  }

  async findOneChat({
    filter,
    options,
    select,
    page = 1,
    size = 5,
  }: {
    filter: RootFilterQuery<TDocument>;
    updateData?: UpdateQuery<TDocument>;
    options?: QueryOptions<TDocument> & { populate?: PopulateOptions[]; lean?: boolean };
    select?: string;
    page?: number | undefined;
    size?: number | undefined;
  }): Promise<HydratedDocument<TDocument> | LeanDocument<TDocument> | null> {
    const doc = this.model
      .findOne(filter, { messages: { $slice: [-(page * size), size] } })
      .select(select || "");

    if (options?.populate) {
      doc.populate(options.populate);
    }

    if (options?.lean) {
      doc.lean(options.lean);
    }

    return await doc.exec();
  }
}
