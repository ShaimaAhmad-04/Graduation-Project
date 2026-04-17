import jwt from "jsonwebtoken"


export const authenticate=(req,res,next)=>{

const authHeader= req.headers.authorization;

if(!authHeader || !authHeader.startsWith("Bearer ")){
  return res.status(400).json({message:"token not available"});
}
const token = authHeader.split(" ")[1];
try{
const decoded = jwt.verify(token,process.env.JWT_SECRET);
req.userId=decoded.userId;
req.role=decoded.role;
next()


}catch(error){
  return res.status(501).json({error:error.message});
}
}



// Checks if the logged in user has the required role.
// Always use after authenticate middleware, never alone.
// Usage: router.post("/route", authenticate, authorizeRole(1), controller)

export const authenticateRole = (...roles)=>{
  return (req,res,next)=>{
    if(!roles.includes(req.role)){
      return res.status(400).json({message:"access denied!"});
    }
    next();
  }
}
