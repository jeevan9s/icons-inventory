// confirmation of user sign-out
// redirects them to sign-out splash page in /logout

import Modal from "./Modal";

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function SignOutDialog({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign Out" size="md">
      <h1>header</h1>
      <div className="flex flex-row gap-2">
        <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-neutral-800 text-white text-xs sm:text-sm rounded-xl hover:cursor-pointer hover:bg-neutral-700 hover:scale-105 transition-colors font-mp whitespace-nowrap">text1</button>
        <button className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-neutral-800 text-white text-xs sm:text-sm rounded-xl hover:cursor-pointer hover:bg-neutral-700 hover:scale-105 transition-colors font-mp whitespace-nowrap">text2</button>
      </div>
    </Modal>
  )
}