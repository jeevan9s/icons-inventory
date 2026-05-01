// confirmation of user sign-out
// redirects them to sign-out splash page in /logout

import Modal from "./Modal";
import { onLogout } from "@/services/auth/authCallers";
import { toast } from "sonner";

type Props = {
  isOpen: boolean
  onClose: () => void
}


export default function SignOutDialog({ isOpen, onClose }: Props) {

async function signOutHandler() {

  try {
    await onLogout();
  } catch(err) {
    console.error(err);
    toast.error("Failed to sign out. Please try again.");
  }

}

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Out" size="md">
      <h1 className="text-sm font-mp mb-5 font-thin text-black/80">Are you sure you want to sign out?</h1>
      <div className="flex flex-row gap-2">
        <button onClick={signOutHandler} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-red-600 text-white text-xs sm:text-sm rounded-xl hover:cursor-pointer hover:bg-red-900 hover:scale-105 transition-colors font-mp whitespace-nowrap">Sign out</button>
        <button  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-neutral-600 text-white text-xs sm:text-sm rounded-xl hover:cursor-pointer hover:bg-neutral-700 hover:scale-105 transition-colors font-mp whitespace-nowrap">Cancel</button>
      </div>
    </Modal>
  )
}