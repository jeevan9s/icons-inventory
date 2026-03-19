// form-based entry addition
// will require props in implemntation to toggle between tables to add into

import Modal from "./Modal";

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function AddDialog({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Item" size="xl">
<h1></h1>
    </Modal>
  )
}