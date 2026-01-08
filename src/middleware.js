// import { NextResponse } from 'next/server';
// import { jwtVerify } from 'jose';

// export async function middleware(request) {
//   // 1. חילוץ הטוקן מהעוגייה
//   const token = request.cookies.get('token')?.value;

//   // 2. אם אין טוקן - החזרת שגיאת JSON (או רידירקט ללוגין)
//   if (!token) {
//     return NextResponse.json(
//       { message: 'לא נשלח טוקן או לא קיים', status: 401 },
//       { status: 401 }
//     );
//   }

//   try {
//     // 3. אימות החתימה בעזרת jose
//     const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
//     const { payload } = await jwtVerify(token, secretKey);

//     // 4. חילוץ הנתונים (שים לב לשמות המשתנים - userRole!)
//     const { userId, userRole, userEmail } = payload;

//     // הדפסה לדיבאגינג בטרמינל
//     console.log("✅ User Authorized:", { userId, userEmail, userRole });

//     // --- הגנה על ה-API ---
//     // אם הנתיב הוא /api/users ומי שמנסה להיכנס הוא לא אדמין
//     // if (request.nextUrl.pathname.startsWith('/api/users/') && userRole !== 'admin') {
//     //   return NextResponse.json(
//     //     { message: 'גישה נדחתה: דרושות הרשאות מנהל' },
//     //     { status: 403 }
//     //   );
//     // }

//     // // --- הגנה על דפי ה-UI (Dashboard) ---
//     // if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'admin') {
//     //   return NextResponse.redirect(new URL('/login', request.url));
//     // }

    

//     // 6. הכל תקין - המשך לדף המבוקש
//     return NextResponse.next();

//   } catch (err) {
//     // 7. אם הטוקן פג תוקף או שונה
//     console.error("JWT verification failed:", err.message);
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
// }

// // 8. הגדרת הנתיבים (איחוד של שני ה-configs שרשמת)
// export const config = {
//   matcher: [
//     // // מגן על כל האתר חוץ מהקבצים הסטטיים ודפי התחברות
//     // '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
//     // '/api/users/:path*',  // מגן על ה-API של המשתמשים
//     // '/dashboard/:path*',  // מגן על דפי ה-Dashboard
//     // '/api/users/((?!login|register).*)',
//     '/api/users',

    
//   ],
// };








import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { message: 'לא נשלח טוקן או לא קיים', status: 401 },
      { status: 401 }
    );
  }

  try {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secretKey);

    const { userId, userRole, userEmail } = payload;

    console.log("✅ User Authorized:", { userId, userEmail, userRole });

    // בדיקת הרשאות אדמין
    if (pathname.startsWith('/api/users') && userRole !== 'ADMIN') {
      console.log('access deny , not an admin');
      return NextResponse.json(
        { message: 'גישה נדחתה , מנהל מערכת בלבד' },
        { status: 403 }
      );
    }

    // --- הוספת ה-ID ל-Headers כדי שתוכל להשתמש בו ב-POST של הפוסטים ---
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId); 

    // המשך עם ה-Headers החדשים
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });






    

  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/api/users/:path*',
    '/api/posts/:path*', // הוספתי גם את זה כדי שתוכל ליצור פוסטים מוגנים
  ],
};