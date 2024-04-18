import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()


app.use(cors({
       origin: process.env.CORS_ORIGIN,
       credentials:true,
}))
  //these are  major configuration these are parsers 
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true , limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import from router folders 
import  userRouter from './routes/user.routes.js'

//routes declaration  or mounting the routes 
app.use("/api/v1/users" ,userRouter)

export {app}

/*app.use is used in Express.js to mount middleware 
functions at a specified path in the application's 
middleware stack. Middleware functions are functions 
that have access to the request object (req), the
 response object (res), and the next middleware 
 function in the application’s request-response cycle.
  They can perform tasks such as modifying request and
   response objects, terminating the request-response
    cycle, calling the next middleware function in the 
    stack, etc.
    In summary, app.use is used to mount middleware 
    functions in the Express application to perform
     various tasks such as request processing, error
      handling, serving static files, etc. 
      These middleware functions are executed in the
       order they are mounted, so the order of app.use
        calls matters.  */