import { apierrors } from "../utils/apierrors.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";


//this handler is created for use the controllers which can be only used by login user 
// so before using such controllers we first verify that user is logged or not 
export const verifyJWT = asynchandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accesstoken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apierrors(401, "Unautorized request");
    }
    const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedtoken?._id).select(
      "-password -refreshtoken"
    );
    if (!user) {
      throw new apierrors(401, "Invalid Acces Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new apierrors(401, error.message || "Invalid access Token");
  }
});
