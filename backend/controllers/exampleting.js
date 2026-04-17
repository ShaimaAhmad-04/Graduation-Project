import prisma from '../prisma/client.js'
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken"


export const register = async(req,res)=>{ // async cause we don't want the app to wait for the response to continue
  try{
  const {firstName,lastName,email,password,role,phoneNumber}=req.body;
  if(!firstName || !lastName || !email || !password){ // Validation in case some credintials are missing
    return res.status(400).json({message: "All fields are required"});  // code 4xx = client errors
  }
  const existingUser= await prisma.user.findUnique({where: {email}}); // checks if email is already in use
  if(existingUser){
    return res.status(400).json({message: "Email is already in use"});
  }
  const hashedPassword= await bcrypt.hash(password,10);  // cause we don't save the original password but the hashed for security purposes
  const user= await prisma.user.create({
    data:{firstName,lastName,email,phoneNumber,password:hashedPassword,role}
  });
  const { password: _, ...safeUser } = user; // Object destructuring + rest: takes `user.password` into throwaway variable `_` (renamed),
  //and copies all remaining properties into `safeUser` so password is excluded from response.
  res.status(200).json({safeUser}); //code 2xx = success
}catch(error){
  res.status(500).json({error: error.message}); // code 5xx = server errors
}
};
export const login = async(req,res)=>{
  try{
  const{email,password}=req.body;
  if(!email || !password){
     return res.status(400).json({message:"Email and Password are required"});
  }
  const user= await prisma.user.findUnique({where:{email}});
  if(!user){
    return res.status(400).json({message:"User not found"});
  }
  const validPassword= await bcrypt.compare(password,user.password); // it implicitly hashes the input password
  if(!validPassword){
    return res.status(400).json({message:"Invalid Password"});
  }
  const token= jwt.sign(  // creates a JSON Web Token with the following data
    {UserID: user.id, role: user.role},   // the payload of the token , UserID and his role
    process.env.JWT_SECRET,  // from the env file, that validates that the login was 100% authentic
    {expiresIn:"7d"}  // expiration of the JWT
  );
  res.status(200).json({token});
}catch(error){
  res.status(500).json({error: error.message});
}
};







// export const login= async(req,res)=>{
//   try{
//     const {email,password}=req.body;
//     if(!email || !password){
//       return res.status(400).json({message: "All fields are required"});
//     }
//     const user = await prisma.user.findUnique({where:{email}});
//     if(!user){
//       return res.status(400).json({message:"email is not found!"});
//     }
//     const validting = await bcrypt.compare(password,user.password);
//     if(!validting){
//       return res.status(400).json({message:"invalid password!"});
//     }
//     const token = jwt.sign(
//       {UserID:user.id,role:user.role},
//       process.env.JWT_SECRET,
//       {expiresIn:"7d"}
//     );
//     res.status(200).json({token});

//   }catch(error){
//     res.status(500).json({error:error.message});
//   }
// }


//Request → Router → Middleware → Controller → Response
