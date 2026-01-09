

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

    const { userId, userRole, userName } = payload;

    console.log("✅ User Authorized:", { userId, userRole , userName});

    // // בדיקת הרשאות אדמין
    // if (pathname.startsWith('/api/users') && userRole !== 'ADMIN') {
    //   console.log('access deny , not an admin');
    //   return NextResponse.json(
    //     { message: 'גישה נדחתה , מנהל מערכת בלבד' },
    //     { status: 403 }
    //   );
    // }

    // --- הוספת ה-ID ל-Headers כדי שתוכל להשתמש בו ב-POST של הפוסטים ---
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId);
    requestHeaders.set('x-user-role' ,userRole) ;
    requestHeaders.set('x-user-name' ,userName) ;

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
    '/api/users/:path*', '/api/users' ,
    '/api/posts/:path*', // הוספתי גם את זה כדי שתוכל ליצור פוסטים מוגנים
  ],
};