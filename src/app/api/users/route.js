import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. הגדרת שליפה ממוקדת (אופציונלי: שליפת רק מה שצריך)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
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