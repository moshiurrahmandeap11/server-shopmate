import { Router } from "express";
import { dashboardStats, deleteUser, getAllUsers } from "../../controllers/adminController.js";
import { authorizedRoles, isAuthenticated } from "../../middleware/authMiddleware.js";

const router = Router();

router.get("/getallusers", isAuthenticated, authorizedRoles("Admin"), getAllUsers) //Dashboard
router.delete("/delete/:id", isAuthenticated, authorizedRoles("Admin"), deleteUser);
router.get("/fetch/dashboard-status",isAuthenticated, authorizedRoles("Admin"), dashboardStats)

export default router;