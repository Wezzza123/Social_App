import { Schema, models, model, Document, HydratedDocument, UpdateQuery } from "mongoose";
import { BadRequestException } from "../../utils/response/error.response";
import { generateHash } from "../../utils/security/hash.security";
import { emailEvent } from "../../utils/email/emial.event";
import { TokenModel } from "./token.model";
import { TokenRepository } from "../repository/token.repository";

export enum GenderEnum {
  male = "male",
  female = "female",
}

export enum RoleEnum {
  user = "user",
  admin = "admin",
}

export enum ProviderEnum {
  system = "system",
  google = "google",
}

export interface IUser extends Document {
  _id: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  userName?: string;
  slug: string;
  email: string;
  confirmedAt?: Date;
  confirmEmailOTP?: string;
  confirmEmailSentTime?: Date;
  OTPReSendCount?: number;
  otpBlockExpiresAt?: Date;
  password: string;
  reSetPasswordOTP?: string;
  changeCredentialsTime?: Date;
  phone?: string;
  adress?: string;
  gender: GenderEnum;
  role: RoleEnum;
  createdAt: Date;
  updatedAt?: Date;
  provider: ProviderEnum;
  picture?: string;
  coverImages?: string[];
  forgetPasswordOTP?: string;
  forgetPasswordOTPExpiresAt?: Date;
  forgetPasswordCount?: number;
  forgetPasswordBlockExpiresAt?: Date;
  freezedAt?: Date;
  freezedBy?: Schema.Types.ObjectId;
  restoredAt?: Date;
  restoredBy?: Schema.Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, min: 3, max: 25 },
    lastName: { type: String, required: true, min: 3, max: 25 },
    slug: { type: String, required: true, min: 2, max: 51 },

    email: { type: String, required: true, unique: true },
    confirmedAt: { type: Date },
    confirmEmailOTP: { type: String },
    confirmEmailSentTime: { type: Date },
    OTPReSendCount: { type: Number, max: 5 },
    otpBlockExpiresAt: { type: Date },

    password: {
      type: String,
      required: function () {
        return this.provider === ProviderEnum.system;
      },
    },

    reSetPasswordOTP: { type: String },
    changeCredentialsTime: { type: Date },

    phone: { type: String },
    adress: { type: String },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.male,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.user,
    },

    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.system,
    },

    picture: { type: String },
    coverImages: { type: [String] },

    forgetPasswordOTP: { type: String },
    forgetPasswordOTPExpiresAt: { type: Date },
    forgetPasswordCount: { type: Number, min: 0, max: 5 },
    forgetPasswordBlockExpiresAt: { type: Date },

    freezedAt: { type: Date },
    freezedBy: { type: Schema.Types.ObjectId, ref: "User" },

    restoredAt: { type: Date },
    restoredBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema
  .virtual("userName")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ");
    this.set({ firstName, lastName });
  })
  .get(function (this: IUser) {
    return `${this.firstName} ${this.lastName}`;
  });
  userSchema.pre("save",
    async function(this: HUserDocument & {wasNew : boolean},next){
    this.wasNew = this.isNew || this.isModified("email") 
    console.log({
      pre_save:this,    
      password:this.isModified("password"),
      modifiedPaths: this.modifiedPaths(),
      new: this.isNew,
      directPaths: this.directModifiedPaths(),
      isdirectPaths: this.isDirectModified("extra")
  })
  if(this.isModified("password")){
    this.password = await generateHash(this.password)
  }
  next()
  })
  
  userSchema.post("save",function(doc,next){
    const that = this as HUserDocument & {wasNew : boolean}
    console.log({Post_save: this , doc , new: that.wasNew})
    if (that.wasNew){
    emailEvent.emit("confirmEmail", {to: this.email, otp:45787})
    }
    next()
  })
    userSchema.post("validate",function(doc,next){
    console.log({post_validate:this})
    next()
  })
  userSchema.pre("validate",function(next){
    console.log({pre_validate:this})
    if(!this.slug?.includes("-")){
      return next (
        new BadRequestException(
          "slug is required and must hold - like ex: any-something"
        )
      )
    }
    next()
  })
    userSchema.post(["deleteOne","findOneAndDelete"],async function(doc,next){
      const query = this.getQuery()
      const tokenModel = new TokenRepository(TokenModel)
      await tokenModel.deleteMany({filter: {userId: query._id}})
    })

  //userSchema.pre("updateOne",{document:true , query:false},function(next){
  //console.log({this: this});
   //next();
  //})
  

  //userSchema.pre("deleteOne",{document:true , query:false},function(next){
  //console.log({this: this});
   //next();
  //})

  userSchema.pre("findOne",function(next){
    console.log({this : this , query:this.getQuery()});
    next()
  })

  userSchema.pre("findOne",function(next){
    const query = this.getQuery()
    console.log({this: this , query});
    if(query.paranoid === false){
      this.setQuery({...query})
    }else{
      this.setQuery({...query, freezedAt: {$exists: false } })
    }
    next()
  })

  userSchema.pre("updateOne",async function(next){
    const query = this.getQuery()
    const update = this.getUpdate() as UpdateQuery<HUserDocument>
    if(update.freezedAt){
      this.setUpdate({...update , changeCredentialsTime: new Date()})
    }
    console.log({query,update});
    
  })
  userSchema.pre("insertMany",async function(next,docs){
    console.log({this:this,docs})
    for(const doc of docs){
      doc.password = await generateHash(doc.password)
    }
  })

  userSchema.pre(
    "save",
    async function(
      this: HUserDocument &  {wasNew:boolean, confirmEmailplainOtp?:string},
      next
    ) {
      this.wasNew= this.isNew
      if(this.isModified("password")){
this.password = await generateHash(this.password)
      }
      if(this.isModified("confirmEmailOtp")){
        this.confirmEmailplainOtp = this.confirmEmailOTP as string
        this.confirmEmailOTP =await generateHash(this.confirmEmailOTP as string)
      }
    }
  )
  
  userSchema.post(
    "save",
    async function(doc,next) {
      const that = this as HUserDocument&{
        wasNew: boolean,
        confirmEmailplainOtp?: string
      }
      if(that.wasNew && that.confirmEmailplainOtp){
        emailEvent.emit("confirmEmail",{
          to: this.email,
          otp: that.confirmEmailplainOtp
        })
      }
      next()   
    })


export const UserModel =
  models.User || model<IUser>("User", userSchema);

export type HUserDocument = HydratedDocument<IUser>;