import React, { useState } from 'react';
import { X } from 'lucide-react';
import CoffeeOptionsStep from './steps/CoffeeOptionsStep';
import CoffeePlanStep from './steps/CoffeePlanStep';
import CoffeeFormStep from './steps/CoffeeFormStep';
import SuccessStep from './steps/SuccessStep';
import { useAnalytics } from '../../context/analytics';

export type CoffeeStep = 'option' | 'plan' | 'form' | 'success';

interface CoffeeMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CoffeeFormData {
  optionId: string;
  planId: string;
  name: string;
  email: string;
  description: string;
}

const CoffeeMeModal: React.FC<CoffeeMeModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<CoffeeStep>('option');
  const [formData, setFormData] = useState<CoffeeFormData>({
    optionId: '',
    planId: '',
    name: '',
    email: '',
    description: ''
  });
  const { trackEvent } = useAnalytics();

  if (!isOpen) return null;

  const handleNext = (data?: Partial<CoffeeFormData>) => {
    if (data) {
      setFormData((prev) => ({ ...prev, ...data }));
    }

    if (currentStep === 'option') {
      if (data?.optionId) {
        trackEvent('coffee_option_selected', { optionId: data.optionId });
      }
      setCurrentStep('plan');
    }
    else if (currentStep === 'plan') {
      if (data?.planId) {
        trackEvent('coffee_plan_selected', { planId: data.planId });
      }
      setCurrentStep('form');
    }
    else if (currentStep === 'form') {
      handleSubmit(data as CoffeeFormData);
    }
  };

  const handleBack = () => {
    if (currentStep === 'plan') setCurrentStep('option');
    else if (currentStep === 'form') setCurrentStep('plan');
  };

  const handleSubmit = async (finalData: CoffeeFormData) => {
    try {
      const submissionData = {
        ...formData,
        ...finalData,
        option: formData.optionId || finalData.optionId,
        plan_tier: formData.planId || finalData.planId
      };

      const response = await fetch('/api/v1/coffee-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) throw new Error('Failed to submit request');
      
      trackEvent('coffee_submitted', { 
        option: submissionData.option,
        plan: submissionData.plan_tier
      });
      
      setCurrentStep('success');
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your request. Please try again.');
    }
  };

  const stepTitle = {
    option: 'Coffee With Me: Get Clarity Fast',
    plan: 'Choose Your Consultancy Plan',
    form: 'Define Your Quick Wins',
    success: 'Request Received!'
  };

  const progress = {
    option: 25,
    plan: 50,
    form: 75,
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
            <h2 className="text-2xl font-bold text-white">{stepTitle[currentStep]}</h2>
            {currentStep !== 'success' && (
              <div className="mt-2 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500 ease-out"
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
          {currentStep === 'option' && (
            <CoffeeOptionsStep 
              selectedOptionId={formData.optionId} 
              onSelect={(optionId: string) => handleNext({ optionId })} 
            />
          )}
          {currentStep === 'plan' && (
            <CoffeePlanStep 
              selectedPlanId={formData.planId} 
              onSelect={(planId: string) => handleNext({ planId })} 
              onBack={handleBack}
            />
          )}
          {currentStep === 'form' && (
            <CoffeeFormStep 
              initialData={formData}
              onNext={(data) => handleNext(data)}
              onBack={handleBack}
            />
          )}
          {currentStep === 'success' && (
            <SuccessStep 
              onClose={onClose} 
              title="Consultancy Request Received!"
              description="Request received. We’ll reach out shortly to schedule our session. Get clear. Move fast. Take action."
              steps={[
                { title: "Review", description: "I'll personally review your request and notes." },
                { title: "Schedule", description: "You'll receive a link to pick a slot that works for you." }
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CoffeeMeModal;
