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








export async function DELETE(request, { params }) {
  try {
    const postId = Number(params.id); // ה-ID של הפוסט שרוצים למחוק

    // 1. שליפת ה-ID שהזרקנו ב-Middleware
    const userIdFromHeader = request.headers.get('x-user-id');
    const currentUserId = Number(userIdFromHeader);

    // 2. בדיקה בפריזמה: תמחק את הפוסט רק אם ה-ID שלו מתאים והוא שייך למשתמש
    // זו הדרך הכי בטוחה!
    const deletedPost = await prisma.post.deleteMany({
      where: {
        id: postId,
        authorId: currentUserId, // כאן נכנס ה-authorId שדיברנו עליו!
      },
    });

    // 3. בדיקה אם באמת נמחק משהו
    if (deletedPost.count === 0) {
      return NextResponse.json(
        { message: "הפוסט לא נמצא או שאין לך הרשאה למחוק אותו" },
        { status: 403 }
      );
    }

    return NextResponse.json({ message: "הפוסט נמחק בהצלחה" });

  } catch (error) {
    return NextResponse.json({ message: "שגיאת שרת" }, { status: 500 });
  }
}