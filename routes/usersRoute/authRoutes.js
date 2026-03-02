import { Router } from "express";
import { forgotPassword, getUser, login, logout, register, resetPassword, updatePassword, updateProfile } from "../../controllers/authController.js";
import { isAuthenticated } from "../../middleware/authMiddleware.js";

const router = Router();


router.post("/register", register)
router.post("/login", login)
router.get("/logout", isAuthenticated, logout)
router.get("/me",isAuthenticated, getUser)
router.post("/forgot-password", forgotPassword)
router.patch("/reset-password", resetPassword);
router.patch("/update-password",isAuthenticated, updatePassword);
router.put("/update-profile", isAuthenticated, updateProfile);

export default router;