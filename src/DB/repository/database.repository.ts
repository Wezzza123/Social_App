import { NotFoundException } from '@nestjs/common';
import type {
  QueryOptions,
  CreateOptions,
  FilterQuery,
  FlattenMaps,
  HydratedDocument,
  Model,
  ProjectionType,
  RootFilterQuery,
  UpdateQuery,
  Types,
  DeleteResult,
} from 'mongoose';

export type Lean<T> = FlattenMaps<T>;

export abstract class DatabaseRepository<TDocument> {
  protected constructor(protected model: Model<TDocument>) {}

  async create({
    data,
    options,
  }: {
    data: Partial<TDocument>[];
    options?: CreateOptions;
  }): Promise<HydratedDocument<TDocument>[] | undefined> {
    return await this.model.create(data, options);
  }

  async insertMany({
    data,
  }: {
    data: Partial<TDocument>[];
  }): Promise<HydratedDocument<TDocument>[]> {
    return (await this.model.insertMany(data)) as HydratedDocument<TDocument>[];
  }

  async findOne({
    filter,
    select,
    options,
  }: {
    filter?: RootFilterQuery<TDocument>;
    select?: ProjectionType<TDocument> | null;
    options?: QueryOptions<TDocument> | null;
  }): Promise<
    | HydratedDocument<FlattenMaps<TDocument>>
    | HydratedDocument<TDocument>
    | null
  > {
    const doc = this.model.findOne(filter).select(select || '');
    if (options?.lean) {
      doc.lean(options.lean);
    }
    return await doc.exec();
  }

  async findById({
    id,
    select,
    options,
  }: {
    id: Types.ObjectId;
    select?: ProjectionType<TDocument> | null;
    options?: QueryOptions<TDocument> | null;
  }): Promise<
    | HydratedDocument<FlattenMaps<TDocument>>
    | HydratedDocument<TDocument>
    | null
  > {
    const doc = this.model.findById(id).select(select || '');
    if (options?.lean) {
      doc.lean(options.lean);
    }
    return await doc.exec();
  }

  async find({
    filter = {},
    projection = null,
    options = {},
    page = 1,
    limit = 10,
    sort = {},
  }: {
    filter?: FilterQuery<TDocument>;
    projection?: ProjectionType<TDocument> | null;
    options?: QueryOptions;
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
  }) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.model
        .find(filter, projection, {
          ...options,
          skip,
          limit,
          sort,
        })
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateOne(
    filter: FilterQuery<TDocument>,
    updateData: UpdateQuery<TDocument>,
    options: QueryOptions = { new: true },
  ): Promise<HydratedDocument<TDocument>> {
    const updatedDoc = await this.model
      .findOneAndUpdate(
        filter,
        {
          ...updateData,
          $inc: { __v: 1 },
        },
        options,
      )
      .exec();

    if (!updatedDoc) {
      throw new NotFoundException('Document not found');
    }

    return updatedDoc;
  }

  async findOneAndUpdate({
    filter,
    updateData,
    options = { new: true },
  }: {
    filter: RootFilterQuery<TDocument>;
    updateData: UpdateQuery<TDocument>;
    options: QueryOptions<TDocument> | null;
  }): Promise<HydratedDocument<TDocument> | Lean<TDocument> | null> {
    const updatedDoc = await this.model.findOneAndUpdate(
      filter,
      {
        ...updateData,
        $inc: { __v: 1 },
      },
      options,
    );

    return updatedDoc;
  }

  async updateMany(
    filter: FilterQuery<TDocument>,
    updateData: UpdateQuery<TDocument>,
    options: QueryOptions,
  ) {
    return this.model.updateMany(filter, updateData,options).exec();
  }

  async findOneAndDelete({
    filter,
  }: {
    filter: RootFilterQuery<TDocument>;
  }): Promise<HydratedDocument<TDocument> | null> {
    return this.model.findOneAndDelete(filter);
  }

  async deleteOne({
    filter,
  }: {
    filter: RootFilterQuery<TDocument>;
  }): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }

  async deleteMany({
    filter,
  }: {
    filter: RootFilterQuery<TDocument>;
  }): Promise<DeleteResult> {
    return this.model.deleteMany(filter);
  }
}
