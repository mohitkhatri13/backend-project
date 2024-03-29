// require('dotenv').config({path: './env'})
//Note - dotenv ke import wale function ko use karne ke liye hume ws script me changes karne padenge
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from "./app.js"
dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server is running at port :${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongo db connection failed !!!", err);
  });

/*  this is the first approach but not use because it make index file bulky 
import express from "express"

const app = express()



;( async ()=>{
      
     try{
           await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
           app.on("error", ()=>{
            console.log("ERROR: " , error);
            throw error
           })

           app.listen(process.env.PORT , ()=>{
              console.log(`App is listening at port ${process.env.PORT}`);
           })
     }
     catch(error){
        console.error("ERROR: " , error)
        throw error
     }
})()
*/
