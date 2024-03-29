import mongoose from "mongoose";
import { Schema } from "mongoose";
import { Jwt } from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, //if we want to enable searching field than index is a good option
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: true,
    },
    coverimage: {
      type: String, //cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save" ,async function (next) {
    if(!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password ,10)
    next()
}) //here is the problem means jab bhi data me kuch change hoga toh ye function call hoga 
// so we want that it  runs only when we change our password or save it  so we use if consition inside it 


//this is custom method created in middleware  
userSchema.methods.isPasswordCorrect = async function 
(password){
   return await bcrypt.compare(password , this.password)
}
userSchema.methods.generateAccessToken = fundtion(){
  return jwt.sign({
     _id:this._id,
     email:this.email,
     username:this.username,
     fullname:this.fullname
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
     expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  }
  )
}
userSchema.methods.generateRefreshToken = fundtion(){
  return jwt.sign({
    _id:this._id,
 },
 process.env.REFRESH_TOKEN_SECRET,
 {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
 }
 )

}


export const User = mongoose.model("User", userSchema);
