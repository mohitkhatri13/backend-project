import { Router } from "express";
import {
  changeCurrentPassword,
  getcurrentuser,
  getuserChannelProfile,
  getwatchedhistory,
  loggedoutuser,
  loginUser,
  refreshAccessToken,
  registerUser,
  updateaccountdetails,
  updateuseravatar,
  updateusercoverimage,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "coverimage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
//secured routes
router.route("/logout").post(verifyJWT, loggedoutuser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/current-user").get(verifyJWT, getcurrentuser);

router.route("/update-account").patch(verifyJWT, updateaccountdetails);

//patch is used here because we not want to update all the things

router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar", updateuseravatar));

router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("/coverImage"), updateusercoverimage);

router.route("/c/:username").get(verifyJWT, getuserChannelProfile);

router.route("/history").get(verifyJWT, getwatchedhistory);

export default router;
