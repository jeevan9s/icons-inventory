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

    </Modal>
  )
}