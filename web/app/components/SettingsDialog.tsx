// app settings
// some will need some auth-based props, only admin can access certain settings. 

import Modal from "./Modal";

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsDialog({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="xl">

    </Modal>
  )
}