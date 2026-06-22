import Product from "../models/product.model.js";
import messages from "../utils/messages.js";
import {
  badRequestErrorResponse,
  serverErrorResponse,
  successResponse,
  notFoundResponse, 
} from "../utils/response.js";
import cloudinary from "../utils/cloudinary.js";

export const AddProduct = async (req, res) => {
  const { title, category, description, price } = req.body;
  const files = req.files;
  
  try {
    const uploadedImages = await Promise.all(
      files.map((file) =>
        cloudinary.uploader.upload(file.path).then((result) => ({
          url: result.secure_url,
          public_id: result.public_id,
        }))
      )
    );

    const newProduct = new Product({
      title,
      category,
      images: uploadedImages,
      description,
      price,
      status: "active",
    });

    await newProduct.save();

    return successResponse(res, messages.ProdCreate, newProduct);
  } catch (error) {
    console.log("Error in AddProduct:", error.message);
    return serverErrorResponse(res, messages.internalServerError);
  }
};

export const GetAllProd = async (req, res) => {
  try {
    const products = await Product.find() 
    
    return successResponse(res, messages.ok, products);
  } catch (error) {
    console.log("Error in Get All products:", error.message);
    return serverErrorResponse(res, messages.serverError);
  }
};

export const GetById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const getProduct = await Product.findById(id)

    return successResponse(res, messages.ok, getProduct);
  } catch (error) {
    console.log("Error in Get Product", error);
    return serverErrorResponse(res, error);
  }
};

export const UpdateProductStatus = async (req, res) => {
  try {
    const now = new Date();
    const result = await Product.updateMany(
      {
        status: "active",
        endTime: { $lt: now }
      },
      {
        $set: { status: "ended" }
      }
    );
    
    return successResponse(res, "Product statuses updated", result);
  } catch (error) {
    console.log("Error in UpdateProductStatus:", error.message);
    return serverErrorResponse(res, messages.internalServerError);
  }
};

export const GetActiveProducts = async (req, res) => {
  try {
    const now = new Date();
    const products = await Product.find({
      status: "active",
      endTime: { $gt: now }
    })
      .populate("seller", "fullName email")
      .sort({ createdAt: -1 });
    
    return successResponse(res, messages.ok, products);
  } catch (error) {
    console.log("Error in GetActiveProducts:", error.message);
    return serverErrorResponse(res, messages.serverError);
  }
};

export const GetProductsByCategory = async (req, res) => {
  const { category } = req.params;
  
  try {
    const products = await Product.find({ 
      category: category,
      status: "active" 
    })
      .populate("seller", "fullName email")
      .sort({ createdAt: -1 });
    
    return successResponse(res, messages.ok, products);
  } catch (error) {
    console.log("Error in GetProductsByCategory:", error.message);
    return serverErrorResponse(res, messages.serverError);
  }
};