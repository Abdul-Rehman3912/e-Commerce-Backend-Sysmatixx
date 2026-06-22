import {
  AddProduct,
  GetAllProd,
  GetById,
   UpdateProductStatus,
  GetActiveProducts,
  GetProductsByCategory,
} from "../controllers/product.controller.js";
import express from "express";
import upload from "../middleware/multer.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();


router.post("/create", protectRoute, upload.array("images", 5), AddProduct);
router.get("/AllProducts", GetAllProd);
router.get("/getProduct/:id", GetById); 
router.put("/update-status", protectRoute, UpdateProductStatus);
router.get("/active-products", GetActiveProducts);
router.get("/category/:category", GetProductsByCategory);


export default router;