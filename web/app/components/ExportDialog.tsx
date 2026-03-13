// export dialog

import Modal from "./Modal";

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function ExportDialog({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Data" size="lg">

    </Modal>
  )
}