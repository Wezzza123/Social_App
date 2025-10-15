/* eslint-disable @typescript-eslint/no-unsafe-call */
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GenderEnum, providerEnum } from 'src/common';
import { generateHash } from 'src/common/utilis/security/hash.security';

@Schema({
  strictQuery: true,
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class User {
  @Prop({
    type: String,
    minLength: 2,
    maxLength: 25,
    trim: true,
  })
  firstname: string;

  @Prop({
    type: String,
    minLength: 2,
    maxLength: 25,
    trim: true,
  })
  lastname: string;

  // Virtual fields لازم تتعامل في الـ schema مباشرة، هنشيل دي دلوقتي ونضيفها بعدين

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
  })
  password: string;

  @Prop({ type: String, enum: providerEnum, default: providerEnum.GOOGLE })
  provider: providerEnum;

  @Prop({ type: String, enum: GenderEnum, default: GenderEnum.male })
  gender: GenderEnum;

  @Prop({
    type: Date,
    required: true,
  })
  changeCredentialsTime: Date;
}

// النوع بعد التعريف
export type UserDocument = HydratedDocument<User>;

// إنشاء السكيمة
const userSchema = SchemaFactory.createForClass(User);

// تعريف الفيرتشوال بشكل صحيح (مش من خلال ديكوريتر)
userSchema
  .virtual('username')
  .get(function (this: UserDocument) {
    return `${this.firstname} ${this.lastname}`;
  })
  .set(function (this: UserDocument, value: string) {
    const [firstname, lastname] = value.split(' ');
    if (firstname) this.firstname = firstname;
    if (lastname) this.lastname = lastname;
  });

userSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password')) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.password = await generateHash(this.password);
  }
  next();
});

export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: userSchema },
]);
