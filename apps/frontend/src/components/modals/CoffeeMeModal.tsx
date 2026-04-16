import React, { useState } from 'react';
import { X } from 'lucide-react';
import CoffeePlanStep from './steps/CoffeePlanStep';
import CoffeeFormStep from './steps/CoffeeFormStep';
import SuccessStep from './steps/SuccessStep';
import { useAnalytics } from '../../context/analytics';

export type CoffeeStep = 'plan' | 'form' | 'success';

interface CoffeeMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface CoffeeFormData {
  planId: string;
  name: string;
  email: string;
  idea: string;
  urgency: 'low' | 'medium' | 'high';
}

const CoffeeMeModal: React.FC<CoffeeMeModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<CoffeeStep>('plan');
  const [formData, setFormData] = useState<CoffeeFormData>({
    planId: '',
    name: '',
    email: '',
    idea: '',
    urgency: 'medium'
  });
  const { trackEvent } = useAnalytics();

  if (!isOpen) return null;

  const handleNext = (data?: Partial<CoffeeFormData>) => {
    const updatedData = data ? { ...formData, ...data } : formData;
    if (data) {
      setFormData(updatedData);
    }

    if (currentStep === 'plan') {
      if (updatedData.planId) {
        trackEvent('coffee_plan_selected', { planId: updatedData.planId });
      }
      setCurrentStep('form');
    }
    else if (currentStep === 'form') {
      handleSubmit(updatedData);
    }
  };

  const handleBack = () => {
    if (currentStep === 'form') setCurrentStep('plan');
  };

  const handleSubmit = async (finalData: CoffeeFormData) => {
    try {
      const submissionData = {
        name: finalData.name,
        email: finalData.email,
        plan: finalData.planId,
        idea: finalData.idea,
        urgency: finalData.urgency
      };

      const response = await fetch('/api/v1/coffee-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) throw new Error('Failed to submit request');
      
      trackEvent('coffee_request_submitted', { 
        plan: submissionData.plan,
        urgency: submissionData.urgency
      });
      
      setCurrentStep('success');
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your request. Please try again.');
    }
  };

  const stepTitle = {
    plan: 'Coffee With Me: Choose Your Plan',
    form: 'Define Your Idea & Urgency',
    success: 'Request Received!'
  };

  const progress = {
    plan: 33,
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
          {currentStep === 'plan' && (
            <CoffeePlanStep 
              selectedPlanId={formData.planId} 
              onSelect={(planId: string) => handleNext({ planId })} 
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
              description="Your idea has been captured. I'll personally review your submission and we'll reach out shortly to schedule our session. Get clear. Move fast. Take action."
              steps={[
                { title: "Review", description: "Expert review of your idea and challenges." },
                { title: "Schedule", description: "Picking the best slot to achieve your wins." }
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CoffeeMeModal;
