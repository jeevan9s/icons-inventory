// confirmation of user sign-out
// redirects them to sign-out splash page in /logout

import Modal from "./Modal";
import Link from "next/link";
import { onLogout } from "@/services/auth/authCallers";

type Props = {
  isOpen: boolean
  onClose: () => void
}


export default function SignOutDialog({ isOpen, onClose }: Props) {


  function SignOut() {
    onLogout()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Out" size="md">
      <h1 className="text-sm font-mp mb-5 font-thin text-black/80">Are you sure you want to sign out?</h1>
      <div className="flex flex-row gap-2">
       <Link href="/auth/logout">
        <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-red-500 text-white text-xs sm:text-sm rounded-xl hover:cursor-pointer hover:bg-red-900 hover:scale-105 transition-colors font-mp whitespace-nowrap">Sign out</button>
       </Link>
        <button onClick={SignOut} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-neutral-800 text-white text-xs sm:text-sm rounded-xl hover:cursor-pointer hover:bg-neutral-700 hover:scale-105 transition-colors font-mp whitespace-nowrap">Go Back</button>
      </div>
    </Modal>
  )
}