import React from 'react';
import { useModals } from '../../context/ModalContext';
import DeliverProjectModal from './DeliverProjectModal';
import MentorMeModal from './MentorMeModal';
import CoffeeMeModal from './CoffeeMeModal';
import HelpMeFreeModal from './HelpMeFreeModal';
import ServiceSelectionModal from './ServiceSelectionModal';
import { useAnalytics } from '../../context/analytics';

const GlobalModals: React.FC = () => {
  const { activeModal, closeModal, openModal } = useModals();
  const { trackEvent } = useAnalytics();

  const handleServiceSelect = (serviceId: string) => {
    const eventMap: Record<string, string> = {
      'deliver_project': 'Work With Me - Delivery Project option clicked',
      'mentor_me': 'Work With Me - Mentor Me option clicked',
      'coffee_with_me': 'Work With Me - Coffee With Me option clicked'
    };
    
    if (eventMap[serviceId]) {
      trackEvent(eventMap[serviceId]);
    }
    
    closeModal();
    // Small delay to allow previous modal to close smoothly
    setTimeout(() => {
      openModal(serviceId as any);
    }, 300);
  };

  return (
    <>
      <ServiceSelectionModal 
        isOpen={activeModal === 'service_selection'} 
        onClose={closeModal} 
        onSelectService={handleServiceSelect}
      />

      <DeliverProjectModal 
        isOpen={activeModal === 'deliver_project'} 
        onClose={closeModal} 
      />

      <MentorMeModal 
        isOpen={activeModal === 'mentor_me'} 
        onClose={closeModal} 
      />

      <CoffeeMeModal
        isOpen={activeModal === 'coffee_with_me'}
        onClose={closeModal}
      />

      <HelpMeFreeModal
        isOpen={activeModal === 'help_me_free'}
        onClose={closeModal}
      />
    </>
  );
};

export default GlobalModals;
