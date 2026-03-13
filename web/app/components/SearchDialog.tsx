// search dialog
// used to search through the database, both tables.

import Modal from "./Modal";

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function SearchDialog({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search" size="xl">

    </Modal>
  )
}