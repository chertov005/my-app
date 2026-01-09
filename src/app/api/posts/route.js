



import prisma from "@/lib/db"; // חיבור לבסיס הנתונים דרך Prisma Client
import { NextResponse } from "next/server"; // כלי של Next.js להחזרת תשובות HTTP (JSON, סטטוסים וכו')
import { z } from 'zod'; // ספרייה לאימות (Validation) של מבנה הנתונים

// 1. הגדרת ה"חוזה" (Schema) - אילו נתונים אנחנו מוכנים לקבל מהמשתמש
const postsSchema = z.object({
  // הכותרת חייבת להיות טקסט, מינימום 3 תווים, וללא רווחים מיותרים בקצוות
  title: z.string().min(3, 'כותרת קצרה מדי').trim(),
  // התוכן חייב להיות טקסט, מינימום 10 תווים
  content: z.string().min(10, 'התוכן קצר מדי, מינימום 10 תווים').trim()
});

export async function POST(_req) {
  try {
    // 2. חילוץ המידע מהבקשה
    const body = await _req.json(); // הפיכת גוף הבקשה (JSON) לאובייקט JS
    const userId = _req.headers.get('x-user-id'); // שליפת ה-ID שהוזרק על ידי ה-Middleware מהטוקן

    // 3. שכבת הגנה ראשונה: אימות זהות (Authentication)
    // אם אין userId ב-Headers, זה אומר שהמשתמש לא מחובר או שהטוקן לא תקין
    if (!userId) {
      console.log('access denied'); 
      return NextResponse.json(
        { message: 'גישה נדחתה. רק למשתמש רשום' }, 
        { status: 401 } // 401 Unauthorized
      );
    }

    // 4. שכבת הגנה שנייה: אימות נתונים (Validation)
    // בדיקה האם ה-body ששלח המשתמש תואם לחוקים שהגדרנו ב-Schema
    const validation = postsSchema.safeParse(body); 

    // אם האימות נכשל, נחזיר למשתמש פירוט של השגיאות (למשל: "כותרת קצרה מדי")
    if (!validation.success) {
      return NextResponse.json(
        validation.error.flatten().fieldErrors, // הופך את השגיאה למבנה פשוט שקל להצnpיג ב-React
        { status: 400 } // 400 Bad Request
      );
    }

    // חילוץ הנתונים הנקיים לאחר האימות
    const { content, title } = validation.data;

    // 5. עבודה מול בסיס הנתונים (Database)
    const userPosts = await prisma.post.create({
      data: {
        content,
        title,
        authorId: Number(userId), // קישור הפוסט למשתמש (המרה למספר לטובת ה-DB)
      },
      // הגדרה מה בדיוק יחזור אלינו מפריזמה לאחר היצירה
      select: {
        author: false, // מביא את פרטי הכותב (שם, אימייל וכו')
        authorId: true,
        title: true,
        content: true
      }
    });

    // 6. תגובת הצלחה
    return NextResponse.json(
      {
        message: 'success post',
        data: userPosts 
      }, 
      { status: 201 } // 201 Created - הסטטוס התקני ליצירת משאב חדש
    );
    
  } catch (error) {
    // 7. טיפול בשגיאות בלתי צפויות (שרת קרס, DB לא זמין וכו')
    console.error("Error:", error);
    return NextResponse.json(
      { message: 'internal server error 500' },
      { status: 500 } // 500 Internal Server Error
    );
  }
}