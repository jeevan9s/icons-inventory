import { NextRequest } from "next/server";
import { updateSession } from "./services/auth/server";

export async function proxy(request: NextRequest) {
    return updateSession(request);
}

export const config = {
    matcher: ["/main/:path*", "/data/:path*"],
};