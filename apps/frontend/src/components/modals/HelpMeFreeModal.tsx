import React, { useState } from 'react';
import { X } from 'lucide-react';
import FreeServiceStep from './steps/FreeServiceStep';
import FreeFormStep from './steps/FreeFormStep';
import SuccessStep from './steps/SuccessStep';
import { useAnalytics } from '../../context/analytics';
import freeConfig from '../../config/free-services.json';

export type FreeStep = 'service' | 'form' | 'success';

interface HelpMeFreeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FreeFormData {
  serviceId: string;
  name: string;
  email: string;
  url?: string;
  frequency?: string;
  message: string;
}

const HelpMeFreeModal: React.FC<HelpMeFreeModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<FreeStep>('service');
  const [formData, setFormData] = useState<FreeFormData>({
    serviceId: '',
    name: '',
    email: '',
    url: '',
    frequency: '',
    message: ''
  });
  const { trackEvent } = useAnalytics();

  if (!isOpen) return null;

  const handleNext = (data?: Partial<FreeFormData>) => {
    const updatedData = data ? { ...formData, ...data } : formData;
    if (data) {
      setFormData(updatedData);
    }

    if (currentStep === 'service') {
      if (updatedData.serviceId) {
        trackEvent('free_service_selected', { serviceId: updatedData.serviceId });
      }
      setCurrentStep('form');
    }
    else if (currentStep === 'form') {
      handleSubmit(updatedData);
    }
  };

  const handleBack = () => {
    if (currentStep === 'form') setCurrentStep('service');
  };

  const handleSubmit = async (finalData: FreeFormData) => {
    try {
      const response = await fetch('/api/v1/free-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalData.name,
          email: finalData.email,
          service: finalData.serviceId,
          message: finalData.message,
          metadata: {
            url: finalData.url,
            frequency: finalData.frequency
          }
        })
      });

      if (!response.ok) throw new Error('Failed to submit request');
      
      trackEvent('free_request_submitted', { 
        service: finalData.serviceId,
        frequency: finalData.frequency
      });
      
      setCurrentStep('success');
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your request. Please try again.');
    }
  };

  const getSuccessContent = () => {
    const service = freeConfig.services.find(s => s.id === formData.serviceId);
    
    switch (formData.serviceId) {
      case 'website_audit':
        return {
          title: "Audit Request Received!",
          description: "I've queued your site for a professional review. While I dive into the details, check out this quick wins checklist.",
          steps: [
            { title: "Initial Scan", description: "Running automated performance and SEO checks." },
            { title: "Manual Review", description: "I'll personally analyze your UX and conversion paths." }
          ],
          action: {
            label: "Download Quick Audit Checklist",
            url: "#", // Placeholder for actual resource
            icon: null
          }
        };
      case 'quick_chat':
        return {
          title: "Let's Talk!",
          description: "Your request is in. To get moving faster, pick a slot on my calendar that works best for you.",
          steps: [
            { title: "Select Time", description: "Choose a 15-minute window for our deep dive." },
            { title: "Confirmation", description: "You'll receive a calendar invite with the meeting link." }
          ],
          action: {
            label: "Book on Calendly",
            url: "https://calendly.com/samuelsoita79",
            icon: null
          }
        };
      case 'tech_catchup':
        return {
          title: "You're on the List!",
          description: `Great choice! I'll be sending you updates on a ${formData.frequency || 'regular'} basis. Get ready for some technical deep dives.`,
          steps: [
            { title: "Confirmation", description: "Check your inbox for a welcome email." },
            { title: "First Session", description: "I'll notify you before our next community catchup." }
          ]
        };
      default:
        return {
          title: "Request Received!",
          description: "I've received your request and will get back to you soon.",
          steps: [
            { title: "Review", description: "Analyzing your request." },
            { title: "Response", description: "Expect an email within 24 hours." }
          ]
        };
    }
  };

  const successContent = getSuccessContent();

  const stepTitle = {
    service: 'Help Me Free: Select Your Service',
    form: 'Tell Me More',
    success: successContent.title
  };

  const progress = {
    service: 33,
    form: 66,
    success: 100
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight italic">{stepTitle[currentStep]}</h2>
            {currentStep !== 'success' && (
              <div className="mt-2 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress[currentStep]}%` }}
                />
              </div>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
          {currentStep === 'service' && (
            <FreeServiceStep 
              selectedServiceId={formData.serviceId} 
              onSelect={(serviceId: string) => handleNext({ serviceId })} 
            />
          )}
          {currentStep === 'form' && (
            <FreeFormStep 
              serviceId={formData.serviceId}
              initialData={formData}
              onNext={(data) => handleNext(data)}
              onBack={handleBack}
            />
          )}
          {currentStep === 'success' && (
            <SuccessStep 
              onClose={onClose} 
              title={successContent.title}
              description={successContent.description}
              steps={successContent.steps}
              action={successContent.action}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpMeFreeModal;
