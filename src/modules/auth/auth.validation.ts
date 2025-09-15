import { z } from "zod";
import { generalField } from "../../middleware/validation.middleware"; 
import { GenderEnum } from "../../DataBase/models/user.model";
import { LogoutFlagEnum, TokenTypeEnum } from "../../utils/security/token.security";

export const login = {
    body: z.strictObject({
        email: generalField.email,
        password: generalField.password,
    })
};

export const signup = {
    body: login.body.extend({
        userName: generalField.username,
        confirmPassword: z.string(),
        phone: generalField.phone.optional(),
        gender: z.enum(GenderEnum).default(GenderEnum.male)
    }).superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "Password and confirm password must be the same."
            });
        }
        if (data.userName.split(" ").length !== 2) {
            ctx.addIssue({
                code: "custom",
                path: ["userName"],
                message: "User Name Must Include First And Last Name Example:[Adham Zain]"
            });
        }
    })
};

export const reSendConfirmOTP = {
    body: z.strictObject({
        email: generalField.email,
    })
};

export const confirmEmail = {
    body: reSendConfirmOTP.body.extend({
        OTP: generalField.otp
    })
};

export const verifyToken = {
    body: z.object({
        tokenType: z.nativeEnum(TokenTypeEnum).default(TokenTypeEnum.accses),
        token: generalField.token
    })
};

export const logout = {
    body: z.object({
        logoutFlag: z.nativeEnum(LogoutFlagEnum).default(LogoutFlagEnum.current),
    })
};

export const signupWithGmail = {
    body: z.object({
        idToken: z.string()
    })
};

export const forgetPassword = {
    body: z.object({
        email: generalField.email
    })
};

export const changeForgetPassword = {
    body: z.object({
        email: generalField.email,
        OTP: generalField.otp,
        newPassword: generalField.password,
        confirmNewPassword: z.string()
    }).superRefine((data, ctx) => {
        if (data.newPassword !== data.confirmNewPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmNewPassword"],
                message: "newPassword and confirmNewPassword must be the same."
            });
        }
    })
};

export const changePassword = {
    body: z.object({
        oldPassword: generalField.password,
        newPassword: generalField.password,
        confirmNewPassword: z.string()
    }).superRefine((data, ctx) => {
        if (data.newPassword !== data.confirmNewPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmNewPassword"],
                message: "newPassword and confirmNewPassword must be the same."
            });
        }
        if (data.oldPassword === data.newPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["oldPassword"],
                message: "Old Password And New Password Cannot Be The Same."
            });
        }
    })
};
