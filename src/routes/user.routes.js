import { Router } from "express";
import { register, login, verify2FA, profile } from "../controllers/auth.controller.js";
import { validateSchema } from "../middleware/validation.middlewere.js";
import { loginValidation, registerValidation, verify2FAValidation } from "../validations/auth.validations.js";

const router = Router();

router.post("/register", validateSchema(registerValidation), register);
router.post("/login", validateSchema(loginValidation), login);
router.post("/verify-2fa", validateSchema(verify2FAValidation), verify2FA);
router.get("/:id", profile);

export default router;