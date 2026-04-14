// frontend calls for login, logout, and fetching user info

import { loginWithMicrosoft, logout, populateUser } from "./client";

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

export async function getUserInfo() {
    try {
        const profile = await populateUser();
        if (!profile) return null;

        return profile;
    } catch (error) {
        console.error("failed to get user info", error);
        return null;
    }
}