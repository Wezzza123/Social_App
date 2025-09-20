import type { NextFunction, Request, Response } from "express"
import type {
    I_ConfirmEmailInputs,
    I_loginBodyInputs,
    I_ReSendConfirmEmailIOTPInputs,
    I_SignupBodyInputs,
    IChangeForgetPassword,
    IChangePassword,
    IForgetPassword,
    ILogout,
    IResendForgetPasswordOTP,
    ISignupWithGmail
} from "./auth.dto";
import { UserRepository } from "../../DataBase/repository";
import { HUserDocument, ProviderEnum, UserModel } from "../../DataBase/models/user.model";
import { ApplicationException, BadRequestException, ConflictException, NotFoundException } from "../../utils/response/error.response";
import { compareHash, generateHash } from "../../utils/security/hash.security";
import { emailEvent } from "../../utils/email/emial.event";
import { generateNumberOtp } from "../../utils/security/otp";
import { LogoutFlagEnum, TokenService } from "../../utils/security/token.security";
import { JwtPayload } from "jsonwebtoken";
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { UpdateQuery } from "mongoose";
import { succsesResponse } from "../../utils/response/success.response"; 

class AuthenticationServices {

    private userModel = new UserRepository(UserModel);
    private tokenService = new TokenService;

    constructor() { }


    private verifyGmailAccount = async (idToken: string): Promise<TokenPayload> => {

        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.WEB_CLIENT_ID as string,
        });
        const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new BadRequestException("Fail To Verify This Account")
        }
        return payload;
    }

    signup = async (req: Request, res: Response): Promise<Response> => {

        let { userName, email, password, gender, phone }: I_SignupBodyInputs = req.body.validData;


        const userExsist = await this.userModel.findOne({
            filter: { email }, select: "_id userName email", options: { lean: true }
        })

        if (userExsist) {
            throw new ConflictException("Email Alredy Exsists Try To Login", userExsist)
        }

        const OTPCode = generateNumberOtp();

        await this.userModel.createUser({
            data: [{
                userName,
                email,
                password,
                gender,
                confirmEmailOTP: `${OTPCode.toString()}`,
                confirmEmailSentTime: new Date(),
                ...(phone ? { phone } : {})
            }]
        })

        emailEvent.emit("confirmEmail", { to: email, OTPCode })

        return succsesResponse({
            res,
            statusCode: 201,
            info: "We Sent A Confirm OTP To Your Email , Please Confirm It To Login"
        })

    }

    confirmEmail = async (req: Request, res: Response): Promise<Response> => {

        const { email, OTP }: I_ConfirmEmailInputs = req.body.validData;

        const user = await this.userModel.findOne({
            filter: { email },
        })

        if (!user) {
            throw new NotFoundException("Email Is Not Exsist")
        }

        if (user.confirmedAt) {
            throw new BadRequestException("This Email Is Already Confirmed");
        }

        if (!user.confirmEmailSentTime || !user.confirmEmailOTP) {
            throw new NotFoundException("OTP Not Found Or Not Sent For This Email");
        }

        const sentAt: Date = user.confirmEmailSentTime
        const expiresAt = new Date(sentAt.getTime() + 5 * 60 * 1000);
        if (new Date() > expiresAt) {
            throw new BadRequestException("OTP Code Has Expired");
        }

        if (! await compareHash(OTP, user.confirmEmailOTP as string)) {
            throw new BadRequestException("Invalid OTP Number")
        }


        await this.userModel.updateOne({
            email
        }, {
            $set: {
                confirmedAt: new Date(),
            },
            $unset: {
                confirmEmailOTP: true,
                confirmEmailSentTime: true,
                OTPReSendCount: true,
                otpBlockExpiresAt: true
            },
        })

        return succsesResponse({
            res,
            info: "Email Confirmed Succses",
        })

    }

    reSendConfirmOTP = async (req: Request, res: Response): Promise<Response> => {

        const { email }: I_ReSendConfirmEmailIOTPInputs = req.body.validData;

        let user = await this.userModel.findOne({
            filter: { email },
        })

        // الأكونت مش موجود يا بلدينا
        if (!user) {
            throw new NotFoundException("User Not Found")
        }

        // جاي تأكتف أكونت أوريدي متأكتف !! طب اقنعني ازاي
        if (user.confirmedAt) {
            throw new BadRequestException("This Account Already Confirmed Before");
        }

        //  لسة مش واخد بلوك بس وصل الحد الاقصى
        if (!user.otpBlockExpiresAt && user.OTPReSendCount === 5) {
            await this.userModel.updateOne({ email }, {
                otpBlockExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
                OTPReSendCount: user.OTPReSendCount
            })
            throw new BadRequestException("Max 5 Attempts Reached. Try Again In 10 Minutes.");
        }

        // واخد بلوك
        if (user.otpBlockExpiresAt) {

            // لسة واخد بلوك
            if (user.otpBlockExpiresAt > new Date()) {
                throw new BadRequestException("Maximum attempts reached. Please try again later.");
            }

            // نفك البلوك عشان الوقت خلص
            else {
                user = await this.userModel.updateOne({ email }, {
                    $unset: { otpBlockExpiresAt: 1 },
                    OTPReSendCount: 0
                })
            }
        }

        const OTPCode: string = generateNumberOtp().toString();
        await this.userModel.updateOne({ email }, {
            OTPReSendCount: user.OTPReSendCount ? user.OTPReSendCount + 1 : 1,
            confirmEmailOTP: await generateHash(OTPCode),
            confirmEmailSentTime: new Date()
        })

        emailEvent.emit("confirmEmail", { to: email, OTPCode });


        return succsesResponse({
            res,
            statusCode: 200,
            info: "Email Confirmed Succses"
        })


    }

    loginWithGmail = async (req: Request, res: Response): Promise<Response> => {

        const { idToken }: ISignupWithGmail = req.body.validData

        const { email }: TokenPayload = await this.verifyGmailAccount(idToken)

        const user = await this.userModel.findOne({
            filter: {
                email,
                provider: ProviderEnum.google
            }
        })

        if (!user) {
            throw new NotFoundException("Not Registerd Account Or Registerd With Another Provider");
        }


        const credentials = await this.tokenService.createLoginCredentials(user)


        return succsesResponse({
            res,
            info: "login Succses",
            data: { credentials }
        })


    }

    signupWithGmail = async (req: Request, res: Response): Promise<Response> => {

        const { idToken }: ISignupWithGmail = req.body.validData

        const { email, name, picture }: TokenPayload = await this.verifyGmailAccount(idToken)

        const user = await this.userModel.findOne({
            filter: {
                email
            }
        })

        if (user) {
            if (user.provider === ProviderEnum.system) {
                return await this.loginWithGmail(req, res)
            }
            throw new ConflictException("Invalid Provider", { userProvider: user.provider })
        }

        const [newUser] = await this.userModel.create({
            data: [{
                userName: name as string,
                email: email as string,
                picture: picture as string,
                confirmedAt: new Date()
            }]
        }) || [];


        if (!newUser) {
            throw new BadRequestException("Fail To Signup")
        }

        const credentials = await this.tokenService.createLoginCredentials(newUser)

        return succsesResponse({
            res,
            info: "Signup Succses",
            data: { credentials }
        })


    }

    login = async (req: Request, res: Response): Promise<Response> => {

        const { email, password }: I_loginBodyInputs = req.body.validData;

        const user = await this.userModel.findOne({
            filter: {
                email
            },
            select: { email: 1, password: 1, confirmedAt: 1, role: 1 }
        })

        if (!user) {
            throw new NotFoundException("User Not Found Try To Signup");
        }

        if (!user.confirmedAt) {
            throw new BadRequestException("Confirm Your Email To Login")
        }

        if (user.freezedAt) {
            throw new NotFoundException("User Not Found")
        }
        if (!user.password) {
    throw new BadRequestException("Password not found for this user");
}

        const compare: boolean = await compareHash(password, user.password);

        if (!compare) {
            throw new BadRequestException("Invalid Email Or Password");
        }

        const credentials = await this.tokenService.createLoginCredentials(user);

        return succsesResponse({
            res,
            info: "Login Succses",
            data: { credentials }
        })

    }

    logout = async (req: Request, res: Response): Promise<Response> => {

        const { logoutFlag }: ILogout = req.body.validData;


        if (logoutFlag === LogoutFlagEnum.all) {

            await this.userModel.updateOne({
                _id: req.user?._id
            },
                {
                    changeCredentialsTime: new Date()
                })

        }

        else {
            await this.tokenService.createRevokeToken(req.tokenDecoded as JwtPayload);
        }



        return succsesResponse({
            res,
            info: "Logout Succses",
        })

    }

    refreshToken = async (req: Request, res: Response): Promise<Response> => {

        const credentials = await this.tokenService.createLoginCredentials(req.user as HUserDocument)

        await this.tokenService.createRevokeToken(req.tokenDecoded as JwtPayload);

        return succsesResponse({
            res,
            data: { credentials }
        })

    }

    changePassword = async (req: Request, res: Response): Promise<Response> => {


        const { _id, email, password } = req.user as HUserDocument;
        const { oldPassword, newPassword }: IChangePassword = req.body


    if (!password) {
        throw new BadRequestException("No password found for this account");
    }
        if (!await compareHash(oldPassword, password)) {
            throw new BadRequestException("Invalid Old Password")
        }

        const OTPCode = generateNumberOtp();
        emailEvent.emit("changePassword", { to: email, OTPCode })


        await this.userModel.updateOne({
            _id
        }, {
            password: await generateHash(newPassword)
        })



        return succsesResponse({
            res,
            info: "Your Password Changed Succses"
        })



    }

    forgetPassword = async (req: Request, res: Response): Promise<Response> => {

        const { email }: IForgetPassword = req.body.validData;
        const user = await this.userModel.findOne({
            filter: {
                email,
            }
        })

        if (!user) {
            throw new NotFoundException("User Not Exists")
        }
        if (user.provider === ProviderEnum.google) {
            throw new ConflictException("Invalid Provider", { userProvider: user.provider })
        }
        if (!user.confirmedAt) {
            throw new BadRequestException("Account Not Confirmed");
        }

        if (user.forgetPasswordCount) {
            throw new BadRequestException("Use EndPoint : [Re send Forget Password OTP]");
        }

        const OTPCode = generateNumberOtp();
        await this.userModel.updateOne({ email }, {
            forgetPasswordOTP: await generateHash(OTPCode.toString()),
            forgetPasswordOTPExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
            forgetPasswordCount: user.forgetPasswordCount ? user.forgetPasswordCount + 1 : 1
        })

        emailEvent.emit("forgetPassword", { to: email, OTPCode })



        return succsesResponse({
            res,
            info: "Password reset code has been sent to your registered email"
        })

    }

    reSendForgetPasswordOTP = async (req: Request, res: Response): Promise<Response> => {

        const { email }: IResendForgetPasswordOTP = req.body.validData;

        const user = await this.userModel.findOne({
            filter: { email }
        })
        if (!user) {
            throw new NotFoundException("User Not Exists")
        }
        if (user.provider === ProviderEnum.google) {
            throw new ConflictException("Invalid Provider", { userProvider: user.provider })
        }
        if (!user.confirmedAt) {
            throw new BadRequestException("Account Not Confirmed");
        }
        const OTPCode = generateNumberOtp();

        let data: UpdateQuery<HUserDocument> = {};

        // وصل الحد الأقصى بس مخدش بلوك
        if (!user.forgetPasswordBlockExpiresAt && user.forgetPasswordCount === 4) {

            // نديله بلوك ونبعتله الكود للمرة الاخيرة
            data = {
                forgetPasswordOTP: await generateHash(OTPCode.toString()),
                forgetPasswordOTPExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
                forgetPasswordCount: 5,
                forgetPasswordBlockExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            }
        }

        // واخد بلوك
        if (user.forgetPasswordBlockExpiresAt) {
            // وقت البلوك خلص
            if (user.forgetPasswordBlockExpiresAt.getTime() <= Date.now()) {

                // نفك البلوك ونرجع العداد لـ 1

                data = {
                    forgetPasswordOTP: await generateHash(OTPCode.toString()),
                    forgetPasswordOTPExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
                    forgetPasswordCount: 1,
                    $unset: { forgetPasswordBlockExpiresAt: 1 }
                }

            }

            else {
                // لسة وقت البلوك مخلصش
                throw new BadRequestException("Blocked For 10 Munits")
            }

        }

        // لسة الدنيا تمام كمل زي ما انت
        if (user.forgetPasswordCount && user.forgetPasswordCount < 4) {
            data = {
                forgetPasswordOTP: await generateHash(OTPCode.toString()),
                forgetPasswordOTPExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
                forgetPasswordCount: user.forgetPasswordCount ? user.forgetPasswordCount + 1 : 1,
            }
        }

        await this.userModel.updateOne({ email }, data)
        emailEvent.emit("forgetPassword", { to: email, OTPCode })

        return succsesResponse({
            res,
            info: "A new password reset code has been sent to your registered email"
        })


    }

    // Middleware 
    confirmForgetPasswordOTP = () => {
        return async (req: Request, res: Response, next: NextFunction) => {

            const { email, OTP }: IChangeForgetPassword = req.body.validData;

            const user = await this.userModel.findOne({
                filter: { email }
            })

            if (!user) {
                throw new NotFoundException("User Not Exists")
            }

            if (!user.forgetPasswordOTP) {
                throw new BadRequestException("No OTP was requested for this account. Please request a new password reset")
            }

            if (user.forgetPasswordOTPExpiresAt && new Date(user.forgetPasswordOTPExpiresAt).getTime() < Date.now()) {
                throw new BadRequestException("Expierd OTP")
            }

            if (!await compareHash(OTP, user.forgetPasswordOTP as string)) {
                throw new BadRequestException("Invalid OTP Code")
            }
            else {
                next();
            }

        }
    }

    changeForgetPassword = async (req: Request, res: Response): Promise<Response> => {

        const { email, newPassword }: IChangeForgetPassword = req.body.validData;

        const user = await this.userModel.updateOne({ email },
            {
                password: await generateHash(newPassword),
                changeCredentialsTime: new Date,
                $unset: { forgetPasswordCount: 1, forgetPasswordOTP: 1, forgetPasswordOTPExpiresAt: 1 }
            }
        )

        if (!user) {
            throw new ApplicationException("Something Went Wrong");
        }

        const credentials = await this.tokenService.createLoginCredentials(user);

        return succsesResponse({
            res,
            info: "Your Password Changed Succses",
            data: { credentials }
        })

    }

}

export default new AuthenticationServices();
