import React from 'react';
import { 
  FileCode, 
  Files, 
  Image as ImageIcon, 
  CloudRain, 
  CheckCheck, 
  KeyRound, 
  ArrowUpRight 
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FeatureItem } from '../../types';

interface FeaturesSectionProps {
  onSelectFeature?: (feature: FeatureItem) => void;
}

const features: FeatureItem[] = [
  {
    id: 'text-encryption',
    title: 'Text Encryption',
    subtitle: 'Confidential Messaging & Notes',
    description: 'Securely encrypt and decrypt sensitive text, credentials, and confidential notes using authenticated cryptographic streams.',
    iconName: 'FileCode',
    techSpecs: ['AES-256-GCM', 'UTF-8 Binary Encoding', 'Zero Plaintext Persistence'],
    status: 'Planned',
  },
  {
    id: 'file-encryption',
    title: 'File Encryption',
    subtitle: 'Document-Level Defense',
    description: 'Protect documents, archives, and arbitrary files before cloud storage, preventing unauthorized access across network boundaries.',
    iconName: 'Files',
    techSpecs: ['Chunked Streaming', 'Unique Initialization Vectors', 'Format Encapsulation'],
    status: 'Planned',
  },
  {
    id: 'image-encryption',
    title: 'Image Encryption',
    subtitle: 'Visual Media Protection',
    description: 'Secure image files while preserving their original byte fidelity upon decryption, shielding sensitive visual information.',
    iconName: 'ImageIcon',
    techSpecs: ['Lossless Reconstitution', 'EXIF Metadata Stripping', 'Multi-Format Support'],
    status: 'Planned',
  },
  {
    id: 'secure-cloud-storage',
    title: 'Secure Cloud Storage',
    subtitle: 'Encrypted Object Repository',
    description: 'Store encrypted payloads in scalable cloud infrastructure where raw objects remain completely opaque to storage hosts.',
    iconName: 'CloudRain',
    techSpecs: ['Encrypted at Rest', 'Cloud Object Architecture', 'Opaque Blob Indexing'],
    status: 'Planned',
  },
  {
    id: 'data-integrity',
    title: 'Data Integrity',
    subtitle: 'Cryptographic Tamper Detection',
    description: 'Use cryptographic hashing to verify file integrity, ensuring files have not been modified, corrupted, or intercepted in transit.',
    iconName: 'CheckCheck',
    techSpecs: ['SHA-256 Digests', 'Authenticated Cipher Tags', 'Bit-Flip Detection'],
    status: 'Planned',
  },
  {
    id: 'key-management',
    title: 'Key Management',
    subtitle: 'Cryptographic Key Lifecycle',
    description: 'Protect and manage cryptographic key metadata securely with dedicated key derivation, separation of duties, and KMS hooks.',
    iconName: 'KeyRound',
    techSpecs: ['PBKDF2 / Argon2 Derivation', 'KMS Integration Ready', 'Metadata Vaulting'],
    status: 'Planned',
  },
];

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onSelectFeature }) => {
  const getIcon = (iconName: string) => {
    const props = { className: 'w-6 h-6 text-[#00D4FF]' };
    switch (iconName) {
      case 'FileCode':
        return <FileCode {...props} />;
      case 'Files':
        return <Files {...props} />;
      case 'ImageIcon':
        return <ImageIcon {...props} />;
      case 'CloudRain':
        return <CloudRain {...props} />;
      case 'CheckCheck':
        return <CheckCheck {...props} />;
      case 'KeyRound':
        return <KeyRound {...props} />;
      default:
        return <FileCode {...props} />;
    }
  };

  return (
    <section id="features" className="py-20 md:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="cyan" size="sm">
            Core Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
            Engineered for Comprehensive Data Defense
          </h2>
          <p className="text-[#94A3B8] text-base sm:text-lg">
            CryptX provides a unified cryptographic architecture tailored for multi-format
            data payloads, backed by robust key security and cloud integration principles.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.id}
              hoverEffect
              className="p-6 flex flex-col justify-between group cursor-pointer"
              onClick={() => onSelectFeature?.(feature)}
            >
              <div>
                {/* Header with Icon and Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-[#101622] border border-[#1E293B] group-hover:border-[#00D4FF]/40 group-hover:shadow-[0_0_15px_-3px_rgba(0,212,255,0.2)] transition-all">
                    {getIcon(feature.iconName)}
                  </div>
                  <Badge variant="neutral" size="sm">
                    {feature.status}
                  </Badge>
                </div>

                {/* Title & Subtitle */}
                <div className="mb-2">
                  <h3 className="text-xl font-semibold text-[#F8FAFC] group-hover:text-[#00D4FF] transition-colors flex items-center justify-between">
                    <span>{feature.title}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#00D4FF] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <span className="text-xs font-mono text-[#3B82F6]">
                    {feature.subtitle}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
                  {feature.description}
                </p>
              </div>

              {/* Technical Specifications Pills */}
              <div className="pt-4 border-t border-[#1E293B]/70">
                <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-2">
                  Architecture Specifications:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {feature.techSpecs.map((spec) => (
                    <span
                      key={spec}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#101622] text-[#94A3B8] border border-[#1E293B]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Development Note Banner */}
        <div className="mt-12 p-4 rounded-xl bg-[#101622] border border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00D4FF]" />
            <span>
              <strong>Phase 1 Architecture Note:</strong> Capabilities shown represent product
              specifications designed for integration with Python FastAPI & AES-256-GCM backend modules.
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#00D4FF] shrink-0">
            Roadmap Phase 1/4
          </span>
        </div>
      </div>
    </section>
  );
};
