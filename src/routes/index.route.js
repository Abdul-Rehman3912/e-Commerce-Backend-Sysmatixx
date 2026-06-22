import authRoute from "./user.route.js"
import prodRoute from "./product.route.js"
import express from "express";

const router  = express.Router();

router.use("/auth", authRoute)
router.use("/product", prodRoute)

export default router;