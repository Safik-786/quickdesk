
import SubmitTicketSlideover from './SubmitTicketSlideover';


export default function EditTicketModal({ ticket, isOpen, onClose }) {
  // This component is now a wrapper for the Slideover used for editing tickets
  return (
    <SubmitTicketSlideover
      isOpen={isOpen}
      onClose={onClose}
      ticket={ticket}
      isEdit={true}
    />
  );
}
