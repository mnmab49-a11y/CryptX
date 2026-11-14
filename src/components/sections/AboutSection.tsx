import React from 'react';
import { 
  GraduationCap, 
  Terminal, 
  Server, 
  Cloud, 
  Lock, 
  Code2 
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ArchitectureLayer } from '../../types';

const techLayers: ArchitectureLayer[] = [
  {
    layer: 'Frontend Client',
    tech: 'React 18, TypeScript 5.7, Tailwind CSS, Vite 6',
    role: 'Live client-side interface deployed on Vercel with strict route guards & session telemetry',
  },
  {
    layer: 'Backend Services',
    tech: 'Python 3.12+ FastAPI, Starlette, Asynchronous Uvicorn',
    role: 'High-throughput asynchronous REST API deployed on FastAPI Cloud with live CORS guards',
  },
  {
    layer: 'Cryptography Core',
    tech: 'Python cryptography (AES-256-GCM, NIST RFC 3394 Key Wrap)',
    role: 'Hardware-accelerated authenticated AEAD cipher streams, ephemeral DEKs, and SHA-256 verification',
  },
  {
    layer: 'Database Layer',
    tech: 'PostgreSQL 16 & SQLAlchemy 2.0 ORM',
    role: 'Relational metadata management, user accounts, and immutable forensic audit ledger',
  },
  {
    layer: 'Cloud Infrastructure',
    tech: 'Opaque Binary Persistence, Master KEK Security, JWT Auth',
    role: 'Zero-knowledge encrypted object storage, 24-hour Bearer sessions, and envelope key hierarchy',
  },
];

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 md:py-28 bg-[#101622]/40 border-t border-[#1E293B]/70 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <Badge variant="blue" size="sm" icon={<GraduationCap className="w-3.5 h-3.5" />}>
            Academic & Engineering Identity
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F8FAFC] tracking-tight">
            About the CryptX Initiative
          </h2>
          <p className="text-[#94A3B8] text-base sm:text-lg">
            Developed as an advanced university capstone in cloud computing and cybersecurity,
            CryptX demonstrates how modern commercial-grade architectures can solve
            real-world data privacy and file storage challenges.
          </p>
        </div>

        {/* Project Meta Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          <Card className="lg:col-span-5 p-6 sm:p-8 space-y-6 bg-[#141D2B]">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#080B12] border border-[#1E293B]">
                <Lock className="w-6 h-6 text-[#00D4FF]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#F8FAFC]">CryptX</h3>
                <p className="text-xs font-mono text-[#00D4FF]">
                  Cloud-Based Multi-Format Encryption & Secure Storage Platform
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080B12] border border-[#1E293B] space-y-2">
              <span className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider block">
                Official Tagline
              </span>
              <p className="text-lg font-semibold text-[#F8FAFC] italic">
                &ldquo;Your Data. Your Keys. Your Privacy.&rdquo;
              </p>
            </div>

            <div className="space-y-3 text-sm text-[#94A3B8] leading-relaxed">
              <p>
                CryptX was conceived to eliminate the trade-off between user convenience and
                rigorous cryptographic isolation. By treating text, documents, and media as
                first-class encrypted objects, the platform ensures that users retain full sovereignty
                over their cryptographic keys and data artifacts.
              </p>
              <p>
                Designed from first principles to reflect the standards expected of an enterprise
                cybersecurity SaaS product, with full separation between frontend clients, API
                gateways, and encrypted cloud storage backends.
              </p>
            </div>

            <div className="pt-4 border-t border-[#1E293B] grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#101622] border border-[#1E293B]">
                <span className="text-slate-500 block">Domain:</span>
                <span className="text-[#F8FAFC] font-medium">Cloud & InfoSec</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[#101622] border border-[#1E293B]">
                <span className="text-slate-500 block">System Status:</span>
                <span className="text-emerald-400 font-medium">Production Live (v1.0)</span>
              </div>
            </div>
          </Card>

          {/* Planned Technology Stack & Layering */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-[#F8FAFC] flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#3B82F6]" />
                Full-Stack Operational Architecture
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live & Integrated
              </span>
            </div>

            <div className="space-y-3">
              {techLayers.map((item, idx) => (
                <div
                  key={item.layer}
                  className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] hover:border-[#3B82F6]/40 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#00D4FF] font-semibold">
                        0{idx + 1}.
                      </span>
                      <span className="font-bold text-sm sm:text-base text-[#F8FAFC]">
                        {item.layer}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      Live & Operational
                    </span>
                  </div>
                  <div className="font-mono text-xs text-[#3B82F6] mb-1.5">
                    {item.tech}
                  </div>
                  <p className="text-xs text-[#94A3B8]">
                    {item.role}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Pillars Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] text-center space-y-1">
            <Code2 className="w-5 h-5 text-[#00D4FF] mx-auto mb-1" />
            <div className="font-bold text-sm text-[#F8FAFC]">Clean Architecture</div>
            <div className="text-[11px] text-[#94A3B8]">Strict separation of concerns</div>
          </div>
          <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] text-center space-y-1">
            <Lock className="w-5 h-5 text-[#3B82F6] mx-auto mb-1" />
            <div className="font-bold text-sm text-[#F8FAFC]">Authentic Cryptography</div>
            <div className="text-[11px] text-[#94A3B8]">Standardized AES-256-GCM</div>
          </div>
          <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] text-center space-y-1">
            <Cloud className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
            <div className="font-bold text-sm text-[#F8FAFC]">Cloud Native</div>
            <div className="text-[11px] text-[#94A3B8]">Object storage & KMS ready</div>
          </div>
          <div className="p-4 rounded-xl bg-[#141D2B] border border-[#1E293B] text-center space-y-1">
            <Server className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <div className="font-bold text-sm text-[#F8FAFC]">FastAPI Asynchronous</div>
            <div className="text-[11px] text-[#94A3B8]">High-throughput backend</div>
          </div>
        </div>
      </div>
    </section>
  );
};
