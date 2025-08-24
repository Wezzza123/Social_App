import authService from "./auth.services"
import { Router } from "express"
import { validation } from "../../middleware/validation.middleware"
import * as validators from "./auth.validation"


const router = Router();

router.post("/signup", validation({ body: validators.signup }), authService.signup);
router.post("/login", authService.login);

export default router;
