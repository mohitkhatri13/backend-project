import { asynchandler } from "../utils/asynchandler.js";
import { apierrors } from "../utils/apierrors.js";
import {User} from "../models/user.models.js";
import {uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";

const registerUser = asynchandler(async (req, res)=>{
    //get user detail frontend
    //validation - not empty 
    //check if user already exist or not : ussername ,email , id 
    //check for images , check for avatar 
    //upload them for cloudinary , avatar
    //creaate usr object - create entry in db 
    //remove password and referesh token fields 
    //check for user creation 
    //return yes 

     const {username , email , fullname , password}=req.body
     console.log(email);

if([fullname , email , password , username
].some((field)=> field?.trim()==="")){
      throw new apierrors(400 , "All fields are required")
}
    // this  is beginner method for check each and every imput field
    //  if(fullname===""){
    //    throw new  apierrors(400 ,"fullname is required")
    //  }
        
   const existeduser = await User.find({ 
        $or:[ {username} , {email}]
    });
    if(existeduser.length>0){
        throw new apierrors(409 , "user with email or username already exist")
    }
          //multer se files 
   const avatarlocalpath =  req.files?.avatar[0]?.path;
  //  const coverlocalpath =  req.files?.coverimage[0]?.path;  this will may give us error and we use normal if else
   let coverlocalpath;
   if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length>0){
     coverlocalpath = req.files.coverimage[0].path
   }
 
    if(!avatarlocalpath){
        throw new apierrors(400 , "avator file is required")
    }


    //upload on cloudinary
   const avatar = await uploadOnCloudinary(avatarlocalpath)
   const coverimage = await uploadOnCloudinary(coverlocalpath);

    if(!avatar){
        throw new apierrors(400 , "avator file is required")
    }

    // database me entry
   const user =  await User.create({
        fullname,
        avatar:avatar.url,
        coverimage:coverimage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

   const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
   )
     //check for user creation
   if(!createduser){
     throw new apierrors(500 , "Something went wrong while registering the user");
   }
 
   return res.status(201).json(
     new apiresponse(200 , createduser , "UserRegisteredSuccessfully")
   )



}) 
export {registerUser}