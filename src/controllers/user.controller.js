import bcrypt from "bcrypt";
import messages from "../utils/messages.js";
import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import {
  successResponse,
  serverErrorResponse,
  badRequestErrorResponse,
  userExistResponse,
} from "../utils/response.js";

export const signUp = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    if (!email || !fullName || !password  || !role ) {
      return badRequestErrorResponse(res, messages.validationError);
    }
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return badRequestErrorResponse(res, messages.emailAlreadyExist);
    }
    if (password.length < 6) {
      return badRequestErrorResponse(res, messages.PasswordLength);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      fullName,
      password: hashedpassword,
      role
    });
    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      return successResponse(res, messages.userRegister, {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: user.role,
      });
    }
  } catch (error) {
    console.log("Error:", error);
    return serverErrorResponse(res, messages.SignUpErr);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return badRequestErrorResponse(res, messages.validationError);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return badRequestErrorResponse(res, messages.invalidCredentials);
    }

    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      return badRequestErrorResponse(res, messages.invalidCredentials);
    }

    generateToken(user._id, res);

    return successResponse(res, messages.logIn, {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.log("Error in logIn", error);
    return serverErrorResponse(res, messages.serverError);
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", " ", { maxAge: 0 });
    return successResponse(res, messages.logout);
  } catch (error) {
    console.log("Error in Logout", error);
    return serverErrorResponse(res, messages.serverError);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find().select("-password");
    return successResponse(res, messages.ok, allUsers);
  } catch (error) {
    console.log("Error in Get All Users:", error);
    return serverErrorResponse(res, error);
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
