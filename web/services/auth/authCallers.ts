// ez frontend calls
import { loginWithMicrosoft, logout, populateUser } from "./client";
import authLogger from "./utils/authLogger";

export const onLogin = async () => {
    const { error } = await loginWithMicrosoft();
    if (error) {
        console.error("login failed:", error.message);
        alert("could not connect to queen's NETID.")
    }
}

export const onLogout = async () => {
    await logout();
}

export const onCheckStatus = async () => {
    const user = await populateUser();
    if (user) {
        authLogger(user);
    }
    return user;
}