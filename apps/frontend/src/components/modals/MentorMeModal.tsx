import React, { useState } from 'react';
import { X } from 'lucide-react';
import MentorPlanStep from './steps/MentorPlanStep';
import MentorFormStep from './steps/MentorFormStep';
import SuccessStep from './steps/SuccessStep';
import { useAnalytics } from '../../context/analytics';

export type MentorStep = 'plan' | 'form' | 'success';

interface MentorMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface MentorFormData {
  planId: string;
  name: string;
  email: string;
  level: string;
  goal: string;
  description: string;
}

const MentorMeModal: React.FC<MentorMeModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<MentorStep>('plan');
  const [formData, setFormData] = useState<MentorFormData>({
    planId: '',
    name: '',
    email: '',
    level: '',
    goal: '',
    description: ''
  });
  const { trackEvent } = useAnalytics();

  if (!isOpen) return null;

  const handleNext = (data?: Partial<MentorFormData>) => {
    if (data) {
      setFormData((prev) => ({ ...prev, ...data }));
    }

    if (currentStep === 'plan') {
      if (data?.planId) {
        trackEvent('mentor_plan_selected', { planId: data.planId });
      }
      setCurrentStep('form');
    }
    else if (currentStep === 'form') {
      handleSubmit(data as MentorFormData);
    }
  };

  const handleBack = () => {
    if (currentStep === 'form') setCurrentStep('plan');
  };

  const handleSubmit = async (finalData: MentorFormData) => {
    try {
      const submissionData = {
        ...formData,
        ...finalData,
        plan: formData.planId || finalData.planId
      };

      const response = await fetch('/api/v1/mentor-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) throw new Error('Failed to submit request');
      
      trackEvent('mentor_submitted', { 
        plan: submissionData.plan,
        goal: submissionData.goal
      });
      
      setCurrentStep('success');
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your request. Please try again.');
    }
  };

  const stepTitle = {
    plan: 'Choose Your Mentorship Path',
    form: 'Learning Goals & Details',
    success: 'Success!'
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
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800">
          {currentStep === 'plan' && (
            <MentorPlanStep 
              selectedPlanId={formData.planId} 
              onNext={(planId: string) => handleNext({ planId })} 
            />
          )}
          {currentStep === 'form' && (
            <MentorFormStep 
              initialData={formData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 'success' && (
            <SuccessStep 
              onClose={onClose} 
              title="Mentorship Request Received!"
              description="I'm excited to help you grow. I've received your learning goals and will review them to see how we can best work together. Expect a response within 24 hours."
              steps={[
                { title: "Review", description: "I'll personally review your current level and goals." },
                { title: "Onboarding", description: "We'll set up a brief chat to align on a roadmap." }
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorMeModal;
