import React from 'react';
import { 
  FileSearch, 
  Binary, 
  CloudUpload, 
  Key, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { StepItem } from '../../types';

const steps: StepItem[] = [
  {
    stepNumber: '01',
    title: 'Select Your Data',
    description: 'Choose your sensitive payload directly in the web workspace.',
    detail: 'Supports plain text, secret tokens, documents (.pdf, .docx, .zip), and raw images (.png, .jpg) without local cache persistence.',
    iconName: 'FileSearch',
  },
  {
    stepNumber: '02',
    title: 'Encrypt Your Data',
    description: 'Transform plaintext into authenticated ciphertext streams.',
    detail: 'Cryptographic engine applies authenticated AES-256-GCM cipher with random 96-bit initialization vectors and 128-bit MAC tags.',
    iconName: 'Binary',
  },
  {
    stepNumber: '03',
    title: 'Store It Securely',
    description: 'Persist encrypted payloads in cloud object infrastructure.',
    detail: 'Sealed objects and SHA-256 integrity digests are cataloged with isolated key metadata, keeping the cloud storage backend fully zero-knowledge.',
    iconName: 'CloudUpload',
  },
  {
    stepNumber: '04',
    title: 'Retrieve and Decrypt',
    description: 'Authenticate and safely reconstruct original payloads.',
    detail: 'Provide valid cryptographic credentials to verify authentication tags, confirm bit-level integrity, and stream decrypted data.',
    iconName: 'Key',
  },
];

export const HowItWorksSection: React.FC = () => {
  const getStepIcon = (iconName: string) => {
    const props = { className: 'w-6 h-6 text-[#00D4FF]' };
    switch (iconName) {
      case 'FileSearch':
        return <FileSearch {...props} />;
      case 'Binary':
        return <Binary {...props} />;
      case 'CloudUpload':
        return <CloudUpload {...props} />;
      case 'Key':
        return <Key {...props} />;
      default:
        return <FileSearch {...props} />;
    }
  };

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#101622]/50 border-y border-[#1E293B]/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="blue" size="sm">
            End-to-End Pipeline
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
            How CryptX Secures Your Information
          </h2>
          <p className="text-[#94A3B8] text-base sm:text-lg">
            A transparent four-stage cryptographic pipeline ensuring data remains protected
            at rest, in transit, and during retrieval.
          </p>
        </div>

        {/* Steps Grid / Horizontal Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, index) => (
            <div
              key={step.stepNumber}
              className="relative bg-[#141D2B] rounded-2xl p-6 border border-[#1E293B] hover:border-[#3B82F6]/50 transition-all duration-300 group flex flex-col justify-between"
            >
              {/* Connector line on desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-[#1E293B] group-hover:text-[#3B82F6] transition-colors">
                  <ChevronRight className="w-6 h-6" />
                </div>
              )}

              <div>
                {/* Step Top Bar */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#101622] border border-[#1E293B] flex items-center justify-center group-hover:border-[#00D4FF]/40 transition-colors shadow-inner">
                    {getStepIcon(step.iconName)}
                  </div>
                  <span className="font-mono text-xl font-bold text-[#94A3B8] group-hover:text-[#00D4FF] transition-colors">
                    {step.stepNumber}
                  </span>
                </div>

                {/* Step Title & Description */}
                <h3 className="text-lg font-bold text-[#F8FAFC] mb-2 group-hover:text-[#00D4FF] transition-colors">
                  {step.title}
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
                  {step.description}
                </p>
              </div>

              {/* Technical Pipeline Detail */}
              <div className="pt-3 border-t border-[#1E293B]/70 text-xs font-mono text-slate-400 leading-normal">
                {step.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Verification Summary Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141D2B] border border-[#1E293B] text-xs font-mono text-[#94A3B8]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Verification: No plaintext leaves your authorized session boundary</span>
          </div>
        </div>
      </div>
    </section>
  );
};
