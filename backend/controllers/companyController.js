import prisma from '../prisma/client.js'


export const getCompanyProfile =async (req,res)=>{
  try{
    const company = await prisma.company.findUnique({
      where:{userId:req.userId},
      include:{
        user:{
          select:{
            firstName:true,
            email:true,
            phoneNumber:true,
            role:true
          }
        }
      }
  })
  if(!company){
    return res.status(404).json({message:"Company profile not found!"});
  }
  res.json(company);
  }catch(error){
    res.status(500).json({error:error.message});
  }
}



export const updateCompanyProfile = async(req,res)=>{
  try{
    const {
      name,
      description,
      industry,
      website
    }=req.body;
    if(!name){
      return res.status(400).json({message:"required fields are missing!"});
    }
    const company = await prisma.company.update({
      where:{userId:req.userId},
      data:{
        name,
        description,
        industry,
        website
      }
    });
    res.json(company);

  }catch(error){
    res.status(500).json({error:error.message});
  }
}
