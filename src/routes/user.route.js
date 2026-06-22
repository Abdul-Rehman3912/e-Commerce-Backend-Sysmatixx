import {signUp, login,logout, getAllUsers, checkAuth} from "../controllers/user.controller.js"
import express from "express";
import {protectRoute} from "../middleware/auth.middleware.js"

const router  = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.get("/allUsers", getAllUsers);
router.get("/check", protectRoute, checkAuth);

export default router;