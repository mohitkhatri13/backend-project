// require('dotenv').config({path: './env'})
//Note - dotenv ke import wale function ko use karne ke liye hume ev script me changes karne padenge 
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path :'./env'
})

connectDB()




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