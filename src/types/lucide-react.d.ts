/// <reference types="react" />

declare module 'lucide-react' {
  import type { SVGProps, ForwardRefExoticComponent, RefAttributes } from 'react';

  export interface LucideProps extends SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    absoluteStrokeWidth?: boolean;
    className?: string;
  }

  export type LucideIcon = ForwardRefExoticComponent<
    LucideProps & RefAttributes<SVGSVGElement>
  >;

  export const Shield: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const ShieldAlert: LucideIcon;
  export const Key: LucideIcon;
  export const KeyRound: LucideIcon;
  export const Lock: LucideIcon;
  export const Unlock: LucideIcon;
  export const FileText: LucideIcon;
  export const Files: LucideIcon;
  export const FileCode: LucideIcon;
  export const FileArchive: LucideIcon;
  export const FileCheck2: LucideIcon;
  export const Image: LucideIcon;
  export const Cloud: LucideIcon;
  export const CloudRain: LucideIcon;
  export const CloudUpload: LucideIcon;
  export const Database: LucideIcon;
  export const Cpu: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const CheckCheck: LucideIcon;
  export const Menu: LucideIcon;
  export const X: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const Sparkles: LucideIcon;
  export const FileSearch: LucideIcon;
  export const Binary: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Hash: LucideIcon;
  export const Layers: LucideIcon;
  export const GraduationCap: LucideIcon;
  export const Terminal: LucideIcon;
  export const Server: LucideIcon;
  export const Code2: LucideIcon;
  export const Info: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const User: LucideIcon;
  export const Mail: LucideIcon;
  export const Check: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const FileLock: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const FolderLock: LucideIcon;
  export const History: LucideIcon;
  export const Settings: LucideIcon;
  export const LogOut: LucideIcon;
  export const Bell: LucideIcon;
  export const Search: LucideIcon;
  export const Download: LucideIcon;
  export const Trash2: LucideIcon;
  export const Copy: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Upload: LucideIcon;
  export const UploadCloud: LucideIcon;
  export const Filter: LucideIcon;
  export const SlidersHorizontal: LucideIcon;
  export const Clock: LucideIcon;
  export const HardDrive: LucideIcon;
  export const Activity: LucideIcon;
  export const FileUp: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const File: LucideIcon;

  export const icons: Record<string, LucideIcon>;
}
