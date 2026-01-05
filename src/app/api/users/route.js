import prisma from "@/lib/db";
import { NextResponse } from "next/server";
import z, { email } from "zod";


// 1. הגדרת חוקי הוולידציה (Zod)
const userSchema = z.object({
  name: z.string().min(2, "השם חייב להכיל לפחות 2 תווים"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  password: z.string().min(8, "הסיסמה חייבת להכיל לפחות 8 תווים"),
});


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







export async function POST(req) {

    try {

        const body = await req.json();

        const userValidtion = userSchema.safeParse(body)

        if (!userValidtion.success) {
            return NextResponse.json(userValidtion.error.format(), { status: 400 })
        }

        const { email, name } = userValidtion.data

        const newUser = await prisma.user.create({
            data: {
                email,
                name
            },

            select: {
                email: true,
                name: true,
                id: true
            }
        })

        return NextResponse.json(
            {
                message: 'success create user', // ההודעה שלך
                data: newUser                  // הנתונים שחזרו מ-Prisma
            },
            {
                status: 201                   // הסטטוס האמיתי של ה-HTTP
            }
        );


    } catch (error) {
        console.log(
            { message: 'intrnatl server error 500' }
        )

        return NextResponse.json(
            { error }
        )
    }


}















export async function POST(req) {
  try {
    // 2. קבלת הגוף של הבקשה (Body)
    const body = await req.json();

    // 3. אימות הנתונים מול הסכמה
    const validation = userSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // 4. בדיקה האם האימייל כבר קיים במערכת (מניעת כפילות)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "משתמש עם אימייל זה כבר קיים" },
        { status: 409 } // 409 = Conflict
      );
    }

    // 5. הצפנת הסיסמה (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. יצירת המשתמש בבסיס הנתונים
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      // מחזירים רק את השדות הנחוצים (בלי הסיסמה!)
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // 7. תגובה מוצלחת
    return NextResponse.json(
      { message: "המשתמש נוצר בהצלחה", user: newUser },
      { status: 201 }
    );

  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    return NextResponse.json(
      { message: "שגיאת שרת פנימית" },
      { status: 500 }
    );
  }
}