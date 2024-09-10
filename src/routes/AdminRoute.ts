import express from "express";
import { hasAdminRole, jwtParse } from "../middleware/auth/auth";
import AdminController from "../controller/AdminController";

const router = express.Router();

router.get("/all-users", jwtParse, hasAdminRole, AdminController.adminhandler);

export default router;
