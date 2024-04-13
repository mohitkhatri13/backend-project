import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


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
//agreegation framework in mongoose
// this is agreegation pipeline 
// now we can agreegate out video model 


export const Video = mongoose.model("Model" ,videoSchema );