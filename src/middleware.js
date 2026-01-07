import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  // 1. חילוץ הטוקן מהעוגייה
  const token = request.cookies.get('token')?.value;

  // 2. אם אין טוקן, שלח ללוגין
  if (!token) {
    // return NextResponse.redirect(new URL('/login', request.url));
    return NextResponse.json(
        {
            message:'לא נשלח טוקן או לא קיים' ,
            status:401
        }
    )
  }

  try {
    // 3. אימות החתימה (Signature)
    // אנחנו הופכים את ה-Secret מה-env למערך של בייטים (Uint8Array)
    // const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    // const { payload } = await jwtVerify(token, secret);

    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET)
    const {payload} = await jwtVerify(token ,secretKey)
    const {userId , userRole ,userEmail} = payload
    
    console.log("----------------------------");
        console.log("✅ User Authorized!");
        console.log("ID:", userId);
        console.log("Email:", userEmail);
        console.log("Role:", userRole);
        console.log("----------------------------");

    // אם הגענו לכאן, החתימה תקינה!

    

    console.log("User authorized:", payload.userId);
    return NextResponse.next();
    
  } catch (err) {
    // אם החתימה לא תקינה או הטוקן פג תוקף
    console.error("JWT verification failed:", err.message);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}


export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'], // הגנה על נתיבים ספציפיים
};









// // 6. הגנה על נתיבי Admin: אם הנתיב מתחיל ב-/admin והמשתמש לא אדמין
//         if (req.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
//             return NextResponse.redirect(new URL('/login', req.url)); // או לדף "אין גישה"
//         }

//         // 7. הכל תקין - המשך לדף המבוקש
//         return NextResponse.next();





// // הגדרת הנתיבים עליהם ה-Middleware ירוץ
// export const config = {
//     matcher: [
//         /*
//          * הפעל על כל הנתיבים חוץ מ:
//          * api, _next/static, _next/image, favicon.ico, login, register
//          */
//         '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
//     ],
// };