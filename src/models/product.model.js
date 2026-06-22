import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String
    },

    category: {
      type: String,
      enum: ["Electronics", "Clothing & Accessories", "Home & Garden", "Collectibles & Art", "Sports & Outdoors", "Toys & Hobbies", "Jewelry & Watches", "Books & Magazines", "Other"]
    },
    price: {
      type: Number,
    },

    images: [
      {
        url: String,
        public_id: String,
      },
    ],

    description: {
      type: String,
    },

    isSold: {
      type: Boolean,
    },

    watchlistUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    status: {
      type: String,
      enum: ["active", "ended"],
      default: "active",
    },
  },
  { timestamps: true }
);

productSchema.index({ status: 1, endTime: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;