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

export async function GET() {
    try {
        // 1. הגדרת שליפה ממוקדת (אופציונלי: שליפת רק מה שצריך)
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                role: true
                // לא שולפים סיסמאות או מידע רגיש!
            },
        });

        // 2. החזרת סטטוס 200 בצורה מפורשת
        
        return NextResponse.json(users, { status: 200 });

    } catch (error) {
        // 3. לוג לשרת (בשבילך) ותגובה קריאה ללקוח
        console.error("Prisma Error:", error);

        return NextResponse.json(
            {
                message: "Internal Server Error",
                // ב-Production לא נרצה לחשוף את כל ה-Error Object מטעמי אבטחה
                error: process.env.NODE_ENV === "development" ? error.message : undefined
            },
            { status: 500 }
        );
    }
}








