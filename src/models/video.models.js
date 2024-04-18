import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
//pagination ka means hai hum ek baar me complete videos ko load nahi kar sakte 
// jaise jaise user ko need hogi vo render hoti jaegi 
//like reels on instagram and game environment

const videoSchema = new Schema(
    {
        videoFile:{
            type:String, //cloudinary url 
            required:true,
        },
        thumbnail:{
            type:String, //cloudinary url 
            required:true,
        },
        title:{
            type:String, 
            required:true,
        },
        description:{
            type:String,  
            required:true,
        },
        duration:{
            type:Number, //cloudinary url
            required:true,
        },
        views:{
            type:Number,
            default:0
        },
        isPubliched:{
            type:Boolean,
            default:true,
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
},
{
    timestamps:true
});

videoSchema.plugin(mongooseAggregatePaginate)
//iska kaam ye hai kaha se kaha tk paginate karna hai 
//agreegation framework in mongoose
// this is agreegation pipeline 
// now we can agreegate out video model 


export const Video = mongoose.model("Video" ,videoSchema );