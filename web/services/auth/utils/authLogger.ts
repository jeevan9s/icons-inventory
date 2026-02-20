import { StaffUser } from "./types";
import { populateUser } from "../client";

const userInfo = await populateUser(); 

export default function authLogger(userInfo: StaffUser): void {
    if (userInfo) { console.log("user info:", userInfo); } 
    else {console.log("user info unavailable")}
}



