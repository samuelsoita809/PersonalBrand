import React, { useState } from 'react';
import { X } from 'lucide-react';
import PlanStep from './steps/PlanStep';
import DetailsStep from './steps/DetailsStep';
import ReviewStep from './steps/ReviewStep';
import SuccessStep from './steps/SuccessStep';
import { useAnalytics } from '../../context/analytics';

export type Step = 'plan' | 'details' | 'review' | 'success';

interface DeliverProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FormData {
  planId: string;
  name: string;
  email: string;
  projectType: string;
  description: string;
}

const DeliverProjectModal: React.FC<DeliverProjectModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<Step>('plan');
  const [formData, setFormData] = useState<FormData>({
    planId: '',
    name: '',
    email: '',
    projectType: '',
    description: ''
  });
  const { trackEvent } = useAnalytics();
  const isCompleted = React.useRef(false);

  // Track abandonment on close if not completed
  const handleClose = React.useCallback(() => {
    if (!isCompleted.current) {
      trackEvent('Work With Me - Delivery Project Journey Not Completed / Abandoned');
    }
    onClose();
  }, [onClose, trackEvent]);

  if (!isOpen) {
    // Reset state when closed
    if (currentStep !== 'plan') setCurrentStep('plan');
    isCompleted.current = false;
    return null;
  }

  const handleNext = (data?: Partial<FormData>) => {
    if (data) {
      setFormData((prev) => ({ ...prev, ...data }));
    }

    if (currentStep === 'plan') setCurrentStep('details');
    else if (currentStep === 'details') setCurrentStep('review');
    else if (currentStep === 'review') handleSubmit();
  };

  const handleBack = () => {
    if (currentStep === 'details') setCurrentStep('plan');
    else if (currentStep === 'review') setCurrentStep('details');
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/v1/project-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          selected_plan: formData.planId,
          project_type: formData.projectType
        })
      });

      if (!response.ok) throw new Error('Failed to submit request');
      
      isCompleted.current = true;
      trackEvent('Work With Me - Deliver Project Journey Completed', { 
        plan: formData.planId 
      });
      
      setCurrentStep('success');
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your request. Please try again.');
    }
  };

  const stepTitle = {
    plan: 'Build Your Project — Fast, Reliable, Done Right',
    details: 'Project Details',
    review: 'Review & Submit',
    success: 'Success!'
  };

  const progress = {
    plan: 25,
    details: 50,
    review: 75,
    success: 100
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-2xl font-bold text-white">{stepTitle[currentStep]}</h2>
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
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
          {currentStep === 'plan' && (
            <PlanStep 
              selectedPlanId={formData.planId} 
              onNext={(planId: string) => handleNext({ planId })} 
            />
          )}
          {currentStep === 'details' && (
            <DetailsStep 
              initialData={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 'review' && (
            <ReviewStep 
              formData={formData}
              onNext={() => handleNext()}
              onBack={handleBack}
            />
          )}
          {currentStep === 'success' && (
            <SuccessStep onClose={handleClose} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliverProjectModal;
