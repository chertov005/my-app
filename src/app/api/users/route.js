import prisma from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
// ... שאר ה-imports (zod, bcrypt)

export async function GET(request) { // אל תשכח להוסיף את request כפרמטר!
    try {
      

        // שולף את המידע של role מבקשת headers
        const headerList = await headers()
        const userRole = headerList.get('x-user-role');
        // const userRole = request.headers.get('x-user-role');

        if (userRole !== 'ADMIN') {
            return NextResponse.json(
                { message: "גישה נדחתה: דף זה מיועד למנהלים בלבד" },
                { status: 403 } // 403 Forbidden - אין הרשאה
            );
        }
        // ---------------------------------------------

        // אם הגענו לכאן, המשתמש הוא ADMIN
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                role: true
            },
        });

        return NextResponse.json(users, { status: 200 });

    } catch (error) {
        console.error("Prisma Error:", error);
        return NextResponse.json(
            {
                message: "Internal Server Error",
                error: process.env.NODE_ENV === "development" ? error.message : undefined
            },
            { status: 500 }
        );
    }
}