import multer from "multer";
/*Multer is a Node.js middleware used for handling
multipart/form-data, which is primarily used for uploading files. It is commonly employed alongside frameworks like Express to handle file uploads in web applications. Multer simplifies the process of handling file uploads by providing easy-to-use middleware that can be integrated into the application's routes.
With Multer, you can specify where to store
uploaded files, define file size limits, filter file types,
and handle other aspects of file uploads. It processes the multipart/form-data, extracts the files, and makes them available in your Express routes for further processing or storage.
Overall, Multer simplifies the handling of
file uploads in Node.js applications.*/
const storage = multer.diskStorage({
    destination:function(req , file , cb){
        cb(null , "./public/temp")
    },
    filename:function (req,file , cb){
        cb(null , file.originalname)
    }
})

export const upload = multer({ storage,});