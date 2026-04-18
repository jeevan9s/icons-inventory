import { supabase } from "../supabase";
import { getUserProfile } from "./profile";
// import { rolePermissions } from "@/app/databasetesting/database.types";
import { Role } from "@/services/lib/types";

export async function requireRole(userId: string, roles: Role | Role[]) {
    const profile = await getUserProfile(userId, supabase)
    if (!profile) throw new Error("profile not found")
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    const role = profile.role
    if (!role || !allowedRoles.includes(role)) {
        throw new Error("unauthorized -> insufficient role");
    }

    return profile;
}

// export async function requirePermission(userId: string, permission:Permission) {
//     const profile = await getUserProfile(userId)
//     if (!profile) throw new Error("profile not found")
    
//         const permissions = rolePermissions[profile.role] || []
//         if (!permissions.includes(permission)) {
//             throw new Error(`missing permission ${permission}`)
//         }

// }