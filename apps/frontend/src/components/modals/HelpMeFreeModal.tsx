import React, { useState } from 'react';
import { X } from 'lucide-react';
import FreeServiceStep from './steps/FreeServiceStep';
import FreeFormStep from './steps/FreeFormStep';
import SuccessStep from './steps/SuccessStep';
import { useAnalytics } from '../../context/analytics';

export type FreeStep = 'service' | 'form' | 'success';

interface HelpMeFreeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FreeFormData {
  serviceId: string;
  name: string;
  email: string;
  message: string;
}

const HelpMeFreeModal: React.FC<HelpMeFreeModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<FreeStep>('service');
  const [formData, setFormData] = useState<FreeFormData>({
    serviceId: '',
    name: '',
    email: '',
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
          message: finalData.message
        })
      });

      if (!response.ok) throw new Error('Failed to submit request');
      
      trackEvent('free_request_submitted', { 
        service: finalData.serviceId
      });
      
      setCurrentStep('success');
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your request. Please try again.');
    }
  };

  const stepTitle = {
    service: 'Help Me Free: Select Your Service',
    form: 'Tell Me More',
    success: 'Request Received!'
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
              title="Help Request Received!"
              description="I've received your request for free help. I personally review every submission to ensure I can provide the best value possible. Expect a response soon."
              steps={[
                { title: "Review", description: "Analyzing your request and context." },
                { title: "Reach Out", description: "I'll contact you via email with the next steps." }
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpMeFreeModal;
