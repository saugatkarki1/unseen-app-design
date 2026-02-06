import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { access_token, refresh_token } = await request.json()

        if (!access_token) {
            return NextResponse.json({ error: "Missing access_token" }, { status: 400 })
        }

        const response = NextResponse.json({ success: true })

        // Set the session cookies for server-side auth
        response.cookies.set("sb-access-token", access_token, {
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 1 week
        })

        if (refresh_token) {
            response.cookies.set("sb-refresh-token", refresh_token, {
                path: "/",
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7, // 1 week
            })
        }

        return response
    } catch (error) {
        console.error("Error setting session cookies:", error)
        return NextResponse.json({ error: "Failed to set session" }, { status: 500 })
    }
}
