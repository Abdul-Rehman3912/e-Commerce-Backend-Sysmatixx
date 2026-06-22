import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import {
  badRequestErrorResponse,
  serverErrorResponse,
} from "../utils/response.js";
import messages from "../utils/messages.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return badRequestErrorResponse(res, messages.NoToken);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return badRequestErrorResponse(res, messages.invalidToken);
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return badRequestErrorResponse(res, messages.UserNotFound);
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("Error in Protect Route", error.message);
    return serverErrorResponse(res, messages.internalServerError);
  }
};
