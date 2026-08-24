// import { withAuth } from "next-auth/middleware";

// export default withAuth({
//     pages: {
//         signIn: "/login",
//     },
// });

// export const config = {
//     matcher: ["/dashboard/:path*", "/clinical/:path*", "/inventory/:path*", "/billing/:path*", "/accounting/:path*"],
// };

import { NextResponse } from 'next/server';

export function middleware(request: Request) {
    return NextResponse.next();
}
