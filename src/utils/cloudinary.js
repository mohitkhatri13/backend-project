//file uploading on backend 
//importing v2  named custom  as cloudinary
import {v2 as cloudinary}from "cloudinary"
import fs from "fs"
//fs = file system library automatically installed with node packages
// it is used for handling files open , read , write files
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath)=>{
     try{
        if(!localFilePath)return null
        //upload the file on cloudinary 
       const response =  await cloudinary.uploader.upload(localFilePath ,{
            resource_type:auto
         } )
         //file has been uploaded successfully
         console.log("file is uploaded on cloudinary");
         console.lof(response.url);
         return response
     }
     catch(error){
            fs.unlinkSync(localFilePath) // remove the locally saved temmporary file as the upload operation got failed 
     }
}

export {uploadOnCloudinary}
