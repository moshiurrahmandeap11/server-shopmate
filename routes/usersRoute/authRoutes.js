import { Router } from "express";
import { getUser, login, logout, register } from "../../controllers/authController.js";
import { isAuthenticated } from "../../middleware/authMiddleware.js";

const router = Router();


router.post("/register", register)
router.post("/login", login)
router.get("/logout", isAuthenticated, logout)
router.get("/me",isAuthenticated, getUser)

export default router;