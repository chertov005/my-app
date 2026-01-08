import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // 1. קבלת ה-ID של המשתמש מה-Header (שהוזרק ב-Middleware)
    const userId = request.headers.get('x-user-id');
    
    // 2. קבלת ה-ID של הפוסט מהכתובת (URL)
    const { id } = await params; 

    // 3. חיפוש בפריזמה עם תנאי כפול
    const post = await prisma.post.findFirst({
      where: {
        id: Number(id),           // הפוסט הספציפי
        authorId: Number(userId)  // חייב להיות שייך למשתמש הזה!
      }
    });

    // 4. אם לא נמצא פוסט כזה (או שהוא קיים אבל שייך למישהו אחר)
    if (!post) {
      return NextResponse.json(
        { message: "הפוסט לא נמצא או שאין לך הרשאה לצפות בו" },
        { status: 403 } // 403 Forbidden
      );
    }

    return NextResponse.json(post);

  } catch (error) {
    return NextResponse.json({ message: "שגיאת שרת" }, { status: 500 });
  }
}