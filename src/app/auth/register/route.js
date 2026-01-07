import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from 'bcrypt'


// 1. הגדרת חוקי הוולידציה (Zod)
const validationSchema = z.object({
  email:z.string().email('איימיל לא תקין ') .lowercase() .trim(),
  name:z.string() .min(2) .trim(),
  password:z.string().min(2) 
})

export async function POST(_reg) {

  try {
    const body = await _reg.json()
    const validationUser = validationSchema.safeParse(body)

    if(validationUser.error) {
      return NextResponse.json(validationUser.error.flatten() .fieldErrors ,{status:401})
    }


    const {email,password,name} =validationUser.data

    const checkEmail = await prisma.user.findUnique({
      where:{email}
    })

    if(checkEmail) {
      return NextResponse.json({message:'האימייל כבר קיים במערכת'})
    }


    const hashPassword = await bcrypt.hash(password , 10) 

    const newUser = await prisma.user.create({
      data:{
        name,
        email ,
        password:hashPassword
        
      },

      select:{
        name:true ,
        email:true ,
        id:true ,
        createdAt:true
      }
      
    })


    return NextResponse.json(
      {message:'success create user ' ,  

        date:newUser

      } ,

      {status:201}
    )

    


    
  } catch (error) {
    console.log({
      message:'threr was error initrnal server'
    } ,
    {status:500}  
    
  )

  return NextResponse.json({code:error})
  }

}