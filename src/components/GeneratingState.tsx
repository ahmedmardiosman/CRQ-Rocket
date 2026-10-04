import React, { useEffect, useState } from 'react';
import { Cpu } from 'lucide-react';

interface GeneratingStateProps {
  defectNumber: string;
  title: string;
}

export const GeneratingState: React.FC<GeneratingStateProps> = ({
  defectNumber,
  title,
}) => {
  const steps = [
    'Parsing raw syntax, JSON structures, and technical notes...',
    'Synthesizing formal enterprise passive-voice implementation prose...',
    'Formulating ITIL CAB verification & regression assurance steps...',
    'Composing stakeholder email with mandatory approval sign-off...',
    'Compiling monochrome CAB PDF dossier in-memory...',
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 850);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="google-card p-8 sm:p-12 text-center my-6">
      {/* Animated Google Colors Spinner */}
      <div className="mx-auto w-14 h-14 relative mb-6">
        <div className="w-14 h-14 rounded-full border-4 border-[#e8f0fe] border-t-[#1a73e8] border-r-[#1e8e3e] border-b-[#f9ab00] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-[#1a73e8]">
          <Cpu className="w-5 h-5" />
        </div>
      </div>

      <div className="inline-block bg-[#e8f0fe] text-[#1a73e8] font-medium text-xs px-3 py-1 rounded-full mb-2">
        Processing Change Request
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-[#202124] mb-1">
        Professionalizing Documentation
      </h2>
      <p className="text-xs sm:text-sm text-[#5f6368] mb-6">
        Target: <span className="font-semibold text-[#1a73e8]">{defectNumber || 'DEF-CRQ'}</span> — "{title || 'Change Request'}"
      </p>

      {/* Steps log */}
      <div className="max-w-md mx-auto bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-4 text-xs text-left space-y-2.5">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          return (
            <div
              key={step}
              className={`flex items-start gap-2.5 transition-colors ${
                isDone
                  ? 'text-[#1e8e3e] font-medium'
                  : isCurrent
                  ? 'text-[#1a73e8] font-semibold'
                  : 'text-[#9aa0a6]'
              }`}
            >
              <span className="shrink-0 font-bold">
                {isDone ? '✓' : isCurrent ? '•' : '○'}
              </span>
              <span>{step}</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-[#5f6368] mt-6">
        Preserving code structures and syntax blocks for CAB review...
      </p>
    </div>
  );
};
