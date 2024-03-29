
//these are two methods of utility async function

const asynchandler = (requestHandler)=>{
   return  (req , res , next)=>{
         Promise.resolve(requestHandler(req , res, next))
         .catch((err)=>next(err))
     }
}
// const asynchandler = ()=>{}
// const asynchandler = (func)=>()=>{}
//const asynchandler = (func)=>async()=>{}
// const asynchandler  = (fn)=>async (req , res , next)=> {
//       try{
//               await fn(req , res , next)
//       }
//       catch(error){
//          res.status(error.code||500).json({
//             success:false,
//             message:error.message
//          })
//       }
// }
export {asynchandler}