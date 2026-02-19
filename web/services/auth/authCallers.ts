// ez frontend calls
import * as auth from "@/services/auth/auth";
import authLogger from "./utils/authLogger";

export const onLogin = async () => {
    const { error } = await auth.loginWithMicrosoft();
    if (error) {
        console.error("login failed:", error.message);
        alert("could not connect to queen's NETID.")
    }
}

export const onLogout = async () => {
    await auth.logout();
}

export const onCheckStatus = async () => {
    const user = await auth.populateUser();
    if (user) {
        authLogger(user);
    }
    return user;
}