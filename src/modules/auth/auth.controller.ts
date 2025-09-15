import { Router } from "express";
import AuthenticationServices from "./auth.services";
import { validation } from "../../middleware/validation.middleware";
import * as authValidators from "./auth.validation"
import { authenticationMiddleware } from "../../middleware/authentication.middleware";
import { TokenTypeEnum } from "../../utils/security/token.security";

const authRouter = Router();


authRouter.post("/signup",
    validation(authValidators.signup),
    AuthenticationServices.signup);

authRouter.patch("/confirm-email",
    validation(authValidators.confirmEmail),
    AuthenticationServices.confirmEmail);

authRouter.post("/re-send-confirm-email-otp",
    validation(authValidators.reSendConfirmOTP),
    AuthenticationServices.reSendConfirmOTP);

authRouter.post("/signup-with-gmail",
    validation(authValidators.signupWithGmail),
    AuthenticationServices.signupWithGmail);


authRouter.post("/login",
    validation(authValidators.login),
    AuthenticationServices.login);


authRouter.post("/logout",
    validation(authValidators.logout),
    authenticationMiddleware(),
    AuthenticationServices.logout);


authRouter.get("/refresh-token",
    authenticationMiddleware(TokenTypeEnum.refresh),
    AuthenticationServices.refreshToken);


authRouter.patch("/change-password",
    authenticationMiddleware(),
    validation(authValidators.changePassword),
    AuthenticationServices.changePassword);


authRouter.post("/forget-password",
    validation(authValidators.forgetPassword),
    AuthenticationServices.forgetPassword);


authRouter.post("/resend-forget-password-otp",
    validation(authValidators.forgetPassword),
    AuthenticationServices.reSendForgetPasswordOTP);

authRouter.post("/change-forget-password",
    validation(authValidators.changeForgetPassword),
    AuthenticationServices.confirmForgetPasswordOTP(),
    AuthenticationServices.changeForgetPassword);





// authRouter.post("/verify-token",
//     validationMiddleware(authValidators.verifyToken),
//     AuthenticationServices.verifyToken);


export default authRouter;