import { asynchandler } from "../utils/asynchandler.js";
import { apierrors } from "../utils/apierrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";
const generateAccessandRefreshTokens = async (userId) => {
  try {
    // console.log(userId);
    const user = await User.findById(userId);
    console.log(user);
    const accesstoken = user.generateAccessToken();
    const refreshtoken = user.generateRefreshToken();
    console.log(accesstoken);
    user.refreshtoken = refreshtoken;

    await user.save({ validateBeforeSave: false });
    return { accesstoken, refreshtoken };
  } catch (err) {
    throw new apierrors(
      500,
      "Something went wrong while accessing refresh and access token"
    );
  }
};

const registerUser = asynchandler(async (req, res) => {
  //get user detail frontend
  //validation - not empty
  //check if user already exist or not : ussername ,email , id
  //check for images , check for avatar
  //upload them for cloudinary , avatar
  //creaate usr object - create entry in db
  //remove password and referesh token fields
  //check for user creation
  //return yes

  const { username, email, fullname, password } = req.body;
  //  console.log(email);

  if (
    [fullname, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new apierrors(400, "All fields are required");
  }
  // this  is beginner method for check each and every input field
  //  if(fullname===""){
  //    throw new  apierrors(400 ,"fullname is required")
  //  }

  const existeduser = await User.find({
    $or: [{ username }, { email }],
  });
  if (existeduser.length > 0) {
    throw new apierrors(409, "user with email or username already exist");
  }
  //multer se files
  const avatarlocalpath = req.files?.avatar[0]?.path;
  // path is property of multer it give us path where the file stores
  //  const coverlocalpath =  req.files?.coverimage[0]?.path;  this will may give us error and we use normal if else
  let coverlocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverlocalpath = req.files.coverimage[0].path;
  }

  if (!avatarlocalpath) {
    throw new apierrors(400, "avator file is required");
  }

  //upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarlocalpath);
  const coverimage = await uploadOnCloudinary(coverlocalpath);

  if (!avatar) {
    throw new apierrors(400, "avator file is required");
  }

  // database me entry
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //check for user creation
  if (!createduser) {
    throw new apierrors(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new apiresponse(200, createduser, "UserRegisteredSuccessfully"));
});
const loginUser = asynchandler(async (req, res) => {
  // req data from body
  // username or email
  // find the user
  // if not than register
  // password check
  // access and refresh token
  //send cookie include tokens
  const { email, username, password } = req.body;
  console.log(username);
  console.log(password);
  if (!username && !email) {
    throw new apierrors(400, "username or password is required ");
  }
  // hume ek hi entry find karni hai
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new apierrors(400, "User does not exist ");
  }

  // check password
  const ispassvalid = await user.isPasswordCorrect(password);
  if (!ispassvalid) {
    throw new apierrors(401, "Invalid user Credentials");
  }

  const { accesstoken, refreshtoken } = await generateAccessandRefreshTokens(
    user._id
  );

  const loggeduser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );
  // send cookies
  const options = {
    // by default cookies ho koi bhi frontend se edit or change kr sakta hai par
    //below condition lagake only server side se cookies change kr sakte hai  frontend se ni kr sakte
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accesstoken", accesstoken, options)
    .cookie("refreshtoken", refreshtoken, options)
    .json(
      new apiresponse(
        200,
        {
          user: loggeduser,
          accesstoken,
          refreshtoken,
        },
        "User logged in successfully"
      )
    );
});
const loggedoutuser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshtoken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accesstoken", options)
    .clearCookie("refreshtoken", options)
    .json(new apiresponse(200, {}, "User Logged out successfully"));
});

const refreshAccessToken = asynchandler(async (req, res) => {
  const incomingrefreshtoken =
    req.cookies.refreshtoken || req.body.refreshtoken;
  if (!incomingrefreshtoken) {
    throw new apierrors(401, "Unauthorised request");
  }
  try {
    const decodedtoken = jwt.verify(
      incomingrefreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedtoken._id);
    if (!user) {
      throw new apierrors(401, "Invalid refresh Token");
    }

    if (incomingrefreshtoken !== user?.refreshtoken) {
      throw new apierrors(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accesstoken, newrefreshtoken } =
      await generateAccessandRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accesstoken", accesstoken, options)
      .cookie("refreshtoken", accesstoken, options)
      .json(
        new apiresponse(
          200,
          { accesstoken, refreshtoken: newrefreshtoken },
          "Access token refresh"
        )
      );
  } catch (error) {
    throw new apierrors(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asynchandler(async (req, res) => {
  const { oldpassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const ispasswordcorrect = user.isPasswordCorrect(oldpassword);

  if (!ispasswordcorrect) {
    throw new apierrors(400, "Invalid password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new apiresponse(200, {}, "Password changed successfully"));
});

const getcurrentuser = asynchandler(async (req, res) => {
  console.log(req.user)
  return res
    .status(200)
    .json(200, req.user, "current user fetched succesfully");
});

const updateaccountdetails = asynchandler(async (req, res) => {
  const { fullname, email } = req.body;
  //for changing files make different controllers
  if (!fullname || !email) {
    throw new apierrors(400, "Al fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true } // update hone ke bad information return hoti hai
  ).select("-password");

  return res
    .status(200)
    .json(new apiresponse(200, user, "Account details Updated Successfully"));
});

const updateuseravatar = asynchandler(async (req, res) => {
  const avatarlocalpath = req.file?.path;
  if (!avatarlocalpath) {
    throw new apierrors(400, "Avatar file is missing");
  }
  const avatar = await uploadOnCloudinary(avatarlocalpath);
  if (!avatar) {
    throw new apierrors(400, "error while uploading avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new apiresponse(200, user, "avatar image updated succesfully"));
});

const updateusercoverimage = asynchandler(async (req, res) => {
  const coverlocalpath = req.file?.path;
  if (!coverlocalpath) {
    throw new apierrors(400, "cover image  file is missing");
  }
  const coverimage = await uploadOnCloudinary(coverlocalpath);
  if (!coverimage) {
    throw new apierrors(400, "error while uploading avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverimage: coverimage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new apiresponse(200, user, "avatar image updated succesfully"));
});

const getuserChannelProfile = asynchandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new apierrors(400, "Username is Missing");
  }

  // User.find({username})
  //by default aggreate pipeline array return karta hai
  const channel = await User.aggregate([
    {
      /*This aggregation stage behaves like a 
      find. It will filter documents that match the query provided.
      Using $match early in the pipeline can improve
       performance since it limits the number of documents the next stages must process.*/
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      //This aggregation stage performs a left outer join to a collection in the same database.
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel", // ye value subscription modal se aa rhi
        as: "subscribers",
      },
    },
    {
      //This aggregation stage performs a left outer join to a collection in the same database.
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      //original user object ke andar ye field or add krdi
      $addFields: {
        subscriberscount: {
          $size: "$subscribers", // subscribers ka coutn store kar liya
        },
        subscribedtocount: {
          $size: "$subscribedTo", //humne kitno ko subscriber kr rakha ai uska count
        },

        isSubscribed: {
          //conditon has three parameters if than else
          $condition: {
            //in is used for both array and object traversing
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      // iski help se hum project ko selected things pass kr sakta hai
      // hum saari things send nahi karna chahte toh jo jo bhejnen hai uske aage true likh do
      $project: {
        fullname: 1,
        username: 1,
        subscriberscount: 1,
        subscribedtocount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverimage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new apierrors(404, "Channel does not exist");
  }
  return res
    .status(200)
    .json(
      new apiresponse(200, channel[0], "User channel fetched successfully")
    );
});

const getwatchedhistory = asynchandler(async (req, res) => {
  // req.user._id   // hume isse string milti(andar ki key only) hai mongoose behind the scene all things handle kr leta hai
  //mtlb automatically id ko mongodb ki object id me convert kr deta hai (complete object id )
  //but aggregation pipeline me hume cheeze hamdle karni padti hai mongoose automatically work nahi karta
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id), // sse hum manually object id access kar sakte hai
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        //this is nested pipeline
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              //hume kuch selected data bhejna hai
              pipeline: [
                {
                  $project: {
                    fullname: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {  
             //array ka first value return kr rhe 
            $addFields:{
              owner:{
                $first:"$owner"
              }
            }
          }
        ],
      },
    },
  ]);
  return res.status(200)
  .json( new apiresponse (200 , 
    user[0].watchHistory,
     "Watch history fetched succesfully"))
});

 

export {
  registerUser,
  loginUser,
  loggedoutuser,
  refreshAccessToken,
  getcurrentuser,
  changeCurrentPassword,
  updateaccountdetails,
  updateuseravatar,
  updateusercoverimage,
  getuserChannelProfile,
  getwatchedhistory,
};
