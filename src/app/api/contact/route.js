import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { headers } from 'next/headers'; // ייבוא הכלי של Next.js לטיפול ב-Headers
import { z } from "zod";

// הגדרת ה-Schema לוולידציה
const contactSchema = z.object({
  name: z.string().min(2, "שם קצר מדי").trim(),
  email: z.string().email("אימייל לא תקין").trim().lowercase(),
  title: z.string().min(3, "כותרת קצרה מדי").trim(),
  content: z.string().min(10, "הודעה קצרה מדי").trim(),
});

export async function POST(req) {
  try {
    // 1. חילוץ ה-IP בעזרת headers() של Next.js
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || "0.0.0.0"; 
    // const ip - req.headers.get('x-forwarded-for') // אפשר גם ככה 
    // הוספתי .split(',')[0] כי לפעמים ב-Production יש רשימה של כתובות IP, ואנחנו רוצים את הראשונה (של המשתמש)

    // 2. קריאת גוף הבקשה
    const body = await req.json();

    // 3. אימות עם Zod
    const validation = contactSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        validation.error.flatten().fieldErrors, 
        { status: 400 }
      );
    }

    const {content,email,name,title} = validation.data

    // 4. שמירה בבסיס הנתונים (Prisma)
        const newMessage = await prisma.contact.create({
      data: {
        name,
        email,
        title,
        content,
        ipAddress: ip,
        status: "PENDING", // מה-Enum שהגדרנו במודל
        priority: "LOW"
      }
    });

    // 5. החזרת תשובה חיובית
    return NextResponse.json(
      { message: "הפנייה התקבלה בהצלחה!" }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Contact Error:", error);
    return NextResponse.json(
      { message: "שגיאת שרת פנימית" }, 
      { status: 500 }
    );
  }
}







