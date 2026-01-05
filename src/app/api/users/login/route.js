import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";

// 1. סכמה לאימות פרטי הלוגין
const loginSchema = z.object({
  email: z.string().email("אימייל לא תקין") .trim(),
  password: z.string().min(1, "חובה להזין סיסמה"),
});





export async function POST(req) {
  try {
    const body = await req.json();

    // 2. בדיקת וולידציה
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(validation.error.flatten().fieldErrors, { status: 400 });
    }

    const { email, password } = validation.data;

    // 3. מציאת המשתמש בבסיס הנתונים לפי האימייל
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // אם המשתמש לא קיים
    if (!user) {
      return NextResponse.json({ message: "אימייל או סיסמה שגויים" }, { status: 401 });
    }

    // 4. השימוש ב-bcrypt.compare!
    // אנחנו משווים את הסיסמה מהטופס (password) לסיסמה המוצפנת מה-DB (user.password)
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      // טיפ אבטחה: אל תגיד "סיסמה שגויה", תגיד "אימייל או סיסמה שגויים" כדי לא לגלות להאקר שהאימייל קיים
      return NextResponse.json({ message: "אימייל או סיסמה שגויים" }, { status: 401 });
    }

    // 5. אם הכל תקין - המשתמש מחובר
    // כאן בדרך כלל יוצרים JWT או Session, אבל כרגע נחזיר הצלחה
    return NextResponse.json({
      message: "התחברת בהצלחה!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }, { status: 200});
 
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "שגיאת שרת פנימית" }, { status: 500 });
  }
}









