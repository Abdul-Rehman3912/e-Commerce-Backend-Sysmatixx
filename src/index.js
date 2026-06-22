import { connectDB } from "./connection/db.js";
import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import paymentRoutes from "./routes/payment.route.js";

const app = express();
dotenv.config();

app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT;
app.use("/api", routes);
app.use("/api/payment", paymentRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  connectDB();
});
