import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // 1. שליפת ה-ID של המשתמש מה-Headers (שה-Middleware הזריק)
    const userId = request.headers.get('x-user-id');

    // אם מסיבה כלשהי אין ID (למשל הנתיב לא ב-matcher), נחזיר שגיאה
    if (!userId) {
      return NextResponse.json({ message: "משתמש לא מזוהה" }, { status: 401 });
    }

    // 2. קבלת נתוני הפוסט מהגוף של הבקשה (body)
    const body = await request.json();
    const { title, content } = body;

    // וולידציה בסיסית (אפשר גם עם Zod אם תרצה)
    if (!title || !content) {
      return NextResponse.json({ message: "כותרת ותוכן הם שדות חובה" }, { status: 400 });
    }

    // 3. יצירת הפוסט בבסיס הנתונים בעזרת Prisma
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        // אנחנו הופכים את ה-ID למספר אם ב-Prisma הוא מוגדר כ-Int
        authorId: Number(userId), 
      },
    });

    // 4. החזרת תשובה חיובית
    return NextResponse.json(
      { message: "הפוסט נוצר בהצלחה!", data: newPost },
      { status: 201 }
    );

  } catch (error) {
    console.error("Post Creation Error:", error);
    return NextResponse.json(
      { message: "שגיאת שרת פנימית", error: error.message },
      { status: 500 }
    );
  }
}